import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SlackMessage } from "../libs/types";
import { handleCli } from "./cli";

// プロセス関連のモック
const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit called");
});
const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

// process.argvをモック
const originalArgv = process.argv;

describe("handleCli", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
    // テストファイルを削除
    const testFiles = ["test-input.json", "test-output.md"];
    for (const file of testFiles) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }
  });

  it("ヘルプメッセージを表示", () => {
    process.argv = ["node", "cli.js", "--help"];

    expect(() => handleCli()).toThrow("process.exit called");
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining("Slack Message to Markdown Converter"),
    );
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it("入力ファイルが指定されていない場合はエラー", () => {
    process.argv = ["node", "cli.js"];

    expect(() => handleCli()).toThrow("process.exit called");
    expect(mockError).toHaveBeenCalledWith(
      "エラー: 入力ファイルが指定されていません",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("単一メッセージを標準出力に変換", () => {
    const testMessage: SlackMessage = {
      type: "message",
      text: "Hello *world*!",
      user: "U123456",
      ts: "1704980400",
    };

    writeFileSync("test-input.json", JSON.stringify(testMessage));
    process.argv = ["node", "cli.js", "test-input.json"];

    handleCli();

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining("**@U123456**"),
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining("Hello **world**!"),
    );
  });

  it("単一メッセージをファイルに出力", () => {
    const testMessage: SlackMessage = {
      type: "message",
      text: "Hello world!",
      user: "U123456",
      ts: "1704980400",
    };

    writeFileSync("test-input.json", JSON.stringify(testMessage));
    process.argv = ["node", "cli.js", "test-input.json", "test-output.md"];

    handleCli();

    expect(existsSync("test-output.md")).toBe(true);
    const output = readFileSync("test-output.md", "utf-8");
    expect(output).toContain("**@U123456**");
    expect(output).toContain("Hello world!");
    expect(mockLog).toHaveBeenCalledWith("変換完了: test-output.md");
  });

  it("複数メッセージを変換", () => {
    const testMessages: SlackMessage[] = [
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

    writeFileSync("test-input.json", JSON.stringify(testMessages));
    process.argv = ["node", "cli.js", "test-input.json"];

    handleCli();

    const output = mockLog.mock.calls[0]?.[0] as string;
    expect(output).toContain("First message");
    expect(output).toContain("Second message");
    expect(output).toContain("---"); // メッセージ区切り線
  });

  it("無効なJSONファイルでエラー", () => {
    writeFileSync("test-input.json", "invalid json");
    process.argv = ["node", "cli.js", "test-input.json"];

    expect(() => handleCli()).toThrow("process.exit called");
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("JSONファイルの解析に失敗しました"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("コンテンツがないメッセージでエラー", () => {
    const invalidMessage: SlackMessage = {
      ts: "1704980400",
    };

    writeFileSync("test-input.json", JSON.stringify(invalidMessage));
    process.argv = ["node", "cli.js", "test-input.json"];

    expect(() => handleCli()).toThrow("process.exit called");
    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining("No content to convert"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("オプション形式での指定", () => {
    const testMessage: SlackMessage = {
      type: "message",
      text: "Test message",
      user: "U123456",
      ts: "1704980400",
    };

    writeFileSync("test-input.json", JSON.stringify(testMessage));
    process.argv = [
      "node",
      "cli.js",
      "--input",
      "test-input.json",
      "--output",
      "test-output.md",
    ];

    handleCli();

    expect(existsSync("test-output.md")).toBe(true);
    expect(mockLog).toHaveBeenCalledWith("変換完了: test-output.md");
  });

  it("一部メッセージの変換でエラーが発生した場合の警告", () => {
    const testMessages = [
      {
        type: "message",
        text: "Valid message",
        user: "U123456",
        ts: "1704980400",
      },
      {
        ts: "1704984000", // textなし
      },
    ];

    writeFileSync("test-input.json", JSON.stringify(testMessages));
    process.argv = ["node", "cli.js", "test-input.json"];

    handleCli();

    expect(mockWarn).toHaveBeenCalledWith(
      "警告: 一部のメッセージの変換でエラーが発生しました:",
    );
    expect(mockWarn).toHaveBeenCalledWith(
      "  メッセージ 2: No content to convert",
    );

    const output = mockLog.mock.calls[0]?.[0] as string;
    expect(output).toContain("Valid message");
  });
});
