---
description: Resume work on an existing specification from last session
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
argument-hint: <feature-name>
---

# Resume Specification Session

## Path Resolution

Before proceeding, resolve the specification and steering directory paths from configuration:

Use the Bash tool to execute the following path resolution logic:
```bash
CONFIG_FILE=".claude/spec-config.json"

if [ -f "$CONFIG_FILE" ]; then
  # Read paths from config file
  SPECS_DIR=$(grep -o '"specs": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
  STEERING_DIR=$(grep -o '"steering": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
else
  # Fallback: detect legacy paths or use defaults
  if [ -d ".kiro/specs" ]; then
    SPECS_DIR=".kiro/specs/"
    STEERING_DIR=".kiro/steering/"
    echo "⚠️  Using legacy paths (.kiro/). Consider creating .claude/spec-config.json" >&2
  else
    SPECS_DIR=".spec/"
    STEERING_DIR=".spec-steering/"
  fi
fi

echo "SPECS_DIR=$SPECS_DIR"
echo "STEERING_DIR=$STEERING_DIR"
```

Store the resolved paths as variables: `$SPECS_DIR` and `$STEERING_DIR` for use in subsequent steps.

---

Resume work on specification: **$1**

## Task: Resume Previous Session

**SCOPE**: Efficiently restore context from the last session and continue implementation.

### 1. Validate Feature Exists

Check that `.kiro/specs/$1/` directory exists:
- If not found: Display error and suggest `/spec:init` or `/spec:init-issue`

### 2. Load Session State (Token-Efficient)

Read ONLY the session state file first:
- **Primary**: `.kiro/specs/$1/session-state.md`
- If not found: Create initial state from existing spec files

Parse FrontMatter using `python-frontmatter`:
```python
import frontmatter

with open('.kiro/specs/$1/session-state.md') as f:
    post = frontmatter.load(f)
    metadata = post.metadata
    content = post.content
```

Extract key metadata:
- `lastUpdated`: Last session timestamp
- `phase`: Current development phase
- `currentTaskIndex`: Current task number
- `totalTasks`: Total number of tasks
- `testsPass` / `testsTotal`: Test status
- `blockers`: Any blocking issues
- `modifiedFiles`: Files changed in last session
- `gitBranch` / `gitBaseBranch`: Branch information (if exists)

### 3. Git Branch Verification (GitHub環境の場合)

**IMPORTANT**: Verify we're on the correct branch before resuming work.

#### Check Current Branch

```bash
git branch --show-current
```

#### Compare with session-state.md

If `gitBranch` exists in FrontMatter:

**Case 1: Matching branch**
```
✓ 正しいブランチにいます: feature/$1
```

**Case 2: Different branch**
```
⚠️  ブランチが異なります

session-state.md: feature/$1
現在のブランチ: {current_branch}

[c]heckout / [s]tay / [a]bort
- c: feature/$1 にチェックアウト
- s: {current_branch} で続行（session-state.mdを更新）
- a: 中断
```

**Case 3: Branch doesn't exist**
```
⚠️  前回のブランチが見つかりません: feature/$1

[r]ecreate / [s]tay / [a]bort
- r: feature/$1 を再作成
- s: {current_branch} で続行
- a: 中断
```

#### Update Branch Info if Changed

If user chooses to stay on different branch:
```yaml
---
# Update FrontMatter
gitBranch: "{new_current_branch}"
gitBranchChanged: true
gitBranchChangedAt: "current_timestamp"
---
```

Add note to Implementation Notes:
```markdown
## 📝 Implementation Notes
⚠️ ブランチ変更: feature/$1 → {new_current_branch} (changed at {timestamp})
```

### 4. Display Session Summary

Show concise summary in Japanese:
```
📊 セッション再開: $1
─────────────────────────────────────
フェーズ: {phase}
進捗: タスク {currentTaskIndex}/{totalTasks} ({percentage}%)
テスト: {testsPass}/{testsTotal} 通過
最終更新: {lastUpdated}

🎯 前回の作業内容:
{Extract "Current Focus" section from markdown}

🔄 次のステップ:
{Extract "Next Steps" section from markdown}
```

### 4. Check for Blockers

If `blockers` array is not empty:
```
⚠️ ブロッカーが検出されました:
1. {blocker 1}
2. {blocker 2}

これらの問題は解決されましたか? [Y/n]
```

- If user responds 'n' or 'no': Ask for details and update blockers
- If user responds 'y' or 'yes': Clear blockers and continue

### 5. Load Additional Context (If Needed)

Based on phase, load minimal additional context:

**Phase: implementation**
- Read: `tasks.md` (only current task section)
- Read: `design.md` (only if referenced in current task)

**Phase: design**
- Read: `requirements.md`
- Read: `design.md`

**Phase: requirements**
- Read: `requirements.md`

**Do NOT load**:
- Full steering files (unless explicitly needed)
- Entire task list (only current task)
- Design details (unless current task needs them)

### 6. Propose Next Action

Based on `phase` and `currentTaskIndex`:

**If phase == "implementation" and currentTaskIndex < totalTasks**:
```
📋 次のタスクに進む準備ができました:

タスク {currentTaskIndex + 1}: {task title from tasks.md}

このタスクを開始しますか? [Y/n]
- Y: 次のタスクを開始
- n: 別のタスクを指定してください
```

**If phase == "implementation" and currentTaskIndex == totalTasks**:
```
✅ 全タスクが完了しています！

次のステップ:
1. 統合テストの実行
2. ドキュメントの更新
3. プルリクエストの作成
```

**If phase in ["requirements", "design", "tasks"]**:
```
📝 {phase}フェーズが進行中です。

次のステップ: /spec:{next-phase} $1
```

### 7. Update Session State

Before starting work, update `session-state.md`:
```yaml
---
lastUpdated: "current_timestamp_iso8601"
# ... preserve other metadata ...
---

# Session State: $1

## 📊 Progress Summary
[Keep existing]

## 🎯 Current Focus
セッション再開: {timestamp}

[Rest of content]
```

Add new entry to "Last Completed Actions":
```markdown
## ✅ Last Completed Actions
1. ✓ Session resumed at {timestamp}
[... previous actions ...]
```

### 8. Start Work

If user confirms (or auto-start if no blocker):
- Execute next task from `tasks.md`
- Update `currentTaskIndex` in FrontMatter
- Follow TDD methodology from `/spec:impl`

## Output Format

Provide clear, concise Japanese output:
```
✅ セッション再開完了: $1

📄 読み込んだファイル:
- session-state.md
- tasks.md (タスク {currentTaskIndex})

🚀 作業を開始します...
```

## Error Handling

**session-state.md not found**:
```
⚠️ session-state.md が見つかりません。

自動生成しますか? [Y/n]
```

If yes: Generate from `spec.json` and `tasks.md`

**Corrupted FrontMatter**:
```
❌ session-state.md のFrontMatterが破損しています。

手動で修正するか、再生成してください。
```

**Feature not found**:
```
❌ 仕様が見つかりません: $1

利用可能な仕様:
{list all features in .kiro/specs/}

または、新規作成:
- /spec:init <description>
- /spec:init-issue <issue-number>
```

## Helper: Generate session-state.md from Existing Spec

If `session-state.md` doesn't exist, generate from:

1. Read `spec.json` for phase and metadata
2. Read `tasks.md` and count tasks, find current task index
3. Run tests to get pass/fail counts (optional)
4. Create initial `session-state.md` with inferred state

Template:
```markdown
---
lastUpdated: "current_timestamp"
phase: "{from spec.json}"
currentTaskIndex: {count completed tasks in tasks.md}
totalTasks: {total tasks in tasks.md}
testsPass: null
testsTotal: null
modifiedFiles: []
blockers: []
---

# Session State: $1

## 📊 Progress Summary
- **Phase**: {phase}
- **Progress**: Task {currentTaskIndex}/{totalTasks}

## 🎯 Current Focus
*Session state auto-generated from existing spec files.*

## ✅ Last Completed Actions
{List completed tasks from tasks.md}

## 🔄 Next Steps
{List pending tasks from tasks.md}

## 🐛 Known Issues / Blockers
*None*

## 📝 Implementation Notes
*Auto-generated session state*

## 🔗 Key Files Modified This Session
*No files modified yet*
```

## Best Practices

1. **Minimize token usage**: Only load what's needed for next task
2. **Clear communication**: Always explain what's happening
3. **User confirmation**: Don't auto-start if blockers exist
4. **State consistency**: Keep FrontMatter and markdown in sync
5. **Error recovery**: Gracefully handle missing/corrupted state files

think deeply
