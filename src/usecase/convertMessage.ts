import { parseAttachments } from "../libs/attachmentParser";
import { parseBlocks } from "../libs/blockParser";
import {
  createUnknownError,
  handleMissingContent,
  wrapSafeExecution,
} from "../libs/errorHandler";
import { parseFiles } from "../libs/fileParser";
import {
  formatEditedInfo,
  formatReactions,
  formatUserHeader,
} from "../libs/metadataParser";
import { formatMrkdwn } from "../libs/textFormatter";
import type {
  ConversionResult,
  SlackMessage,
  UserMapping,
} from "../libs/types";
import { hasAttachments, hasBlocks, hasFiles } from "../libs/types";
import { SlackMessageSchema } from "../libs/validation";

export function convertMessage(
  message: SlackMessage,
  userMapping?: UserMapping,
): ConversionResult {
  try {
    // コンテンツがあるかチェック
    if (!hasContent(message)) {
      return handleMissingContent(message);
    }

    const sections: string[] = [];

    // 1. ヘッダー（ユーザー + タイムスタンプ）
    const header = wrapSafeExecution(
      () => formatUserHeader(message.user, message.ts, userMapping),
      "",
    );
    if (header) {
      sections.push(header);
    }

    // 2. メインコンテンツ（blocks が優先、なければ text）
    if (hasBlocks(message)) {
      const blocksContent = wrapSafeExecution(
        () => parseBlocks(message.blocks, userMapping),
        "",
      );
      if (blocksContent) {
        sections.push(blocksContent);
      }
    } else if (message.text) {
      const textContent = wrapSafeExecution(
        () => formatMrkdwn(message.text || "", userMapping),
        message.text || "",
      );
      if (textContent) {
        sections.push(textContent);
      }
    }

    // 3. アタッチメント
    if (hasAttachments(message)) {
      const attachmentContent = wrapSafeExecution(
        () => parseAttachments(message.attachments, userMapping),
        "",
      );
      if (attachmentContent) {
        sections.push(attachmentContent);
      }
    }

    // 4. ファイル
    if (hasFiles(message)) {
      const fileContent = wrapSafeExecution(
        () => parseFiles(message.files),
        "",
      );
      if (fileContent) {
        sections.push(fileContent);
      }
    }

    // 5. リアクション
    if (message.reactions && message.reactions.length > 0) {
      const reactionsContent = wrapSafeExecution(
        () => formatReactions(message.reactions),
        "",
      );
      if (reactionsContent) {
        sections.push(reactionsContent);
      }
    }

    // 6. 編集情報
    if (message.edited) {
      const editedInfo = wrapSafeExecution(
        () => formatEditedInfo(message.edited, userMapping),
        "",
      );
      if (editedInfo) {
        sections.push(editedInfo);
      }
    }

    // 結合
    const markdown = sections
      .filter((section) => section.length > 0)
      .join("\n\n");

    if (markdown.length === 0) {
      return handleMissingContent(message);
    }

    return {
      success: true,
      markdown,
    };
  } catch (error) {
    return createUnknownError(error);
  }
}

export function convertMultipleMessages(
  messages: SlackMessage[],
  userMapping?: UserMapping,
): ConversionResult[] {
  return messages.map((message) => convertMessage(message, userMapping));
}

export function convertMessageWithValidation(
  message: unknown,
  userMapping?: UserMapping,
): ConversionResult {
  const parseResult = SlackMessageSchema.safeParse(message);

  if (!parseResult.success) {
    return {
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "メッセージの形式が正しくありません",
        details: parseResult.error.format(),
      },
    };
  }

  return convertMessage(parseResult.data as SlackMessage, userMapping);
}

function hasContent(message: SlackMessage): boolean {
  return !!(
    message.text ||
    hasBlocks(message) ||
    hasAttachments(message) ||
    hasFiles(message) ||
    (message.reactions && message.reactions.length > 0) ||
    message.reply_count ||
    message.edited
  );
}
