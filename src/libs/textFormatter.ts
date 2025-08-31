const EMOJI_MAP: Record<string, string> = {
  ":smile:": "😄",
  ":smiley:": "😃",
  ":grin:": "😁",
  ":laughing:": "😆",
  ":satisfied:": "😆",
  ":sweat_smile:": "😅",
  ":joy:": "😂",
  ":heart:": "❤️",
  ":heart_eyes:": "😍",
  ":thumbsup:": "👍",
  ":+1:": "👍",
  ":thumbsdown:": "👎",
  ":-1:": "👎",
  ":clap:": "👏",
  ":pray:": "🙏",
  ":raised_hands:": "🙌",
  ":muscle:": "💪",
  ":metal:": "🤘",
  ":ok_hand:": "👌",
  ":point_up:": "☝️",
  ":point_down:": "👇",
  ":point_left:": "👈",
  ":point_right:": "👉",
  ":wave:": "👋",
  ":eyes:": "👀",
  ":tongue:": "👅",
  ":ear:": "👂",
  ":nose:": "👃",
  ":fire:": "🔥",
  ":star:": "⭐",
  ":sparkles:": "✨",
  ":100:": "💯",
  ":heavy_check_mark:": "✔️",
  ":white_check_mark:": "✅",
  ":x:": "❌",
  ":warning:": "⚠️",
  ":no_entry:": "⛔",
  ":tada:": "🎉",
  ":confetti_ball:": "🎊",
  ":gift:": "🎁",
  ":rocket:": "🚀",
  ":airplane:": "✈️",
  ":hourglass:": "⌛",
  ":watch:": "⌚",
  ":alarm_clock:": "⏰",
  ":hourglass_flowing_sand:": "⏳",
  ":bulb:": "💡",
  ":flashlight:": "🔦",
  ":book:": "📖",
  ":books:": "📚",
  ":memo:": "📝",
  ":pencil2:": "✏️",
  ":mag:": "🔍",
  ":mag_right:": "🔎",
  ":lock:": "🔒",
  ":unlock:": "🔓",
  ":key:": "🔑",
  ":email:": "✉️",
  ":phone:": "☎️",
  ":computer:": "💻",
  ":desktop_computer:": "🖥️",
  ":keyboard:": "⌨️",
  ":house:": "🏠",
  ":office:": "🏢",
  ":hospital:": "🏥",
  ":bank:": "🏦",
  ":atm:": "🏧",
  ":hotel:": "🏨",
  ":school:": "🏫",
  ":convenience_store:": "🏪",
  ":sun:": "☀️",
  ":cloud:": "☁️",
  ":partly_sunny:": "⛅",
  ":rain_cloud:": "🌧️",
  ":snowflake:": "❄️",
  ":zap:": "⚡",
  ":umbrella:": "☂️",
  ":coffee:": "☕",
  ":tea:": "🍵",
  ":beer:": "🍺",
  ":wine_glass:": "🍷",
  ":cocktail:": "🍸",
  ":pizza:": "🍕",
  ":hamburger:": "🍔",
  ":fries:": "🍟",
  ":ramen:": "🍜",
  ":sushi:": "🍣",
  ":bento:": "🍱",
  ":apple:": "🍎",
  ":green_apple:": "🍏",
  ":banana:": "🍌",
  ":watermelon:": "🍉",
  ":strawberry:": "🍓",
  ":cherry_blossom:": "🌸",
  ":rose:": "🌹",
  ":sunflower:": "🌻",
  ":leaves:": "🍃",
  ":seedling:": "🌱",
  ":tree:": "🌳",
  ":cat:": "🐱",
  ":dog:": "🐶",
  ":mouse:": "🐭",
  ":hamster:": "🐹",
  ":rabbit:": "🐰",
  ":bear:": "🐻",
  ":panda_face:": "🐼",
  ":koala:": "🐨",
  ":tiger:": "🐯",
  ":lion:": "🦁",
  ":cow:": "🐮",
  ":pig:": "🐷",
  ":frog:": "🐸",
  ":octopus:": "🐙",
  ":monkey_face:": "🐵",
  ":see_no_evil:": "🙈",
  ":hear_no_evil:": "🙉",
  ":speak_no_evil:": "🙊",
};

export function formatMrkdwn(text: string): string {
  let result = text;

  // コードブロックを一時的に保護（```の直後・直前に改行がない場合は追加）
  const codeBlocks: string[] = [];
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const index = codeBlocks.length;
    // ```の直後と直前に改行を確保
    let processedBlock = match;
    if (
      processedBlock.startsWith("```") &&
      processedBlock.length > 3 &&
      processedBlock.charAt(3) !== "\n"
    ) {
      processedBlock = `\`\`\`\n${processedBlock.slice(3)}`;
    }
    if (
      processedBlock.endsWith("```") &&
      processedBlock.length > 3 &&
      processedBlock.charAt(processedBlock.length - 4) !== "\n"
    ) {
      processedBlock = `${processedBlock.slice(0, -3)}\n\`\`\``;
    }
    codeBlocks.push(processedBlock);
    return `\x00CODE_BLOCK_${index}\x00`;
  });

  // インラインコードを一時的に保護
  const inlineCodes: string[] = [];
  result = result.replace(/`[^`]+`/g, (match) => {
    const index = inlineCodes.length;
    inlineCodes.push(match);
    return `\x00INLINE_CODE_${index}\x00`;
  });

  // チャンネルメンション (<#C123456|channel-name> -> #channel-name)
  result = result.replace(/<#([^|>]+)\|([^>]+)>/g, "#$2");

  // チャンネルメンション (<#C123456> -> #C123456)
  result = result.replace(/<#([^|>]+)>/g, "#$1");

  // ユーザーメンション (<@U123456> -> @U123456)
  result = result.replace(/<@([^|>]+)>/g, "@$1");

  // リンク (<url|label> -> [label](url))
  result = result.replace(/<([^|>]+)\|([^>]+)>/g, "[$2]($1)");

  // ラベルなしリンク (<url> -> url)
  result = result.replace(/<([^|>]+)>/g, "$1");

  // 太字 (*text* -> **text**)
  // プレースホルダーを避けて処理
  result = result.replace(/\*([^*]+)\*/g, (match, p1) => {
    if (p1.includes("\x00")) return match;
    return `**${p1}**`;
  });

  // 斜体 (_text_ -> *text*)
  result = result.replace(/_([^_]+)_/g, (match, p1) => {
    if (p1.includes("\x00")) return match;
    return `*${p1}*`;
  });

  // 取り消し線 (~text~ -> ~~text~~)
  result = result.replace(/~([^~]+)~/g, "~~$1~~");

  // インラインコードを復元
  inlineCodes.forEach((code, i) => {
    const placeholder = new RegExp(`\\x00INLINE[_*]CODE[_*]${i}\\x00`, "g");
    result = result.replace(placeholder, code);
  });

  // コードブロックを復元（前後に空行を追加）
  codeBlocks.forEach((block, i) => {
    const placeholder = `\\x00CODE[_*]BLOCK[_*]${i}\\x00`;
    const regex = new RegExp(placeholder, "g");

    result = result.replace(regex, (_match) => {
      // コードブロックの前後に改行を追加
      return `\n\n${block}\n\n`;
    });
  });

  // 文頭・文末の余分な改行を整理
  result = result.replace(/^\n+/, "").replace(/\n+$/, "");

  // 連続する改行を最大2つまでに制限（空行は1つまで）
  result = result.replace(/\n{4,}/g, "\n\n\n").replace(/\n{3}/g, "\n\n");

  return result;
}

export function formatPlainText(text: string): string {
  return text;
}

export function formatUserMention(userId: string, userName?: string): string {
  if (userName && userName.length > 0) {
    return `@${userName}`;
  }
  return `@${userId}`;
}

export function formatChannelMention(
  channelId: string,
  channelName?: string,
): string {
  if (channelName && channelName.length > 0) {
    return `#${channelName}`;
  }
  return `#${channelId}`;
}

export function formatLink(url: string, label?: string): string {
  if (label && label.length > 0) {
    return `[${label}](${url})`;
  }
  return url;
}

export function formatEmoji(emojiName: string): string {
  return EMOJI_MAP[emojiName] || emojiName;
}

export function escapeMarkdown(text: string): string {
  // Markdownの特殊文字をエスケープ
  return text.replace(/([*_[\]`#~>!+\-=|{}()\\])/g, "\\$1");
}
