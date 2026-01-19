# Commands Directory

This directory contains all Claude Code skill definition files for the Spec-Driven Development system.

## Skill Files

The following 13 slash commands are defined here:

### Initialization
- `init.md` - Initialize new specification from description
- `init-issue.md` - Initialize specification from GitHub Issue

### Specification Workflow
- `requirements.md` - Generate requirements document (EARS format)
- `design.md` - Create technical design document
- `tasks.md` - Generate implementation tasks

### Implementation
- `impl.md` - Execute tasks using TDD methodology
- `resume.md` - Resume from last session (token-efficient)

### Progress Tracking
- `status.md` - Check specification status and progress

### Steering Documents
- `steering.md` - Create/update steering documents
- `steering-custom.md` - Create custom steering for specialized contexts

### Validation
- `validate-design.md` - Interactive technical design review
- `validate-gap.md` - Analyze implementation gap

### Completion
- `complete.md` - Mark specification as complete and archive

## File Format

Each skill file uses Markdown with YAML frontmatter:

```markdown
---
description: Brief description of the command
allowed-tools: Tool1, Tool2, Tool3
argument-hint: <argument-pattern>
---

# Command Implementation

[Skill implementation instructions...]
```

## Path Resolution

All skill files use dynamic path resolution via `spec-config.json`:
- `$SPECS_DIR` - Specification directory (default: `.spec/`)
- `$STEERING_DIR` - Steering documents directory (default: `.spec-steering/`)

Legacy paths (`.kiro/specs/`, `.kiro/steering/`) are automatically detected for backward compatibility.
