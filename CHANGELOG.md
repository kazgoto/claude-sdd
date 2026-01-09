# Changelog

All notable changes to the Spec-Driven Development System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### Added
- **12 Slash Commands** for Claude Code
  - `/spec:init` - Initialize new specification from description
  - `/spec:init-issue` - Initialize specification from GitHub Issue
  - `/spec:requirements` - Generate EARS-format requirements document
  - `/spec:design` - Create comprehensive technical design
  - `/spec:tasks` - Generate implementation tasks with TDD approach
  - `/spec:impl` - Execute tasks using Test-Driven Development
  - `/spec:resume` - Resume from last session (token-efficient)
  - `/spec:status` - Check current progress and phase status
  - `/spec:steering` - Create/update steering documents
  - `/spec:steering-custom` - Create custom steering for specialized contexts
  - `/spec:validate-design` - Interactive technical design quality review
  - `/spec:validate-gap` - Analyze implementation gap between requirements and codebase

- **Configuration System**
  - `spec-config.json` for flexible directory path configuration
  - Support for custom paths (specs and steering directories)
  - Legacy path auto-detection (`.kiro/specs/` and `.kiro/steering/`)
  - Compatibility mode for existing projects

- **Installation Scripts**
  - `install.sh` - Bash-based installer for macOS/Linux/WSL2
  - `install.py` - Python-based installer as alternative
  - Support for both local and remote installation
  - Automatic legacy path detection and configuration generation

- **Dynamic Path Resolution**
  - All 12 skill files use `$SPECS_DIR` and `$STEERING_DIR` variables
  - Fallback to legacy paths if config file not found
  - Warning messages for legacy path usage

- **Documentation**
  - Comprehensive README.md with installation and usage instructions
  - README.ja.md (Japanese version)
  - Command reference with usage examples
  - Workflow diagrams (Mermaid format)
  - Migration guide for legacy projects (docs/migration-guide.md)
  - Testing guide (docs/testing.md)
  - Security best practices (docs/security.md)

- **Configuration Examples**
  - JSON Schema for validation (`config/spec-config.schema.json`)
  - Example configurations for new and legacy projects

### Features
- **Product-Agnostic Design**: Removed all product-specific names (e.g., "Kiro")
- **Project-Independent**: No hardcoded project names (e.g., "backlog-project-check")
- **Backward Compatible**: Existing `.kiro/` structure continues to work
- **GitHub Integration**: `/spec:init-issue` command for seamless GitHub Issue workflow
- **TDD-First**: Built-in Test-Driven Development methodology
- **Session Management**: Automatic session state tracking in `session-state.md`
- **Branch Management**: Automatic feature branch creation for GitHub repositories

### Technical Details
- **Platform Support**: macOS, Linux, Windows (WSL2)
- **Requirements**: Python 3.12+ (standard library only), `gh` CLI (optional, for `/spec:init-issue`)
- **Template Engine**: Jinja2 variable expansion (`$1`, `$ARGUMENTS`, `@filepath`)
- **License**: MIT License

### Verified Compatibility
- Successfully tested with existing projects using `.kiro/specs/` structure
- Zero impact on existing Python functionality (18/18 tests passed)
- Maintains full compatibility with Claude Code CLI

### Known Limitations
- CLI-only support (Claude Code CLI environment required)
- No VSCode extension support (by design)
- Manual testing only (no automated test suite for skill files)

### Migration Path
For projects currently using `.kiro/specs/` structure:
1. Run `install.sh` - automatically detects legacy paths
2. Generates `spec-config.json` with `legacyMode: true`
3. All existing specs continue to work without modification
4. See `docs/migration-guide.md` for detailed migration steps

---

## Future Releases (Planned)

### [1.1.0] - TBD
- [ ] CONTRIBUTING.md with contribution guidelines
- [ ] GitHub Actions CI/CD pipeline
- [ ] Automated tests for skill files
- [ ] Additional example projects

### [2.0.0] - TBD
- [ ] `/spec:migrate` command for legacy-to-new path migration
- [ ] Plugin system for custom analyzers
- [ ] Multi-language support (currently Japanese-focused)

---

[1.0.0]: https://github.com/kazgoto/claude-sdd/releases/tag/v1.0.0
