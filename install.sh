#!/bin/bash
# Spec-Driven Development System Installer
# Install slash commands for Claude Code

set -e

REPO_URL="https://github.com/kazgoto/claude-sdd"
TARGET_DIR=".claude/commands/spec"
CONFIG_FILE=".claude/spec-config.json"
COMMANDS_SOURCE="commands"

echo "🚀 Installing Spec-Driven Development System..."
echo ""

# 1. 対象ディレクトリを作成
mkdir -p "$TARGET_DIR"
echo "✓ Created directory: $TARGET_DIR"

# 2. スキル定義ファイルをコピー
if [ -d "$COMMANDS_SOURCE" ]; then
    # ローカルインストール（クローン済み）
    echo "📦 Installing from local source..."
    cp "$COMMANDS_SOURCE"/*.md "$TARGET_DIR/"
    echo "✓ Copied skill files from local directory"
else
    # リモートインストール（GitHub から直接）
    echo "📥 Installing from remote repository..."
    echo "   Source: $REPO_URL"

    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT

    curl -sSL "${REPO_URL}/archive/main.tar.gz" | \
        tar -xz -C "$TEMP_DIR" --strip-components=1

    cp "$TEMP_DIR/commands"/*.md "$TARGET_DIR/"
    echo "✓ Downloaded and copied skill files from GitHub"
fi

# 3. 設定ファイルを生成（存在しない場合のみ）
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Configuration file already exists: $CONFIG_FILE"
    echo "   Skipping configuration generation to preserve existing settings"
else
    # レガシーパス検出
    if [ -d ".kiro/specs" ]; then
        echo "⚠️  Detected legacy .kiro/specs/ directory"
        echo "   Using compatibility mode with legacy paths"

        cat > "$CONFIG_FILE" <<'EOF'
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
        # Replace timestamp placeholder
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE"
        else
            sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE"
        fi

        echo "✓ Generated legacy mode configuration"
    else
        # 新規プロジェクト用デフォルト設定
        echo "📝 Setting up default configuration for new project..."

        cat > "$CONFIG_FILE" <<'EOF'
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
        # Replace timestamp placeholder
        TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE"
        else
            sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$CONFIG_FILE"
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
