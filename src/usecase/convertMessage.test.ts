import { describe, expect, it } from "vitest";
import type { SlackMessage } from "../libs/types";
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
    expect(result).toMatchSnapshot();
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
