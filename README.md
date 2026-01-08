# Claude Spec-Driven Development (SDD)

A comprehensive Spec-Driven Development system for Claude Code projects.

## Overview

Claude SDD provides a complete workflow for structured software development using specifications:
- Initialize specifications from descriptions or GitHub Issues
- Generate requirements with EARS format
- Create technical designs
- Generate implementation tasks
- Execute tasks with TDD methodology
- Track progress and session state

## Features

- **12 Slash Commands**: Complete workflow from spec initialization to implementation
- **Configuration-Driven**: Flexible directory paths via `spec-config.json`
- **Backward Compatible**: Legacy path detection and migration support
- **One-Command Install**: Simple installation script for any project
- **Claude Code Optimized**: Designed specifically for Claude Code CLI environment

## Installation

### Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash
```

### Manual Install

```bash
# Clone repository
git clone https://github.com/kazgoto/claude-sdd.git
cd claude-sdd

# Run install script
bash install.sh
```

## Commands

- `/spec:init` - Initialize new specification
- `/spec:init-issue` - Initialize from GitHub Issue
- `/spec:requirements` - Generate requirements document
- `/spec:design` - Create technical design
- `/spec:tasks` - Generate implementation tasks
- `/spec:impl` - Execute tasks with TDD
- `/spec:resume` - Resume from last session
- `/spec:status` - Check specification status
- `/spec:steering` - Create/update steering documents
- `/spec:steering-custom` - Create custom steering
- `/spec:validate-design` - Validate technical design
- `/spec:validate-gap` - Analyze implementation gap

## Configuration

The system uses `spec-config.json` for flexible path management:

```json
{
  "version": "1.0.0",
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false,
    "warnOnLegacyPaths": true
  }
}
```

## Quick Start

1. Install Claude SDD in your project
2. Initialize a new specification:
   ```
   /spec:init <project-description>
   ```
3. Follow the workflow: requirements → design → tasks → implementation

## Documentation

- [Installation Guide](docs/installation.md)
- [Command Reference](docs/commands.md)
- [Configuration](docs/configuration.md)
- [Migration Guide](docs/migration.md)

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Version

Current version: 1.0.0
