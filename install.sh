#!/bin/bash
# Spec-Driven Development System Installer
# Install slash commands for Claude Code

set -e

REPO_URL="https://github.com/kazgoto/claude-sdd"
TARGET_DIR=".claude/commands/spec"
CONFIG_FILE=".claude/spec-config.json"
COMMANDS_SOURCE="commands"

# Error handler
error_exit() {
    echo "❌ Error: $1" >&2
    exit "${2:-1}"
}

echo "🚀 Installing Spec-Driven Development System..."
echo ""

# 1. 対象ディレクトリを作成
if ! mkdir -p "$TARGET_DIR" 2>/dev/null; then
    error_exit "Failed to create directory: $TARGET_DIR. Check permissions." 1
fi
echo "✓ Created directory: $TARGET_DIR"

# 2. スキル定義ファイルをコピー
if [ -d "$COMMANDS_SOURCE" ]; then
    # ローカルインストール（クローン済み）
    echo "📦 Installing from local source..."

    if ! cp "$COMMANDS_SOURCE"/*.md "$TARGET_DIR/" 2>/dev/null; then
        error_exit "Failed to copy skill files from $COMMANDS_SOURCE/. Check if files exist." 2
    fi

    # Verify files were copied
    if [ "$(ls -1 "$TARGET_DIR"/*.md 2>/dev/null | wc -l)" -eq 0 ]; then
        error_exit "No skill files found in $TARGET_DIR after copy. Installation failed." 2
    fi

    echo "✓ Copied skill files from local directory"
else
    # リモートインストール（GitHub から直接）
    echo "📥 Installing from remote repository..."
    echo "   Source: $REPO_URL"

    # Check required commands
    for cmd in curl tar; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "$cmd is required but not installed. Please install $cmd and try again." 3
        fi
    done

    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    if ! curl -sSL "${REPO_URL}/archive/main.tar.gz" | \
        tar -xz -C "$TEMP_DIR" --strip-components=1 2>/dev/null; then
        error_exit "Failed to download from GitHub. Check network connection and URL: $REPO_URL" 4
    fi

    if [ ! -d "$TEMP_DIR/commands" ]; then
        error_exit "Downloaded archive does not contain commands/ directory. Repository structure may have changed." 5
    fi

    if ! cp "$TEMP_DIR/commands"/*.md "$TARGET_DIR/" 2>/dev/null; then
        error_exit "Failed to copy skill files from downloaded archive." 2
    fi

    # Verify files were copied
    if [ "$(ls -1 "$TARGET_DIR"/*.md 2>/dev/null | wc -l)" -eq 0 ]; then
        error_exit "No skill files found in $TARGET_DIR after download. Installation failed." 2
    fi

    echo "✓ Downloaded and copied skill files from GitHub"
fi

# 3. 設定ファイルを生成（存在しない場合のみ）
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Configuration file already exists: $CONFIG_FILE"
    echo "   Skipping configuration generation to preserve existing settings"
else
    # Create .claude directory if it doesn't exist
    if ! mkdir -p "$(dirname "$CONFIG_FILE")" 2>/dev/null; then
        error_exit "Failed to create .claude directory. Check permissions." 6
    fi

    # レガシーパス検出
    if [ -d ".kiro/specs" ]; then
        echo "⚠️  Detected legacy .kiro/specs/ directory"
        echo "   Using compatibility mode with legacy paths"

        if ! cat > "$CONFIG_FILE" <<'EOF'
{
  "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
  "version": "1.0.0",
  "paths": {
    "specs": ".kiro/specs/",
    "steering": ".kiro/steering/"
  },
  "compatibility": {
    "legacyMode": true,
    "warnOnLegacyPaths": true
  },
  "metadata": {
    "installedAt": "TIMESTAMP_PLACEHOLDER",
    "installedFrom": "https://github.com/kazgoto/claude-sdd",
    "version": "1.0.0"
  }
}
EOF
        then
            error_exit "Failed to write configuration file: $CONFIG_FILE. Check permissions." 7
        fi

        # Replace timestamp placeholder
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
        if [ -z "$TIMESTAMP" ]; then
            error_exit "Failed to generate timestamp. 'date' command may not be available." 8
        fi

        if [[ "$OSTYPE" == "darwin"* ]]; then
            if ! sed -i '' "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE" 2>/dev/null; then
                error_exit "Failed to update timestamp in configuration file." 9
            fi
        else
            if ! sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE" 2>/dev/null; then
                error_exit "Failed to update timestamp in configuration file." 9
            fi
        fi

        # Verify config file was created successfully
        if [ ! -f "$CONFIG_FILE" ]; then
            error_exit "Configuration file was not created successfully." 10
        fi

        echo "✓ Generated legacy mode configuration"
    else
        # 新規プロジェクト用デフォルト設定
        echo "📝 Setting up default configuration for new project..."

        if ! cat > "$CONFIG_FILE" <<'EOF'
{
  "$schema": "https://raw.githubusercontent.com/kazgoto/claude-sdd/main/config/spec-config.schema.json",
  "version": "1.0.0",
  "paths": {
    "specs": ".spec/",
    "steering": ".spec-steering/"
  },
  "compatibility": {
    "legacyMode": false,
    "warnOnLegacyPaths": false
  },
  "metadata": {
    "installedAt": "TIMESTAMP_PLACEHOLDER",
    "installedFrom": "https://github.com/kazgoto/claude-sdd",
    "version": "1.0.0"
  }
}
EOF
        then
            error_exit "Failed to write configuration file: $CONFIG_FILE. Check permissions." 7
        fi

        # Replace timestamp placeholder
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
        if [ -z "$TIMESTAMP" ]; then
            error_exit "Failed to generate timestamp. 'date' command may not be available." 8
        fi

        if [[ "$OSTYPE" == "darwin"* ]]; then
            if ! sed -i '' "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE" 2>/dev/null; then
                error_exit "Failed to update timestamp in configuration file." 9
            fi
        else
            if ! sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE" 2>/dev/null; then
                error_exit "Failed to update timestamp in configuration file." 9
            fi
        fi

        # Verify config file was created successfully
        if [ ! -f "$CONFIG_FILE" ]; then
            error_exit "Configuration file was not created successfully." 10
        fi

        echo "✓ Generated default configuration"
    fi
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Review configuration in $CONFIG_FILE"
echo "   2. Run 'claude' to start using /spec:* commands"
echo "   3. Try: /spec:init <project-description>"
echo ""
echo "📚 Available commands:"
echo "   /spec:init              - Initialize new specification"
echo "   /spec:init-issue        - Initialize from GitHub Issue"
echo "   /spec:requirements      - Generate requirements document"
echo "   /spec:design            - Create technical design"
echo "   /spec:tasks             - Generate implementation tasks"
echo "   /spec:impl              - Execute tasks with TDD"
echo "   /spec:resume            - Resume from last session"
echo "   /spec:status            - Check progress"
echo "   /spec:steering          - Create/update steering documents"
echo "   /spec:steering-custom   - Create custom steering"
echo "   /spec:validate-design   - Interactive design review"
echo "   /spec:validate-gap      - Analyze implementation gap"
echo ""
