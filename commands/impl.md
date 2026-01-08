---
description: Execute spec tasks using TDD methodology
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Grep, Glob, LS, WebFetch, WebSearch
argument-hint: <feature-name> [task-numbers]
---

# Execute Spec Tasks with TDD

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

Execute implementation tasks for **$1** using Kent Beck's Test-Driven Development methodology.

## Instructions

### Pre-Execution Validation
Validate required files exist for feature **$1**:
- Requirements: `.kiro/specs/$1/requirements.md`
- Design: `.kiro/specs/$1/design.md`
- Tasks: `.kiro/specs/$1/tasks.md`
- Metadata: `.kiro/specs/$1/spec.json`

### Git Branch Management (GitHub環境の場合)

**IMPORTANT**: Before starting implementation, check if we should create a feature branch.

#### 1. Detect GitHub Environment

Check if this is a GitHub repository:
```bash
# Check if it's a git repository
git rev-parse --git-dir 2>/dev/null

# Check if remote is GitHub
git remote get-url origin 2>/dev/null | grep -q github.com
```

#### 2. Determine Branch Strategy

If GitHub environment detected:

**Check current branch**:
```bash
git branch --show-current
```

**Branch creation conditions**:
- ✅ Current branch is `main` or `master`
- ✅ Working directory is clean (no uncommitted changes)
- ✅ Feature branch `feature/$1` does NOT exist

**Skip branch creation if**:
- ❌ Already on a feature branch
- ❌ Working directory has uncommitted changes
- ❌ Feature branch already exists

#### 3. Create Feature Branch (with confirmation)

If all conditions met, ask user:
```
🔀 GitHub環境を検出しました

新しいfeatureブランチを作成しますか?
ブランチ名: feature/$1
ベースブランチ: {current_branch}

作業ディレクトリ: クリーン ✓

[Y/n]
- Y: ブランチを作成して実装開始
- n: 現在のブランチ ({current_branch}) で実装開始
```

If user confirms (Y):
```bash
# Create and checkout feature branch
git checkout -b feature/$1

# Update session-state.md with branch info
```

If user declines (n) or conditions not met:
```
⚠️  現在のブランチで実装を続けます: {current_branch}
```

#### 4. Update session-state.md with Branch Info

Add to FrontMatter:
```yaml
---
# ... existing fields ...
gitBranch: "feature/$1"  # or current branch if not created
gitBaseBranch: "main"     # branch we branched from
---
```

Add to Implementation Notes section:
```markdown
## 📝 Implementation Notes
- **Git Branch**: feature/$1 (created from main)
- **Base Branch**: main
```

#### 5. Error Handling

**Uncommitted changes detected**:
```
⚠️  未コミットの変更が検出されました

以下のいずれかを実行してください:
1. 変更をコミット: git add . && git commit -m "message"
2. 変更をstash: git stash
3. 現在のブランチで続行: [Enter]
```

**Feature branch already exists**:
```
ℹ️  feature/$1 ブランチが既に存在します

[c]heckout / [n]ew name / [s]tay
- c: 既存ブランチにチェックアウト
- n: 別の名前でブランチ作成 (feature/$1-2)
- s: 現在のブランチで続行
```

### Context Loading

**Core Steering:**
- Structure: @.kiro/steering/structure.md
- Tech Stack: @.kiro/steering/tech.md
- Product: @.kiro/steering/product.md

**Custom Steering:**
- Additional `*.md` files in `.kiro/steering/` (excluding structure.md, tech.md, product.md)

**Spec Documents for $1:**
- Metadata: @.kiro/specs/$1/spec.json
- Requirements: @.kiro/specs/$1/requirements.md
- Design: @.kiro/specs/$1/design.md
- Tasks: @.kiro/specs/$1/tasks.md

### Task Execution
1. **Feature**: $1
2. **Task numbers**: $2 (optional, defaults to all pending tasks)
3. **Load all context** (steering + spec documents)
4. **Execute selected tasks** using TDD methodology

### TDD Implementation
For each selected task:

1. **Update session-state.md (Start)**:
   - Set `currentTaskIndex` to current task number
   - Update `lastUpdated` timestamp
   - Update "Current Focus" with task description
   - Update "Next Steps" with immediate actions

2. **RED**: Write failing tests first

3. **GREEN**: Write minimal code to pass tests

4. **REFACTOR**: Clean up and improve code structure

5. **Verify**:
   - All tests pass
   - No regressions in existing tests
   - Code quality and test coverage maintained

6. **Update session-state.md (Complete)**:
   - Update `testsPass` / `testsTotal` from test results
   - Add modified files to `modifiedFiles` array
   - Move task to "Last Completed Actions"
   - Update "Next Steps" with next task

7. **Automatic Documentation Updates**:
   - **Update tasks.md**:
     - Change checkbox from `- [ ]` to `- [x]` for completed task
     - Add commit hash: `  - **完了**: コミット \`{short_hash}\``
   - **Update session-state.md**:
     - Update FrontMatter `currentTaskIndex` to next task number
     - Update FrontMatter `testsPass` and `testsTotal` from pytest output
     - Calculate progress: `{completed}/{total}タスク完了（{percentage}%）`
     - Update FrontMatter `lastUpdated` with current timestamp (ISO 8601)
     - Add task to "Last Completed Actions" section
     - Update "Current Focus" with next task description
   - **Commit documentation changes**:
     - Stage: `.kiro/specs/$1/tasks.md` and `.kiro/specs/$1/session-state.md`
     - Commit: `docs: update task tracking for $1 (task {task_number})`

**Note**: Follow Kent Beck's TDD methodology strictly, implementing only the specific task requirements.

### Session State Updates

**Before starting task**:
```yaml
---
currentTaskIndex: 3
lastUpdated: "2025-11-27T14:30:00Z"
phase: "implementation"
# ... other fields ...
---
```

**After completing task**:
```yaml
---
currentTaskIndex: 3
testsPass: 8
testsTotal: 10
modifiedFiles:
  - "src/auth/middleware.py"
  - "tests/auth/test_middleware.py"
lastUpdated: "2025-11-27T15:45:00Z"
# ... other fields ...
---
```

Update markdown sections:
- "Last Completed Actions": Add completed task
- "Next Steps": Update with next task from tasks.md
- "Key Files Modified This Session": Update with new files

### Automatic Documentation Update Workflow

When a task is completed (after successful test execution and code commit):

#### Step 1: Extract Test Results
```bash
# Run tests and capture output
uv run pytest -v > test_output.txt 2>&1

# Extract test counts
# Example: "17 passed in 2.34s" → testsPass=17, testsTotal=17
# Example: "15 passed, 2 failed in 3.45s" → testsPass=15, testsTotal=17
```

#### Step 2: Get Current Commit Hash
```bash
# Get short commit hash (7 characters)
git rev-parse --short HEAD
# Example output: 9559de7
```

#### Step 3: Update tasks.md
Find the current task line and:
1. Change `- [ ]` to `- [x]`
2. Add completion marker with commit hash

Example transformation:
```markdown
# Before
- [ ] 4.2 SystemExit例外のハンドリングを実装
  - cache_command呼び出しをtry-except SystemExitブロックで囲む
  - _Requirements: 1.4, 2.5, 4.4_

# After
- [x] 4.2 SystemExit例外のハンドリングを実装
  - cache_command呼び出しをtry-except SystemExitブロックで囲む
  - _Requirements: 1.4, 2.5, 4.4_
  - **完了**: コミット `9559de7`
```

#### Step 4: Update session-state.md FrontMatter

Calculate progress by counting checked tasks in tasks.md:
```python
# Pseudo-code
total_tasks = count("- [ ]" + "- [x]" in tasks.md)
completed_tasks = count("- [x]" in tasks.md)
percentage = (completed_tasks / total_tasks) * 100
```

Update YAML FrontMatter:
```yaml
---
lastUpdated: "2025-11-27T15:30:00Z"  # Current timestamp (ISO 8601)
phase: "implementation"
currentTaskIndex: 12  # Next task index
totalTasks: 28
testsPass: 17  # From pytest output
testsTotal: 17  # From pytest output
modifiedFiles:
  - "main.py"
  - "tests/test_analyze_command.py"
  - ".kiro/specs/043-analyze-command-cache-metrics-update-option/tasks.md"
  - ".kiro/specs/043-analyze-command-cache-metrics-update-option/session-state.md"
blockers: []
sourceIssue: 43
gitBranch: "feature/043-analyze-command-cache-metrics-update-option"
gitBaseBranch: "main"
---
```

#### Step 5: Update session-state.md Markdown Sections

Update "Progress Summary":
```markdown
## 📊 Progress Summary
- **Phase**: 実装中（TDD Red-Green-Refactorサイクル）
- **Progress**: 10/28タスク完了（35.7%）
- **Source**: GitHub Issue #43
- **Commits**: 11件（全てのRed-Greenサイクル完了）
```

Add to "Last Completed Actions":
```markdown
## ✅ Last Completed Actions
1. ✓ タスク1.1-1.2: --refreshオプションの追加（Red→Green）- コミット `16da85d2b`, `9c7a913c1`
2. ✓ タスク2.1-2.2: --refresh検出ロジックの実装（Red→Green）- コミット `15b0c93c7`, `80fb9b6ee`
3. ✓ タスク3.1-3.2: 進捗メッセージ表示の実装（Red→Green）- コミット `3dfa03901`, `702621552`
4. ✓ タスク4.1-4.3: エラーハンドリングとログ出力の実装（Red→Green）- コミット `e7d476f25`, `9559de74a`
```

Update "Current Focus":
```markdown
## 🎯 Current Focus
タスク5.1: 複数オプション併用テストの作成 - 次回セッション
```

#### Step 6: Commit Documentation Updates
```bash
# Stage documentation files
git add .kiro/specs/$1/tasks.md .kiro/specs/$1/session-state.md

# Commit with standardized message
git commit -m "docs: update task tracking for $1 (task {task_number})"
```

**Automation Triggers**:
- Execute after each successful task completion
- Execute after code commit (not before)
- Skip if tests fail or code doesn't compile

**Error Handling**:
- If pytest fails: Don't update documentation
- If git commit fails: Log error and continue (documentation updates can be manual)
- If tasks.md parse fails: Log warning and skip checkbox update

## Implementation Notes

- **Feature**: Use `$1` for feature name
- **Tasks**: Use `$2` for specific task numbers (optional)
- **Validation**: Check all required spec files exist
- **TDD Focus**: Always write tests before implementation
- **Task Tracking**: Update checkboxes in tasks.md as completed
