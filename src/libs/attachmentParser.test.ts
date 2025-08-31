import type { MessageAttachment } from "@slack/types";
import { describe, expect, it } from "vitest";
import {
  formatAttachmentAuthor,
  formatAttachmentColor,
  formatAttachmentFooter,
  parseAttachmentFields,
  parseAttachments,
} from "./attachmentParser";

describe("formatAttachmentAuthor", () => {
  it("作成者名のみの場合", () => {
    expect(formatAttachmentAuthor("John Doe")).toBe("John Doe");
  });

  it("作成者名とリンクがある場合", () => {
    expect(formatAttachmentAuthor("John Doe", "https://example.com/john")).toBe(
      "[John Doe](https://example.com/john)",
    );
  });

  it("作成者名、リンク、アイコンがある場合", () => {
    expect(
      formatAttachmentAuthor(
        "John Doe",
        "https://example.com/john",
        "https://example.com/john.png",
      ),
    ).toBe("[John Doe](https://example.com/john)");
  });

  it("すべて未定義の場合", () => {
    expect(formatAttachmentAuthor()).toBe("");
  });
});

describe("formatAttachmentFooter", () => {
  it("フッターテキストのみの場合", () => {
    expect(formatAttachmentFooter("Slack API")).toBe("_Slack API_");
  });

  it("フッターとタイムスタンプがある場合", () => {
    expect(formatAttachmentFooter("Slack API", undefined, 1704980400)).toBe(
      "_Slack API • 2024-01-11 13:40:00_",
    );
  });

  it("フッター、アイコン、タイムスタンプがある場合", () => {
    expect(
      formatAttachmentFooter(
        "Slack API",
        "https://example.com/icon.png",
        1704980400,
      ),
    ).toBe("_Slack API • 2024-01-11 13:40:00_");
  });

  it("タイムスタンプのみの場合", () => {
    expect(formatAttachmentFooter(undefined, undefined, 1704980400)).toBe(
      "_2024-01-11 13:40:00_",
    );
  });

  it("すべて未定義の場合", () => {
    expect(formatAttachmentFooter()).toBe("");
  });
});

describe("formatAttachmentColor", () => {
  it("good（緑）の場合", () => {
    expect(formatAttachmentColor("good")).toBe("🟢");
  });

  it("warning（黄）の場合", () => {
    expect(formatAttachmentColor("warning")).toBe("🟡");
  });

  it("danger（赤）の場合", () => {
    expect(formatAttachmentColor("danger")).toBe("🔴");
  });

  it("16進数カラーコードの場合", () => {
    expect(formatAttachmentColor("#36a64f")).toBe("🟩");
  });

  it("未定義の場合", () => {
    expect(formatAttachmentColor()).toBe("");
  });
});

describe("parseAttachmentFields", () => {
  it("2つのフィールドを表示", () => {
    const fields = [
      { title: "Priority", value: "High", short: true },
      { title: "Status", value: "Open", short: true },
    ];
    expect(parseAttachmentFields(fields)).toBe(
      "###Priority\n\nHigh\n\n###Status\n\nOpen",
    );
  });

  it("長いフィールドを通常のテキストで表示", () => {
    const fields = [
      {
        title: "Description",
        value: "This is a long description",
        short: false,
      },
    ];
    expect(parseAttachmentFields(fields)).toBe(
      "###Description\n\nThis is a long description",
    );
  });

  it("混在するフィールドを適切に表示", () => {
    const fields = [
      { title: "Type", value: "Bug", short: true },
      { title: "Severity", value: "High", short: true },
      { title: "Details", value: "Long detailed text", short: false },
    ];
    expect(parseAttachmentFields(fields)).toBe(
      "###Type\n\nBug\n\n###Severity\n\nHigh\n\n###Details\n\nLong detailed text",
    );
  });

  it("空の配列の場合", () => {
    expect(parseAttachmentFields([])).toBe("");
  });
});

describe("parseAttachments", () => {
  it("基本的なアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        title: "Test Attachment",
        text: "This is attachment text",
        color: "good",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("<attachment>");
    expect(result).toContain("**Test Attachment**");
    expect(result).toContain("This is attachment text");
    expect(result).toContain("</attachment>");
  });

  it("リンク付きタイトルのアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        title: "Important Document",
        title_link: "https://example.com/doc",
        text: "Document content",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("[Important Document](https://example.com/doc)");
  });

  it("pretextとフィールド付きアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        pretext: "New issue created",
        title: "Issue #123",
        fields: [
          { title: "Type", value: "Bug", short: true },
          { title: "Priority", value: "High", short: true },
        ],
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("New issue created");
    expect(result).toContain("**Issue #123**");
    expect(result).toContain("###Type");
    expect(result).toContain("Bug");
    expect(result).toContain("###Priority");
    expect(result).toContain("High");
  });

  it("作成者情報付きアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        author_name: "Jane Smith",
        author_link: "https://example.com/jane",
        author_icon: "https://example.com/jane.png",
        text: "Author's content",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("[Jane Smith](https://example.com/jane)");
  });

  it("画像付きアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        title: "Image Attachment",
        image_url: "https://example.com/image.png",
        thumb_url: "https://example.com/thumb.png",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("![Image](https://example.com/image.png)");
    expect(result).toContain("![Thumbnail](https://example.com/thumb.png)");
  });

  it("フッター付きアタッチメントを変換", () => {
    const attachments: MessageAttachment[] = [
      {
        text: "Content",
        footer: "API Example",
        footer_icon: "https://example.com/icon.png",
        ts: "1704980400",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("_API Example • 2024-01-11 13:40:00_");
  });

  it("blocksフィールドがある場合はblockParserを使用", () => {
    const attachments: MessageAttachment[] = [
      {
        blocks: [
          {
            type: "section",
            text: { type: "plain_text", text: "Block content" },
          },
        ],
        text: "Fallback text",
      },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("Block content");
    expect(result).not.toContain("Fallback text");
  });

  it("複数のアタッチメントを順番に処理", () => {
    const attachments: MessageAttachment[] = [
      { title: "First", text: "First attachment" },
      { title: "Second", text: "Second attachment" },
    ];
    const result = parseAttachments(attachments);
    expect(result).toContain("First");
    expect(result).toContain("First attachment");
    expect(result).toContain("Second");
    expect(result).toContain("Second attachment");
  });

  it("空の配列の場合", () => {
    expect(parseAttachments([])).toBe("");
  });
});
