# Claude Spec-Driven Development (SDD)

A comprehensive Spec-Driven Development system for Claude Code projects, providing a structured workflow from specification to implementation with TDD methodology.

## Overview

Claude Spec-Driven Development (SDD) is a complete workflow system designed specifically for Claude Code CLI. It transforms software development through a systematic approach:

1. **Specification Creation**: Define project requirements with precision using EARS (Easy Approach to Requirements Syntax) format
2. **Technical Design**: Create comprehensive technical designs with architecture decisions and tradeoffs
3. **Task Breakdown**: Generate detailed implementation tasks with clear dependencies
4. **TDD Implementation**: Execute tasks using Test-Driven Development (Red-Green-Refactor cycle)
5. **Progress Tracking**: Automatic session state management and progress visualization

The system is configuration-driven, supporting flexible directory structures and seamless migration from legacy paths.

## Key Features

### Complete Workflow Coverage
- **12 Slash Commands**: Full lifecycle from spec initialization to implementation validation
- **Steering Documents**: Project-wide context and constraints for consistent AI guidance
- **Session State Tracking**: Automatic progress tracking with task completion percentage
- **GitHub Integration**: Initialize specs directly from GitHub Issues

### Flexible Configuration
- **Dynamic Path Resolution**: Configure custom directory paths via `spec-config.json`
- **Legacy Path Support**: Automatic detection and migration from `.kiro/` paths
- **Cross-Project Portability**: Install once, use in any Claude Code project

### Developer Experience
- **One-Command Install**: Install via curl or local script in seconds
- **Cross-Platform**: Works on macOS, Linux, and Windows (WSL2)
- **Error Handling**: Comprehensive error messages with exit codes
- **Token Efficiency**: Resume command for quick session recovery

## Installation

### Remote Installation (Recommended)

Install directly from GitHub without cloning:

```bash
# Bash (macOS, Linux, WSL2)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash

# Python (Windows, or if bash unavailable)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.py | python3
```

### Local Installation

Clone the repository and run the installer:

```bash
# Clone repository
git clone https://github.com/kazgoto/claude-sdd.git
cd claude-sdd

# Install with bash
./install.sh

# Or install with Python
python3 install.py
```

**What the installer does**:
1. Copies 12 skill definition files to `.claude/commands/spec/`
2. Detects legacy `.kiro/specs/` directory (if exists)
3. Generates `spec-config.json` with appropriate settings
4. Displays next steps and available commands

## Quick Start

Get started with Spec-Driven Development in 3 steps:

### Step 1: Initialize a Specification

From a project description:
```bash
/spec:init A user authentication system with OAuth2 support and JWT tokens
```

Or from a GitHub Issue:
```bash
/spec:init-issue 42
```

### Step 2: Generate Requirements and Design

```bash
# Generate detailed requirements (EARS format)
/spec:requirements auth-system

# Create technical design
/spec:design auth-system

# Generate implementation tasks
/spec:tasks auth-system
```

### Step 3: Implement with TDD

```bash
# Execute all tasks
/spec:impl auth-system

# Or execute specific tasks
/spec:impl auth-system 1-3,5

# Resume from last session
/spec:resume auth-system
```

## Available Commands

All commands use the `/spec:` prefix:

| Command | Description |
|---------|-------------|
| `/spec:init <description>` | Initialize new specification from description |
| `/spec:init-issue <number>` | Initialize specification from GitHub Issue |
| `/spec:requirements <name>` | Generate requirements document (EARS format) |
| `/spec:design <name>` | Create comprehensive technical design |
| `/spec:tasks <name>` | Generate implementation tasks with dependencies |
| `/spec:impl <name> [tasks]` | Execute tasks using TDD methodology |
| `/spec:resume <name>` | Resume from last session (token-efficient) |
| `/spec:status <name>` | Check specification status and progress |
| `/spec:steering` | Create/update steering documents |
| `/spec:steering-custom` | Create custom steering for specialized contexts |
| `/spec:validate-design <name>` | Interactive technical design quality review |
| `/spec:validate-gap <name>` | Analyze implementation gap |
| `/spec:complete <name> [options]` | Mark specification as complete and archive |

## Command Reference

### Initialization Commands

#### `/spec:init <description>`

Initialize a new specification from a project description.

**Usage:**
```bash
/spec:init Build a user authentication system with OAuth2 and JWT
```

**Arguments:**
- `<description>`: Detailed project description (required)

**What it does:**
1. Generates a unique feature name from the description
2. Creates spec directory structure: `{SPECS_DIR}/{feature-name}/`
3. Generates initial files:
   - `spec.json` - Metadata and approval tracking
   - `requirements.md` - Lightweight template with project description
   - `session-state.md` - Initial session state
4. Updates CLAUDE.md Active Specifications section (if exists)

**Example output:**
```
✅ Spec initialized: user-authentication-oauth2-jwt
📁 Location: .spec/user-authentication-oauth2-jwt/
📖 Next: /spec:requirements user-authentication-oauth2-jwt
```

---

#### `/spec:init-issue <issue-number>`

Initialize a new specification from a GitHub Issue.

**Usage:**
```bash
/spec:init-issue 42
```

**Arguments:**
- `<issue-number>`: GitHub Issue number (required)

**Prerequisites:**
- GitHub CLI (`gh`) must be installed
- Repository must be a GitHub repository

**What it does:**
1. Fetches issue details using `gh api`
2. Extracts title, body, labels, and metadata
3. Creates spec directory with issue context
4. Links spec to source issue in `spec.json`

**Example output:**
```
✅ Spec initialized from Issue #42
📁 Location: .spec/implement-dark-mode/
🔗 Source: https://github.com/user/repo/issues/42
📖 Next: /spec:requirements implement-dark-mode
```

---

### Requirements & Design Commands

#### `/spec:requirements <name>`

Generate comprehensive requirements document in EARS format.

**Usage:**
```bash
/spec:requirements user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**Prerequisites:**
- Spec must be initialized with `/spec:init` or `/spec:init-issue`

**What it does:**
1. Loads steering documents (structure, tech, product)
2. Analyzes project description and context
3. Generates EARS-formatted requirements:
   - Functional requirements with acceptance criteria
   - Non-functional requirements (performance, security, etc.)
   - Out of scope clarifications
4. Updates `spec.json` with requirements approval state

**Example output:**
```
✅ Requirements generated: .spec/user-authentication/requirements.md
📊 Generated: 12 functional requirements, 8 non-functional requirements
📖 Next: Review requirements, then /spec:design user-authentication
```

---

#### `/spec:design <name>`

Create comprehensive technical design document.

**Usage:**
```bash
/spec:design user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**Prerequisites:**
- Requirements must be generated and approved
- Interactive approval: System asks "Have you reviewed requirements.md? [y/N]"

**What it does:**
1. Loads requirements and steering documents
2. Generates technical design including:
   - Architecture overview and system flows
   - Component interfaces and contracts
   - Data models and error handling
   - Security considerations
3. Updates `spec.json` with design approval state

**Example output:**
```
✅ Design generated: .spec/user-authentication/design.md
📊 Components: 5, Interfaces: 8, Data models: 3
📖 Next: Review design, then /spec:tasks user-authentication
```

---

#### `/spec:tasks <name>`

Generate detailed implementation tasks with dependencies.

**Usage:**
```bash
/spec:tasks user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**Prerequisites:**
- Design must be generated and approved
- Interactive approval: System asks "Have you reviewed both requirements and design? [y/N]"

**What it does:**
1. Analyzes requirements and design documents
2. Generates implementation tasks:
   - Breaks down into logical sections
   - Defines dependencies between tasks
   - Maps tasks to requirements for traceability
3. Creates `tasks.md` with checkbox format for progress tracking

**Example output:**
```
✅ Tasks generated: .spec/user-authentication/tasks.md
📊 Total tasks: 28 (across 6 sections)
📖 Next: Review tasks, then /spec:impl user-authentication
```

---

### Implementation Commands

#### `/spec:impl <name> [task-numbers]`

Execute implementation tasks using TDD methodology.

**Usage:**
```bash
# Execute all pending tasks
/spec:impl user-authentication

# Execute specific task sections
/spec:impl user-authentication 1,3,5

# Execute task range
/spec:impl user-authentication 1-5
```

**Arguments:**
- `<name>`: Feature name (required)
- `[task-numbers]`: Task sections or ranges to execute (optional, defaults to all pending)

**Prerequisites:**
- Tasks must be generated and approved

**What it does:**
1. Creates feature branch (if in GitHub environment)
2. Loads all context (steering + spec documents)
3. Executes tasks using TDD Red-Green-Refactor cycle:
   - RED: Write failing tests
   - GREEN: Write minimal code to pass tests
   - REFACTOR: Improve code quality
4. Updates `session-state.md` and `tasks.md` after each task
5. Commits changes with descriptive messages

**Example output:**
```
✅ Task 1.1 completed: Set up authentication middleware
   Tests: 5/5 passed
   Commit: a1b2c3d

📊 Progress: 12/28 tasks completed (42.9%)
📖 Next: Continue with /spec:impl user-authentication 4-6
```

---

#### `/spec:resume <name>`

Resume implementation from last session (token-efficient).

**Usage:**
```bash
/spec:resume user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**What it does:**
1. Loads minimal context from `session-state.md`
2. Displays current progress and next steps
3. Resumes from last incomplete task
4. Significantly faster than `/spec:impl` (reduced token usage)

**Example output:**
```
📊 Resuming: user-authentication
   Progress: 12/28 tasks (42.9%)
   Last completed: Task 3.2 - JWT token generation

🎯 Next task: 4.1 - Implement token refresh endpoint
📖 Continue with implementation
```

---

### Monitoring Commands

#### `/spec:status <name>`

Check specification status and progress.

**Usage:**
```bash
/spec:status user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**What it does:**
1. Reads `spec.json` and `session-state.md`
2. Displays comprehensive status:
   - Current phase (requirements/design/tasks/implementation)
   - Approval states
   - Task completion percentage
   - Recent commits
   - Known blockers

**Example output:**
```
📋 Spec: user-authentication
📁 Location: .spec/user-authentication/

Phase: Implementation (TDD)
Progress: 12/28 tasks (42.9%)

Approvals:
  ✅ Requirements (approved)
  ✅ Design (approved)
  ✅ Tasks (approved)

Tests: 45/45 passing
Last updated: 2026-01-08T15:30:00+09:00
```

---

### Steering Commands

#### `/spec:steering`

Create or update steering documents intelligently.

**Usage:**
```bash
/spec:steering
```

**What it does:**
1. Detects project state (new project vs. existing)
2. Creates or updates core steering documents:
   - `structure.md` - Project structure and organization
   - `tech.md` - Technology stack and tools
   - `product.md` - Product overview and goals
3. Preserves existing custom steering files
4. Provides guidance on steering document usage

**Example output:**
```
✅ Steering documents updated
📁 Location: .spec-steering/

Created/Updated:
  - structure.md (updated based on current project)
  - tech.md (preserved existing + added new frameworks)
  - product.md (updated business context)

📖 Use these documents as context for all /spec:* commands
```

---

#### `/spec:steering-custom`

Create custom steering documents for specialized contexts.

**Usage:**
```bash
/spec:steering-custom
```

**What it does:**
1. Interactive wizard for custom steering creation
2. Asks for:
   - Steering document purpose
   - Target context (specific files, features, or always-on)
   - Content structure
3. Creates specialized steering document
4. Registers it in CLAUDE.md custom steering section

**Example output:**
```
✅ Custom steering created: api-design-guidelines.md
📁 Location: .spec-steering/api-design-guidelines.md

Inclusion mode: Conditional (*.api.ts files)
Registered in: CLAUDE.md

📖 This steering will be loaded when working on API files
```

---

### Validation Commands

#### `/spec:validate-design <name>`

Interactive technical design quality review.

**Usage:**
```bash
/spec:validate-design user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**Prerequisites:**
- Design document must exist

**What it does:**
1. Analyzes design document for:
   - Architecture completeness
   - Interface definitions
   - Error handling coverage
   - Security considerations
2. Provides interactive feedback with improvement suggestions
3. Generates validation report with scores

**Example output:**
```
📋 Design Validation: user-authentication

Architecture: ✅ Complete (95/100)
Interfaces: ⚠️  Needs improvement (70/100)
  - Missing error responses in AuthController
  - Incomplete data validation in UserService

Security: ✅ Good (85/100)
Error Handling: ✅ Complete (90/100)

Overall Score: 85/100 (Good)

📖 Recommended: Address interface gaps before tasks generation
```

---

#### `/spec:validate-gap <name>`

Analyze implementation gap between requirements and existing code.

**Usage:**
```bash
/spec:validate-gap user-authentication
```

**Arguments:**
- `<name>`: Feature name (required)

**Prerequisites:**
- Requirements document must exist
- Some implementation should exist (partially completed)

**What it does:**
1. Compares requirements with current codebase
2. Identifies:
   - Implemented requirements
   - Partially implemented requirements
   - Not yet implemented requirements
3. Highlights discrepancies and missing features
4. Suggests next steps for completion

**Example output:**
```
📋 Implementation Gap Analysis: user-authentication

Requirements Coverage:
  ✅ Implemented: 8/12 (66.7%)
  🔄 Partial: 3/12 (25.0%)
  ❌ Not implemented: 1/12 (8.3%)

Not Implemented:
  - Requirement 2.4: Token refresh mechanism

Partially Implemented:
  - Requirement 1.3: OAuth2 integration (missing Google provider)
  - Requirement 3.1: Rate limiting (missing IP-based limits)

📖 Next: Focus on completing partial implementations
```

---

#### `/spec:complete <name> [options]`

Mark specification as complete, update metadata, and archive.

**Usage:**
```bash
# Auto-detect PR from issue number
/spec:complete user-authentication

# Manually specify PR number
/spec:complete user-authentication --pr 42

# Update spec.json only (skip archiving)
/spec:complete user-authentication --skip-archive

# Preview changes without executing
/spec:complete user-authentication --dry-run
```

**Arguments:**
- `<name>`: Feature name (required)
- `--pr <number>`: Manually specify PR number (optional, auto-detects from issue by default)
- `--skip-archive`: Update spec.json only, skip directory archiving (optional)
- `--dry-run`: Show what would be done without making changes (optional)

**Prerequisites:**
- Specification must exist and not be archived
- Git repository
- GitHub CLI (`gh`) installed and authenticated
- PR must be merged (or specified with `--pr`)

**What it does:**
1. Validates specification and prerequisites
2. Detects PR information:
   - Auto-detection: Searches for merged PRs linked to spec's issue number
   - Manual: Uses `--pr` option to specify PR directly
3. Updates `spec.json` with completion metadata:
   - Sets `phase: "completed"`
   - Adds `completed_at` timestamp
   - Records PR number, URL, merge date, and branch
   - Marks `approvals.tasks.approved: true`
4. Archives specification (unless `--skip-archive`):
   - Moves directory to `{SPECS_DIR}_archived/{feature-name}/`
   - Verifies all expected files present
5. Updates CLAUDE.md:
   - Removes entry from Active Specifications section
6. Displays completion summary with recommended commit message

**Example output:**
```
✅ 仕様 user-authentication を完了としてマークしました

📊 サマリー:
  - 完了日時: 2026-01-16T09:00:00Z
  - PR: #42 (https://github.com/user/repo/pull/42)
  - アーカイブパス: .spec/_archived/user-authentication/

📝 変更されたファイル:
  - spec.json
  - ディレクトリ移動: user-authentication -> _archived/user-authentication
  - CLAUDE.md

🔄 次のステップ:
  1. 変更を確認してください
  2. コミットしてプッシュしてください:

     git add .
     git commit -m "spec: complete user-authentication (#42)"
     git push
```

---

## Workflow

The typical workflow follows these phases:

```mermaid
graph LR
    A[/spec:init] --> B[/spec:requirements]
    B --> C[/spec:design]
    C --> D[/spec:tasks]
    D --> E[/spec:impl]
    E --> F{Complete?}
    F -->|No| G[/spec:resume]
    G --> E
    F -->|Yes| H[/spec:complete]
    H --> I[Done]

    J[/spec:status] -.->|Check progress| E
    K[/spec:validate-design] -.->|Review| C
    L[/spec:validate-gap] -.->|Check coverage| E
```

**Phase 0 (Optional):** Steering
- `/spec:steering` - Create project-wide context

**Phase 1:** Specification
1. `/spec:init <description>` or `/spec:init-issue <number>`
2. `/spec:requirements <name>`
3. `/spec:design <name>`
4. `/spec:tasks <name>`

**Phase 2:** Implementation
5. `/spec:impl <name> [tasks]`
6. `/spec:resume <name>` (for subsequent sessions)
7. `/spec:status <name>` (monitor progress)

**Phase 3 (Optional):** Validation
- `/spec:validate-design <name>` - Before implementation
- `/spec:validate-gap <name>` - During implementation

---

## Configuration

### Configuration File

The system uses `.claude/spec-config.json` for path management:

```json
{
  "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
  "version": "1.0.0",
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false,
    "warnOnLegacyPaths": true
  },
  "metadata": {
    "installedAt": "2026-01-08T10:00:00Z",
    "installedFrom": "https://github.com/kazgoto/claude-sdd",
    "version": "1.0.0"
  }
}
```

### Configuration Fields

- **`version`**: Configuration file version (semantic versioning)
- **`paths.specs`**: Directory for specification files (must end with `/`)
- **`paths.steering`**: Directory for steering documents (must end with `/`)
- **`compatibility.legacyMode`**: Enable legacy path compatibility (`.kiro/`)
- **`compatibility.warnOnLegacyPaths`**: Show warnings when legacy paths detected
- **`metadata.installedAt`**: Installation timestamp (ISO 8601)
- **`metadata.installedFrom`**: Source URL or path
- **`metadata.version`**: Installed system version

### Path Requirements

- Must be **relative paths** (no absolute paths)
- Must end with **`/`** (trailing slash)
- No **`...`** directory traversal allowed
- No **leading `/`** (absolute path indicator)

**Valid paths**: `.spec/`, `specifications/`, `.kiro/specs/`  
**Invalid paths**: `/spec/`, `../specs/`, `spec` (no trailing slash)

### Legacy Mode

If you have existing `.kiro/specs/` directory, the installer automatically detects it and sets `legacyMode: true`. You can manually switch between modes:

**New project (recommended)**:
```json
{
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false
  }
}
```

**Legacy project (backward compatibility)**:
```json
{
  "paths": {
    "specs": ".kiro/specs/",
    "steering": ".kiro/steering/"
  },
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": true
  }
}
```

## Documentation

- **[Installation Guide](docs/installation.md)** - Detailed installation instructions
- **[Command Reference](docs/commands.md)** - Complete command documentation
- **[Configuration](docs/configuration.md)** - Configuration file reference
- **[Migration Guide](docs/migration.md)** - Migrating from legacy paths
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Examples

See the [examples/](examples/) directory for:
- Sample specifications
- Steering document templates
- Configuration examples
- Workflow demonstrations

## Why claude-sdd?

While excellent tools like [cc-sdd](https://github.com/gotalab/cc-sdd) provide multi-AI-tool spec-driven development, **claude-sdd** focuses on a different set of priorities:

### Simplicity & Portability
- **No NPM dependencies**: Install with a single `curl` command or local script
- **Cross-platform**: Bash and Python installers work on macOS, Linux, Windows (WSL2)
- **Single-project focus**: Optimized for individual Claude Code projects, not multi-tool workflows

### Flexibility & Configuration
- **Dynamic path resolution**: Configure custom directory paths via `spec-config.json`
- **Legacy path support**: Automatic detection and migration from `.kiro/` paths
- **JSON Schema validation**: Configuration file validation with comprehensive error messages

### Security & Validation
- **Built-in path validation**: Prevents directory traversal and absolute path vulnerabilities
- **Input sanitization**: Feature name sanitization to prevent command injection
- **Security documentation**: Comprehensive security guidelines in `docs/security.md`

### Enhanced Developer Experience
- **GitHub Issue integration**: Initialize specs directly from GitHub Issues with `/spec:init-issue`
- **Session state management**: Automatic progress tracking with resume capability
- **Token efficiency**: `/spec:resume` command for quick session recovery with minimal context
- **Comprehensive testing guide**: 717-line testing documentation with CI/CD templates

### Claude Code Native
- **Optimized for Claude Code**: Takes full advantage of Claude Code's unique capabilities
- **Slash command conventions**: Uses `/spec:*` namespace for consistency
- **Error handling**: Comprehensive error messages with actionable next steps

**Choose cc-sdd** for multi-AI-tool/multi-language team workflows.
**Choose claude-sdd** for Claude Code-focused, portable, secure, single-project workflows.

## Acknowledgments

This project was inspired by [cc-sdd](https://github.com/gotalab/cc-sdd), an excellent specification-driven development tool for multiple AI coding assistants. While claude-sdd shares similar conceptual foundations in spec-driven development methodology, it has been independently implemented with a focus on:

- Single-project portability and simplicity (Git-based installation vs. NPM)
- Dynamic path configuration with JSON Schema validation
- Claude Code-specific optimizations and native integration
- Enhanced security features (path validation, input sanitization)
- GitHub Issue integration and session state management

We thank the cc-sdd team for pioneering the spec-driven development approach in the AI coding assistant ecosystem. Both projects share the MIT License and the common goal of making structured, specification-driven development accessible to developers.

## Requirements

- **Claude Code CLI** - The system is designed for Claude Code
- **Git** (optional) - For GitHub Issue integration (`/spec:init-issue`)
- **GitHub CLI** (optional) - For enhanced GitHub features

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development environment setup
- Code style guidelines
- Pull request process
- Testing requirements

## Version

**Current version**: 1.0.0

### Release Notes

**1.0.0** (2026-01-08)
- Initial release
- 12 slash commands for complete SDD workflow
- Configuration-driven path management
- Legacy path detection and migration support
- Bash and Python installation scripts
- Comprehensive error handling
- JSON Schema validation for configuration

## Support

- **Issues**: [GitHub Issues](https://github.com/kazgoto/claude-sdd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kazgoto/claude-sdd/discussions)
- **Repository**: [https://github.com/kazgoto/claude-sdd](https://github.com/kazgoto/claude-sdd)
