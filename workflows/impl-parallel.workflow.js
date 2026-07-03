export const meta = {
  name: 'impl-parallel',
  description: 'spec の tasks.md の Parallelization Plan に従い Layer0=直列 / Layer1=worktree並列 / Layer2=直列 で TDD 実装し、最後にレビューする',
  whenToUse: 'tasks.md に Layer 1（独立・ファイル所有権が重複しない並列可タスク）が複数あるとき。直列specにも使えるが旨味は薄い。',
  phases: [
    { title: 'Setup', detail: '実装ブランチ feature/<feature> を保証（spec-implementer）' },
    { title: 'Parse', detail: 'tasks.md の Parallelization Plan を構造化（spec-explorer）' },
    { title: 'Layer0', detail: '共有コントラクトを直列 TDD（test-author→implementer→verifier）' },
    { title: 'Layer1', detail: '独立モジュールを worktree 並列で TDD（spec-implementer）' },
    { title: 'Layer2', detail: '結線・全体検証を直列 TDD' },
    { title: 'Review', detail: '差分を correctness/security でレビュー（spec-reviewer）' },
  ],
}

// ── 使い方 ───────────────────────────────────────────────
//   Workflow({ scriptPath: '<このファイル>', args: { feature: '073-...', specDir: '.spec' } })
//   ※ skill 経由の起動では args が feature 文字列（例 "073-..."）で渡るケースもあり、
//     本スクリプトは文字列 / JSON文字列 / オブジェクトのいずれの args も受け付ける。
//
// ⚠️ scaffold: 並列向き issue（Layer 1 が複数ある spec）で初回検証すること。
//
// ⚠️ サブエージェント参照について:
//   agentType は claude-sdd 同梱の spec-* エージェント（agents/*.md）を参照する。
//   plugin agent はハーネスに名前空間付き（例 'spec:spec-implementer'）で登録されるため、
//   下の AGENT 定数は既定で 'spec:' プレフィックスを付ける。名前空間無しで登録される
//   環境では args.agentPrefix: '' を渡してプレフィックスを無効化できる。
//
// ⚠️ worktree 並列の制約（既知・scaffold の宿題）:
//   - Layer1 の各タスクは個別 worktree で commit するため、終了後に各 worktree ブランチを
//     feature ブランチへ統合する手順が別途必要（本スクリプトは自動マージしない）。
//   - 最終 Review は main ツリーの diff を見るため、Layer1 worktree のコミットは差分に含まれない。
//     完全並列運用時は統合後に別途 spec-reviewer を回すこと。
//   - test-author と implementer は worktree を共有できない（isolation は agent() 単位）ため、
//     Layer1 は spec-implementer 単独で RED→GREEN を内製する（モードB）。役割分離は直列レイヤーで効く。
// ─────────────────────────────────────────────────────────

// args は「オブジェクト / JSON文字列 / プレーンな feature 文字列」のいずれでも受ける。
// skill ランチャー経由の起動では args が feature 文字列（例 "073-..."）で渡るため正規化する。
let A = args
if (typeof A === 'string') {
  try { A = JSON.parse(A) } catch { A = { feature: A } }
}
const feature = A?.feature
const specDir = A?.specDir || '.spec'
if (!feature) throw new Error('args.feature is required (e.g. "073-rbac-env-compat-removal")')

// プラグイン同梱の spec-* エージェントはハーネスに名前空間付き（例 'spec:spec-implementer'）で
// 登録されるため、既定で 'spec:' プレフィックスを付ける。名前空間無しで登録される環境では
// args.agentPrefix: '' を渡して無効化できる。
const NS = A?.agentPrefix ?? 'spec:'
const AGENT = {
  explorer: `${NS}spec-explorer`,
  testAuthor: `${NS}spec-test-author`,
  implementer: `${NS}spec-implementer`,
  verifier: `${NS}spec-verifier`,
  reviewer: `${NS}spec-reviewer`,
}
const base = `${specDir}/${feature}`
const tasksPath = `${base}/tasks.md`

// タスク項目スキーマ。3レイヤーで共有するが $defs/$ref は使わず JS 参照でインライン展開する。
// StructuredOutput のスキーマに $ref が入ると、モデル（特に軽量モデル）のスキーマ解釈も
// バリデータ側の参照解決も安定せず、正しい形の入力すら弾かれ続けることがある。
const TASK_ITEM = {
  type: 'object',
  required: ['id', 'title', 'ownedFiles'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', description: 'タスク番号（例 "2.1"）' },
    title: { type: 'string' },
    ownedFiles: { type: 'array', items: { type: 'string' } },
    dependsOn: { type: 'array', items: { type: 'string' } },
  },
}

const PLAN_SCHEMA = {
  type: 'object',
  required: ['layer0', 'layer1', 'layer2', 'serial'],
  additionalProperties: false,
  properties: {
    serial: { type: 'boolean', description: 'Layer1 並列が無く完全直列なら true' },
    note: { type: 'string' },
    layer0: { type: 'array', items: TASK_ITEM },
    layer1: { type: 'array', items: TASK_ITEM },
    layer2: { type: 'array', items: TASK_ITEM },
  },
}

const RESULT_SCHEMA = {
  type: 'object',
  required: ['taskId', 'status', 'summary'],
  additionalProperties: false,
  properties: {
    taskId: { type: 'string' },
    status: { enum: ['green', 'failed', 'blocked'] },
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['status', 'testsPass', 'testsTotal'],
  additionalProperties: false,
  properties: {
    status: { enum: ['green', 'failed'] },
    testsPass: { type: 'integer' },
    testsTotal: { type: 'integer' },
    note: { type: 'string' },
  },
}

const specRefs = `仕様は ${base}/{requirements.md, design.md, tasks.md} を読むこと。`
const ownedLine = t => `所有ファイル: ${(t.ownedFiles || []).join(', ') || '(design.md から判断)'}。`

// 実装ブランチ feature/<feature> を保証する（/spec:impl のブランチ規約に準拠）。
const BRANCH_SCHEMA = {
  type: 'object',
  required: ['branch', 'onTarget', 'action'],
  additionalProperties: false,
  properties: {
    branch: { type: 'string', description: '最終的に居るブランチ' },
    onTarget: { type: 'boolean', description: `feature/${feature} 上にいるなら true` },
    action: { enum: ['already', 'created', 'switched', 'blocked'] },
    note: { type: 'string' },
  },
}

// 直列レイヤー: test-author → implementer → verifier を同一ツリーで順に回す（役割分離）
async function tddSerial(t, phaseName) {
  const red = await agent(
    `feature "${feature}" タスク ${t.id}（${t.title}）の失敗テストを書け。${specRefs} ${ownedLine(t)}`,
    { label: `test:${t.id}`, phase: phaseName, agentType: AGENT.testAuthor }
  )
  const green = await agent(
    `feature "${feature}" タスク ${t.id} の実装で上記テストを通せ。テストは改変しない。${specRefs} ${ownedLine(t)}\n` +
    `test-author の報告:\n${red || '(なし)'}`,
    { label: `impl:${t.id}`, phase: phaseName, schema: RESULT_SCHEMA, agentType: AGENT.implementer }
  )
  const verdict = await agent(
    `feature "${feature}" タスク ${t.id} の実装後、全件テストと静的検証でリグレッションが無いか独立検証せよ。${specRefs}`,
    { label: `verify:${t.id}`, phase: phaseName, schema: VERIFY_SCHEMA, agentType: AGENT.verifier }
  )
  return green ? { ...green, verify: verdict } : null
}

// 並列レイヤー: 1タスク=1worktree、implementer が RED→GREEN を内製（モードB）
function tddIsolated(t) {
  return agent(
    `feature "${feature}" タスク ${t.id}（${t.title}）を厳格 TDD（RED→GREEN）で実装せよ。` +
    `あなたは専用 worktree で動作している。${ownedLine(t)} 所有ファイル外は変更しないこと。${specRefs}`,
    { label: `L1:${t.id}`, phase: 'Layer1', schema: RESULT_SCHEMA, isolation: 'worktree', agentType: AGENT.implementer }
  )
}

// ── Setup: 実装ブランチを保証（/spec:impl のブランチ規約に準拠）──
// ワークフローは作業ツリーの HEAD に commit するため、開始時に feature/<feature> を固定する。
// 未コミット変更がある別ブランチでは自動切替せず停止（勝手な切替による作業ロスを防ぐ）。
phase('Setup')
const targetBranch = `feature/${feature}`
const setup = await agent(
  `git の実装ブランチを保証せよ。目標ブランチ = "${targetBranch}"。\n` +
  `手順: (1) git rev-parse --abbrev-ref HEAD で現在ブランチを確認。\n` +
  `(2) すでに ${targetBranch} 上なら action="already"。\n` +
  `(3) ${targetBranch} が未存在なら、現在の HEAD から git checkout -b ${targetBranch} で作成し action="created"。\n` +
  `(4) ${targetBranch} が存在するが別ブランチにいる場合: git status --porcelain が空（クリーン）なら git switch ${targetBranch} して action="switched"。未コミット変更があれば**切替も作成もせず** action="blocked"（作業ロス防止）。\n` +
  `最後に git rev-parse --abbrev-ref HEAD を再確認し、onTarget = (それが ${targetBranch} か) を返せ。`,
  { label: 'branch-setup', phase: 'Setup', schema: BRANCH_SCHEMA, agentType: AGENT.implementer }
)
if (!setup || !setup.onTarget) {
  throw new Error(`実装ブランチ ${targetBranch} を確保できません（branch=${setup?.branch}, action=${setup?.action}）。未コミット変更を commit/stash してから再実行してください。`)
}
log(`branch=${setup.branch}（${setup.action}）`)

// ── Parse ──
// spec-explorer 既定の haiku は StructuredOutput のスキーマ解釈が不安定で、
// JSON 全体を文字列化して架空のキーに包む→バリデーション連敗→リトライ上限で
// ワークフロー全体がエラー終了した実績がある。Parse は 1 呼び出しだけなので
// model を sonnet に引き上げ、それでも構造化に失敗したら schema 無しで
// JSON テキストを回収して JSON.parse する二段構えにする。
phase('Parse')
log(`reading ${tasksPath}`)
const PARSE_PROMPT =
  `${tasksPath} を読み、末尾の "## Parallelization Plan" を解析して Layer0/1/2 と各タスクの所有ファイル・依存を構造化して返せ。` +
  `各タスクの所有ファイルは design.md と実コード（import 方向）で裏取りすること。` +
  `Plan が無い/"serial" の場合は serial=true で layer1 を空に。捏造して並列化しないこと。`
let plan = null
try {
  plan = await agent(PARSE_PROMPT, {
    label: 'parse-plan', phase: 'Parse',
    schema: PLAN_SCHEMA, agentType: AGENT.explorer, model: 'sonnet',
  })
} catch (e) {
  log(`parse-plan（structured）失敗: ${e?.message || e}`)
}
if (!plan) {
  log('fallback: schema 無しの JSON テキスト回収に切り替える')
  const raw = await agent(
    `${PARSE_PROMPT}\n\n` +
    `出力形式: 次の形の JSON オブジェクト**だけ**を返せ。コードフェンス・前置き・後置きの説明は一切付けない。\n` +
    `{"serial": true|false, "note": "任意の補足", "layer0": [TASK...], "layer1": [TASK...], "layer2": [TASK...]}\n` +
    `TASK = {"id": "2.1", "title": "...", "ownedFiles": ["src/...", ...], "dependsOn": ["1.1", ...]}`,
    { label: 'parse-plan-fallback', phase: 'Parse', agentType: AGENT.explorer, model: 'sonnet' }
  )
  // コードフェンスや前置きが混ざっても最初の { から最後の } までを拾う
  const m = raw ? String(raw).match(/\{[\s\S]*\}/) : null
  try { plan = m ? JSON.parse(m[0]) : null } catch { plan = null }
}
// フォールバック経路はスキーマ検証を通らないため、下流が依存する形だけ確認する
if (!plan || ![plan.layer0, plan.layer1, plan.layer2].every(Array.isArray)) {
  throw new Error('failed to parse Parallelization Plan')
}
plan.serial = !!plan.serial
log(plan.serial
  ? `serial spec（${plan.note || 'Layer1 並列なし'}）→ Layer0/2 のみ直列実行`
  : `Layer0=${plan.layer0.length} / Layer1=${plan.layer1.length}（並列） / Layer2=${plan.layer2.length}`)

const results = []

// ── Layer 0（直列・役割分離）──
phase('Layer0')
for (const t of plan.layer0) {
  const r = await tddSerial(t, 'Layer0')
  results.push(r)
  if (r && r.status !== 'green') {
    log(`Layer0 ${t.id} が ${r.status} → 基盤が崩れているため中断`)
    return { aborted: `Layer0 ${t.id} ${r.status}`, results }
  }
}

// ── Layer 1（worktree 並列）──
phase('Layer1')
if (plan.layer1.length) {
  const l1 = await parallel(plan.layer1.map(t => () => tddIsolated(t)))
  results.push(...l1.filter(Boolean))
  log('⚠️ Layer1 は各 worktree にコミット済み。feature ブランチへの統合は別途手動で行うこと。')
}

// ── Layer 2（直列・役割分離）──
phase('Layer2')
for (const t of plan.layer2) {
  results.push(await tddSerial(t, 'Layer2'))
}

// ── Review（差分レビュー）──
phase('Review')
const review = await agent(
  `feature "${feature}" の実装差分を correctness と security の観点でレビューせよ。${specRefs}` +
  `要件充足と仕様逸脱を必ず突き合わせること。` +
  (plan.layer1.length ? ' 注意: Layer1 のコミットは別 worktree にあり main の diff には含まれない可能性がある。' : ''),
  { label: 'review', phase: 'Review', agentType: AGENT.reviewer }
)

const green = results.filter(r => r && r.status === 'green').length
log(`完了: ${green}/${results.length} タスク green`)
return { feature, serial: plan.serial, green, total: results.length, results, review }
