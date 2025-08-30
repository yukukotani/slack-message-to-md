import { describe, expect, it } from "vitest";
import {
  escapeMarkdown,
  formatChannelMention,
  formatEmoji,
  formatLink,
  formatMrkdwn,
  formatPlainText,
  formatUserMention,
} from "./textFormatter";

describe("formatMrkdwn", () => {
  it("太字(*text*)を**text**に変換する", () => {
    expect(formatMrkdwn("これは*太字*です")).toBe("これは**太字**です");
  });

  it("斜体(_text_)を*text*に変換する", () => {
    expect(formatMrkdwn("これは_斜体_です")).toBe("これは*斜体*です");
  });

  it("取り消し線(~text~)を~~text~~に変換する", () => {
    expect(formatMrkdwn("これは~取り消し線~です")).toBe(
      "これは~~取り消し線~~です",
    );
  });

  it("インラインコード(`code`)をそのまま維持する", () => {
    expect(formatMrkdwn("これは`code`です")).toBe("これは`code`です");
  });

  it("コードブロック(```code```)をそのまま維持する", () => {
    const input = "```\nfunction hello() {\n  console.log('hello');\n}\n```";
    const expected = "```\nfunction hello() {\n  console.log('hello');\n}\n```";
    expect(formatMrkdwn(input)).toBe(expected);
  });

  it("リンク(<url|label>)を[label](url)に変換する", () => {
    expect(
      formatMrkdwn("詳細は<https://example.com|こちら>をご覧ください"),
    ).toBe("詳細は[こちら](https://example.com)をご覧ください");
  });

  it("ラベルなしリンク(<url>)をそのまま表示する", () => {
    expect(formatMrkdwn("URLは<https://example.com>です")).toBe(
      "URLはhttps://example.comです",
    );
  });

  it("ユーザーメンション(<@U123456>)を@U123456に変換する", () => {
    expect(formatMrkdwn("<@U123456>さん、こんにちは")).toBe(
      "@U123456さん、こんにちは",
    );
  });

  it("チャンネルメンション(<#C123456|channel-name>)を#channel-nameに変換する", () => {
    expect(formatMrkdwn("<#C123456|general>で議論しましょう")).toBe(
      "#generalで議論しましょう",
    );
  });

  it("チャンネルメンション(<#C123456>)を#C123456に変換する", () => {
    expect(formatMrkdwn("<#C123456>で議論しましょう")).toBe(
      "#C123456で議論しましょう",
    );
  });

  it("複数のフォーマットが混在する場合も正しく変換する", () => {
    const input = "*太字*と_斜体_と`code`と<https://example.com|リンク>";
    const expected = "**太字**と*斜体*と`code`と[リンク](https://example.com)";
    expect(formatMrkdwn(input)).toBe(expected);
  });

  it("ブロック引用(>)をそのまま維持する", () => {
    expect(formatMrkdwn("> 引用文")).toBe("> 引用文");
  });

  it("リスト記法をそのまま維持する", () => {
    const input = "• アイテム1\n• アイテム2\n• アイテム3";
    const expected = "• アイテム1\n• アイテム2\n• アイテム3";
    expect(formatMrkdwn(input)).toBe(expected);
  });
});

describe("formatPlainText", () => {
  it("プレーンテキストをそのまま返す", () => {
    expect(formatPlainText("これはプレーンテキストです")).toBe(
      "これはプレーンテキストです",
    );
  });

  it("改行を維持する", () => {
    expect(formatPlainText("行1\n行2\n行3")).toBe("行1\n行2\n行3");
  });

  it("空文字列を正しく処理する", () => {
    expect(formatPlainText("")).toBe("");
  });
});

describe("formatUserMention", () => {
  it("ユーザー名が提供された場合は@usernameを返す", () => {
    expect(formatUserMention("U123456", "john.doe")).toBe("@john.doe");
  });

  it("ユーザー名が提供されない場合は@UserIDを返す", () => {
    expect(formatUserMention("U123456")).toBe("@U123456");
  });

  it("ユーザー名が空文字列の場合は@UserIDを返す", () => {
    expect(formatUserMention("U123456", "")).toBe("@U123456");
  });
});

describe("formatChannelMention", () => {
  it("チャンネル名が提供された場合は#channel-nameを返す", () => {
    expect(formatChannelMention("C123456", "general")).toBe("#general");
  });

  it("チャンネル名が提供されない場合は#ChannelIDを返す", () => {
    expect(formatChannelMention("C123456")).toBe("#C123456");
  });

  it("チャンネル名が空文字列の場合は#ChannelIDを返す", () => {
    expect(formatChannelMention("C123456", "")).toBe("#C123456");
  });
});

describe("formatLink", () => {
  it("ラベル付きリンクを[label](url)形式に変換する", () => {
    expect(formatLink("https://example.com", "Example Site")).toBe(
      "[Example Site](https://example.com)",
    );
  });

  it("ラベルなしリンクをそのまま返す", () => {
    expect(formatLink("https://example.com")).toBe("https://example.com");
  });

  it("ラベルが空文字列の場合はURLをそのまま返す", () => {
    expect(formatLink("https://example.com", "")).toBe("https://example.com");
  });
});

describe("formatEmoji", () => {
  it("一般的な絵文字を適切なUnicode絵文字に変換する", () => {
    expect(formatEmoji(":smile:")).toBe("😄");
    expect(formatEmoji(":heart:")).toBe("❤️");
    expect(formatEmoji(":thumbsup:")).toBe("👍");
  });

  it("未知の絵文字名はそのまま返す", () => {
    expect(formatEmoji(":unknown_emoji_name:")).toBe(":unknown_emoji_name:");
  });

  it("カスタム絵文字はそのまま返す", () => {
    expect(formatEmoji(":custom-emoji:")).toBe(":custom-emoji:");
  });
});

describe("escapeMarkdown", () => {
  it("Markdown特殊文字をエスケープする", () => {
    expect(escapeMarkdown("*text*")).toBe("\\*text\\*");
    expect(escapeMarkdown("_text_")).toBe("\\_text\\_");
    expect(escapeMarkdown("[link]")).toBe("\\[link\\]");
    expect(escapeMarkdown("`code`")).toBe("\\`code\\`");
    expect(escapeMarkdown("# heading")).toBe("\\# heading");
  });

  it("複数の特殊文字を含むテキストを正しくエスケープする", () => {
    expect(escapeMarkdown("*bold* and _italic_ and `code`")).toBe(
      "\\*bold\\* and \\_italic\\_ and \\`code\\`",
    );
  });

  it("特殊文字を含まないテキストはそのまま返す", () => {
    expect(escapeMarkdown("普通のテキスト")).toBe("普通のテキスト");
  });
});
