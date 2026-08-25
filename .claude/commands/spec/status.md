---
description: Show specification status and progress
allowed-tools: Bash, Read, Glob, Write, Edit
argument-hint: [feature-name]
---

# Specification Status

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

## Argument Handling

- **If `$1` is provided**: proceed to "Spec Context" below for a single-feature report (unchanged behavior).
- **If `$1` is empty/not provided**: run "All Specs Overview" instead, then STOP — do not generate a single-feature report.

## All Specs Overview (when `$1` is not provided)

This is a pure read-time aggregation over `spec.json` files — **no file is written**, so it can
never go stale and never conflicts with any repo's file-protection rules. This is the single,
recommended way to see "what's in progress across this repo" — do not resurrect any pattern that
writes an active-specs list into any file outside `$SPECS_DIR`.

Use the Bash tool to enumerate specs (skip anything under `${SPECS_DIR}_archived/`):
```bash
for f in "$SPECS_DIR"*/spec.json; do
  [ -f "$f" ] && echo "$f"
done
```

For each `spec.json` found:
1. Read `feature_name`, `phase`, `updated_at`, `source.type`/`source.issue_number` (if present),
   and `approvals.*.approved` for requirements/design/tasks.
2. If a sibling `session-state.md` exists in the same directory, read its FrontMatter
   `currentTaskIndex`/`totalTasks` to compute a task-completion fraction (e.g. `4/4`).
3. Render one row per spec, **sorted by `updated_at` descending** (most recently touched first):

```markdown
## 進行中の Spec 一覧

| Feature | Phase | 承認 (req/design/tasks) | 進捗 | 更新日時 | Issue |
|---|---|---|---|---|---|
| 307-anomaly-alert-dashboard | implementation | ✅/✅/✅ | 4/4 (100%) | 2026-06-30 | #307 |
| 118-dashboard-date-format-unification | tasks-generated | ✅/✅/⬜ | — | 2026-06-25 | #118 |
```

- Also report the count of specs under `${SPECS_DIR}_archived/` as a one-line summary
  (e.g. "完了済み: 13件（`_archived/` 参照）") — list the directory count only, not each one.
- If zero specs exist under `$SPECS_DIR` (excluding `_archived/`): print "進行中の spec はありません。"

---

Show current status and progress for feature: **$1**

## Spec Context

### Spec Files
- Spec directory: !`ls -la $SPECS_DIR$1/ 2>/dev/null || echo "No spec directory found"`
- Spec metadata: `$SPECS_DIR$1/spec.json`
- Requirements: `$SPECS_DIR$1/requirements.md`
- Design: `$SPECS_DIR$1/design.md`
- Tasks: `$SPECS_DIR$1/tasks.md`

### All Specs Overview
- Available specs: !`ls -la $SPECS_DIR 2>/dev/null || echo "No specs directory found"`
- Active specs: !`find $SPECS_DIR -name "spec.json" -exec grep -l "implementation_ready.*true" {} \; 2>/dev/null || echo "No active specs"`

## Task: Generate Status Report

Create comprehensive status report for the specification in the language specified in spec.json (check `$SPECS_DIR$1/spec.json` for "language" field):

### 1. Specification Overview
Display:
- Feature name and description
- Creation date and last update
- Current phase (requirements/design/tasks/implementation)
- Overall completion percentage

### 2. Phase Status
For each phase, show:
- ✅ **Requirements Phase**: [completion %]
  - Requirements count: [number]
  - Acceptance criteria defined: [yes/no]
  - Requirements coverage: [complete/partial/missing]

- ✅ **Design Phase**: [completion %]
  - Architecture documented: [yes/no]
  - Components defined: [yes/no]
  - Diagrams created: [yes/no]
  - Integration planned: [yes/no]

- ✅ **Tasks Phase**: [completion %]
  - Total tasks: [number]
  - Completed tasks: [number]
  - Remaining tasks: [number]
  - Blocked tasks: [number]

### 3. Implementation Progress
If in implementation phase:
- Task completion breakdown
- Current blockers or issues
- Estimated time to completion
- Next actions needed

#### Task Completion Tracking
- Parse tasks.md checkbox status: `- [x]` (completed) vs `- [ ]` (pending)
- Count completed vs total tasks
- Show completion percentage
- Identify next uncompleted task

### 4. Quality Metrics
Show:
- Requirements coverage: [percentage]
- Design completeness: [percentage]
- Task granularity: [appropriate/too large/too small]
- Dependencies resolved: [yes/no]

### 5. Recommendations
Based on status, provide:
- Next steps to take
- Potential issues to address
- Suggested improvements
- Missing elements to complete

### 6. Steering Alignment
Check alignment with steering documents:
- Architecture consistency: [aligned/misaligned]
- Technology stack compliance: [compliant/non-compliant]
- Product requirements alignment: [aligned/misaligned]

## Instructions

1. **Check spec.json for language** - Use the language specified in the metadata
2. **Parse all spec files** to understand current state
3. **Calculate completion percentages** for each phase
4. **Identify next actions** based on current progress
5. **Highlight any blockers** or issues
6. **Provide clear recommendations** for moving forward
7. **Check steering alignment** to ensure consistency

Generate status report that provides clear visibility into spec progress and next steps.
