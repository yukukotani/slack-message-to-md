# Slack API メッセージ構造調査結果

## 概要

Slack API のメッセージ構造について詳しく調査した結果をまとめます。この情報は設計ドキュメントの参考資料として活用できます。

## 1. メッセージペイロードの基本構造

Slack API では、すべてのメッセージ送信APIで共通の**メッセージペイロード**と呼ばれるJSON構造を使用します。

### 基本的なペイロード

```json
{
  "text": "メッセージのテキスト内容",
  "blocks": [],
  "attachments": [],
  "thread_ts": "1355517523.000005",
  "mrkdwn": true
}
```

### 主要フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|---|------|-----|
| `text` | String | Yes | メッセージのメイン内容。`blocks`使用時は通知用フォールバック文字列として機能 |
| `blocks` | Array | No | レイアウトブロックの配列（Block Kit）。リッチなUIとインタラクティブ要素用 |
| `attachments` | Array | No | レガシーアタッチメントの配列（非推奨、`blocks`使用推奨） |
| `thread_ts` | String | No | 返信先メッセージのタイムスタンプ（スレッド機能用） |
| `mrkdwn` | Boolean | No | `text`フィールドで`mrkdwn`フォーマットを使用するか（デフォルト: true） |

### 完全なメッセージオブジェクト

```json
{
  "type": "message",
  "channel": "C123ABC456",
  "user": "U123ABC456",
  "text": "Hello, world!",
  "ts": "1355517523.000005",
  "subtype": null,
  "edited": {
    "user": "U123ABC456",
    "ts": "1355517536.000001"
  },
  "blocks": [],
  "attachments": [],
  "reactions": [],
  "permalink": "https://workspace.slack.com/archives/C123ABC456/p1355517523000005"
}
```

## 2. Block Kit の各ブロックタイプの構造

### 2.1 `rich_text` ブロック

リッチテキストコンテンツの表示用。WYSIWYGエディターの出力。

```json
{
  "type": "rich_text",
  "block_id": "optional_block_id",
  "elements": [
    {
      "type": "rich_text_section",
      "elements": [
        {
          "type": "text",
          "text": "これは ",
          "style": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": "リッチテキストセクションです。"
        }
      ]
    },
    {
      "type": "rich_text_list",
      "style": "bullet",
      "elements": [
        {
          "type": "rich_text_section",
          "elements": [
            {
              "type": "text",
              "text": "リスト項目 1"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 `section` ブロック

最も汎用的なブロック。テキストとアクセサリ要素を組み合わせ可能。

```json
{
  "type": "section",
  "block_id": "section_block_id",
  "text": {
    "type": "mrkdwn",
    "text": "これは *section* ブロックです。"
  },
  "fields": [
    {
      "type": "mrkdwn",
      "text": "*フィールド 1:*\n値 1"
    },
    {
      "type": "mrkdwn",
      "text": "*フィールド 2:*\n値 2"
    }
  ],
  "accessory": {
    "type": "image",
    "image_url": "https://example.com/image.png",
    "alt_text": "サンプル画像"
  }
}
```

### 2.3 `header` ブロック

大きく太字のヘッダー表示用。

```json
{
  "type": "header",
  "block_id": "header_block_id",
  "text": {
    "type": "plain_text",
    "text": "これはヘッダーです",
    "emoji": true
  }
}
```

### 2.4 `context` ブロック

追加情報やコンテキスト表示用。小さなグレーテキスト。

```json
{
  "type": "context",
  "block_id": "context_block_id",
  "elements": [
    {
      "type": "image",
      "image_url": "https://example.com/icon.png",
      "alt_text": "コンテキストアイコン"
    },
    {
      "type": "mrkdwn",
      "text": "*田中太郎* によって 2025年8月30日に作成"
    }
  ]
}
```

### 2.5 `divider` ブロック

視覚的な区切り線（HTML の `<hr>` タグ相当）。

```json
{
  "type": "divider",
  "block_id": "divider_block_id"
}
```

### 2.6 `image` ブロック

画像表示用。URLまたはSlack内ファイルを指定。

```json
{
  "type": "image",
  "block_id": "image_block_id",
  "image_url": "https://example.com/kitten.jpg",
  "alt_text": "とても可愛い子猫の写真です。",
  "title": {
    "type": "plain_text",
    "text": "子猫の写真をお楽しみください"
  }
}
```

### 2.7 `actions` ブロック

インタラクティブ要素（ボタン、セレクトメニューなど）のコンテナ。

```json
{
  "type": "actions",
  "block_id": "actions_block_id",
  "elements": [
    {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "承認",
        "emoji": true
      },
      "style": "primary",
      "value": "click_me_123",
      "action_id": "button_approve"
    },
    {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "却下",
        "emoji": true
      },
      "style": "danger",
      "value": "click_me_456",
      "action_id": "button_deny"
    }
  ]
}
```

### 2.8 `input` ブロック

ユーザー入力収集用。モーダルやHome タブで使用。

```json
{
  "type": "input",
  "block_id": "input_block_id",
  "label": {
    "type": "plain_text",
    "text": "フィードバックを入力してください"
  },
  "element": {
    "type": "plain_text_input",
    "action_id": "plain_text_input_action_id",
    "placeholder": {
      "type": "plain_text",
      "text": "こちらに入力..."
    }
  },
  "hint": {
    "type": "plain_text",
    "text": "あなたのフィードバックは貴重です。"
  },
  "optional": false
}
```

## 3. レガシーアタッチメントの構造

**注意**: レガシーアタッチメントは非推奨です。新しい実装では Block Kit の使用が強く推奨されています。

```json
{
  "channel": "ABCDEBF1",
  "attachments": [
    {
      "mrkdwn_in": ["text"],
      "color": "#36a64f",
      "pretext": "アタッチメントブロックの上に表示されるオプションのプリテキスト",
      "author_name": "作者名",
      "author_link": "http://flickr.com/bobby/",
      "author_icon": "https://placeimg.com/16/16/people",
      "title": "タイトル",
      "title_link": "https://api.slack.com/",
      "text": "アタッチメント内に表示されるオプションの `text`",
      "fields": [
        {
          "title": "フィールドのタイトル",
          "value": "このフィールドの値",
          "short": false
        },
        {
          "title": "短いフィールドのタイトル",
          "value": "短いフィールドの値",
          "short": true
        }
      ],
      "thumb_url": "http://placekitten.com/g/200/200",
      "footer": "フッター",
      "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
      "ts": 123456789
    }
  ]
}
```

### 主要フィールド

- `color`: 左端のボーダー色（"good", "warning", "danger" または16進カラーコード）
- `fields`: テーブル形式で表示される情報の配列
- `thumb_url`: サムネイル画像のURL
- `ts`: Unix タイムスタンプ（フッターに時刻表示）

## 4. ファイル共有時のメッセージ構造

**注意**: `files.upload` メソッドは2025年3月11日に廃止予定。`files.getUploadURLExternal` と `files.completeUploadExternal` の使用が推奨されています。

```json
{
  "channel": "C0A1BC2DE",
  "text": "リクエストされた資料です。",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "リクエストされた資料です。 :page_facing_up:"
      }
    }
  ],
  "files": [
    {
      "id": "F0G1H2I3J4",
      "created": 1678886400,
      "timestamp": 1678886400,
      "name": "project_report_2024.pdf",
      "title": "プロジェクトレポート 2024",
      "mimetype": "application/pdf",
      "filetype": "pdf",
      "pretty_type": "PDF",
      "user": "U1234567890",
      "editable": false,
      "size": 1548576,
      "mode": "hosted",
      "is_external": false,
      "external_type": "",
      "is_public": true,
      "public_url_shared": true,
      "channels": ["C0A1BC2DE", "C1B2C3D4E5"],
      "groups": [],
      "ims": [],
      "comments_count": 0,
      "initial_comment": {
        "id": "Fc0G1H2I3J4",
        "timestamp": 1678886400,
        "user": "U1234567890",
        "comment": "最新のプロジェクトレポートです。"
      },
      "num_shares": 2,
      "is_starred": false,
      "url_private": "https://files.slack.com/files-pri/T01234567-F0G1H2I3J4/project_report_2024.pdf",
      "url_private_download": "https://files.slack.com/files-pri/T01234567-F0G1H2I3J4/download/project_report_2024.pdf",
      "thumb_64": "https://files.slack.com/files-tmb/T01234567-F0G1H2I3J4/thumb_64.png",
      "thumb_80": "https://files.slack.com/files-tmb/T01234567-F0G1H2I3J4/thumb_80.png",
      "permalink": "https://yourworkspace.slack.com/files/U1234567890/F0G1H2I3J4/project_report_2024.pdf",
      "permalink_public": "https://slack-files.com/T01234567-F0G1H2I3J4-pub"
    }
  ]
}
```

### ファイルオブジェクトの主要プロパティ

- `id`: ファイルの一意識別子
- `name`, `title`: ファイル名とタイトル
- `mimetype`, `filetype`: MIMEタイプとファイル拡張子
- `size`: ファイルサイズ（バイト）
- `url_private`: プライベートダウンロードURL
- `permalink`: Slack内での永続リンク

## 5. スレッド、リアクション、編集済みメッセージの構造

### 5.1 親メッセージ（スレッドの開始）

```json
{
  "type": "message",
  "subtype": "thread_broadcast",
  "channel": "C1234567890",
  "user": "U02ABCDEFGH",
  "text": "これはスレッドを開始した元のメッセージです。重要な情報が含まれています。",
  "ts": "1678886400.012345",
  "edited": {
    "user": "U02ABCDEFGH",
    "ts": "1678886460.012346"
  },
  "reactions": [
    {
      "name": "thumbsup",
      "count": 5,
      "users": [
        "U01QRSTUVWX",
        "U03ZYXWVUT",
        "U04FEDCBA9",
        "U05HGJIJKL",
        "U06MNOPQRS"
      ]
    },
    {
      "name": "rocket",
      "count": 2,
      "users": [
        "U07LKJIHGF",
        "U08PONMLKJ"
      ]
    }
  ],
  "reply_count": 3,
  "reply_users_count": 2,
  "latest_reply": "1678886580.012349",
  "reply_users": [
    "U01QRSTUVWX",
    "U03ZYXWVUT"
  ],
  "last_read": "1678886580.012349",
  "thread_ts": "1678886400.012345",
  "is_locked": false
}
```

### 5.2 スレッド返信メッセージ

```json
{
  "type": "message",
  "subtype": null,
  "channel": "C1234567890",
  "user": "U01QRSTUVWX",
  "text": "これはスレッド内の元メッセージに対する返信です。",
  "ts": "1678886520.012347",
  "thread_ts": "1678886400.012345",
  "parent_user_id": "U02ABCDEFGH",
  "reactions": [
    {
      "name": "white_check_mark",
      "count": 1,
      "users": [
        "U03ZYXWVUT"
      ]
    }
  ]
}
```

### 主要フィールドの説明

#### スレッド関連
- `ts`: メッセージの一意タイムスタンプ
- `thread_ts`: スレッドの親メッセージのタイムスタンプ（親メッセージでは`ts`と同じ値）
- `parent_user_id`: 親メッセージの作者のユーザーID

#### 編集関連
- `edited`: 編集情報オブジェクト
  - `user`: 編集したユーザーのID
  - `ts`: 編集が行われたタイムスタンプ

#### リアクション関連
- `reactions`: リアクション配列
  - `name`: 絵文字名
  - `count`: リアクション数
  - `users`: リアクションしたユーザーのID配列

#### スレッド統計（親メッセージのみ）
- `reply_count`: スレッド内の返信総数
- `reply_users_count`: 返信したユニークユーザー数
- `latest_reply`: 最新返信のタイムスタンプ
- `reply_users`: 返信したユーザーのID配列

## 6. 実装時の注意点

### メッセージ送信方法
- `chat.postMessage`: 通常メッセージ送信
- `chat.postEphemeral`: 一時的メッセージ送信（特定ユーザーのみ表示）
- Incoming webhooks: URL へのPOSTでメッセージ送信
- `response_url`: インタラクション応答用

### パフォーマンス考慮事項
- Block Kit使用時も`text`フィールドは通知フォールバック用に含めることを強く推奨
- レガシーアタッチメントではなく Block Kit の使用を推奨
- JSON送信時は`Content-type: application/json`ヘッダーを設定

### API制限
- `actions` ブロックは最大25個の要素
- `context` ブロックは最大10個の要素
- `header` ブロックのテキストは最大150文字

この調査結果を元に、Slackメッセージの構造を適切に解析・変換する設計を行うことができます。