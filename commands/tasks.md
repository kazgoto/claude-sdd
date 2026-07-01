---
description: Generate implementation tasks for a specification
allowed-tools: Read, Write, Edit, Glob, Grep
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
1. `$SPECS_DIR$1/requirements.md` - Feature requirements (EARS format)
2. `$SPECS_DIR$1/design.md` - Technical design document
3. `$STEERING_DIR` (resolved above from spec-config.json; do NOT hardcode `.kiro/steering/`) - Project-wide guidelines and constraints:
   - **Core files (always load)**:
     - `$STEERING_DIR/product.md` - Business context, product vision, user needs
     - `$STEERING_DIR/tech.md` - Technology stack, frameworks, libraries
     - `$STEERING_DIR/structure.md` - File organization, naming conventions, code patterns
   - **Custom steering files** (load all EXCEPT "Manual" mode in `AGENTS.md`):
     - Any additional `*.md` files in the `$STEERING_DIR` directory (e.g. `parallel.md`, `testing.md`, `security.md`)
     - Read each with the Read tool after resolving `$STEERING_DIR`
   - (Task planning benefits from comprehensive context)
4. `$SPECS_DIR$1/tasks.md` - Existing tasks (only if merge mode)

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
6. **Parallelizability classification (for autonomous & parallel execution)**: While generating tasks, reason about which tasks can run concurrently. This drives the Parallelization Plan section below. Two axes decide it:
   - **Dependency**: does this task consume another task's output (types, functions, schema, API)? If yes, it must run after that task.
   - **File ownership**: which files does this task create or modify? Two tasks may run in parallel ONLY if their file sets are disjoint. Overlapping files ⇒ serial.
   - Prefer designing a small **Layer 0** of shared contracts (types/interfaces/schema) up front so that downstream module tasks become independent and parallel-safe. Do NOT manufacture parallelism that the dependency graph does not support.
7. **E2E harness bootstrap task (conditional)**: Read design.md's Testing Strategy → E2E/UI Tests section.
   - If it names specific Requirement ID(s) as REQUIRED for e2e coverage AND no e2e harness exists yet in the repo (no `playwright.config.*`/`cypress.config.*`/equivalent): generate one additional major task — "e2eテストハーネスをbootstrapする" (install the test framework, create its config, establish a fixture/seed convention for this repo's data layer, document the convention for future specs) — and place it in **Layer 0** (foundation, serial, first). This is a one-time cost; specs written after this one will detect the harness already present and skip this task.
   - If it names Requirement IDs and a harness already exists: do NOT generate a bootstrap task. Instead, the Layer 2 integration task must include writing and running the named e2e scenario(s) using the existing harness/fixture convention.
   - If the section says "対象外" (either UI向け要件なし or harness未整備の⚠️フラグ): do not generate any e2e-related task. A ⚠️-flagged-but-undecided design.md is a deliberate default to skip — it is not this command's job to second-guess that; if the human wants it in scope, they edit design.md first (per the flag's own instructions) and re-run this command.

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

### Parallelization Plan (MANDATORY — append at end of tasks.md)

After the task list, append a `## Parallelization Plan` section that classifies every major task into execution layers. This section is consumed by autonomous/parallel runners (e.g. a worktree fan-out workflow), so be precise and honest.

Required format:

```markdown
## Parallelization Plan

### Layer 0 — Foundation (serial, run first)
Shared contracts every downstream task depends on (types / interfaces / schema / shared config).
If an e2e harness bootstrap task was generated (see Task Generation Rule 7), it belongs here too —
it is a foundation for the Layer 2 e2e scenario, not a feature module.
- Task 1 — owns: `path/a.ts`, `path/b.ts`

### Layer 1 — Independent modules (parallel-safe)
Tasks with NO mutual dependency AND disjoint file ownership. Safe to run each in its own worktree concurrently.
- Task 2 — owns: `path/c.ts`, `tests/c.test.ts` — depends on: Layer 0
- Task 3 — owns: `path/d.ts`, `tests/d.test.ts` — depends on: Layer 0

### Layer 2 — Integration (serial, run last)
Wiring / cross-cutting tasks that depend on multiple Layer 1 outputs. If design.md's Testing
Strategy names Requirement ID(s) as REQUIRED for e2e coverage, this task must also write and run
those e2e scenario(s) against the harness (existing, or bootstrapped in Layer 0) — not just a
manual preview check.
- Task 4 — owns: `path/wire.ts` — depends on: Task 2, Task 3

### Dependency & ownership table
| Task | Depends on | Owned files | Layer |
|------|-----------|-------------|-------|
| 1 | — | a.ts, b.ts | 0 |
| 2 | 1 | c.ts | 1 |
```

Hard rules:
- A task goes in Layer 1 ONLY if its owned-file set is disjoint from every other Layer 1 task. If two tasks touch the same file, they are serial — keep them out of Layer 1.
- **If no two tasks are independent, state exactly: `No Layer 1 parallelism — this spec is serial.`** Never invent parallelism to look productive. A correct "serial" verdict is a successful result.
- Owned files come from design.md; if a task's files are unknown, treat it as serial (conservative default).

### Requirements Coverage Check
- **MANDATORY**: Ensure ALL requirements from requirements.md are covered
- Cross-reference every requirement ID with task mappings
- If gaps found: Return to requirements or design phase
- No requirement should be left without corresponding tasks

### Document Generation
- Generate `$SPECS_DIR$1/tasks.md` using the exact numbering format above
- Append the `## Parallelization Plan` section (see format above) at the end — this is mandatory, even when the verdict is "serial"
- **Language**: Use language from `spec.json.language` field, default to English
- **Task descriptions**: Use natural language for "what to do" (implementation details in design.md)
- Update `$SPECS_DIR$1/spec.json`:
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
📄 Generated: $SPECS_DIR$1/tasks.md
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
- All spec files ($SPECS_DIR) are preserved and will be reloaded as needed

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
