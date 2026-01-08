---
description: Initialize a new specification with detailed project description and requirements
allowed-tools: Bash, Read, Write, Glob
argument-hint: <project-description>
---

# Spec Initialization

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

Initialize a new specification based on the provided project description:

**Project Description**: $ARGUMENTS

## Task: Initialize Specification Structure

**SCOPE**: This command initializes the directory structure and metadata based on the detailed project description provided.

### 1. Generate Feature Name
Create a concise, descriptive feature name from the project description ($ARGUMENTS).
**Check existing `$SPECS_DIR` directory to ensure the generated feature name is unique. If a conflict exists, append a number suffix (e.g., feature-name-2).**

### 2. Create Spec Directory
Create `$SPECS_DIR[generated-feature-name]/` directory with:
- `spec.json` - Metadata and approval tracking
- `requirements.md` - Lightweight template with project description
- `session-state.md` - Initial session state tracking

**Note**: design.md and tasks.md will be created by their respective commands during the development process.

### 3. Initialize spec.json Metadata
Create initial metadata with approval tracking:
```json
{
  "feature_name": "[generated-feature-name]",
  "created_at": "current_timestamp",
  "updated_at": "current_timestamp",
  "language": "ja",
  "phase": "initialized",
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

### 4. Create Requirements Template
Create requirements.md with project description:
```markdown
# Requirements Document

## Project Description (Input)
$ARGUMENTS

## Requirements
<!-- Will be generated in /spec:requirements phase -->
```

### 5. Initialize session-state.md

Create initial session state with FrontMatter:
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
gitBranch: null
gitBaseBranch: null
---

# Session State: [generated-feature-name]

## 📊 Progress Summary
- **Phase**: Initialized
- **Progress**: Not started
- **Created**: current_timestamp

## 🎯 Current Focus
Specification initialized. Next step: Generate requirements document.

## ✅ Last Completed Actions
1. ✓ Created specification structure
2. ✓ Initialized metadata files

## 🔄 Next Steps
1. [ ] Run `/spec:requirements [generated-feature-name]` to generate requirements
2. [ ] Review and approve requirements
3. [ ] Proceed with design phase

## 🐛 Known Issues / Blockers
*None*

## 📝 Implementation Notes
*Initial state - no implementation yet*

## 🔗 Key Files Modified This Session
- `$SPECS_DIR[generated-feature-name]/spec.json`
- `$SPECS_DIR[generated-feature-name]/requirements.md`
- `$SPECS_DIR[generated-feature-name]/session-state.md`
```

### 6. Update CLAUDE.md Reference
Add the new spec to the active specifications list with the generated feature name and a brief description.

## Next Steps After Initialization

Follow the strict spec-driven development workflow:
1. **`/spec:requirements <feature-name>`** - Create and generate requirements.md
2. **`/spec:design <feature-name>`** - Create and generate design.md (requires approved requirements)
3. **`/spec:tasks <feature-name>`** - Create and generate tasks.md (requires approved design)

**Important**: Each phase creates its respective file and requires approval before proceeding to the next phase.

## Output Format

After initialization, provide:
1. Generated feature name and rationale
2. Brief project summary
3. Created spec.json path
4. **Clear next step**: `/spec:requirements <feature-name>`
5. Explanation that only spec.json was created, following stage-by-stage development principles
