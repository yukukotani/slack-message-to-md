import type { ConversionResult, SlackMessage } from "./types";

export function handleInvalidJson(input: string): ConversionResult {
  return {
    success: false,
    error: {
      code: "INVALID_JSON",
      message: "Invalid JSON format",
      details: input.substring(0, 100), // 最初の100文字のみ保持
    },
  };
}

export function handleMissingContent(message: SlackMessage): ConversionResult {
  return {
    success: false,
    error: {
      code: "MISSING_CONTENT",
      message: "No content to convert",
      details: message,
    },
  };
}

export function handlePartialConversion(
  markdown: string,
  errors: Error[],
): ConversionResult {
  return {
    success: false,
    error: {
      code: "PARTIAL_CONVERSION",
      message: "Some elements could not be converted",
      details: errors,
    },
    partialMarkdown: markdown,
  };
}

export function wrapSafeExecution<T>(fn: () => T, fallback: T): T {
  try {
    const result = fn();
    // Promise の場合も同期的に処理
    if (result instanceof Promise) {
      try {
        // Promise が reject した場合はエラーになる
        return fallback;
      } catch {
        return fallback;
      }
    }
    return result;
  } catch (error) {
    // エラーをログに出力（デバッグ用）
    if (process.env.NODE_ENV === "development") {
      console.warn("Safe execution failed:", error);
    }
    return fallback;
  }
}

export function createUnknownError(error: unknown): ConversionResult {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error occurred";

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: errorMessage,
      details: error,
    },
  };
}
