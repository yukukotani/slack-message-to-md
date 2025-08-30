# Slack Message to Markdown

SlackのAPIメッセージオブジェクトをMarkdown形式に変換するTypeScriptライブラリです。

## 特徴

- **完全対応**: Block Kit、レガシーアタッチメント、ファイル共有、リアクション
- **豊富なメタデータ**: タイムスタンプ、ユーザー情報、スレッド情報、編集履歴
- **柔軟なAPI**: CLI とプログラマティック API の両方をサポート
- **エラー処理**: グレースフルデグラデーション、部分変換サポート
- **型安全**: TypeScript完全対応、Slack SDK連携

## インストール

```bash
npm install slack-message-to-md
# または
yarn add slack-message-to-md
# または
bun add slack-message-to-md
```

## 使用方法

### CLI使用法

#### 基本的な使用方法

```bash
# 単一メッセージの変換（標準出力）
slack-message-to-md message.json

# ファイルに出力
slack-message-to-md message.json output.md

# オプション形式
slack-message-to-md --input message.json --output output.md

# 複数メッセージの変換
slack-message-to-md messages.json output.md
```

#### CLIオプション

```bash
slack-message-to-md [オプション] <入力ファイル> [出力ファイル]

オプション:
  -i, --input <file>   入力JSONファイルのパス
  -o, --output <file>  出力Markdownファイルのパス（省略時は標準出力）
  -h, --help           ヘルプメッセージを表示
```

### プログラマティック API

#### 単一メッセージの変換

```typescript
import { convertMessage } from 'slack-message-to-md';
import type { SlackMessage } from 'slack-message-to-md';

const message: SlackMessage = {
  type: "message",
  text: "Hello *world*! :wave:",
  user: "U123456789",
  ts: "1704980400"
};

const result = convertMessage(message);

if (result.success) {
  console.log(result.markdown);
  // 出力:
  // **@U123456789** - 2024-01-11 13:40:00
  //
  // Hello **world**! 👋
} else {
  console.error(result.error.message);
}
```

#### 複数メッセージの変換

```typescript
import { convertMultipleMessages } from 'slack-message-to-md';

const messages: SlackMessage[] = [
  { type: "message", text: "First message", user: "U123", ts: "1704980400" },
  { type: "message", text: "Second message", user: "U456", ts: "1704984000" }
];

const results = convertMultipleMessages(messages);

for (const [index, result] of results.entries()) {
  if (result.success) {
    console.log(`Message ${index + 1}:`, result.markdown);
  } else {
    console.error(`Message ${index + 1} failed:`, result.error.message);
  }
}
```

## 入力形式

### 単一メッセージ

```json
{
  "type": "message",
  "text": "Hello *world*!",
  "user": "U123456789",
  "ts": "1704980400",
  "reactions": [
    {
      "name": "thumbsup",
      "users": ["U234567890"],
      "count": 1
    }
  ]
}
```

### 複数メッセージ

```json
[
  {
    "type": "message",
    "text": "First message",
    "user": "U123456789",
    "ts": "1704980400"
  },
  {
    "type": "message",
    "text": "Second message",
    "user": "U987654321",
    "ts": "1704984000"
  }
]
```

## 対応要素

### Block Kit

- **Rich Text**: テキストフォーマット、リスト、引用、コードブロック
- **Section**: テキストとフィールド
- **Header**: 見出し
- **Divider**: 区切り線
- **Image**: 画像表示
- **Context**: コンテキスト情報

### レガシーアタッチメント

- **タイトル**: リンク付きタイトル
- **テキスト**: mrkdwn フォーマット
- **フィールド**: 表形式とロング形式
- **色**: good/warning/danger/カスタムカラー
- **画像**: メイン画像とサムネイル
- **作成者情報**: 名前とリンク
- **フッター**: タイムスタンプ付き

### ファイル共有

- **画像ファイル**: インライン表示
- **ドキュメント**: リンク形式
- **ファイル情報**: サイズ、タイプ表示

### メタデータ

- **ユーザー情報**: @ユーザーID 形式
- **タイムスタンプ**: UTC時間
- **リアクション**: 絵文字とカウント
- **スレッド情報**: 返信数とユーザー数
- **編集履歴**: 編集者と編集時刻

## 出力例

### 基本的なメッセージ

**入力:**
```json
{
  "type": "message",
  "text": "Hello *world*! Check out this link: <https://example.com|Example>",
  "user": "U123456789",
  "ts": "1704980400"
}
```

**出力:**
```markdown
**@U123456789** - 2024-01-11 13:40:00

Hello **world**! Check out this link: [Example](https://example.com)
```

### Block Kit メッセージ

**入力:**
```json
{
  "type": "message",
  "user": "U123456789",
  "ts": "1704980400",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "Important Notice" }
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "This is a *section* with formatting." }
    }
  ]
}
```

**出力:**
```markdown
**@U123456789** - 2024-01-11 13:40:00

# Important Notice

This is a **section** with formatting.
```

### ファイル付きメッセージ

**入力:**
```json
{
  "type": "message",
  "text": "Shared a document:",
  "user": "U123456789",
  "ts": "1704980400",
  "files": [
    {
      "id": "F123456789",
      "name": "report.pdf",
      "mimetype": "application/pdf",
      "url_private": "https://files.slack.com/files-pri/T123-F123/report.pdf",
      "size": 1048576
    }
  ]
}
```

**出力:**
```markdown
**@U123456789** - 2024-01-11 13:40:00

Shared a document:

📄 **[report.pdf](https://files.slack.com/files-pri/T123-F123/report.pdf)** (PDF, 1 MB)
```

## エラーハンドリング

ライブラリは複数レベルのエラーハンドリングを提供します：

### 変換結果の型

```typescript
type ConversionResult = 
  | { success: true; markdown: string }
  | { 
      success: false; 
      error: ConversionError; 
      partialMarkdown?: string // 部分的な変換結果
    }
```

### エラーの種類

- **INVALID_JSON**: 不正なJSON形式
- **MISSING_CONTENT**: 変換可能なコンテンツなし
- **PARTIAL_CONVERSION**: 一部要素の変換失敗
- **UNKNOWN_ERROR**: 予期しないエラー

### 部分変換

一部の要素で変換エラーが発生しても、可能な限り変換を続行します：

```typescript
const result = convertMessage(complexMessage);

if (!result.success && result.partialMarkdown) {
  console.warn("部分的な変換:", result.partialMarkdown);
  console.error("エラー:", result.error.message);
}
```

## 開発

### 環境設定

```bash
# 依存関係のインストール
bun install

# テスト実行
bun test

# リント・フォーマット
bun lint

# ビルド
bun run build
```

### プロジェクト構造

```
src/
├── libs/              # ライブラリコア機能
│   ├── types.ts       # 型定義
│   ├── textFormatter.ts   # テキスト変換
│   ├── blockParser.ts     # Block Kit解析
│   ├── attachmentParser.ts # アタッチメント解析
│   ├── fileParser.ts      # ファイル解析
│   ├── metadataParser.ts  # メタデータ解析
│   └── errorHandler.ts   # エラーハンドリング
├── usecase/          # ビジネスロジック
│   └── convertMessage.ts # メイン変換ロジック
├── presentation/     # プレゼンテーション層
│   └── cli.ts        # CLI実装
├── index.ts          # パブリックAPI
└── cli.ts            # CLIエントリポイント
```

## ライセンス

Apache-2.0

## 貢献

Issue や Pull Request をお気軽にお送りください。

## 関連リンク

- [Slack Block Kit](https://api.slack.com/block-kit)
- [Slack Message Events](https://api.slack.com/events/message)
- [Slack SDK for JavaScript](https://github.com/slackapi/node-slack-sdk)