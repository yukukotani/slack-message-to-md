import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs as utilParseArgs } from "node:util";
import type { SlackMessage } from "../libs/types";
import {
  convertMessage,
  convertMultipleMessages,
} from "../usecase/convertMessage";

export const handleCli = (): void => {
  const { values, positionals } = utilParseArgs({
    args: process.argv.slice(2),
    options: {
      input: {
        type: "string",
        short: "i",
        description: "入力JSONファイルのパス",
      },
      output: {
        type: "string",
        short: "o",
        description: "出力Markdownファイルのパス",
      },
      help: {
        type: "boolean",
        short: "h",
        description: "ヘルプメッセージを表示",
      },
    },
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  const inputFile = values.input || positionals[0];
  const outputFile = values.output || positionals[1];

  if (!inputFile) {
    console.error("エラー: 入力ファイルが指定されていません");
    showUsage();
    process.exit(1);
  }

  try {
    // JSONファイルを読み込み
    const jsonContent = readFileSync(inputFile, "utf-8");
    let data: unknown;

    try {
      data = JSON.parse(jsonContent);
    } catch (error) {
      console.error(`エラー: JSONファイルの解析に失敗しました: ${error}`);
      process.exit(1);
    }

    let markdownContent: string;

    // 単一メッセージまたは複数メッセージの判定
    if (Array.isArray(data)) {
      // 複数メッセージの処理
      const messages = data as SlackMessage[];
      const results = convertMultipleMessages(messages);

      const markdownSections: string[] = [];
      const errors: string[] = [];

      for (const [index, result] of results.entries()) {
        if (result.success) {
          markdownSections.push(result.markdown);
        } else {
          errors.push(`メッセージ ${index + 1}: ${result.error.message}`);
          // 部分的なマークダウンがあれば追加
          if ("partialMarkdown" in result && result.partialMarkdown) {
            markdownSections.push(result.partialMarkdown);
          }
        }
      }

      markdownContent = markdownSections.join("\n\n---\n\n");

      if (errors.length > 0) {
        console.warn("警告: 一部のメッセージの変換でエラーが発生しました:");
        for (const error of errors) {
          console.warn(`  ${error}`);
        }
      }
    } else {
      // 単一メッセージの処理
      const message = data as SlackMessage;
      const result = convertMessage(message);

      if (result.success) {
        markdownContent = result.markdown;
      } else {
        console.error(`エラー: ${result.error.message}`);
        // 部分的なマークダウンがあれば使用
        if ("partialMarkdown" in result && result.partialMarkdown) {
          markdownContent = result.partialMarkdown;
          console.warn("警告: 部分的な変換結果を出力します");
        } else {
          process.exit(1);
        }
      }
    }

    // 結果を出力
    if (outputFile) {
      writeFileSync(outputFile, markdownContent);
      console.log(`変換完了: ${outputFile}`);
    } else {
      console.log(markdownContent);
    }
  } catch (error) {
    console.error(`エラー: ファイル処理中にエラーが発生しました: ${error}`);
    process.exit(1);
  }
};

function showHelp(): void {
  console.log(`
Slack Message to Markdown Converter

使用法:
  slack-message-to-md [オプション] <入力ファイル> [出力ファイル]
  slack-message-to-md -i <入力ファイル> -o <出力ファイル>

オプション:
  -i, --input <file>   入力JSONファイルのパス
  -o, --output <file>  出力Markdownファイルのパス（省略時は標準出力）
  -h, --help           このヘルプメッセージを表示

例:
  # 標準出力に変換結果を表示
  slack-message-to-md message.json
  
  # ファイルに出力
  slack-message-to-md message.json output.md
  
  # オプション形式
  slack-message-to-md --input message.json --output output.md
  
  # 複数メッセージの変換
  slack-message-to-md messages.json output.md

入力形式:
  - 単一メッセージ: SlackMessageオブジェクト
  - 複数メッセージ: SlackMessageオブジェクトの配列
`);
}

function showUsage(): void {
  console.log("使用法: slack-message-to-md <入力ファイル> [出力ファイル]");
  console.log("詳細は --help を参照してください");
}
