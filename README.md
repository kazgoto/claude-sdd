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
- **Dynamic Path Resolution**: Configure custom directory paths via \`spec-config.json\`
- **Legacy Path Support**: Automatic detection and migration from \`.kiro/\` paths
- **Cross-Project Portability**: Install once, use in any Claude Code project

### Developer Experience
- **One-Command Install**: Install via curl or local script in seconds
- **Cross-Platform**: Works on macOS, Linux, and Windows (WSL2)
- **Error Handling**: Comprehensive error messages with exit codes
- **Token Efficiency**: Resume command for quick session recovery

## Installation

### Remote Installation (Recommended)

Install directly from GitHub without cloning:

\`\`\`bash
# Bash (macOS, Linux, WSL2)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash

# Python (Windows, or if bash unavailable)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.py | python3
\`\`\`

### Local Installation

Clone the repository and run the installer:

\`\`\`bash
# Clone repository
git clone https://github.com/kazgoto/claude-sdd.git
cd claude-sdd

# Install with bash
./install.sh

# Or install with Python
python3 install.py
\`\`\`

**What the installer does**:
1. Copies 12 skill definition files to \`.claude/commands/spec/\`
2. Detects legacy \`.kiro/specs/\` directory (if exists)
3. Generates \`spec-config.json\` with appropriate settings
4. Displays next steps and available commands

## Quick Start

Get started with Spec-Driven Development in 3 steps:

### Step 1: Initialize a Specification

From a project description:
\`\`\`bash
/spec:init A user authentication system with OAuth2 support and JWT tokens
\`\`\`

Or from a GitHub Issue:
\`\`\`bash
/spec:init-issue 42
\`\`\`

### Step 2: Generate Requirements and Design

\`\`\`bash
# Generate detailed requirements (EARS format)
/spec:requirements auth-system

# Create technical design
/spec:design auth-system

# Generate implementation tasks
/spec:tasks auth-system
\`\`\`

### Step 3: Implement with TDD

\`\`\`bash
# Execute all tasks
/spec:impl auth-system

# Or execute specific tasks
/spec:impl auth-system 1-3,5

# Resume from last session
/spec:resume auth-system
\`\`\`

## Available Commands

All commands use the \`/spec:\` prefix:

| Command | Description |
|---------|-------------|
| \`/spec:init <description>\` | Initialize new specification from description |
| \`/spec:init-issue <number>\` | Initialize specification from GitHub Issue |
| \`/spec:requirements <name>\` | Generate requirements document (EARS format) |
| \`/spec:design <name>\` | Create comprehensive technical design |
| \`/spec:tasks <name>\` | Generate implementation tasks with dependencies |
| \`/spec:impl <name> [tasks]\` | Execute tasks using TDD methodology |
| \`/spec:resume <name>\` | Resume from last session (token-efficient) |
| \`/spec:status <name>\` | Check specification status and progress |
| \`/spec:steering\` | Create/update steering documents |
| \`/spec:steering-custom\` | Create custom steering for specialized contexts |
| \`/spec:validate-design <name>\` | Interactive technical design quality review |
| \`/spec:validate-gap <name>\` | Analyze implementation gap |

## Configuration

### Configuration File

The system uses \`.claude/spec-config.json\` for path management:

\`\`\`json
{
  "\$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
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
\`\`\`

### Configuration Fields

- **\`version\`**: Configuration file version (semantic versioning)
- **\`paths.specs\`**: Directory for specification files (must end with \`/\`)
- **\`paths.steering\`**: Directory for steering documents (must end with \`/\`)
- **\`compatibility.legacyMode\`**: Enable legacy path compatibility (\`.kiro/\`)
- **\`compatibility.warnOnLegacyPaths\`**: Show warnings when legacy paths detected
- **\`metadata.installedAt\`**: Installation timestamp (ISO 8601)
- **\`metadata.installedFrom\`**: Source URL or path
- **\`metadata.version\`**: Installed system version

### Path Requirements

- Must be **relative paths** (no absolute paths)
- Must end with **\`/\`** (trailing slash)
- No **\`...\`** directory traversal allowed
- No **leading \`/\`** (absolute path indicator)

**Valid paths**: \`.spec/\`, \`specifications/\`, \`.kiro/specs/\`  
**Invalid paths**: \`/spec/\`, \`../specs/\`, \`spec\` (no trailing slash)

### Legacy Mode

If you have existing \`.kiro/specs/\` directory, the installer automatically detects it and sets \`legacyMode: true\`. You can manually switch between modes:

**New project (recommended)**:
\`\`\`json
{
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false
  }
}
\`\`\`

**Legacy project (backward compatibility)**:
\`\`\`json
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
\`\`\`

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

## Requirements

- **Claude Code CLI** - The system is designed for Claude Code
- **Git** (optional) - For GitHub Issue integration (\`/spec:init-issue\`)
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
