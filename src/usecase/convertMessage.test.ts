import { describe, expect, it } from "vitest";
import type { SlackMessage } from "../libs/types";
import {
  convertMessage,
  convertMessageWithValidation,
  convertMultipleMessages,
} from "./convertMessage";

describe("convertMessage", () => {
  it("基本的なテキストメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello *world*!",
      user: "U123456",
      ts: "1704980400",
    };
    const result = convertMessage(message);
    expect(result).toMatchSnapshot();
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
      ],
    };
    const result = convertMessage(message);
    expect(result).toMatchSnapshot();
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
    expect(result).toMatchSnapshot();
  });

  it("filesを含むメッセージを変換", () => {
    const message: SlackMessage = {
      type: "message",
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
    expect(result).toMatchSnapshot();
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
    expect(result).toMatchSnapshot();
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
        },
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
    expect(result).toMatchSnapshot();
  });

  it("コンテンツがない場合のエラーハンドリング", () => {
    const message: SlackMessage = {
      type: "message",
      ts: "1704980400",
    };
    const result = convertMessage(message);
    expect(result).toMatchSnapshot();
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
    expect(results).toMatchSnapshot();
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
    expect(results).toMatchSnapshot();
  });

  it("空の配列を処理", () => {
    const results = convertMultipleMessages([]);
    expect(results).toMatchSnapshot();
  });
});

describe("convertMessage with userMapping", () => {
  it("ユーザーマッピングありでメンションを置き換え", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello <@U123456> and <@U789012>!",
      user: "U111111",
      ts: "1704980400",
    };
    const userMapping = {
      U123456: "田中太郎",
      U789012: "山田花子",
    };
    const result = convertMessage(message, userMapping);
    expect(result).toMatchSnapshot();
  });

  it("ユーザーマッピングなしでデフォルト処理", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello <@U123456>!",
      user: "U111111",
      ts: "1704980400",
    };
    const result = convertMessage(message);
    expect(result).toMatchSnapshot();
  });

  it("部分的なユーザーマッピング", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello <@U123456> and <@U999999>!",
      user: "U111111",
      ts: "1704980400",
    };
    const userMapping = {
      U123456: "田中太郎",
    };
    const result = convertMessage(message, userMapping);
    expect(result).toMatchSnapshot();
  });

  it("空のユーザーマッピング", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Hello <@U123456>!",
      user: "U111111",
      ts: "1704980400",
    };
    const result = convertMessage(message, {});
    expect(result).toMatchSnapshot();
  });

  it("rich_text_section内のuser要素でユーザーマッピング", () => {
    const message: SlackMessage = {
      type: "message",
      user: "U111111",
      ts: "1704980400",
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                { type: "text", text: "Meeting with " },
                { type: "user", user_id: "U123456" },
                { type: "text", text: " and " },
                { type: "user", user_id: "U999999" },
                { type: "text", text: " scheduled." },
              ],
            },
          ],
        },
      ],
    };
    const userMapping = {
      U123456: "田中太郎",
    };
    const result = convertMessage(message, userMapping);
    expect(result).toMatchSnapshot();
  });

  it("メッセージauthorでユーザーマッピング", () => {
    const message: SlackMessage = {
      type: "message",
      text: "This is a test message",
      user: "U123456",
      ts: "1704980400",
    };
    const userMapping = {
      U123456: "田中太郎",
    };
    const result = convertMessage(message, userMapping);
    expect(result).toMatchSnapshot();
  });

  it("編集情報でユーザーマッピング", () => {
    const message: SlackMessage = {
      type: "message",
      text: "Edited message",
      user: "U111111",
      ts: "1704980400",
    };
    const userMapping = {
      U111111: "山田花子",
      U123456: "田中太郎",
    };
    const result = convertMessage(message, userMapping);
    expect(result).toMatchSnapshot();
  });

  it("rich_text_section内のuser要素でマッピングなし", () => {
    const message: SlackMessage = {
      type: "message",
      user: "U111111",
      ts: "1704980400",
      blocks: [
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                { type: "text", text: "Hello " },
                { type: "user", user_id: "U123456" },
                { type: "text", text: "!" },
              ],
            },
          ],
        },
      ],
    };
    const result = convertMessage(message);
    expect(result).toMatchSnapshot();
  });
});

describe("convertMessageWithValidation", () => {
  it("有効なSlackMessageオブジェクトを処理", () => {
    const message = {
      type: "message",
      text: "Hello *world*!",
      user: "U123456",
      ts: "1704980400",
    };
    const result = convertMessageWithValidation(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("Hello **world**!");
    }
  });

  it("無効なオブジェクトでバリデーションエラー", () => {
    const invalidMessage = {
      type: "message",
      ts: 12345, // 文字列でなく数値
    };
    const result = convertMessageWithValidation(invalidMessage);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_JSON");
      expect(result.error.message).toBe("メッセージの形式が正しくありません");
    }
  });

  it("nullでバリデーションエラー", () => {
    const result = convertMessageWithValidation(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_JSON");
    }
  });

  it("undefinedでバリデーションエラー", () => {
    const result = convertMessageWithValidation(undefined);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_JSON");
    }
  });

  it("文字列でバリデーションエラー", () => {
    const result = convertMessageWithValidation("invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_JSON");
    }
  });

  it("配列型のreactionsを正しく処理", () => {
    const message = {
      type: "message",
      text: "Hello!",
      user: "U123456",
      ts: "1704980400",
      reactions: [
        {
          name: "smile",
          users: ["U234567"],
          count: 1,
        },
      ],
    };
    const result = convertMessageWithValidation(message);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.markdown).toContain("smile");
    }
  });
});
