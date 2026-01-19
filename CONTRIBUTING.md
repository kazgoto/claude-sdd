# Contributing to Claude SDD

Thank you for your interest in contributing to Claude Spec-Driven Development! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Claude Code version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- Clear description of the proposed feature
- Use case and rationale
- Example usage (if applicable)

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the code style guidelines below
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages** following the commit message guidelines
6. **Submit a pull request** to the `main` branch

## Development Setup

### Prerequisites

- Git
- Bash (macOS/Linux) or WSL2 (Windows)
- Claude Code CLI
- (Optional) Python 3.x for testing install.py

### Local Development

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/claude-sdd.git
cd claude-sdd
```

2. Install locally to test:
```bash
./install.sh
```

3. Test in a sample project:
```bash
cd /path/to/test/project
# Try various /spec: commands
```

## Code Style Guidelines

### Bash Scripts

- Use `set -e` for error handling
- Quote variables: `"$VARIABLE"`
- Use descriptive variable names in UPPER_CASE
- Add comments for complex logic
- Use `error_exit()` function for consistent error messages

Example:
```bash
#!/bin/bash
set -e

REPO_URL="https://github.com/kazgoto/claude-sdd"

error_exit() {
    echo "❌ Error: $1" >&2
    exit "${2:-1}"
}
```

### Skill Definition Files (.md)

- Follow existing file structure
- Use YAML frontmatter for metadata
- Include clear descriptions and examples
- Document all parameters and options
- Use dynamic path resolution (`$SPECS_DIR`, `$STEERING_DIR`)

Example frontmatter:
```yaml
---
description: Brief description of the command
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <feature-name> [options]
---
```

### Documentation

- Use clear, concise language
- Provide examples for all features
- Keep README.md up to date
- Add usage examples in command documentation

## Commit Message Guidelines

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### Examples

```
feat(commands): add /spec:validate-gap command

Implement gap analysis between requirements and implementation.
Includes automatic coverage detection and reporting.

Closes #42
```

```
fix(install): handle spaces in directory paths

Quote all path variables to support paths with spaces.

Fixes #15
```

```
docs: update installation instructions for Windows

Add WSL2 requirements and troubleshooting section.
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Installation from local source (`./install.sh`)
- [ ] Installation from remote (if modifying install scripts)
- [ ] All modified commands work as expected
- [ ] Commands work with edge cases (empty dirs, special chars, etc.)
- [ ] Error messages are clear and actionable
- [ ] Documentation matches behavior

### Test Scenarios

1. **Fresh installation** in a new project
2. **Upgrade installation** over existing installation
3. **Legacy path migration** (if applicable)
4. **Error conditions** (missing files, permissions, etc.)

## File Structure

```
claude-sdd/
├── commands/              # Source skill definition files
│   ├── init.md
│   ├── requirements.md
│   └── ...
├── config/               # Configuration schemas
│   └── spec-config.schema.json
├── docs/                 # Additional documentation
│   ├── migration-guide.md
│   ├── testing.md
│   └── security.md
├── install.sh            # Bash installer
├── install.py            # Python installer
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── CHANGELOG.md
```

## Adding New Commands

To add a new `/spec:` command:

1. Create `commands/your-command.md` following the skill file structure
2. Update `commands/README.md` to list the new command
3. Update main `README.md` command table and reference section
4. Update installer command count (if needed)
5. Add usage examples
6. Test installation and command execution

## Release Process

Releases are managed by maintainers:

1. Update version in README.md
2. Update CHANGELOG.md with changes
3. Create git tag: `git tag -a v1.x.x -m "Release v1.x.x"`
4. Push tag: `git push origin v1.x.x`
5. Create GitHub release with changelog

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Create a new issue with the `question` label
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Claude SDD! 🎉
