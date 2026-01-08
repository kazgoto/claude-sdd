# Documentation Directory

Comprehensive documentation for Claude Spec-Driven Development (SDD) system.

## Documentation Files

- `installation.md` - Installation guide and setup instructions
- `commands.md` - Complete reference for all 12 slash commands
- `configuration.md` - Configuration file reference and examples
- `migration.md` - Migration guide from legacy paths
- `troubleshooting.md` - Common issues and solutions

## Quick Links

### Getting Started
1. [Installation Guide](installation.md) - Install Claude SDD in your project
2. [Command Reference](commands.md) - Learn available commands
3. [Quick Start](../README.md#quick-start) - First specification in 3 steps

### Configuration
- [Configuration Reference](configuration.md) - All config options explained
- [Path Configuration](configuration.md#path-configuration) - Custom directory paths
- [Legacy Mode](migration.md) - Backward compatibility

### Troubleshooting
- [Common Errors](troubleshooting.md) - Error messages and solutions
- [Migration Guide](migration.md) - Migrating from `.kiro/` paths
- [GitHub Issues](https://github.com/kazgoto/claude-sdd/issues) - Report bugs

## Workflow Documentation

The Spec-Driven Development workflow consists of:

1. **Initialization** - Create specification from description or GitHub Issue
2. **Requirements** - Generate detailed requirements (EARS format)
3. **Design** - Create technical design document
4. **Tasks** - Break down into implementation tasks
5. **Implementation** - Execute tasks with TDD methodology
6. **Progress Tracking** - Monitor progress and session state

## Command Usage Patterns

### Basic Workflow
```
/spec:init <project-description>
/spec:requirements <feature-name>
/spec:design <feature-name>
/spec:tasks <feature-name>
/spec:impl <feature-name>
```

### From GitHub Issue
```
/spec:init-issue <issue-number>
/spec:requirements <feature-name>
/spec:design <feature-name>
/spec:tasks <feature-name>
/spec:impl <feature-name>
```

### Session Management
```
/spec:status <feature-name>    # Check progress
/spec:resume <feature-name>    # Resume from last session
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Documentation improvements
- Adding examples
- Translating documentation
- Reporting documentation issues
