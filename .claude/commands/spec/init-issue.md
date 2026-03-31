---
description: Initialize a new specification from a GitHub Issue
allowed-tools: Bash, Read, Write, Glob
argument-hint: <issue-number-or-url>
---

# Spec Initialization from GitHub Issue

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

Initialize a new specification based on a GitHub Issue:

**Issue Reference**: $ARGUMENTS

## Task: Initialize Specification from GitHub Issue

**SCOPE**: This command fetches a GitHub Issue and initializes the specification structure.

### 1. Parse Issue Reference

Parse $ARGUMENTS to extract issue number:
- If URL format: Extract number from `https://github.com/owner/repo/issues/123`
- If number only: Use directly (e.g., `123`)

### 2. Fetch Issue Information

Use `gh` CLI to fetch issue details:
```bash
gh issue view <issue-number> --json title,body,labels,assignees,number
```

Expected JSON output:
```json
{
  "number": 123,
  "title": "Add dark mode support",
  "body": "## Description\nImplement dark mode...",
  "labels": [{"name": "enhancement"}, {"name": "ui"}],
  "assignees": [{"login": "username"}]
}
```

### 3. Generate Feature Name

Create feature name from issue number and title:
```
Format: {issue-number:03d}-{slugified-title}
Example: 123 + "Add dark mode support" → "123-add-dark-mode-support"
```

Slugification rules:
- Convert to lowercase
- Replace non-alphanumeric with hyphens
- Remove leading/trailing hyphens
- Collapse multiple hyphens

**Check existing `$SPECS_DIR` directory to ensure uniqueness. If conflict exists, append suffix (e.g., 123-add-dark-mode-support-2).**

### 4. Create Spec Directory

Create `$SPECS_DIR[feature-name]/` directory with:
- `spec.json` - Metadata with GitHub Issue reference
- `requirements.md` - Template with issue content
- `session-state.md` - Initial session state

### 5. Initialize spec.json Metadata

Create initial metadata with GitHub Issue tracking:
```json
{
  "feature_name": "[feature-name]",
  "created_at": "current_timestamp",
  "updated_at": "current_timestamp",
  "language": "ja",
  "phase": "initialized",
  "source": {
    "type": "github_issue",
    "issue_number": 123,
    "issue_url": "https://github.com/owner/repo/issues/123"
  },
  "labels": ["enhancement", "ui"],
  "approvals": {
    "requirements": {
      "generated": false,
      "approved": false
    },
    "design": {
      "generated": false,
      "approved": false
    },
    "tasks": {
      "generated": false,
      "approved": false
    }
  },
  "ready_for_implementation": false
}
```

### 6. Create Requirements Template

Create requirements.md with issue content:
```markdown
# Requirements Document

**Source**: GitHub Issue #123
**URL**: https://github.com/owner/repo/issues/123
**Labels**: enhancement, ui
**Created**: 2025-11-27

## Original Issue Description

[Insert full issue body here]

## Requirements Analysis
<!-- Will be generated in /spec:requirements phase -->
```

### 7. Initialize session-state.md

Create initial session state:
```markdown
---
lastUpdated: "current_timestamp_iso8601"
phase: "initialized"
currentTaskIndex: 0
totalTasks: 0
testsPass: null
testsTotal: null
modifiedFiles: []
blockers: []
sourceIssue: 123
gitBranch: null
gitBaseBranch: null
---

# Session State: [feature-name]

## 📊 Progress Summary
- **Phase**: Initialized
- **Progress**: Not started
- **Source**: GitHub Issue #123

## 🎯 Current Focus
Specification initialized from GitHub Issue. Next step: Generate requirements.

## ✅ Last Completed Actions
1. ✓ Fetched GitHub Issue #123
2. ✓ Created specification structure
3. ✓ Initialized metadata

## 🔄 Next Steps
1. [ ] Run `/spec:requirements [feature-name]` to generate requirements
2. [ ] Review and approve requirements
3. [ ] Proceed with design and tasks phases

## 🐛 Known Issues / Blockers
*None*

## 📝 Implementation Notes
*Initial state - no implementation yet*

## 🔗 Key Files Modified This Session
- `$SPECS_DIR[feature-name]/spec.json`
- `$SPECS_DIR[feature-name]/requirements.md`
- `$SPECS_DIR[feature-name]/session-state.md`
```

### 8. Update CLAUDE.md Reference

Add the new spec to the active specifications list with:
- Feature name
- GitHub Issue reference (#123)
- Brief description from issue title

### 9. Link Issue to Specification (Optional)

If issue is still open, add a comment linking to the spec:
```bash
gh issue comment <issue-number> --body "📋 Specification created: $SPECS_DIR[feature-name]/"
```

## Output Format

After initialization, provide:
1. ✅ GitHub Issue fetched: #123 - "Issue Title"
2. 📁 Feature name generated: `[feature-name]`
3. 📄 Created files:
   - `$SPECS_DIR[feature-name]/spec.json`
   - `$SPECS_DIR[feature-name]/requirements.md`
   - `$SPECS_DIR[feature-name]/session-state.md`
4. 🔗 Issue URL: https://github.com/owner/repo/issues/123
5. **Next step**: `/spec:requirements [feature-name]`

## Error Handling

- **Invalid issue number**: Display error and exit
- **Issue not found**: Display error with `gh` output
- **No gh CLI**: Display error: "GitHub CLI not installed. Run: brew install gh"
- **Not authenticated**: Display error: "Not authenticated. Run: gh auth login"
- **Duplicate feature name**: Auto-append suffix and notify user

## Next Steps After Initialization

Follow the strict spec-driven development workflow:
1. **`/spec:requirements <feature-name>`** - Generate requirements from issue
2. **`/spec:design <feature-name>`** - Create technical design
3. **`/spec:tasks <feature-name>`** - Generate implementation tasks
4. **`/spec:impl <feature-name>`** - Execute implementation
