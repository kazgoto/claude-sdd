---
description: Generate comprehensive requirements for a specification
allowed-tools: Bash, Glob, Grep, LS, Read, Write, Edit, MultiEdit, Update, WebSearch, WebFetch
argument-hint: <feature-name>
---

# Requirements Generation

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

Generate comprehensive requirements for feature: **$1**

## Context Validation

### Steering Context
- Architecture context: @$STEERING_DIR/structure.md
- Technical constraints: @$STEERING_DIR/tech.md
- Product context: @$STEERING_DIR/product.md
- Custom steering: Load all "Always" mode custom steering files from $STEERING_DIR

### Existing Spec Context
- Current spec directory: !`ls -la $SPECS_DIR$1/`
- Current requirements: `$SPECS_DIR$1/requirements.md`
- Spec metadata: `$SPECS_DIR$1/spec.json`

## Task: Generate Initial Requirements

### 1. Read Existing Requirements Template
Read the existing requirements.md file created by spec-init to extract the project description.

### 2. Generate Complete Requirements
Generate an initial set of requirements in EARS format based on the project description, then iterate with the user to refine them until they are complete and accurate.

Don't focus on implementation details in this phase. Instead, just focus on writing requirements which will later be turned into a design.

### Requirements Generation Guidelines
1. **Focus on Core Functionality**: Start with the essential features from the user's idea
2. **Use EARS Format**: All acceptance criteria must use proper EARS syntax
3. **No Sequential Questions**: Generate initial version first, then iterate based on user feedback
4. **Keep It Manageable**: Create a solid foundation that can be expanded through user review
5. **Choose an appropriate subject**: For software projects, use the concrete system/service name (e.g., "Checkout Service") instead of a generic subject. For non-software, choose a responsible subject (e.g., process/workflow, team/role, artifact/document, campaign, protocol).

### 3. EARS Format Requirements

**EARS (Easy Approach to Requirements Syntax)** is the recommended format for acceptance criteria:

**Primary EARS Patterns:**
- WHEN [event/condition] THEN [system/subject] SHALL [response]
- IF [precondition/state] THEN [system/subject] SHALL [response]
- WHILE [ongoing condition] THE [system/subject] SHALL [continuous behavior]
- WHERE [location/context/trigger] THE [system/subject] SHALL [contextual behavior]

**Combined Patterns:**
- WHEN [event] AND [additional condition] THEN [system/subject] SHALL [response]
- IF [condition] AND [additional condition] THEN [system/subject] SHALL [response]

### 4. Requirements Document Structure
Update requirements.md with complete content in the language specified in spec.json (check `$SPECS_DIR$1/spec.json` for "language" field):

```markdown
# Requirements Document

## Introduction
[Clear introduction summarizing the feature and its business value]

## Requirements

### Requirement 1: [Major Objective Area]
**Objective:** As a [role/stakeholder], I want [feature/capability/outcome], so that [benefit]

#### Acceptance Criteria
This section should have EARS requirements

1. WHEN [event] THEN [system/subject] SHALL [response]
2. IF [precondition] THEN [system/subject] SHALL [response]
3. WHILE [ongoing condition] THE [system/subject] SHALL [continuous behavior]
4. WHERE [location/context/trigger] THE [system/subject] SHALL [contextual behavior]

### Requirement 2: [Next Major Objective Area]
**Objective:** As a [role/stakeholder], I want [feature/capability/outcome], so that [benefit]

1. WHEN [event] THEN [system/subject] SHALL [response]
2. WHEN [event] AND [condition] THEN [system/subject] SHALL [response]

### Requirement 3: [Additional Major Areas]
[Continue pattern for all major functional areas]
```

### 5. Update Metadata
Update spec.json with:
```json
{
  "phase": "requirements-generated",
  "approvals": {
    "requirements": {
      "generated": true,
      "approved": false
    }
  },
  "updated_at": "current_timestamp"
}
```

### 6. Document Generation Only
Generate the requirements document content ONLY. Do not include any review or approval instructions in the actual document file.

---

## Next Phase: Interactive Approval

After generating requirements.md, review the requirements and choose:

**If requirements look good:**
Run `/spec:design $1 -y` to proceed to design phase

**If requirements need modification:**
Request changes, then re-run this command after modifications

The `-y` flag auto-approves requirements and generates design directly, streamlining the workflow while maintaining review enforcement.

## Instructions

1. **Check spec.json for language** - Use the language specified in the metadata
2. **Generate initial requirements** based on the feature idea WITHOUT asking sequential questions first
3. **Apply EARS format** - Use proper EARS syntax patterns for all acceptance criteria
4. **Focus on core functionality** - Start with essential features and user workflows
5. **Structure clearly** - Group related functionality into logical requirement areas
6. **Make requirements testable** - Each acceptance criterion should be verifiable
7. **Update tracking metadata** upon completion

Generate requirements that provide a solid foundation for the design phase, focusing on the core functionality from the feature idea.
think
