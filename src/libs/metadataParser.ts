import type { Reaction, UserMapping } from "./types";

export function formatUserHeader(
  user?: string,
  timestamp?: string,
  userMapping?: UserMapping,
): string {
  const parts: string[] = [];

  if (user) {
    const displayName = userMapping?.[user] || user;
    parts.push(`**@${displayName}**`);
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
