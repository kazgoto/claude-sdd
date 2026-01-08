# Claude Spec-Driven Development (SDD)

Claude Code プロジェクトのための包括的な仕様駆動開発システム。仕様から実装までの構造化されたワークフローとTDD手法を提供します。

## 概要

Claude Spec-Driven Development (SDD) は、Claude Code CLI 専用に設計された完全なワークフローシステムです。体系的なアプローチでソフトウェア開発を変革します：

1. **仕様の作成**: EARS（Easy Approach to Requirements Syntax）形式で正確にプロジェクト要件を定義
2. **技術設計**: アーキテクチャの決定とトレードオフを含む包括的な技術設計を作成
3. **タスク分解**: 明確な依存関係を持つ詳細な実装タスクを生成
4. **TDD実装**: テスト駆動開発（Red-Green-Refactorサイクル）を使用してタスクを実行
5. **進捗追跡**: 自動セッション状態管理と進捗の可視化

設定駆動型のシステムで、柔軟なディレクトリ構造とレガシーパスからのシームレスな移行をサポートします。

## 主な機能

### 完全なワークフローカバレッジ
- **12のスラッシュコマンド**: 仕様の初期化から実装検証までの完全なライフサイクル
- **ステアリングドキュメント**: 一貫したAIガイダンスのためのプロジェクト全体のコンテキストと制約
- **セッション状態追跡**: タスク完了率を含む自動進捗追跡
- **GitHub統合**: GitHub Issueから直接仕様を初期化

### 柔軟な設定
- **動的パス解決**: `spec-config.json` でカスタムディレクトリパスを設定
- **レガシーパスサポート**: `.kiro/` パスの自動検出と移行
- **クロスプロジェクト移植性**: 一度インストールすれば、任意の Claude Code プロジェクトで使用可能

### 開発者体験
- **ワンコマンドインストール**: curl またはローカルスクリプトで数秒でインストール
- **クロスプラットフォーム**: macOS、Linux、Windows (WSL2) で動作
- **エラーハンドリング**: 終了コード付きの包括的なエラーメッセージ
- **トークン効率**: クイックセッション復旧用の resume コマンド

## インストール

### リモートインストール（推奨）

GitHubから直接インストール（クローン不要）:

```bash
# Bash (macOS, Linux, WSL2)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.sh | bash

# Python (Windows、またはbashが使えない場合)
curl -fsSL https://raw.githubusercontent.com/kazgoto/claude-sdd/main/install.py | python3
```

### ローカルインストール

リポジトリをクローンしてインストーラーを実行:

```bash
# リポジトリをクローン
git clone https://github.com/kazgoto/claude-sdd.git
cd claude-sdd

# Bash でインストール
./install.sh

# または Python でインストール
python3 install.py
```

**インストーラーの動作**:
1. 12個のスキル定義ファイルを `.claude/commands/spec/` にコピー
2. レガシー `.kiro/specs/` ディレクトリを検出（存在する場合）
3. 適切な設定で `spec-config.json` を生成
4. 次のステップと使用可能なコマンドを表示

## クイックスタート

3ステップで仕様駆動開発を開始:

### ステップ1: 仕様を初期化

プロジェクト説明から:
```bash
/spec:init OAuth2サポートとJWTトークンを持つユーザー認証システム
```

またはGitHub Issueから:
```bash
/spec:init-issue 42
```

### ステップ2: 要件と設計を生成

```bash
# 詳細な要件を生成（EARS形式）
/spec:requirements auth-system

# 技術設計を作成
/spec:design auth-system

# 実装タスクを生成
/spec:tasks auth-system
```

### ステップ3: TDDで実装

```bash
# すべてのタスクを実行
/spec:impl auth-system

# または特定のタスクを実行
/spec:impl auth-system 1-3,5

# 前回のセッションから再開
/spec:resume auth-system
```

## 利用可能なコマンド

すべてのコマンドは `/spec:` プレフィックスを使用:

| コマンド | 説明 |
|---------|------|
| `/spec:init <説明>` | 説明から新しい仕様を初期化 |
| `/spec:init-issue <番号>` | GitHub Issue から仕様を初期化 |
| `/spec:requirements <名前>` | 要件ドキュメントを生成（EARS形式） |
| `/spec:design <名前>` | 包括的な技術設計を作成 |
| `/spec:tasks <名前>` | 依存関係を持つ実装タスクを生成 |
| `/spec:impl <名前> [タスク]` | TDD手法を使用してタスクを実行 |
| `/spec:resume <名前>` | 前回のセッションから再開（トークン効率的） |
| `/spec:status <名前>` | 仕様のステータスと進捗を確認 |
| `/spec:steering` | ステアリングドキュメントを作成/更新 |
| `/spec:steering-custom` | 専用コンテキスト用のカスタムステアリングを作成 |
| `/spec:validate-design <名前>` | インタラクティブな技術設計品質レビュー |
| `/spec:validate-gap <名前>` | 実装ギャップを分析 |

## 設定

### 設定ファイル

システムはパス管理に `.claude/spec-config.json` を使用:

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

### 設定フィールド

- **`version`**: 設定ファイルバージョン（セマンティックバージョニング）
- **`paths.specs`**: 仕様ファイルのディレクトリ（`/` で終わる必要あり）
- **`paths.steering`**: ステアリングドキュメントのディレクトリ（`/` で終わる必要あり）
- **`compatibility.legacyMode`**: レガシーパス互換性を有効化（`.kiro/`）
- **`compatibility.warnOnLegacyPaths`**: レガシーパス検出時に警告を表示
- **`metadata.installedAt`**: インストールタイムスタンプ（ISO 8601）
- **`metadata.installedFrom`**: ソースURLまたはパス
- **`metadata.version`**: インストールされたシステムバージョン

### パス要件

- **相対パス**である必要あり（絶対パス不可）
- **`/`** で終わる必要あり（末尾スラッシュ）
- **`..`** ディレクトリトラバーサル不可
- **先頭 `/`** 不可（絶対パスの指示子）

**有効なパス**: `.spec/`, `specifications/`, `.kiro/specs/`  
**無効なパス**: `/spec/`, `../specs/`, `spec`（末尾スラッシュなし）

### レガシーモード

既存の `.kiro/specs/` ディレクトリがある場合、インストーラーが自動的に検出し `legacyMode: true` を設定します。モードは手動で切り替え可能:

**新規プロジェクト（推奨）**:
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

**レガシープロジェクト（後方互換性）**:
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

## ドキュメント

- **[インストールガイド](docs/installation.md)** - 詳細なインストール手順
- **[コマンドリファレンス](docs/commands.md)** - 完全なコマンドドキュメント
- **[設定](docs/configuration.md)** - 設定ファイルリファレンス
- **[移行ガイド](docs/migration.md)** - レガシーパスからの移行
- **[トラブルシューティング](docs/troubleshooting.md)** - よくある問題と解決策

## サンプル

[examples/](examples/) ディレクトリには以下が含まれます:
- サンプル仕様
- ステアリングドキュメントテンプレート
- 設定例
- ワークフローデモンストレーション

## 必要要件

- **Claude Code CLI** - このシステムは Claude Code 用に設計されています
- **Git**（オプション） - GitHub Issue統合用（`/spec:init-issue`）
- **GitHub CLI**（オプション） - 拡張GitHub機能用

## ライセンス

MITライセンス - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## コントリビューション

コントリビューションを歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照:
- 開発環境のセットアップ
- コードスタイルガイドライン
- プルリクエストプロセス
- テスト要件

## バージョン

**現在のバージョン**: 1.0.0

### リリースノート

**1.0.0** (2026-01-08)
- 初回リリース
- 完全なSDDワークフロー用の12個のスラッシュコマンド
- 設定駆動型のパス管理
- レガシーパス検出と移行サポート
- BashとPythonのインストールスクリプト
- 包括的なエラーハンドリング
- 設定用のJSONスキーマ検証

## サポート

- **Issues**: [GitHub Issues](https://github.com/kazgoto/claude-sdd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kazgoto/claude-sdd/discussions)
- **リポジトリ**: [https://github.com/kazgoto/claude-sdd](https://github.com/kazgoto/claude-sdd)
