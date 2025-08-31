import type {
  ActionsBlock,
  AnyBlock,
  Block,
  ContextBlock,
  DividerBlock,
  HeaderBlock,
  ImageBlock,
  InputBlock,
  MessageAttachment,
  MrkdwnElement,
  PlainTextElement,
  RichTextBlock,
  RichTextElement,
  RichTextList,
  RichTextPreformatted,
  RichTextQuote,
  RichTextSection,
  SectionBlock,
} from "@slack/types";

export type FileElement = {
  id?: string;
  created?: number;
  timestamp?: number;
  name?: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  pretty_type?: string;
  user?: string;
  size?: number;
  mode?: string;
  is_external?: boolean;
  external_type?: string;
  is_public?: boolean;
  public_url_shared?: boolean;
  display_as_bot?: boolean;
  username?: string;
  url_private?: string;
  url_private_download?: string;
  thumb_64?: string;
  thumb_80?: string;
  thumb_360?: string;
  thumb_360_w?: number;
  thumb_360_h?: number;
  thumb_480?: string;
  thumb_480_w?: number;
  thumb_480_h?: number;
  thumb_160?: string;
  thumb_360_gif?: string;
  thumb_480_gif?: string;
  thumb_720?: string;
  thumb_720_w?: number;
  thumb_720_h?: number;
  thumb_800?: string;
  thumb_800_w?: number;
  thumb_800_h?: number;
  thumb_960?: string;
  thumb_960_w?: number;
  thumb_960_h?: number;
  thumb_1024?: string;
  thumb_1024_w?: number;
  thumb_1024_h?: number;
  image_exif_rotation?: number;
  original_w?: number;
  original_h?: number;
  permalink?: string;
  permalink_public?: string;
};

export type SlackMessage = {
  type?: string;
  subtype?: string;
  text?: string;
  ts?: string;
  user?: string;
  team?: string;
  blocks?: AnyBlock[];
  attachments?: MessageAttachment[];
  files?: FileElement[];
  reactions?: Reaction[];
  reply_count?: number;
  reply_users?: string[];
  reply_users_count?: number;
  latest_reply?: string;
  edited?: EditedInfo;
  thread_ts?: string;
  parent_user_id?: string;
};

export type ConversionResult =
  | { success: true; markdown: string }
  | { success: false; error: ConversionError; partialMarkdown?: string };

type ConversionError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

type ErrorCode =
  | "INVALID_JSON"
  | "MISSING_CONTENT"
  | "PARTIAL_CONVERSION"
  | "UNKNOWN_ERROR";

export type Reaction = {
  name: string;
  users: string[];
  count: number;
};

export type EditedInfo = {
  user: string;
  ts: string;
};

export function hasBlocks(
  message: SlackMessage,
): message is SlackMessage & { blocks: Block[] } {
  return Array.isArray(message.blocks) && message.blocks.length > 0;
}

export function hasAttachments(
  message: SlackMessage,
): message is SlackMessage & { attachments: MessageAttachment[] } {
  return Array.isArray(message.attachments) && message.attachments.length > 0;
}

export function hasFiles(
  message: SlackMessage,
): message is SlackMessage & { files: FileElement[] } {
  return Array.isArray(message.files) && message.files.length > 0;
}

export function isRichTextBlock(block: Block): block is RichTextBlock {
  return block.type === "rich_text";
}

export function isSectionBlock(block: Block): block is SectionBlock {
  return block.type === "section";
}

export function isHeaderBlock(block: Block): block is HeaderBlock {
  return block.type === "header";
}

export function isContextBlock(block: Block): block is ContextBlock {
  return block.type === "context";
}

export function isDividerBlock(block: Block): block is DividerBlock {
  return block.type === "divider";
}

export function isImageBlock(block: Block): block is ImageBlock {
  return block.type === "image";
}

export function isActionsBlock(block: Block): block is ActionsBlock {
  return block.type === "actions";
}

export function isInputBlock(block: Block): block is InputBlock {
  return block.type === "input";
}

export function isPlainTextElement(
  element: PlainTextElement | MrkdwnElement,
): element is PlainTextElement {
  return element.type === "plain_text";
}

export function isMrkdwnElement(
  element: PlainTextElement | MrkdwnElement,
): element is MrkdwnElement {
  return element.type === "mrkdwn";
}

export function isRichTextSection(
  element:
    | RichTextElement
    | RichTextSection
    | RichTextList
    | RichTextQuote
    | RichTextPreformatted,
): element is RichTextSection {
  return "type" in element && element.type === "rich_text_section";
}

export function isRichTextList(
  element:
    | RichTextElement
    | RichTextSection
    | RichTextList
    | RichTextQuote
    | RichTextPreformatted,
): element is RichTextList {
  return "type" in element && element.type === "rich_text_list";
}

export function isRichTextQuote(
  element:
    | RichTextElement
    | RichTextSection
    | RichTextList
    | RichTextQuote
    | RichTextPreformatted,
): element is RichTextQuote {
  return "type" in element && element.type === "rich_text_quote";
}

export function isRichTextPreformatted(
  element:
    | RichTextElement
    | RichTextSection
    | RichTextList
    | RichTextQuote
    | RichTextPreformatted,
): element is RichTextPreformatted {
  return "type" in element && element.type === "rich_text_preformatted";
}
