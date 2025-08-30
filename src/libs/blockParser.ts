import type {
  ActionsBlock,
  Block,
  ContextBlock,
  DividerBlock,
  HeaderBlock,
  ImageBlock,
  InputBlock,
  RichTextBlock,
  RichTextElement,
  RichTextList,
  RichTextPreformatted,
  RichTextQuote,
  RichTextSection,
  SectionBlock,
} from "@slack/types";
import {
  formatEmoji,
  formatLink,
  formatMrkdwn,
  formatPlainText,
} from "./textFormatter";
import {
  isActionsBlock,
  isContextBlock,
  isDividerBlock,
  isHeaderBlock,
  isImageBlock,
  isInputBlock,
  isMrkdwnElement,
  isPlainTextElement,
  isRichTextBlock,
  isRichTextList,
  isRichTextPreformatted,
  isRichTextQuote,
  isRichTextSection,
  isSectionBlock,
} from "./types";

export function parseBlocks(blocks: Block[]): string {
  const parsedBlocks = blocks
    .map((block) => {
      if (isRichTextBlock(block)) {
        return parseRichTextBlock(block);
      }
      if (isSectionBlock(block)) {
        return parseSectionBlock(block);
      }
      if (isHeaderBlock(block)) {
        return parseHeaderBlock(block);
      }
      if (isContextBlock(block)) {
        return parseContextBlock(block);
      }
      if (isDividerBlock(block)) {
        return parseDividerBlock(block);
      }
      if (isImageBlock(block)) {
        return parseImageBlock(block);
      }
      if (isActionsBlock(block)) {
        return parseActionsBlock(block);
      }
      if (isInputBlock(block)) {
        return parseInputBlock(block);
      }
      // 未知のブロックタイプは無視
      return "";
    })
    .filter((text) => text.length > 0);

  return parsedBlocks.join("\n\n");
}

export function parseRichTextBlock(block: RichTextBlock): string {
  const elements = block.elements || [];
  const parsedElements = elements.map((element) => {
    if (isRichTextSection(element)) {
      return parseRichTextSection(element);
    }
    if (isRichTextList(element)) {
      return parseRichTextList(element);
    }
    if (isRichTextQuote(element)) {
      return parseRichTextQuote(element);
    }
    if (isRichTextPreformatted(element)) {
      return parseRichTextPreformatted(element);
    }
    return "";
  });

  return parsedElements.join("\n");
}

function parseRichTextSection(section: RichTextSection): string {
  const elements = section.elements || [];
  return elements.map((element) => parseRichTextElement(element)).join("");
}

function parseRichTextElement(element: RichTextElement): string {
  switch (element.type) {
    case "text": {
      let text = element.text || "";
      // スタイルを適用
      if ("style" in element && element.style) {
        if (element.style.bold) {
          text = `**${text}**`;
        }
        if (element.style.italic) {
          text = `*${text}*`;
        }
        if (element.style.strike) {
          text = `~~${text}~~`;
        }
        if (element.style.code) {
          text = `\`${text}\``;
        }
      }
      return text;
    }
    case "link":
      return formatLink(element.url || "", element.text);
    case "user":
      return `@${element.user_id}`;
    case "channel":
      return `#${element.channel_id}`;
    case "emoji":
      return formatEmoji(`:${element.name}:`);
    case "broadcast":
      return `@${element.range}`;
    case "color":
      return element.value || "";
    case "date":
      return new Date((element.timestamp || 0) * 1000).toLocaleString();
    case "team":
      return `@${element.team_id}`;
    case "usergroup":
      return `@${element.usergroup_id}`;
    default:
      return "";
  }
}

function parseRichTextList(list: RichTextList): string {
  const elements = list.elements || [];
  const indent = "  ".repeat(list.indent || 0);
  const isOrdered = list.style === "ordered";

  return elements
    .map((element, index) => {
      const content = parseRichTextSection(element as RichTextSection);
      const prefix = isOrdered ? `${index + 1}.` : "-";
      return `${indent}${prefix} ${content}`;
    })
    .join("\n");
}

function parseRichTextQuote(quote: RichTextQuote): string {
  const elements = quote.elements || [];
  const content = elements
    .map((element) => parseRichTextElement(element))
    .join("");
  return `> ${content}`;
}

function parseRichTextPreformatted(preformatted: RichTextPreformatted): string {
  const elements = preformatted.elements || [];
  const content = elements
    .map((element) => parseRichTextElement(element))
    .join("");
  return `\`\`\`\n${content}\n\`\`\``;
}

export function parseSectionBlock(block: SectionBlock): string {
  const parts: string[] = [];

  // テキストの処理
  if (block.text) {
    if (isPlainTextElement(block.text)) {
      parts.push(formatPlainText(block.text.text || ""));
    } else if (isMrkdwnElement(block.text)) {
      parts.push(formatMrkdwn(block.text.text || ""));
    }
  }

  // フィールドの処理
  if (block.fields && block.fields.length > 0) {
    const fieldPairs: string[] = [];
    for (let i = 0; i < block.fields.length; i += 2) {
      const field1 = block.fields[i];
      const field2 = block.fields[i + 1];
      if (field1 && field2) {
        const text1 = isPlainTextElement(field1)
          ? formatPlainText(field1.text || "")
          : formatMrkdwn(field1.text || "");
        const text2 = isPlainTextElement(field2)
          ? formatPlainText(field2.text || "")
          : formatMrkdwn(field2.text || "");
        fieldPairs.push(`${text1} | ${text2}`);
      } else if (field1) {
        const text1 = isPlainTextElement(field1)
          ? formatPlainText(field1.text || "")
          : formatMrkdwn(field1.text || "");
        fieldPairs.push(text1);
      }
    }
    if (fieldPairs.length > 0) {
      parts.push(fieldPairs.join("\n"));
    }
  }

  return parts.join("\n\n");
}

export function parseHeaderBlock(block: HeaderBlock): string {
  const text = block.text?.text || "";
  return `# ${text}`;
}

export function parseContextBlock(block: ContextBlock): string {
  const elements = block.elements || [];
  const texts = elements
    .map((element) => {
      if ("type" in element && element.type === "plain_text") {
        return formatPlainText(element.text || "");
      }
      if ("type" in element && element.type === "mrkdwn") {
        return formatMrkdwn(element.text || "");
      }
      // 画像要素は無視（または必要に応じて処理）
      return "";
    })
    .filter((text) => text.length > 0);

  return texts.length > 0 ? `_${texts.join(" | ")}_` : "";
}

export function parseDividerBlock(_block: DividerBlock): string {
  return "---";
}

export function parseImageBlock(block: ImageBlock): string {
  const parts: string[] = [];

  // タイトルがある場合
  if (block.title) {
    parts.push(`**${block.title.text || ""}**`);
  }

  // 画像
  const altText = block.alt_text || "";
  // image_urlは型定義に含まれていないため、unknownにキャストしてアクセス
  const imageUrl = (block as unknown as { image_url?: string }).image_url || "";
  parts.push(`![${altText}](${imageUrl})`);

  return parts.join("\n");
}

function parseActionsBlock(block: ActionsBlock): string {
  // アクションブロックは通常インタラクティブな要素なので、
  // Markdownでは表現が難しい。要素の説明のみ表示
  const elements = block.elements || [];
  const descriptions = elements
    .map((element) => {
      switch (element.type) {
        case "button":
          return `[${element.text?.text || "Button"}]`;
        case "static_select":
        case "external_select":
        case "users_select":
        case "conversations_select":
        case "channels_select":
          return `[${element.placeholder?.text || "Select"}]`;
        case "overflow":
          return "[Menu]";
        case "datepicker":
          return "[Date Picker]";
        case "timepicker":
          return "[Time Picker]";
        case "checkboxes":
          return "[Checkboxes]";
        case "radio_buttons":
          return "[Radio Buttons]";
        default:
          return "";
      }
    })
    .filter((desc) => desc.length > 0);

  return descriptions.length > 0 ? descriptions.join(" ") : "";
}

function parseInputBlock(block: InputBlock): string {
  const label = block.label?.text || "";
  const hint = block.hint?.text || "";
  const optional = block.optional ? " (optional)" : "";

  let inputType = "";
  switch (block.element?.type) {
    case "plain_text_input":
      inputType = "[Text Input]";
      break;
    case "static_select":
    case "external_select":
    case "users_select":
    case "conversations_select":
    case "channels_select":
      inputType = "[Select]";
      break;
    case "multi_static_select":
    case "multi_external_select":
    case "multi_users_select":
    case "multi_conversations_select":
    case "multi_channels_select":
      inputType = "[Multi Select]";
      break;
    case "datepicker":
      inputType = "[Date Picker]";
      break;
    case "timepicker":
      inputType = "[Time Picker]";
      break;
    case "checkboxes":
      inputType = "[Checkboxes]";
      break;
    case "radio_buttons":
      inputType = "[Radio Buttons]";
      break;
    default:
      inputType = "[Input]";
  }

  const parts = [`**${label}${optional}**`, inputType];
  if (hint) {
    parts.push(`_${hint}_`);
  }

  return parts.join("\n");
}
