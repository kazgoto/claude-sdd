# Changelog

All notable changes to the Spec-Driven Development System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-07-01

### Added
- **`/spec:design`**: Testing Strategy の `E2E/UI Tests` 行を、暗黙のエージェント判断ではなく明示的な二軸判定に変更。
  - 新設ステップ「G. E2E Test Harness Detection」で (a) UI向け要件の有無 (b) e2eハーネスの有無 を検出
  - (a)Yes/(b)Yes → 対象Requirement IDを明記して必須化。(a)Yes/(b)No → 黙って preview 扱いにせず `⚠️` フラグを明記（人間が design.md を編集して bootstrap を選べる）。(a)No → 対象外
- **`/spec:tasks`**: 上記フラグが「必須」側の場合、harness が無ければ Layer 0 に "e2eテストハーネスをbootstrapする" タスクを自動生成。harness が既にあれば Layer 2 統合タスクに具体的な e2e シナリオの作成・実行を義務化。
  - 背景: nah-ai-wine-inventory #307 で e2e トライアルを実施した結果、design フェーズで「harnessが無いから preview 検証」に黙って倒れる問題が判明。判定基準を明文化し、初回だけコストを払えば以降のspecは自動的にe2eへ倒れるようにした。

## [1.1.1] - 2026-06-23

### Fixed
- **`impl-parallel` workflow の起動時クラッシュ2点を修正** (#11)
  - `agentType` を名前空間付き解決名にする（既定 `spec:` プレフィックス、`args.agentPrefix` で上書き可）。プラグイン同梱の spec-* エージェントはハーネスに名前空間付き（例 `spec:spec-implementer`）で登録されるため、バレ名のままだと `agent type not found` で落ちていた
  - `args` を文字列 / JSON文字列 / オブジェクトのいずれでも受け付けるよう正規化。skill ランチャー経由の起動では `args` が feature 文字列で渡るため `args.feature` が undefined になり即落ちしていた

## [1.1.0] - 2026-06-02

### Added
- **Claude Code plugin packaging** — install via `/plugin marketplace add kazgoto/claude-sdd` then `/plugin install spec@claude-sdd`
  - `.claude-plugin/plugin.json` manifest (namespace `spec`, so commands remain `/spec:*`)
  - `.claude-plugin/marketplace.json` for marketplace-based distribution (`source: "./"`)
  - README install instructions (EN/JA)
  - The existing `curl | bash` installer is kept for backward compatibility

### Fixed
- Removed obsolete tool names (`MultiEdit`, `LS`, `Update`) from each command's `allowed-tools` frontmatter to match current Claude Code

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
