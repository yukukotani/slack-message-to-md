import type { MessageAttachment } from "@slack/types";
import { parseBlocks } from "./blockParser";
import { formatMrkdwn } from "./textFormatter";
import { hasBlocks } from "./types";

export function parseAttachments(attachments: MessageAttachment[]): string {
  if (!attachments || attachments.length === 0) {
    return "";
  }

  const parsedAttachments = attachments.map((attachment) =>
    parseAttachment(attachment),
  );
  return parsedAttachments.join("\n\n---\n\n");
}

function parseAttachment(attachment: MessageAttachment): string {
  const parts: string[] = [];

  // pretext
  if (attachment.pretext) {
    parts.push(formatMrkdwn(attachment.pretext));
  }

  // 作成者情報
  const authorText = formatAttachmentAuthor(
    attachment.author_name,
    attachment.author_link,
    attachment.author_icon,
  );
  if (authorText) {
    parts.push(authorText);
  }

  // タイトル
  if (attachment.title) {
    if (attachment.title_link) {
      parts.push(`**[${attachment.title}](${attachment.title_link})**`);
    } else {
      parts.push(`**${attachment.title}**`);
    }
  }

  // blocksがある場合は優先的に処理
  if (hasBlocks(attachment)) {
    parts.push(parseBlocks(attachment.blocks));
  } else if (attachment.text) {
    // テキスト本文
    parts.push(formatMrkdwn(attachment.text));
  }

  // フィールド
  if (attachment.fields && attachment.fields.length > 0) {
    const fieldsText = parseAttachmentFields(attachment.fields);
    if (fieldsText) {
      parts.push(fieldsText);
    }
  }

  // 画像
  if (attachment.image_url) {
    parts.push(`![Image](${attachment.image_url})`);
  }

  // サムネイル
  if (attachment.thumb_url) {
    parts.push(`![Thumbnail](${attachment.thumb_url})`);
  }

  // フッター
  const footerText = formatAttachmentFooter(
    attachment.footer,
    attachment.footer_icon,
    attachment.ts ? Number(attachment.ts) : undefined,
  );
  if (footerText) {
    parts.push(footerText);
  }

  const content = parts.filter((part) => part.length > 0).join("\n\n");
  return `<attachment>\n${content}\n</attachment>`;
}

export function parseAttachmentFields(
  fields: NonNullable<MessageAttachment["fields"]>,
): string {
  if (!fields || fields.length === 0) {
    return "";
  }

  const fieldTexts = fields.map((field) => {
    return `###${field.title}\n\n${field.value}`;
  });

  return fieldTexts.join("\n\n");
}

export function formatAttachmentColor(color?: string): string {
  if (!color) {
    return "";
  }

  switch (color.toLowerCase()) {
    case "good":
      return "🟢";
    case "warning":
      return "🟡";
    case "danger":
      return "🔴";
    default:
      // 16進数カラーコードの場合
      if (color.startsWith("#")) {
        return "🟩";
      }
      return "";
  }
}

export function formatAttachmentAuthor(
  author_name?: string,
  author_link?: string,
  _author_icon?: string,
): string {
  if (!author_name) {
    return "";
  }

  if (author_link) {
    return `[${author_name}](${author_link})`;
  }

  return author_name;
}

export function formatAttachmentFooter(
  footer?: string,
  _footer_icon?: string,
  ts?: number,
): string {
  const parts: string[] = [];

  if (footer) {
    parts.push(footer);
  }

  if (ts) {
    const date = new Date(ts * 1000);
    // UTCでの日時文字列を生成
    const dateStr = date.toISOString().replace("T", " ").substring(0, 19);
    parts.push(dateStr);
  }

  if (parts.length === 0) {
    return "";
  }

  return `_${parts.join(" • ")}_`;
}
