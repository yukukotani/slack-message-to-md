import { describe, expect, it } from "vitest";
import type { ConversionError, SlackMessage } from "./types";
import {
  handleInvalidJson,
  handleMissingContent,
  handlePartialConversion,
  wrapSafeExecution,
} from "./errorHandler";

describe("handleInvalidJson", () => {
  it("JSONパースエラーのエラーレスポンスを生成", () => {
    const result = handleInvalidJson('{"invalid": json}');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_JSON");
      expect(result.error.message).toBe("Invalid JSON format");
      expect(result.error.details).toContain('{"invalid": json}');
    }
  });

  it("長いJSONは100文字で切り捨て", () => {
    const longJson = "a".repeat(200);
    const result = handleInvalidJson(longJson);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toHaveLength(100);
    }
  });
});

describe("handleMissingContent", () => {
  it("コンテンツ欠落エラーのエラーレスポンスを生成", () => {
    const message: SlackMessage = { ts: "1234567890" };
    const result = handleMissingContent(message);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("MISSING_CONTENT");
      expect(result.error.message).toBe("No content to convert");
    }
  });
});

describe("handlePartialConversion", () => {
  it("部分的変換エラーのエラーレスポンスを生成", () => {
    const errors = [
      new Error("Block parsing failed"),
      new Error("Attachment parsing failed"),
    ];
    const result = handlePartialConversion("Partial markdown content", errors);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PARTIAL_CONVERSION");
      expect(result.error.message).toBe("Some elements could not be converted");
      expect(result.error.details).toEqual(errors);
      expect(result.partialMarkdown).toBe("Partial markdown content");
    }
  });

  it("単一エラーでも配列として処理", () => {
    const error = new Error("Single error");
    const result = handlePartialConversion("Content", [error]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toEqual([error]);
    }
  });

  it("空のエラー配列でも処理", () => {
    const result = handlePartialConversion("Content", []);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toEqual([]);
    }
  });
});

describe("wrapSafeExecution", () => {
  it("正常な実行時は結果を返す", () => {
    const fn = () => "success result";
    const fallback = "fallback value";
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toBe("success result");
  });

  it("エラー発生時はフォールバック値を返す", () => {
    const fn = () => {
      throw new Error("Something went wrong");
    };
    const fallback = "fallback value";
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toBe("fallback value");
  });

  it("Promise を返す関数はフォールバック値を返す", () => {
    const fn = () => {
      return Promise.resolve("async result");
    };
    const fallback = "fallback value";
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toBe("fallback value");
  });

  it("nullを返す関数も正常処理", () => {
    const fn = () => null;
    const fallback = "fallback value";
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toBeNull();
  });

  it("undefinedを返す関数も正常処理", () => {
    const fn = () => undefined;
    const fallback = "fallback value";
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toBeUndefined();
  });

  it("複雑なオブジェクトも処理", () => {
    const obj = { key: "value", nested: { prop: 123 } };
    const fn = () => obj;
    const fallback = {};
    const result = wrapSafeExecution(fn, fallback);
    expect(result).toEqual(obj);
  });

  it("フォールバック値が関数の場合", () => {
    const fn = () => {
      throw new Error("Error");
    };
    const fallbackFn = () => "computed fallback";
    const result = wrapSafeExecution(fn, fallbackFn());
    expect(result).toBe("computed fallback");
  });
});