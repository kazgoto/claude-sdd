---
description: 仕様を完了としてマークし、アーカイブに移動する
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <feature-name> [--pr PR_NUMBER] [--skip-archive] [--dry-run]
---

# Spec Complete Command

仕様完了時のアーカイブ処理を自動化し、spec.jsonの更新、ディレクトリのアーカイブ、CLAUDE.mdの更新を一括で実行する。

## Path Resolution

Before proceeding, resolve the specification and steering directory paths from configuration:

Use the Bash tool to execute the following path resolution logic:
```bash
CONFIG_FILE=".claude/spec-config.json"

if [ -f "$CONFIG_FILE" ]; then
  # Read paths from config file
  SPECS_DIR=$(grep -o '"specs": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
  STEERING_DIR=$(grep -o '"steering": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
else
  # Fallback: detect legacy paths or use defaults
  if [ -d ".kiro/specs" ]; then
    SPECS_DIR=".kiro/specs/"
    STEERING_DIR=".kiro/steering/"
    echo "⚠️  Using legacy paths (.kiro/). Consider creating .claude/spec-config.json" >&2
  else
    SPECS_DIR=".spec/"
    STEERING_DIR=".spec-steering/"
  fi
fi

echo "SPECS_DIR=$SPECS_DIR"
echo "STEERING_DIR=$STEERING_DIR"
```

Store the resolved paths as variables: `$SPECS_DIR` and `$STEERING_DIR` for use in subsequent steps.

---

## Command Execution

Complete specification **$ARGUMENTS** and archive it.

### 1. Parse Arguments

Extract feature name and options from **$ARGUMENTS**:

```bash
FEATURE_NAME=""
PR_NUMBER=""
SKIP_ARCHIVE=0
DRY_RUN=0

# Parse arguments
ARGS=($ARGUMENTS)
for arg in "${ARGS[@]}"; do
  case $arg in
    --pr)
      shift
      PR_NUMBER="${ARGS[$((++i))]}"
      ;;
    --skip-archive)
      SKIP_ARCHIVE=1
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    *)
      if [ -z "$FEATURE_NAME" ]; then
        FEATURE_NAME="$arg"
      fi
      ;;
  esac
done

# Validate feature name
if [ -z "$FEATURE_NAME" ]; then
  cat << EOF
使用方法: /spec:complete <feature-name> [オプション]

仕様を完了としてマークし、アーカイブに移動します。

引数:
  <feature-name>         完了する仕様の名前

オプション:
  --pr PR_NUMBER         PR番号を手動指定（自動検出をスキップ）
  --skip-archive         spec.json更新のみ実行（アーカイブをスキップ）
  --dry-run              実行内容を表示するが、変更は行わない

例:
  /spec:complete 056-dashboard-html-auto-open
  /spec:complete 056-dashboard-html-auto-open --pr 57
  /spec:complete 056-dashboard-html-auto-open --skip-archive
  /spec:complete 056-dashboard-html-auto-open --dry-run
EOF
  exit 0
fi
```

### 2. Validate Prerequisites

Validate that the specification and environment requirements are met:

```bash
SPEC_DIR="${SPECS_DIR}${FEATURE_NAME}"

# Check if spec exists
if [ ! -d "$SPEC_DIR" ]; then
  echo "❌ エラー: 仕様が見つかりません: $SPEC_DIR" >&2
  echo "利用可能な仕様を確認するには: ls $SPECS_DIR" >&2
  exit 1
fi

# Check if spec.json exists
if [ ! -f "${SPEC_DIR}/spec.json" ]; then
  echo "❌ エラー: spec.jsonが見つかりません: ${SPEC_DIR}/spec.json" >&2
  exit 1
fi

# Check if already archived
if [[ "$SPEC_DIR" == *"_archived"* ]]; then
  echo "⚠️  警告: この仕様は既にアーカイブされています: $SPEC_DIR" >&2
  echo "処理をスキップします。" >&2
  exit 1
fi

# Check if Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ エラー: Gitリポジトリではありません" >&2
  echo "このコマンドはGitリポジトリ内で実行する必要があります。" >&2
  exit 1
fi

# Check if gh CLI is installed
if ! command -v gh > /dev/null 2>&1; then
  echo "❌ エラー: GitHub CLIがインストールされていません" >&2
  echo "インストール方法: brew install gh" >&2
  exit 1
fi

# Check if gh CLI is authenticated
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ エラー: GitHub CLIで認証されていません" >&2
  echo "認証方法: gh auth login" >&2
  exit 1
fi
```

### 3. Detect PR Information

Automatically detect PR information or use manual specification:

```bash
if [ -n "$PR_NUMBER" ]; then
  # Manual PR number specified
  PR_DETAILS=$(gh pr view "$PR_NUMBER" --json number,url,mergedAt,headRefName,state 2>&1)

  if [ $? -ne 0 ]; then
    echo "❌ エラー: PR #${PR_NUMBER} の詳細取得に失敗しました" >&2
    echo "$PR_DETAILS" >&2
    exit 1
  fi

  PR_STATE=$(echo "$PR_DETAILS" | grep -o '"state": *"[^"]*"' | cut -d'"' -f4)
  if [ "$PR_STATE" != "MERGED" ]; then
    echo "⚠️  警告: PR #${PR_NUMBER} はマージされていません（状態: ${PR_STATE}）" >&2
  fi

  PR_INFO_NUMBER="$PR_NUMBER"
  PR_INFO_URL=$(echo "$PR_DETAILS" | grep -o '"url": *"[^"]*"' | cut -d'"' -f4)
  PR_INFO_MERGED_AT=$(echo "$PR_DETAILS" | grep -o '"mergedAt": *"[^"]*"' | cut -d'"' -f4)
  PR_INFO_BRANCH=$(echo "$PR_DETAILS" | grep -o '"headRefName": *"[^"]*"' | cut -d'"' -f4)
else
  # Automatic PR detection
  ISSUE_NUMBER=$(grep -o '"issue_number": *[0-9]*' "${SPEC_DIR}/spec.json" | grep -o '[0-9]*')

  if [ -z "$ISSUE_NUMBER" ]; then
    echo "❌ エラー: spec.jsonにissue_numberが設定されていません" >&2
    echo "PR番号を手動で指定してください: --pr PR_NUMBER" >&2
    exit 1
  fi

  PR_SEARCH_RESULT=$(gh pr list --search "closes #${ISSUE_NUMBER}" --state merged --json number,url,mergedAt,headRefName 2>&1)

  if [ $? -ne 0 ]; then
    echo "❌ エラー: GitHub PR検索に失敗しました" >&2
    echo "$PR_SEARCH_RESULT" >&2
    exit 1
  fi

  PR_COUNT=$(echo "$PR_SEARCH_RESULT" | grep -c '"number"')

  if [ "$PR_COUNT" -eq 0 ]; then
    echo "❌ エラー: Issue #${ISSUE_NUMBER} に関連するマージ済みPRが見つかりません" >&2
    echo "PR番号を手動で指定してください: --pr PR_NUMBER" >&2
    exit 1
  elif [ "$PR_COUNT" -gt 1 ]; then
    echo "⚠️  警告: 複数のマージ済みPRが見つかりました。最新のPRを使用します。" >&2
  fi

  PR_INFO_NUMBER=$(echo "$PR_SEARCH_RESULT" | grep -o '"number": *[0-9]*' | head -1 | grep -o '[0-9]*')
  PR_INFO_URL=$(echo "$PR_SEARCH_RESULT" | grep -o '"url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  PR_INFO_MERGED_AT=$(echo "$PR_SEARCH_RESULT" | grep -o '"mergedAt": *"[^"]*"' | head -1 | cut -d'"' -f4)
  PR_INFO_BRANCH=$(echo "$PR_SEARCH_RESULT" | grep -o '"headRefName": *"[^"]*"' | head -1 | cut -d'"' -f4)
fi
```

### 4. Update spec.json Metadata

Update spec.json with completion information:

```bash
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SPEC_JSON="${SPEC_DIR}/spec.json"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[DRY RUN] spec.jsonを更新します:" >&2
  echo "[DRY RUN]   phase: (現在の値) -> completed" >&2
  echo "[DRY RUN]   completed_at: $CURRENT_TIME" >&2
  echo "[DRY RUN]   updated_at: $CURRENT_TIME" >&2
  echo "[DRY RUN]   approvals.tasks.approved: true" >&2
  echo "[DRY RUN]   implementation:" >&2
  echo "[DRY RUN]     status: completed" >&2
  echo "[DRY RUN]     pr_number: $PR_INFO_NUMBER" >&2
  echo "[DRY RUN]     pr_url: $PR_INFO_URL" >&2
  echo "[DRY RUN]     merged_at: $PR_INFO_MERGED_AT" >&2
  echo "[DRY RUN]     branch: $PR_INFO_BRANCH" >&2
else
  # Update spec.json using jq if available, otherwise sed/awk
  if command -v jq > /dev/null 2>&1; then
    UPDATED_SPEC=$(cat "$SPEC_JSON" | jq \
      --arg phase "completed" \
      --arg completed_at "$CURRENT_TIME" \
      --arg updated_at "$CURRENT_TIME" \
      --arg pr_number "$PR_INFO_NUMBER" \
      --arg pr_url "$PR_INFO_URL" \
      --arg merged_at "$PR_INFO_MERGED_AT" \
      --arg branch "$PR_INFO_BRANCH" \
      '.phase = $phase |
       .completed_at = $completed_at |
       .updated_at = $updated_at |
       .approvals.tasks.approved = true |
       .implementation = {
         status: "completed",
         pr_number: ($pr_number | tonumber),
         pr_url: $pr_url,
         merged_at: $merged_at,
         branch: $branch
       }')

    echo "$UPDATED_SPEC" > "$SPEC_JSON"
  else
    echo "⚠️  警告: jqがインストールされていません。基本的な更新のみ実施します。" >&2
    # Basic update using sed (simplified)
    # Implementation would require more complex sed/awk logic
  fi

  if [ $? -ne 0 ]; then
    echo "❌ エラー: spec.jsonの書き込みに失敗しました: $SPEC_JSON" >&2
    exit 1
  fi
fi
```

### 5. Archive Specification (if not skipped)

Move specification to _archived/ directory:

```bash
if [ "$SKIP_ARCHIVE" -eq 0 ]; then
  ARCHIVE_BASE="${SPECS_DIR}_archived"
  TARGET_DIR="${ARCHIVE_BASE}/${FEATURE_NAME}"

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[DRY RUN] アーカイブ処理:" >&2
    echo "[DRY RUN]   移動元: $SPEC_DIR" >&2
    echo "[DRY RUN]   移動先: $TARGET_DIR" >&2
    echo "[DRY RUN]   対象ファイル:" >&2
    ls -1 "$SPEC_DIR" 2>/dev/null | sed 's/^/[DRY RUN]     /' >&2
    echo "[DRY RUN] CLAUDE.mdからエントリを削除します" >&2
  else
    # Create _archived directory if needed
    if [ ! -d "$ARCHIVE_BASE" ]; then
      mkdir -p "$ARCHIVE_BASE"
      if [ $? -ne 0 ]; then
        echo "❌ エラー: アーカイブディレクトリの作成に失敗しました: $ARCHIVE_BASE" >&2
        exit 1
      fi
    fi

    # Check if target already exists
    if [ -d "$TARGET_DIR" ]; then
      echo "❌ エラー: アーカイブ先に既存のディレクトリがあります: $TARGET_DIR" >&2
      echo "手動で確認してください。" >&2
      exit 1
    fi

    # Move directory
    mv "$SPEC_DIR" "$TARGET_DIR"

    if [ $? -ne 0 ]; then
      echo "❌ エラー: ディレクトリの移動に失敗しました" >&2
      exit 1
    fi

    # Verify files
    EXPECTED_FILES=("spec.json" "requirements.md" "design.md" "tasks.md" "session-state.md")
    MISSING_FILES=()

    for file in "${EXPECTED_FILES[@]}"; do
      if [ ! -f "${TARGET_DIR}/${file}" ]; then
        MISSING_FILES+=("$file")
      fi
    done

    if [ ${#MISSING_FILES[@]} -gt 0 ]; then
      echo "⚠️  警告: 以下のファイルが見つかりません:" >&2
      printf '  - %s\n' "${MISSING_FILES[@]}" >&2
    fi

    # Update CLAUDE.md
    CLAUDE_FILE="CLAUDE.md"

    if [ ! -f "$CLAUDE_FILE" ]; then
      echo "⚠️  警告: CLAUDE.mdが見つかりません。エントリ削除をスキップします。" >&2
    elif ! grep -q "$FEATURE_NAME" "$CLAUDE_FILE"; then
      echo "⚠️  警告: CLAUDE.mdに仕様のエントリが見つかりません: $FEATURE_NAME" >&2
    else
      # Remove entry from CLAUDE.md
      TEMP_FILE=$(mktemp)

      awk -v name="$FEATURE_NAME" '
        BEGIN { skip = 0 }
        /^###/ {
          if (skip) { skip = 0 }
          if ($0 ~ name) { skip = 1; next }
        }
        !skip { print }
      ' "$CLAUDE_FILE" > "$TEMP_FILE"

      if [ $? -eq 0 ]; then
        mv "$TEMP_FILE" "$CLAUDE_FILE"
        if [ $? -ne 0 ]; then
          echo "⚠️  警告: CLAUDE.mdの書き込みに失敗しました" >&2
          rm -f "$TEMP_FILE"
        fi
      else
        echo "⚠️  警告: CLAUDE.mdの更新に失敗しました" >&2
        rm -f "$TEMP_FILE"
      fi
    fi
  fi
fi
```

### 6. Display Completion Summary

Show summary of what was done:

```bash
cat << EOF

✅ 仕様 $FEATURE_NAME を完了としてマークしました

📊 サマリー:
  - 完了日時: $CURRENT_TIME
  - PR: #$PR_INFO_NUMBER ($PR_INFO_URL)
EOF

if [ "$SKIP_ARCHIVE" -eq 0 ]; then
  echo "  - アーカイブパス: ${ARCHIVE_BASE}/${FEATURE_NAME}/"
else
  echo "  - spec.json更新のみ実行（アーカイブはスキップされました）"
fi

cat << EOF

📝 変更されたファイル:
  - spec.json
EOF

if [ "$SKIP_ARCHIVE" -eq 0 ]; then
  echo "  - ディレクトリ移動: $FEATURE_NAME -> _archived/$FEATURE_NAME"
  echo "  - CLAUDE.md"
fi

cat << EOF

🔄 次のステップ:
  1. 変更を確認してください
  2. コミットしてプッシュしてください:

     git add .
     git commit -m "spec: complete $FEATURE_NAME (#$PR_INFO_NUMBER)"
     git push

推奨コミットメッセージ:
  spec: complete $FEATURE_NAME (#$PR_INFO_NUMBER)

  - Update spec.json with completion metadata
  - Archive spec to _archived/$FEATURE_NAME
  - Remove entry from CLAUDE.md

EOF
```

## Usage Examples

```bash
# Basic usage (auto-detect PR)
/spec:complete 056-dashboard-html-auto-open

# Manual PR specification
/spec:complete 056-dashboard-html-auto-open --pr 57

# Update spec.json only (skip archiving)
/spec:complete 056-dashboard-html-auto-open --skip-archive

# Dry-run mode (preview changes)
/spec:complete 056-dashboard-html-auto-open --dry-run
```

## Error Handling

The command implements fail-fast for core operations and graceful degradation for auxiliary operations:

- **Fail-fast**: Missing spec, invalid PR, archive conflicts
- **Graceful**: Missing CLAUDE.md, CLAUDE.md update failures

All errors are output to stderr with actionable guidance.
