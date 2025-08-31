import type {
  Block,
  ContextBlock,
  DividerBlock,
  HeaderBlock,
  ImageBlock,
  RichTextBlock,
  SectionBlock,
} from "@slack/types";
import { describe, expect, it } from "vitest";
import {
  parseBlocks,
  parseContextBlock,
  parseDividerBlock,
  parseHeaderBlock,
  parseImageBlock,
  parseRichTextBlock,
  parseSectionBlock,
} from "./blockParser";

describe("parseRichTextBlock", () => {
  it("rich_text_sectionを解析する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "通常のテキスト" },
            { type: "text", text: "太字", style: { bold: true } },
            { type: "text", text: "と" },
            { type: "text", text: "斜体", style: { italic: true } },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("通常のテキスト**太字**と*斜体*");
  });

  it("rich_text_listを順序なしリストに変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_list",
          style: "bullet",
          elements: [
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "アイテム1" }],
            },
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "アイテム2" }],
            },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("- アイテム1\n- アイテム2");
  });

  it("rich_text_listを順序付きリストに変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_list",
          style: "ordered",
          elements: [
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "手順1" }],
            },
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "手順2" }],
            },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("1. 手順1\n2. 手順2");
  });

  it("インデント付きリストを正しく変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_list",
          style: "bullet",
          indent: 1,
          elements: [
            {
              type: "rich_text_section",
              elements: [{ type: "text", text: "ネストアイテム" }],
            },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("  - ネストアイテム");
  });

  it("rich_text_quoteを引用ブロックに変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_quote",
          elements: [{ type: "text", text: "これは引用文です" }],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("> これは引用文です");
  });

  it("rich_text_preformattedをコードブロックに変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_preformatted",
          elements: [{ type: "text", text: "const x = 10;\nconsole.log(x);" }],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe(
      "```\nconst x = 10;\nconsole.log(x);\n```",
    );
  });

  it("リンク要素を正しく変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "詳細は" },
            { type: "link", url: "https://example.com", text: "こちら" },
            { type: "text", text: "をご覧ください" },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe(
      "詳細は[こちら](https://example.com)をご覧ください",
    );
  });

  it("ユーザーメンションを正しく変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "user", user_id: "U123456" },
            { type: "text", text: "さん、こんにちは" },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("@U123456さん、こんにちは");
  });

  it("チャンネルメンションを正しく変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "議論は" },
            { type: "channel", channel_id: "C123456" },
            { type: "text", text: "で行います" },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("議論は#C123456で行います");
  });

  it("絵文字を正しく変換する", () => {
    const block: RichTextBlock = {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            { type: "text", text: "良いですね" },
            { type: "emoji", name: "thumbsup" },
          ],
        },
      ],
    };
    expect(parseRichTextBlock(block)).toBe("良いですね👍");
  });
});

describe("parseSectionBlock", () => {
  it("プレーンテキストのセクションを解析する", () => {
    const block: SectionBlock = {
      type: "section",
      text: {
        type: "plain_text",
        text: "これはセクションのテキストです",
      },
    };
    expect(parseSectionBlock(block)).toBe(
      "<section>\nこれはセクションのテキストです\n</section>",
    );
  });

  it("mrkdwnテキストのセクションを解析する", () => {
    const block: SectionBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*太字*と_斜体_のテキスト",
      },
    };
    expect(parseSectionBlock(block)).toBe(
      "<section>\n**太字**と*斜体*のテキスト\n</section>",
    );
  });

  it("フィールド付きセクションを解析する", () => {
    const block: SectionBlock = {
      type: "section",
      fields: [
        { type: "plain_text", text: "項目1" },
        { type: "plain_text", text: "値1" },
        { type: "plain_text", text: "項目2" },
        { type: "plain_text", text: "値2" },
      ],
    };
    expect(parseSectionBlock(block)).toBe(
      "<section>\n項目1 | 値1\n項目2 | 値2\n</section>",
    );
  });

  it("テキストとフィールドの両方を持つセクションを解析する", () => {
    const block: SectionBlock = {
      type: "section",
      text: {
        type: "plain_text",
        text: "メインテキスト",
      },
      fields: [
        { type: "plain_text", text: "項目1" },
        { type: "plain_text", text: "値1" },
      ],
    };
    expect(parseSectionBlock(block)).toBe(
      "<section>\nメインテキスト\n\n項目1 | 値1\n</section>",
    );
  });
});

describe("parseHeaderBlock", () => {
  it("ヘッダーブロックをMarkdownヘッダーに変換する", () => {
    const block: HeaderBlock = {
      type: "header",
      text: {
        type: "plain_text",
        text: "重要なお知らせ",
      },
    };
    expect(parseHeaderBlock(block)).toBe("# 重要なお知らせ");
  });
});

describe("parseContextBlock", () => {
  it("プレーンテキストのコンテキストブロックを解析する", () => {
    const block: ContextBlock = {
      type: "context",
      elements: [
        { type: "plain_text", text: "投稿者: John Doe" },
        { type: "plain_text", text: "日時: 2024-01-15" },
      ],
    };
    expect(parseContextBlock(block)).toBe(
      "_投稿者: John Doe | 日時: 2024-01-15_",
    );
  });

  it("mrkdwnテキストのコンテキストブロックを解析する", () => {
    const block: ContextBlock = {
      type: "context",
      elements: [{ type: "mrkdwn", text: "*更新者:* Alice" }],
    };
    expect(parseContextBlock(block)).toBe("_**更新者:** Alice_");
  });
});

describe("parseDividerBlock", () => {
  it("区切り線ブロックを水平線に変換する", () => {
    const block: DividerBlock = {
      type: "divider",
    };
    expect(parseDividerBlock(block)).toBe("---");
  });
});

describe("parseImageBlock", () => {
  it("画像ブロックをMarkdown画像に変換する", () => {
    const block: ImageBlock = {
      type: "image",
      alt_text: "サンプル画像",
      image_url: "https://example.com/image.png",
    } as ImageBlock;
    expect(parseImageBlock(block)).toBe(
      "![サンプル画像](https://example.com/image.png)",
    );
  });

  it("タイトル付き画像ブロックを変換する", () => {
    const block: ImageBlock = {
      type: "image",
      alt_text: "サンプル画像",
      title: {
        type: "plain_text",
        text: "画像タイトル",
      },
      image_url: "https://example.com/image.png",
    } as ImageBlock;
    expect(parseImageBlock(block)).toBe(
      "**画像タイトル**\n![サンプル画像](https://example.com/image.png)",
    );
  });
});

describe("parseBlocks", () => {
  it("複数のブロックを順番に処理する", () => {
    const blocks: Block[] = [
      {
        type: "header",
        text: { type: "plain_text", text: "タイトル" },
      } as HeaderBlock,
      {
        type: "section",
        text: { type: "plain_text", text: "本文" },
      } as SectionBlock,
      {
        type: "divider",
      } as DividerBlock,
      {
        type: "context",
        elements: [{ type: "plain_text", text: "フッター" }],
      } as ContextBlock,
    ];
    expect(parseBlocks(blocks)).toBe(
      "# タイトル\n\n<section>\n本文\n</section>\n\n---\n\n_フッター_",
    );
  });

  it("未知のブロックタイプを適切に処理する", () => {
    const blocks: Block[] = [
      {
        type: "section",
        text: { type: "plain_text", text: "既知のブロック" },
      } as SectionBlock,
      {
        type: "unknown_block_type",
        text: "未知のブロック",
      } as unknown as Block,
    ];
    expect(parseBlocks(blocks)).toBe("<section>\n既知のブロック\n</section>");
  });
});
