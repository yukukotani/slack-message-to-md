# Slack Message to Markdown Converter - Design Document

## Overview

このライブラリは、Slack APIで取得したメッセージのJSONデータをAIが処理しやすいMarkdown形式に変換するツールです。CLIインターフェースとプログラマティックAPIの両方を提供し、Slackメッセージの全ての表示要素を適切にMarkdown形式に変換します。

### 主要な設計目標

1. **完全性**: Slackメッセージのすべての表示要素をMarkdownに変換
2. **可読性**: AIシステムが理解しやすい構造化されたMarkdown出力
3. **堅牢性**: 不完全なデータでも可能な限り処理を継続
4. **拡張性**: 新しいSlack機能への対応が容易
5. **型安全性**: TypeScriptによる型定義で安全な実装

## Architecture

### レイヤード・アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  CLI Handler │  │  Function API   │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│           Usecase Layer                 │
│  ┌────────────────────────────────────┐ │
│  │  MessageToMarkdownConverter        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│            Libs Layer                   │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ BlockParser  │  │ TextFormatter   │ │
│  ├──────────────┤  ├─────────────────┤ │
│  │Attachment    │  │ MetadataParser  │ │
│  │Parser        │  │                 │ │
│  ├──────────────┤  ├─────────────────┤ │
│  │ FileParser   │  │ ErrorHandler    │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

### 処理フロー

```
JSON Input
    │
    ▼
Validation & Parsing
    │
    ├─→ Metadata Extraction
    │
    ├─→ Text Content Processing
    │   ├─→ mrkdwn parsing
    │   └─→ Rich text formatting
    │
    ├─→ Block Kit Processing
    │   ├─→ rich_text blocks
    │   ├─→ section blocks
    │   └─→ other blocks
    │
    ├─→ Attachment Processing
    │   └─→ Legacy attachments
    │
    └─→ File Processing
        └─→ File metadata & preview
            │
            ▼
    Markdown Generation
            │
            ▼
    Output Formatting
```

## Components and Interfaces

### Core Types

Slack SDKの型を基本的に使用し、必要な拡張のみカスタム定義する。詳細は[Data Models](#data-models)セクションを参照。

### Main Functions

#### 1. convertMessage (Usecase)

**ファイル**: `src/usecase/convertMessage.ts`

```typescript
// メイン変換関数
export function convertMessage(message: SlackMessage): ConversionResult {
  // 各パーサー関数を協調させて変換
}

export function convertMultipleMessages(
  messages: SlackMessage[]
): ConversionResult[] {
  // 複数メッセージの変換
}
```

主要な変換ロジックを統括し、各パーサー関数を協調させる。

#### 2. Block Parser Functions (Libs)

**ファイル**: `src/libs/blockParser.ts`

```typescript
export function parseBlocks(blocks: Block[]): string {
  // 複数ブロックの解析
}

export function parseRichTextBlock(block: RichTextBlock): string {
  // rich_textブロックの解析
}

export function parseSectionBlock(block: SectionBlock): string {
  // sectionブロックの解析
}

export function parseHeaderBlock(block: HeaderBlock): string {
  // headerブロックの解析
}

export function parseContextBlock(block: ContextBlock): string {
  // contextブロックの解析
}

export function parseDividerBlock(block: DividerBlock): string {
  // dividerブロックの解析
}

export function parseImageBlock(block: ImageBlock): string {
  // imageブロックの解析
}

export function parseActionsBlock(block: ActionsBlock): string {
  // actionsブロックの解析
}

export function parseInputBlock(block: InputBlock): string {
  // inputブロックの解析
}
```

Block Kit要素をMarkdownに変換する関数群。

#### 3. Text Formatter Functions (Libs)

**ファイル**: `src/libs/textFormatter.ts`

```typescript
export function formatMrkdwn(text: string): string {
  // mrkdwnフォーマットの変換
}

export function formatPlainText(text: string): string {
  // プレーンテキストの処理
}

export function formatRichTextElement(element: RichTextElement): string {
  // リッチテキスト要素の変換
}

export function escapeMarkdown(text: string): string {
  // Markdown特殊文字のエスケープ
}

export function formatEmoji(emojiName: string): string {
  // 絵文字の変換
}

export function formatUserMention(
  userId: string, 
  userName?: string
): string {
  // ユーザーメンションの変換
}

export function formatChannelMention(
  channelId: string, 
  channelName?: string
): string {
  // チャンネルメンションの変換
}

export function formatLink(url: string, label?: string): string {
  // リンクの変換
}
```

テキストフォーマットの変換を担当する関数群。

#### 4. Attachment Parser Functions (Libs)

**ファイル**: `src/libs/attachmentParser.ts`

```typescript
export function parseAttachments(attachments: Attachment[]): string {
  // 複数アタッチメントの解析
}

export function parseAttachmentFields(
  fields: AttachmentField[]
): string {
  // アタッチメントフィールドの解析
}

export function formatAttachmentColor(color: string): string {
  // 色情報のフォーマット
}

export function formatAttachmentAuthor(
  author_name?: string,
  author_link?: string,
  author_icon?: string
): string {
  // 作成者情報のフォーマット
}

export function formatAttachmentFooter(
  footer?: string,
  footer_icon?: string,
  ts?: number
): string {
  // フッター情報のフォーマット
}
```

レガシーアタッチメントの変換を担当する関数群。

#### 5. File Parser Functions (Libs)

**ファイル**: `src/libs/fileParser.ts`

```typescript
export function parseFiles(files: File[]): string {
  // 複数ファイルの解析
}

export function formatFileInfo(file: File): string {
  // ファイル情報のフォーマット
}

export function formatImageFile(file: File): string {
  // 画像ファイルのフォーマット
}

export function formatDocumentFile(file: File): string {
  // ドキュメントファイルのフォーマット
}

export function formatFileSize(bytes: number): string {
  // ファイルサイズの人間が読める形式への変換
}
```

ファイル共有情報の変換を担当する関数群。

#### 6. Metadata Parser Functions (Libs)

**ファイル**: `src/libs/metadataParser.ts`

```typescript
export function formatUserHeader(
  user: string, 
  timestamp: string
): string {
  // ユーザーとタイムスタンプのヘッダー生成
}

export function formatTimestamp(ts: string): string {
  // Unixタイムスタンプを日時文字列に変換
}

export function formatReactions(reactions: Reaction[]): string {
  // リアクション情報のフォーマット
}

export function formatThreadInfo(message: SlackMessage): string {
  // スレッド情報のフォーマット
}

export function formatEditedInfo(edited: EditedInfo): string {
  // 編集済み情報のフォーマット
}
```

メタデータの抽出とフォーマットを担当する関数群。

#### 7. Error Handler Functions (Libs)

**ファイル**: `src/libs/errorHandler.ts`

```typescript
export function handleInvalidJson(input: string): ConversionResult {
  // JSONパースエラーの処理
}

export function handleMissingContent(
  message: SlackMessage
): ConversionResult {
  // コンテンツ欠落エラーの処理
}

export function handlePartialConversion(
  markdown: string,
  errors: Error[]
): ConversionResult {
  // 部分的変換エラーの処理
}

export function wrapSafeExecution<T>(
  fn: () => T,
  fallback: T
): T {
  // 安全な実行ラッパー
}
```

エラーハンドリングを担当する関数群。

## Data Models

### Slack SDK Types の利用

```typescript
// @slack/types パッケージから型をインポート
import {
  Block,
  RichTextBlock,
  SectionBlock,
  HeaderBlock,
  ContextBlock,
  DividerBlock,
  ImageBlock,
  ActionsBlock,
  InputBlock,
  MessageAttachment,
  FileElement,
  RichTextSection,
  RichTextList,
  RichTextQuote,
  RichTextPreformatted,
  PlainTextElement,
  MrkdwnElement
} from '@slack/types';

// @slack/web-api パッケージから型をインポート
import { 
  ChatPostMessageArguments,
  ConversationsHistoryResponse,
  MessageElement
} from '@slack/web-api';
```

### カスタム型定義（Slack SDKに無いもののみ）

```typescript
// Slack SDKの型を拡張した変換用の型
type SlackMessage = MessageElement & {
  // Slack SDKの型に追加で必要なフィールド
  reactions?: Reaction[];
  reply_count?: number;
  reply_users?: string[];
  reply_users_count?: number;
  latest_reply?: string;
};

// 変換結果の型定義
type ConversionResult = 
  | { success: true; markdown: string }
  | { success: false; error: ConversionError; partialMarkdown?: string };

type ConversionError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

type ErrorCode = 
  | 'INVALID_JSON'
  | 'MISSING_CONTENT'
  | 'PARTIAL_CONVERSION'
  | 'UNKNOWN_ERROR';

// リアクション型（必要に応じてSDKの型を確認）
type Reaction = {
  name: string;
  users: string[];
  count: number;
};

// 編集情報型（必要に応じてSDKの型を確認）
type EditedInfo = {
  user: string;
  ts: string;
};
```

### 型ガードとユーティリティ

```typescript
// Slack SDKの型を判定する型ガード関数
import { isRichTextBlock, isSectionBlock } from '@slack/types';

// カスタム型ガード
export function isSlackMessage(obj: unknown): obj is SlackMessage {
  return typeof obj === 'object' && 
         obj !== null && 
         'type' in obj;
}

export function hasBlocks(message: SlackMessage): message is SlackMessage & { blocks: Block[] } {
  return Array.isArray(message.blocks) && message.blocks.length > 0;
}

export function hasAttachments(
  message: SlackMessage
): message is SlackMessage & { attachments: MessageAttachment[] } {
  return Array.isArray(message.attachments) && message.attachments.length > 0;
}

export function hasFiles(
  message: SlackMessage
): message is SlackMessage & { files: FileElement[] } {
  return Array.isArray(message.files) && message.files.length > 0;
}
```

## Error Handling

### エラー処理戦略

1. **Graceful Degradation**: 可能な限り部分的な結果を返す
2. **詳細なエラー情報**: デバッグのために詳細なエラー情報を提供
3. **フォールバック**: 変換できない要素は元のテキストを保持

### エラーの種類と対処

```typescript
class ConversionErrorHandler {
  handleInvalidJson(input: string): ConversionResult {
    // JSONパースエラー時の処理
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON format',
        details: input.substring(0, 100)
      }
    };
  }

  handleMissingContent(message: SlackMessage): ConversionResult {
    // コンテンツが空の場合の処理
    return {
      success: false,
      error: {
        code: 'MISSING_CONTENT',
        message: 'No content to convert'
      }
    };
  }

  handlePartialConversion(
    markdown: string, 
    errors: Error[]
  ): ConversionResult {
    // 部分的な変換成功時の処理
    return {
      success: false,
      error: {
        code: 'PARTIAL_CONVERSION',
        message: 'Some elements could not be converted',
        details: errors
      },
      partialMarkdown: markdown
    };
  }
}
```

## Testing Strategy

### テストレベル

1. **単体テスト**: 各パーサーとフォーマッターの個別テスト
2. **統合テスト**: 複数のコンポーネントの連携テスト
3. **E2Eテスト**: CLIとAPIの完全な動作テスト

### テストケース設計

#### 基本的な変換テスト
- シンプルなテキストメッセージ
- mrkdwnフォーマット
- 絵文字とメンション
- リンクとコードブロック

#### Block Kit変換テスト
- 各ブロックタイプの個別テスト
- ネストされたrich_textブロック
- 複数ブロックの組み合わせ
- スタイル付きテキスト

#### レガシーアタッチメントテスト
- 基本的なアタッチメント
- フィールド付きアタッチメント
- 画像とサムネイル
- 色情報とフッター

#### ファイル共有テスト
- 画像ファイル
- ドキュメントファイル
- 複数ファイル
- サムネイルとプレビュー

#### エラーハンドリングテスト
- 不正なJSON
- 欠落フィールド
- 未知のブロックタイプ
- 深いネスト構造

#### メタデータテスト
- タイムスタンプ変換
- ユーザー情報
- スレッド情報
- リアクション
- 編集済みメッセージ

### テスト実装方針

```typescript
// テストヘルパー関数
function createMockMessage(overrides?: Partial<SlackMessage>): SlackMessage {
  return {
    type: 'message',
    text: 'Test message',
    user: 'U123456',
    ts: '1234567890.123456',
    ...overrides
  };
}

// スナップショットテストの活用
describe('MessageToMarkdownConverter', () => {
  it('should convert complex message correctly', () => {
    const message = createMockMessage({
      blocks: [/* complex blocks */],
      attachments: [/* attachments */],
      files: [/* files */]
    });
    
    const result = converter.convert(message);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toMatchSnapshot();
    }
  });
});
```

## 出力フォーマット例

### 基本的なメッセージ

入力:
```json
{
  "text": "Hello *world*! Check out <https://slack.com|Slack>",
  "user": "U123456",
  "ts": "1234567890.123456"
}
```

出力:
```markdown
**User U123456** - 2009-02-14 08:31:30

Hello **world**! Check out [Slack](https://slack.com)
```

### Block Kit メッセージ

入力:
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Important Update"
      }
    },
    {
      "type": "rich_text",
      "elements": [
        {
          "type": "rich_text_list",
          "style": "bullet",
          "elements": [...]
        }
      ]
    }
  ]
}
```

出力:
```markdown
# Important Update

- First item
- Second item
  - Nested item
```

### アタッチメント付きメッセージ

出力:
```markdown
**User Name** - 2024-01-15 10:30:00

Main message text

---

📎 **Attachment**
🟢 *Success*

**[Article Title](https://example.com)**

This is the attachment text content.

| Field 1 | Value 1 |
| Field 2 | Value 2 |

![Thumbnail](https://example.com/thumb.jpg)

_Footer text • 2024-01-15 10:30:00_
```

## パフォーマンス考慮事項

1. **メモリ効率**: 大きなファイルや画像URLは参照のみ保持
2. **キャッシング**: ユーザー名やチャンネル名の解決結果をキャッシュ
3. **並列処理**: 複数メッセージの変換時は並列処理を検討

## セキュリティ考慮事項

1. **入力検証**: JSONインジェクション対策
2. **URLサニタイゼーション**: 悪意のあるURLの除去
3. **出力エスケープ**: Markdown特殊文字の適切なエスケープ
4. **サイズ制限**: 過度に大きな入力の拒否

## 将来の拡張性

1. **プラグインシステム**: カスタムブロックタイプの対応
2. **設定オプション**: 出力フォーマットのカスタマイズ
3. **リアルタイム変換**: Slack Events APIとの統合
4. **逆変換**: MarkdownからSlackメッセージへの変換
5. **国際化**: 日付フォーマットやタイムゾーンの対応