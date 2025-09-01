import { describe, expect, it } from "vitest";
import {
  formatEditedInfo,
  formatReactions,
  formatTimestamp,
  formatUserHeader,
} from "./metadataParser";
import type { EditedInfo, Reaction } from "./types";

describe("formatTimestamp", () => {
  it("Unixタイムスタンプを日時文字列に変換", () => {
    expect(formatTimestamp("1704980400")).toBe("2024-01-11 13:40:00");
  });

  it("数値のタイムスタンプも処理", () => {
    expect(formatTimestamp("1577836800")).toBe("2020-01-01 00:00:00");
  });

  it("小数点付きタイムスタンプ", () => {
    expect(formatTimestamp("1704980400.123456")).toBe("2024-01-11 13:40:00");
  });

  it("未定義の場合", () => {
    expect(formatTimestamp(undefined)).toBe("");
  });

  it("空文字列の場合", () => {
    expect(formatTimestamp("")).toBe("");
  });
});

describe("formatUserHeader", () => {
  it("ユーザーIDとタイムスタンプからヘッダーを生成", () => {
    expect(formatUserHeader("U123456", "1704980400")).toBe(
      "**@U123456** - 2024-01-11 13:40:00",
    );
  });

  it("ユーザーIDのみの場合", () => {
    expect(formatUserHeader("U123456")).toBe("**@U123456**");
  });

  it("タイムスタンプのみの場合", () => {
    expect(formatUserHeader(undefined, "1704980400")).toBe(
      "2024-01-11 13:40:00",
    );
  });

  it("両方とも未定義の場合", () => {
    expect(formatUserHeader()).toBe("");
  });
});

describe("formatReactions", () => {
  it("単一のリアクション", () => {
    const reactions: Reaction[] = [
      {
        name: "thumbsup",
        users: ["U123456", "U234567"],
        count: 2,
      },
    ];
    expect(formatReactions(reactions)).toBe(
      '<reaction count="2" users="U123456 U234567">thumbsup</reaction>',
    );
  });

  it("複数のリアクション", () => {
    const reactions: Reaction[] = [
      {
        name: "thumbsup",
        users: ["U123456"],
        count: 1,
      },
      {
        name: "heart",
        users: ["U234567", "U345678"],
        count: 2,
      },
    ];
    expect(formatReactions(reactions)).toBe(
      '<reaction count="1" users="U123456">thumbsup</reaction>\n<reaction count="2" users="U234567 U345678">heart</reaction>',
    );
  });

  it("未知の絵文字名はそのまま表示", () => {
    const reactions: Reaction[] = [
      {
        name: "custom-emoji",
        users: ["U123456"],
        count: 1,
      },
    ];
    expect(formatReactions(reactions)).toBe(
      '<reaction count="1" users="U123456">custom-emoji</reaction>',
    );
  });

  it("countが0の場合は表示しない", () => {
    const reactions: Reaction[] = [
      {
        name: "thumbsup",
        users: [],
        count: 0,
      },
      {
        name: "heart",
        users: ["U123456"],
        count: 1,
      },
    ];
    expect(formatReactions(reactions)).toBe(
      '<reaction count="1" users="U123456">heart</reaction>',
    );
  });

  it("空の配列の場合", () => {
    expect(formatReactions([])).toBe("");
  });

  it("未定義の場合", () => {
    expect(formatReactions(undefined)).toBe("");
  });
});

describe("formatEditedInfo", () => {
  it("編集済みメッセージの情報", () => {
    const edited: EditedInfo = {
      user: "U123456",
      ts: "1704984000",
    };
    expect(formatEditedInfo(edited)).toBe(
      "*(edited by @U123456 at 2024-01-11 14:40:00)*",
    );
  });

  it("編集ユーザーのみの場合", () => {
    const edited: EditedInfo = {
      user: "U123456",
      ts: "",
    };
    expect(formatEditedInfo(edited)).toBe("*(edited by @U123456)*");
  });

  it("編集時刻のみの場合", () => {
    const edited: EditedInfo = {
      user: "",
      ts: "1704984000",
    };
    expect(formatEditedInfo(edited)).toBe("*(edited at 2024-01-11 14:40:00)*");
  });

  it("情報がない場合", () => {
    const edited: EditedInfo = {
      user: "",
      ts: "",
    };
    expect(formatEditedInfo(edited)).toBe("*(edited)*");
  });

  it("未定義の場合", () => {
    expect(formatEditedInfo(undefined as never)).toBe("");
  });
});
