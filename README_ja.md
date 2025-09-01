# slack-message-to-md

Slack の API メッセージオブジェクトを AI フレンドリーな Markdown 形式に変換する TypeScript ライブラリです。

## 特徴

- **Block Kit 対応**: Block Kit 要素を Markdown に変換
- **レガシーアタッチメント**: 従来のアタッチメント形式に対応
- **ファイル共有**: 画像・ドキュメントファイルの変換
- **ユーザーマッピング**: ユーザー ID から実名への変換機能
- **型安全**: TypeScript 完全対応

## インストール

```bash
npm install slack-message-to-md
```

## 使用方法

### プログラマティック API

```typescript
import { convertMessage } from "slack-message-to-md";

const message = {
  type: "message",
  text: "Hello *world*!",
  user: "U123456789",
  ts: "1704980400",
};

// 基本的な変換
const markdown = convertMessage(message);

// ユーザーマッピング付きで変換
const userMapping = { U123456789: "太郎" };
const markdownWithUsers = convertMessage(message, userMapping);
```

### CLI

```bash
# JSONファイルを標準出力に変換
npx slack-message-to-md message.json

# ファイルに出力
npx slack-message-to-md message.json output.md
```

## 対応要素

- **Block Kit**: Section、Header、Divider、Image、Context、Rich Text
- **テキスト**: mrkdwn フォーマット（太字、斜体、リンク、絵文字）
- **アタッチメント**: タイトル、テキスト、フィールド、色
- **ファイル**: 画像ファイル、ドキュメント
- **メタデータ**: ユーザー情報、タイムスタンプ、リアクション

## 開発

```bash
# インストール
bun install

# テスト
bun test

# リント
bun lint

# ビルド
bun run build
```

## ライセンス

Apache-2.0
