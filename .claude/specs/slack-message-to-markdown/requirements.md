# Requirements Document

## Introduction

Slack APIで取得したメッセージのJSONデータをAIが処理しやすいMarkdown形式に変換するライブラリを開発します。このライブラリは、CLIツールとしてパイプ経由でJSONを受け取りMarkdownを出力する機能と、プログラムから呼び出し可能な関数として動作する2つのインターフェースを提供します。Slackメッセージの全ての表示要素（リッチテキスト、アタッチメント、ファイル、リアクション等）を適切にMarkdown形式に変換します。

## Requirements

### Requirement 1: CLI インターフェース

**User Story:** 開発者として、パイプ経由でSlackメッセージのJSONを入力し、Markdown形式で出力を得たい。これにより、シェルスクリプトやパイプラインでの処理が容易になる。

#### Acceptance Criteria

1. WHEN 標準入力からSlackメッセージのJSONが入力される THEN システムは標準出力にMarkdown形式のテキストを出力する
2. WHEN 不正なJSON形式が入力される THEN システムはエラーメッセージを標準エラー出力に出力し、非ゼロの終了コードを返す
3. WHEN 複数のメッセージを含むJSON配列が入力される THEN システムは各メッセージを順番にMarkdownに変換し、適切な区切りで出力する
4. IF 入力JSONにメッセージオブジェクトが含まれない THEN システムは適切なエラーメッセージを出力する

### Requirement 2: プログラマティックAPI

**User Story:** 開発者として、JavaScriptのコードからSlackメッセージオブジェクトをMarkdown文字列に変換する関数を呼び出したい。これにより、他のアプリケーションに組み込んで使用できる。

#### Acceptance Criteria

1. WHEN メッセージオブジェクトが関数に渡される THEN システムはMarkdown形式の文字列を返す
2. WHEN nullまたはundefinedが渡される THEN システムは適切なエラーを返す
3. WHEN 不完全なメッセージオブジェクトが渡される THEN システムは利用可能な情報のみでMarkdownを生成する
4. IF TypeScriptで使用される THEN システムは適切な型定義を提供する

### Requirement 3: リッチテキスト変換

**User Story:** AIシステムとして、Slackのリッチテキスト要素（太字、斜体、リンク、コードブロック等）を適切なMarkdown記法で読みたい。これにより、メッセージの意図と構造を正確に理解できる。

#### Acceptance Criteria

1. WHEN テキストに太字マークアップ(*text*)が含まれる THEN システムは**text**形式のMarkdownに変換する
2. WHEN テキストに斜体マークアップ(_text_)が含まれる THEN システムは*text*形式のMarkdownに変換する
3. WHEN テキストにコードブロック(```code```)が含まれる THEN システムは適切なMarkdownコードブロックに変換する
4. WHEN テキストにインラインコード(`code`)が含まれる THEN システムは`code`形式を維持する
5. WHEN テキストにリンク(<url|label>)が含まれる THEN システムは[label](url)形式のMarkdownリンクに変換する
6. WHEN ユーザーメンション(<@U123456>)が含まれる THEN システムは@username形式に変換する（可能な場合）
7. WHEN チャンネルメンション(<#C123456|channel-name>)が含まれる THEN システムは#channel-name形式に変換する
8. WHEN 絵文字(:emoji:)が含まれる THEN システムは適切なUnicode絵文字または:emoji:形式を維持する

### Requirement 4: Block Kit変換

**User Story:** AIシステムとして、SlackのBlock Kit要素（各種ブロックタイプ）を適切にMarkdownで読みたい。これにより、構造化されたコンテンツを正確に理解できる。

#### Acceptance Criteria

1. WHEN メッセージにrich_textブロックが含まれる THEN システムは以下を適切に変換する：
   - rich_text_sectionの各要素（text、link、emoji、user、channel等）を適切なMarkdownに変換
   - rich_text_listを順序付き/順序なしのMarkdownリスト形式に変換
   - rich_text_quoteをMarkdownの引用ブロック（>記法）に変換
   - rich_text_preformattedをMarkdownコードブロックに変換
2. WHEN rich_text_listにインデントが指定されている THEN システムはネストされたMarkdownリストを生成する
3. IF rich_text要素にスタイル（bold、italic、strike、code）が指定されている THEN システムは対応するMarkdown記法を適用する
4. WHEN メッセージにsectionブロックが含まれる THEN システムはテキストとアクセサリー要素を適切にMarkdownに変換する
5. WHEN メッセージにheaderブロックが含まれる THEN システムはMarkdownヘッダー（#記法）に変換する
6. WHEN メッセージにcontextブロックが含まれる THEN システムは小さなテキストとして適切にMarkdownで表現する
7. WHEN メッセージにdividerブロックが含まれる THEN システムは水平線（---）をMarkdownで表現する
8. WHEN メッセージにimageブロックが含まれる THEN システムは![alt text](url)形式のMarkdown画像として表現する
9. WHEN メッセージにactionsブロックが含まれる THEN システムはボタンやメニューを適切な形式でMarkdownに表現する
10. WHEN メッセージにinputブロックが含まれる THEN システムは入力フィールドの情報を適切にMarkdownで表現する

### Requirement 5: レガシーアタッチメント変換

**User Story:** AIシステムとして、Slackのレガシーアタッチメント形式の内容を構造化されたMarkdownで読みたい。これにより、古い形式のメッセージも正確に理解できる。

#### Acceptance Criteria

1. WHEN アタッチメントにtitle、title_link、textが含まれる THEN システムは適切なMarkdown形式（リンク付きタイトル、本文）で表現する
2. WHEN アタッチメントにauthor_name、author_link、author_iconが含まれる THEN システムは作成者情報を適切にMarkdownで表現する
3. WHEN アタッチメントにfieldsが含まれる THEN システムはテーブル風のMarkdown形式でフィールドを表現する
4. WHEN アタッチメントにimage_urlが含まれる THEN システムは![alt text](url)形式のMarkdown画像として表現する
5. WHEN アタッチメントにthumb_urlが含まれる THEN システムはサムネイル画像を適切にMarkdownで表現する
6. WHEN アタッチメントにfooter、footer_icon、tsが含まれる THEN システムはフッター情報を適切にMarkdownで表現する
7. WHEN アタッチメントにpretextが含まれる THEN システムは前置きテキストを適切にMarkdownで表現する
8. WHEN アタッチメントにcolorが指定されている THEN システムは色情報を適切な方法で表現する（例：色名や絵文字）
9. IF アタッチメントにblocksフィールドが含まれる THEN システムはRequirement 4のBlock Kit変換ルールに従って処理する

### Requirement 6: ファイル共有変換

**User Story:** AIシステムとして、Slackで共有されたファイル（画像、ドキュメント、動画等）の情報を構造化されたMarkdownで読みたい。これにより、共有されたコンテンツの全体像を理解できる。

#### Acceptance Criteria

1. WHEN メッセージにfilesが含まれる THEN システムはファイル名、タイプ、サイズ情報を含むMarkdown形式で表現する
2. WHEN ファイルが画像（mimetype: image/*）の場合 THEN システムは![filename](url)形式のMarkdown画像として表現する
3. WHEN ファイルがPDFやドキュメントの場合 THEN システムはファイル名をリンクとして、タイプとサイズを併記する
4. WHEN ファイルにthumbnail_urlが含まれる THEN システムはサムネイル画像を適切にMarkdownで表現する
5. IF ファイルにpreviewが含まれる THEN システムはプレビュー内容を適切にMarkdownで表現する

### Requirement 7: メタデータ保持

**User Story:** AIシステムとして、メッセージの作成者、タイムスタンプ、スレッド情報などのメタデータをMarkdown内で参照したい。これにより、会話の文脈を正確に把握できる。

#### Acceptance Criteria

1. WHEN メッセージにユーザー情報が含まれる THEN システムは作成者名をMarkdownヘッダーまたは適切な形式で表示する
2. WHEN メッセージにタイムスタンプが含まれる THEN システムは人間が読みやすい日時形式でMarkdownに含める
3. WHEN メッセージがスレッドの一部である THEN システムはスレッド情報を適切にMarkdownで表現する
4. WHEN メッセージにリアクションが含まれる THEN システムはリアクション絵文字と数を適切な形式で表示する
5. IF メッセージが編集されている THEN システムは編集済みインジケーターを表示する

### Requirement 8: エラーハンドリングと堅牢性

**User Story:** 開発者として、不完全または予期しない形式のSlackメッセージデータでもライブラリが適切に処理し、可能な限り有用な出力を生成してほしい。これにより、実環境での信頼性が向上する。

#### Acceptance Criteria

1. WHEN 必須フィールドが欠落している THEN システムは利用可能な情報のみで処理を続行する
2. WHEN 未知のメッセージタイプが入力される THEN システムは基本的なテキスト内容を抽出してMarkdownに変換する
3. WHEN ネストされた構造が深すぎる THEN システムは適切な深さで切り詰めて処理する
4. IF 変換中にエラーが発生した THEN システムは部分的な結果を返し、エラー情報を含める