export const meta = {
  name: 'spec-parallel-impl',
  description: 'spec の tasks.md の Parallelization Plan に従い Layer0=直列 / Layer1=worktree並列 / Layer2=直列 で TDD 実装する',
  whenToUse: 'tasks.md に Layer 1（独立・ファイル所有権が重複しない並列可タスク）が複数あるとき。直列specには使わない。',
  phases: [
    { title: 'Parse' },
    { title: 'Layer0' },
    { title: 'Layer1' },
    { title: 'Layer2' },
  ],
}

// ── 使い方 ───────────────────────────────────────────────
//   Workflow({ scriptPath: '<このファイル>', args: { feature: '073-...', specDir: '.spec' } })
// args.feature  : .spec 配下の feature ディレクトリ名（必須）
// args.specDir  : spec ルート（省略時 '.spec'）
//
// ⚠️ scaffold: 並列向き issue（Layer 1 が複数ある spec）で初回検証すること。
//   直列 spec（#73 等）では Parse が "serial" を返し Layer1 は空 → Layer0 のみ走る（正しい挙動）。
// ─────────────────────────────────────────────────────────

const feature = args?.feature
const specDir = args?.specDir || '.spec'
if (!feature) throw new Error('args.feature is required (e.g. "073-rbac-env-removal")')

const tasksPath = `${specDir}/${feature}/tasks.md`

// 各タスクを表す構造。owned ファイルが他タスクと重複しないものだけ Layer1 に入る前提。
const PLAN_SCHEMA = {
  type: 'object',
  required: ['layer0', 'layer1', 'layer2', 'serial'],
  additionalProperties: false,
  properties: {
    serial: { type: 'boolean', description: 'Layer1 並列が無く完全直列なら true' },
    note: { type: 'string' },
    layer0: { type: 'array', items: { $ref: '#/$defs/task' } },
    layer1: { type: 'array', items: { $ref: '#/$defs/task' } },
    layer2: { type: 'array', items: { $ref: '#/$defs/task' } },
  },
  $defs: {
    task: {
      type: 'object',
      required: ['id', 'title', 'ownedFiles'],
      additionalProperties: false,
      properties: {
        id: { type: 'string', description: 'タスク番号（例 "2.1"）。/spec:impl に渡せる形式' },
        title: { type: 'string' },
        ownedFiles: { type: 'array', items: { type: 'string' } },
        dependsOn: { type: 'array', items: { type: 'string' } },
      },
    },
  },
}

const RESULT_SCHEMA = {
  type: 'object',
  required: ['taskId', 'status', 'testsPass', 'summary'],
  additionalProperties: false,
  properties: {
    taskId: { type: 'string' },
    status: { enum: ['green', 'failed', 'blocked'] },
    testsPass: { type: 'boolean' },
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
  },
}

// TDD 実装を1タスク分実行するプロンプト。spec:impl の流儀（RED→GREEN→Verify）に従わせる。
const implPrompt = (t, opts = {}) => `あなたは spec-driven 開発の実装担当です。
対象: feature "${feature}" のタスク ${t.id}（${t.title}）。
仕様は ${specDir}/${feature}/{requirements.md, design.md, tasks.md} を読むこと。
所有ファイル（このタスクだけが触る）: ${(t.ownedFiles || []).join(', ') || '(design.md から判断)'}。

手順（Kent Beck の TDD を厳守）:
1. RED: まず失敗するテストを書く（${specDir} の steering / package.json からテストコマンドを解決。このリポは vitest: 単一ファイルは \`npx vitest run <file>\`）。
2. GREEN: テストを通す最小実装。
3. Verify: 該当テストと既存テストにリグレッションが無いことを確認。
4. tasks.md の該当チェックボックスを [x] にし、コミット（メッセージ先頭に "[${t.id}]"）。
${opts.isolated ? '⚠️ あなたは専用 worktree で動作している。所有ファイル以外は変更しないこと（並列タスクと衝突するため）。' : ''}
所有ファイルの範囲外を変更しそうになったら status=blocked で報告して止まること。`

// ── Parse: tasks.md の Parallelization Plan を構造化 ──
phase('Parse')
log(`reading ${tasksPath}`)
const plan = await agent(
  `${tasksPath} を読み、末尾の "## Parallelization Plan" を解析して Layer0/1/2 のタスクと各タスクの所有ファイル・依存を構造化して返せ。` +
  `Plan が無い、または "serial" と書かれている場合は serial=true で layer1 を空にすること。捏造して並列化しないこと。`,
  { label: 'parse-plan', phase: 'Parse', schema: PLAN_SCHEMA }
)

if (!plan) throw new Error('failed to parse Parallelization Plan')
log(plan.serial
  ? `serial spec（${plan.note || 'Layer1 並列なし'}）→ Layer0/2 のみ直列実行`
  : `Layer0=${plan.layer0.length} / Layer1=${plan.layer1.length}（並列） / Layer2=${plan.layer2.length}`)

const results = []

// ── Layer 0: 直列（共有コントラクト。後続が依存するので worktree 分離しない）──
phase('Layer0')
for (const t of plan.layer0) {
  const r = await agent(implPrompt(t), { label: `L0:${t.id}`, phase: 'Layer0', schema: RESULT_SCHEMA })
  results.push(r)
  if (r && r.status !== 'green') {
    log(`Layer0 ${t.id} が ${r.status} → 後続を中断（基盤が崩れているため）`)
    return { aborted: `Layer0 ${t.id} ${r.status}`, results }
  }
}

// ── Layer 1: 並列（独立・ファイル所有権が重複しないタスク。各 worktree で同時実行）──
phase('Layer1')
if (plan.layer1.length) {
  const l1 = await parallel(plan.layer1.map(t => () =>
    agent(implPrompt(t, { isolated: true }), {
      label: `L1:${t.id}`, phase: 'Layer1', schema: RESULT_SCHEMA, isolation: 'worktree',
    })
  ))
  results.push(...l1.filter(Boolean))
}

// ── Layer 2: 直列（結線・E2E。複数 Layer1 出力に依存）──
phase('Layer2')
for (const t of plan.layer2) {
  const r = await agent(implPrompt(t), { label: `L2:${t.id}`, phase: 'Layer2', schema: RESULT_SCHEMA })
  results.push(r)
}

const green = results.filter(r => r && r.status === 'green').length
log(`完了: ${green}/${results.length} タスク green`)
return { feature, serial: plan.serial, green, total: results.length, results }
