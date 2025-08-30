import { formatEmoji } from "./textFormatter";
import type { EditedInfo, Reaction, SlackMessage } from "./types";

export function formatUserHeader(user?: string, timestamp?: string): string {
  const parts: string[] = [];

  if (user) {
    parts.push(`**@${user}**`);
  }

  if (timestamp) {
    const timeStr = formatTimestamp(timestamp);
    if (timeStr) {
      parts.push(timeStr);
    }
  }

  return parts.join(" - ");
}

export function formatTimestamp(ts?: string): string {
  if (!ts || ts === "") {
    return "";
  }

  // 小数点がある場合は整数部分のみを使用
  const timestamp = Number.parseFloat(ts);
  if (Number.isNaN(timestamp)) {
    return "";
  }

  const date = new Date(timestamp * 1000);
  return date.toISOString().replace("T", " ").substring(0, 19);
}

export function formatReactions(reactions?: Reaction[]): string {
  if (!reactions || reactions.length === 0) {
    return "";
  }

  const reactionTexts = reactions
    .filter((reaction) => reaction.count > 0)
    .map((reaction) => {
      const users = reaction.users?.join(" ") || "";
      return `<reaction count="${reaction.count}" users="${users}">${reaction.name}</reaction>`;
    });

  return reactionTexts.join("\n");
}

export function formatThreadInfo(message: SlackMessage): string {
  // スレッドの返信メッセージの場合
  if (message.thread_ts && message.thread_ts !== message.ts) {
    return "↳ **Reply to thread**";
  }

  // スレッドのルートメッセージの場合
  if (message.reply_count && message.reply_count > 0) {
    const replyCount = message.reply_count;
    const userCount = message.reply_users_count || 0;
    const replyWord = replyCount === 1 ? "reply" : "replies";
    const userWord = userCount === 1 ? "user" : "users";
    return `💬 **Thread** (${replyCount} ${replyWord}, ${userCount} ${userWord})`;
  }

  return "";
}

export function formatEditedInfo(edited?: EditedInfo): string {
  if (!edited) {
    return "";
  }

  const parts: string[] = ["edited"];

  if (edited.user) {
    parts.push(`by @${edited.user}`);
  }

  if (edited.ts) {
    const timeStr = formatTimestamp(edited.ts);
    if (timeStr) {
      parts.push(`at ${timeStr}`);
    }
  }

  return `*(${parts.join(" ")})*`;
}
