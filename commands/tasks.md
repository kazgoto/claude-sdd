---
description: Generate implementation tasks for a specification
allowed-tools: Read, Write, Edit, MultiEdit, Glob, Grep
argument-hint: <feature-name> [-y]
---

# Implementation Tasks

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

Generate detailed implementation tasks for feature: **$1**

## Task: Generate Implementation Tasks

### Prerequisites & Context Loading
- If invoked with `-y` flag ($2 == "-y"): Auto-approve requirements and design in `spec.json`
- Otherwise: Stop if requirements/design missing or unapproved with message:
  "Run `/spec:requirements` and `/spec:design` first, or use `-y` flag to auto-approve"
- If tasks.md exists: Prompt [o]verwrite/[m]erge/[c]ancel

**Context Loading (Full Paths)**:
1. `.kiro/specs/$1/requirements.md` - Feature requirements (EARS format)
2. `.kiro/specs/$1/design.md` - Technical design document
3. `.kiro/steering/` - Project-wide guidelines and constraints:
   - **Core files (always load)**:
     - @.kiro/steering/product.md - Business context, product vision, user needs
     - @.kiro/steering/tech.md - Technology stack, frameworks, libraries
     - @.kiro/steering/structure.md - File organization, naming conventions, code patterns
   - **Custom steering files** (load all EXCEPT "Manual" mode in `AGENTS.md`):
     - Any additional `*.md` files in `.kiro/steering/` directory
     - Examples: `api.md`, `testing.md`, `security.md`, etc.
   - (Task planning benefits from comprehensive context)
4. `.kiro/specs/$1/tasks.md` - Existing tasks (only if merge mode)

### CRITICAL Task Numbering Rules (MUST FOLLOW)

**⚠️ MANDATORY: Sequential major task numbering & hierarchy limits**
- Major tasks: 1, 2, 3, 4, 5... (MUST increment sequentially)
- Sub-tasks: 1.1, 1.2, 2.1, 2.2... (reset per major task)
- **Maximum 2 levels of hierarchy** (no 1.1.1 or deeper)
- Format exactly as:
```markdown
- [ ] 1. Major task description
- [ ] 1.1 Sub-task description
  - Detail item 1
  - Detail item 2
  - _Requirements: X.X, Y.Y_

- [ ] 1.2 Sub-task description
  - Detail items...
  - _Requirements: X.X_

- [ ] 2. Next major task (NOT 1 again!)
- [ ] 2.1 Sub-task...
```

### Task Generation Rules

1. **Natural language descriptions**: Focus on capabilities and outcomes, not code structure
   - Describe **what functionality to achieve**, not file locations or code organization
   - Specify **business logic and behavior**, not method signatures or type definitions
   - Reference **features and capabilities**, not class names or API contracts
   - Use **domain language**, not programming constructs
   - **Avoid**: File paths, function/method names, type signatures, class/interface names, specific data structures
   - **Include**: User-facing functionality, business rules, system behaviors, data relationships
   - Implementation details (files, methods, types) come from design.md
2. **Task integration & progression**:
   - Each task must build on previous outputs (no orphaned code)
   - End with integration tasks to wire everything together
   - No hanging features - every component must connect to the system
   - Incremental complexity - no big jumps between tasks
   - Validate core functionality early in the sequence
3. **Flexible task sizing**:
   - Major tasks: As many sub-tasks as logically needed
   - Sub-tasks: 1-3 hours each, 3-10 details per sub
   - Group by cohesion, not arbitrary numbers
   - Balance between too granular and too broad
4. **Requirements mapping**: End details with `_Requirements: X.X, Y.Y_` or `_Requirements: [description]_`
5. **Code-only focus**: Include ONLY coding/testing tasks, exclude deployment/docs/user testing

### Example Structure (FORMAT REFERENCE ONLY)

```markdown
# Implementation Plan

- [ ] 1. Set up project foundation and infrastructure
  - Initialize project with required technology stack
  - Configure server infrastructure and request handling
  - Establish data storage and caching layer
  - Set up configuration and environment management
  - _Requirements: All requirements need foundational setup_

- [ ] 2. Build authentication and user management system
- [ ] 2.1 Implement core authentication functionality
  - Set up user data storage with validation rules
  - Implement secure authentication mechanism
  - Build user registration functionality
  - Add login and session management features
  - _Requirements: 7.1, 7.2_

- [ ] 2.2 Enable email service integration
  - Implement secure credential storage system
  - Build authentication flow for email providers
  - Create email connection validation logic
  - Develop email account management features
  - _Requirements: 5.1, 5.2, 5.4_
```

### Requirements Coverage Check
- **MANDATORY**: Ensure ALL requirements from requirements.md are covered
- Cross-reference every requirement ID with task mappings
- If gaps found: Return to requirements or design phase
- No requirement should be left without corresponding tasks

### Document Generation
- Generate `.kiro/specs/$1/tasks.md` using the exact numbering format above
- **Language**: Use language from `spec.json.language` field, default to English
- **Task descriptions**: Use natural language for "what to do" (implementation details in design.md)
- Update `.kiro/specs/$1/spec.json`:
  - Set `phase: "tasks-generated"`
  - Set approvals map exactly as:
    - `approvals.tasks = { "generated": true, "approved": false }`
  - Preserve existing metadata (e.g., `language`), do not remove unrelated fields
  - If invoked with `-y` flag: ensure the above approval booleans are applied even if previously unset/false
  - Set `updated_at` to current ISO8601 timestamp
  - Use file tools only (no shell commands)

### Initialize or Update session-state.md

If `session-state.md` exists:
- Update FrontMatter:
  - `phase: "tasks-generated"`
  - `totalTasks: <count of tasks in tasks.md>`
  - `currentTaskIndex: 0`
  - `lastUpdated: current_timestamp_iso8601`
- Update "Current Focus" section: "タスク生成完了。実装準備完了。"
- Update "Next Steps": List first 3 tasks from tasks.md

If `session-state.md` does NOT exist:
- Create new file with FrontMatter template (see spec-init.md for format)
- Set `phase: "tasks-generated"`
- Set `totalTasks` from tasks.md count
- Initialize other fields appropriately

---

## INTERACTIVE APPROVAL IMPLEMENTED (Not included in document)

The following is for Claude Code conversation only - NOT for the generated document:

## Next Phase: Implementation Ready

After generating tasks.md, review the implementation tasks:

**If tasks look good:**
Begin implementation following the generated task sequence

**If tasks need modification:**
Request changes and re-run this command after modifications

Tasks represent the final planning phase - implementation can begin once tasks are approved.

**Final approval process for implementation**:
```
📋 Tasks review completed. Ready for implementation.
📄 Generated: .kiro/specs/$1/tasks.md
✅ All phases approved. Implementation can now begin.
```

### Next Steps: Implementation
Once tasks are approved, start implementation:
```bash
/spec:impl $1          # Execute all pending tasks
/spec:impl $1 1.1      # Execute specific task
/spec:impl $1 1,2,3    # Execute multiple tasks
```

**Implementation Tips**:
- Use `/clear` if conversation becomes too long, then continue with spec commands
- All spec files (.kiro/specs/) are preserved and will be reloaded as needed

### Review Checklist (for user reference):
- [ ] Tasks are properly sized (1-3 hours each)
- [ ] All requirements are covered by tasks
- [ ] Task dependencies are correct
- [ ] Technology choices match the design
- [ ] Testing tasks are included

### Implementation Instructions
When tasks are approved, the implementation phase begins:
1. Work through tasks sequentially
2. Mark tasks as completed in tasks.md
3. Each task should produce working, tested code
4. Commit code after each major task completion

think deeply
