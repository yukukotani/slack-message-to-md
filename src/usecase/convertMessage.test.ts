import { describe, expect, it } from "vitest";
import type { SlackMessage, TestBlock } from "../libs/types";
import { convertMessage, convertMultipleMessages } from "./convertMessage";

describe("convertMessage", () => {
  it("基本的なテキストメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello *world*!",
      user: "U123456",
      ts: "1704980400",
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("**@U123456** - 2024-01-11 13:40:00");
      expect(result.markdown).toContain("Hello **world**!");
    }
  });

  it("blocksを含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      user: "U123456",
      ts: "1704980400",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "Important Notice" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "This is a *section* with formatting.",
          },
        },
      ] as TestBlock[],
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("# Important Notice");
      expect(result.markdown).toContain(
        "This is a **section** with formatting.",
      );
    }
  });

  it("attachmentsを含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Check this out:",
      user: "U123456",
      ts: "1704980400",
      attachments: [
        {
          title: "Sample Attachment",
          text: "Attachment content",
          color: "good",
        },
      ],
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("Check this out:");
      expect(result.markdown).toContain("📎 **Attachment**");
      expect(result.markdown).toContain("**Sample Attachment**");
      expect(result.markdown).toContain("🟢");
    }
  });

  it("filesを含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Uploaded a file:",
      user: "U123456",
      ts: "1704980400",
      files: [
        {
          id: "F123456",
          name: "document.pdf",
          mimetype: "application/pdf",
          url_private:
            "https://files.slack.com/files-pri/T123456-F123456/document.pdf",
          size: 1048576,
        },
      ],
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("Uploaded a file:");
      expect(result.markdown).toContain("📄 **[document.pdf]");
      expect(result.markdown).toContain("(PDF, 1 MB)");
    }
  });

  it("reactionsを含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Great job!",
      user: "U123456",
      ts: "1704980400",
      reactions: [
        {
          name: "thumbsup",
          users: ["U234567", "U345678"],
          count: 2,
        },
        {
          name: "heart",
          users: ["U456789"],
          count: 1,
        },
      ],
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("Great job!");
      expect(result.markdown).toContain("👍 2 | ❤️ 1");
    }
  });

  it("スレッド情報を含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Original message",
      user: "U123456",
      ts: "1704980400",
      reply_count: 3,
      reply_users: ["U234567", "U345678"],
      reply_users_count: 2,
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("💬 **Thread** (3 replies, 2 users)");
    }
  });

  it("編集済みメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Edited message",
      user: "U123456",
      ts: "1704980400",
      edited: {
        user: "U123456",
        ts: "1704984000",
      },
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain(
        "*(edited by @U123456 at 2024-01-11 14:40:00)*",
      );
    }
  });

  it("複数要素を含む複雑なメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Main message text",
      user: "U123456",
      ts: "1704980400",
      blocks: [
        {
          type: "section",
          text: { type: "plain_text", text: "Block content" },
        } as TestBlock,
      ],
      attachments: [
        {
          title: "Attachment",
          text: "Attachment text",
        },
      ],
      files: [
        {
          id: "F123456",
          name: "image.png",
          mimetype: "image/png",
          url_private:
            "https://files.slack.com/files-pri/T123456-F123456/image.png",
          size: 2048,
        },
      ],
      reactions: [
        {
          name: "thumbsup",
          users: ["U234567"],
          count: 1,
        },
      ],
    };
    const result = convertMessage(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("**@U123456**");
      // blocksがある場合、textは表示されない（Slack仕様に準拠）
      expect(result.markdown).toContain("Block content");
      expect(result.markdown).toContain("📎 **Attachment**");
      expect(result.markdown).toContain("**image.png**");
      expect(result.markdown).toContain("👍 1");
    }
  });

  it("コンテンツがない場合のエラーハンドリング", () => {
    const message: SlackMessage = {
      type: "message",
      ts: "1704980400",
    };
    const result = convertMessage(message);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("MISSING_CONTENT");
    }
  });
});

describe("convertMultipleMessages", () => {
  it("複数メッセージを順番に変換", () => {
    const messages: SlackMessage[] = [
      {
        type: "message",
        text: "First message",
        user: "U123456",
        ts: "1704980400",
      },
      {
        type: "message",
        text: "Second message",
        user: "U234567",
        ts: "1704984000",
      },
    ];
    const results = convertMultipleMessages(messages);
    expect(results).toHaveLength(2);
    expect(results[0]?.success).toBe(true);
    expect(results[1]?.success).toBe(true);
    if (results[0]?.success && results[1]?.success) {
      expect(results[0].markdown).toContain("First message");
      expect(results[1].markdown).toContain("Second message");
    }
  });

  it("エラーメッセージも含めて処理", () => {
    const messages: SlackMessage[] = [
      {
        type: "message",
        text: "Valid message",
        user: "U123456",
        ts: "1704980400",
      },
      {
        type: "message",
        ts: "1704984000", // テキストなし
      },
    ];
    const results = convertMultipleMessages(messages);
    expect(results).toHaveLength(2);
    expect(results[0]?.success).toBe(true);
    expect(results[1]?.success).toBe(false);
  });

  it("空の配列を処理", () => {
    const results = convertMultipleMessages([]);
    expect(results).toEqual([]);
  });
});
