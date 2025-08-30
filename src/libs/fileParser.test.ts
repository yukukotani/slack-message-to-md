import { describe, expect, it } from "vitest";
import {
  formatDocumentFile,
  formatFileInfo,
  formatFileSize,
  formatImageFile,
  parseFiles,
} from "./fileParser";
import type { FileElement } from "./types";

describe("formatFileSize", () => {
  it("バイト単位の場合", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("キロバイト単位の場合", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("メガバイト単位の場合", () => {
    expect(formatFileSize(2097152)).toBe("2 MB");
  });

  it("ギガバイト単位の場合", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });

  it("0バイトの場合", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("小数点以下が0の場合は整数表示", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
  });
});

describe("formatImageFile", () => {
  it("基本的な画像ファイル", () => {
    const file: FileElement = {
      id: "F123456",
      name: "sample.png",
      mimetype: "image/png",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/sample.png",
      size: 2048,
    };
    const result = formatImageFile(file);
    expect(result).toContain(
      "![sample.png](https://files.slack.com/files-pri/T123456-F123456/sample.png)",
    );
    expect(result).toContain("**sample.png** (PNG, 2 KB)");
  });

  it("タイトル付き画像ファイル", () => {
    const file: FileElement = {
      id: "F123456",
      name: "image.jpg",
      title: "サンプル画像",
      mimetype: "image/jpeg",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/image.jpg",
      size: 1536000,
    };
    const result = formatImageFile(file);
    expect(result).toContain("**サンプル画像** (JPEG, 1.5 MB)");
    expect(result).toContain(
      "![サンプル画像](https://files.slack.com/files-pri/T123456-F123456/image.jpg)",
    );
  });

  it("サムネイル付き画像ファイル", () => {
    const file: FileElement = {
      id: "F123456",
      name: "large.png",
      mimetype: "image/png",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/large.png",
      thumb_360:
        "https://files.slack.com/files-tmb/T123456-F123456-thumb360/large.png",
      size: 5242880,
    };
    const result = formatImageFile(file);
    // サムネイルを優先
    expect(result).toContain(
      "![large.png](https://files.slack.com/files-tmb/T123456-F123456-thumb360/large.png)",
    );
  });
});

describe("formatDocumentFile", () => {
  it("PDFファイル", () => {
    const file: FileElement = {
      id: "F123456",
      name: "document.pdf",
      mimetype: "application/pdf",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/document.pdf",
      size: 1048576,
    };
    const result = formatDocumentFile(file);
    expect(result).toBe(
      "📄 **[document.pdf](https://files.slack.com/files-pri/T123456-F123456/document.pdf)** (PDF, 1 MB)",
    );
  });

  it("テキストファイル", () => {
    const file: FileElement = {
      id: "F123456",
      name: "readme.txt",
      mimetype: "text/plain",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/readme.txt",
      size: 1024,
    };
    const result = formatDocumentFile(file);
    expect(result).toBe(
      "📄 **[readme.txt](https://files.slack.com/files-pri/T123456-F123456/readme.txt)** (TXT, 1 KB)",
    );
  });

  it("タイトル付きドキュメント", () => {
    const file: FileElement = {
      id: "F123456",
      name: "report.docx",
      title: "月次レポート",
      mimetype:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/report.docx",
      size: 512000,
    };
    const result = formatDocumentFile(file);
    expect(result).toBe(
      "📄 **[月次レポート](https://files.slack.com/files-pri/T123456-F123456/report.docx)** (DOCX, 500 KB)",
    );
  });
});

describe("formatFileInfo", () => {
  it("一般的なファイル情報を表示", () => {
    const file: FileElement = {
      id: "F123456",
      name: "archive.zip",
      mimetype: "application/zip",
      url_private:
        "https://files.slack.com/files-pri/T123456-F123456/archive.zip",
      size: 10485760,
    };
    const result = formatFileInfo(file);
    expect(result).toBe(
      "📎 **[archive.zip](https://files.slack.com/files-pri/T123456-F123456/archive.zip)** (ZIP, 10 MB)",
    );
  });

  it("外部ファイルの場合", () => {
    const file: FileElement = {
      id: "F123456",
      name: "external.pdf",
      is_external: true,
      external_type: "gdoc",
      url_private: "https://docs.google.com/document/d/123456/edit",
      size: 0,
    };
    const result = formatFileInfo(file);
    expect(result).toContain(
      "**[external.pdf](https://docs.google.com/document/d/123456/edit)**",
    );
    expect(result).toContain("External (gdoc)");
  });
});

describe("parseFiles", () => {
  it("画像ファイルは画像として表示", () => {
    const files: FileElement[] = [
      {
        id: "F123456",
        name: "photo.jpg",
        mimetype: "image/jpeg",
        url_private:
          "https://files.slack.com/files-pri/T123456-F123456/photo.jpg",
        size: 2048000,
      },
    ];
    const result = parseFiles(files);
    expect(result).toBe('<file id="F123456" mimetype="image/jpeg" href="https://files.slack.com/files-pri/T123456-F123456/photo.jpg" size="2048000">photo.jpg</file>');
  });

  it("ドキュメントファイルはリンクとして表示", () => {
    const files: FileElement[] = [
      {
        id: "F123456",
        name: "presentation.pptx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        url_private:
          "https://files.slack.com/files-pri/T123456-F123456/presentation.pptx",
        size: 5242880,
      },
    ];
    const result = parseFiles(files);
    expect(result).toBe('<file id="F123456" mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation" href="https://files.slack.com/files-pri/T123456-F123456/presentation.pptx" size="5242880">presentation.pptx</file>');
  });

  it("複数ファイルを順番に処理", () => {
    const files: FileElement[] = [
      {
        id: "F123456",
        name: "image.png",
        mimetype: "image/png",
        url_private:
          "https://files.slack.com/files-pri/T123456-F123456/image.png",
        size: 1024,
      },
      {
        id: "F234567",
        name: "document.pdf",
        mimetype: "application/pdf",
        url_private:
          "https://files.slack.com/files-pri/T123456-F234567/document.pdf",
        size: 2048,
      },
    ];
    const result = parseFiles(files);
    expect(result).toContain('<file id="F123456" mimetype="image/png" href="https://files.slack.com/files-pri/T123456-F123456/image.png" size="1024">image.png</file>');
    expect(result).toContain('<file id="F234567" mimetype="application/pdf" href="https://files.slack.com/files-pri/T123456-F234567/document.pdf" size="2048">document.pdf</file>');
    // 2つのファイルが区切り線で分かれている
    expect(result.split("\n\n").length).toBeGreaterThan(1);
  });

  it("空の配列の場合", () => {
    expect(parseFiles([])).toBe("");
  });

  it("未定義の場合", () => {
    expect(parseFiles(undefined as never)).toBe("");
  });
});
