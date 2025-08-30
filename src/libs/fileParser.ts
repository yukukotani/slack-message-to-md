import type { FileElement } from "./types";

export function parseFiles(files: FileElement[]): string {
  if (!files || files.length === 0) {
    return "";
  }

  const parsedFiles = files.map((file) => {
    if (isImageFile(file)) {
      return formatImageFile(file);
    } else if (isDocumentFile(file)) {
      return formatDocumentFile(file);
    } else {
      return formatFileInfo(file);
    }
  });

  return parsedFiles.join("\n\n");
}

function isImageFile(file: FileElement): boolean {
  return file.mimetype?.startsWith("image/") === true;
}

function isDocumentFile(file: FileElement): boolean {
  if (!file.mimetype) return false;

  const documentTypes = [
    "application/pdf",
    "text/plain",
    "text/",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  return documentTypes.some((type) => file.mimetype?.startsWith(type));
}

export function formatImageFile(file: FileElement): string {
  const parts: string[] = [];
  const displayName = file.title || file.name || "Image";
  const fileType = getFileTypeFromMimetype(file.mimetype);
  const size = formatFileSize(file.size || 0);

  // ファイル情報
  parts.push(`**${displayName}** (${fileType}, ${size})`);

  // 画像表示（サムネイルがあれば優先、なければ元ファイル）
  const imageUrl = getBestImageUrl(file);
  if (imageUrl) {
    parts.push(`![${displayName}](${imageUrl})`);
  }

  return parts.join("\n\n");
}

export function formatDocumentFile(file: FileElement): string {
  const displayName = file.title || file.name || "Document";
  const fileType = getFileTypeFromMimetype(file.mimetype);
  const size = formatFileSize(file.size || 0);
  const url = file.url_private || "";

  return `📄 **[${displayName}](${url})** (${fileType}, ${size})`;
}

export function formatFileInfo(file: FileElement): string {
  const displayName = file.title || file.name || "File";
  const url = file.url_private || "";
  const size = file.size || 0;

  if (file.is_external) {
    const externalType = file.external_type || "external";
    return `🔗 **[${displayName}](${url})** - External (${externalType})`;
  }

  const fileType = getFileTypeFromMimetype(file.mimetype);
  const sizeText = size > 0 ? formatFileSize(size) : "";

  if (sizeText) {
    return `📎 **[${displayName}](${url})** (${fileType}, ${sizeText})`;
  }

  return `📎 **[${displayName}](${url})** (${fileType})`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 小数点以下が0の場合は整数で表示
  const formattedSize = size % 1 === 0 ? size.toString() : size.toFixed(1);
  return `${formattedSize} ${units[unitIndex]}`;
}

function getFileTypeFromMimetype(mimetype?: string): string {
  if (!mimetype) return "Unknown";

  // よく使われるファイルタイプの短縮形にマッピング
  const typeMap: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WebP",
    "image/svg+xml": "SVG",
    "application/pdf": "PDF",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JS",
    "application/json": "JSON",
    "application/xml": "XML",
    "application/zip": "ZIP",
    "application/x-rar-compressed": "RAR",
    "application/x-7z-compressed": "7Z",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPTX",
    "audio/mpeg": "MP3",
    "audio/wav": "WAV",
    "video/mp4": "MP4",
    "video/avi": "AVI",
    "video/mov": "MOV",
  };

  const exactMatch = typeMap[mimetype.toLowerCase()];
  if (exactMatch) {
    return exactMatch;
  }

  // 部分マッチ
  if (mimetype.startsWith("image/")) return "Image";
  if (mimetype.startsWith("audio/")) return "Audio";
  if (mimetype.startsWith("video/")) return "Video";
  if (mimetype.startsWith("text/")) return "Text";

  // デフォルト
  return "File";
}

function getBestImageUrl(file: FileElement): string {
  // サムネイルのサイズ順（大きい順）
  const thumbnails = [
    file.thumb_1024,
    file.thumb_960,
    file.thumb_800,
    file.thumb_720,
    file.thumb_480,
    file.thumb_360,
    file.thumb_160,
    file.thumb_80,
    file.thumb_64,
  ];

  // 最初に見つかったサムネイルを使用
  for (const thumb of thumbnails) {
    if (thumb) {
      return thumb;
    }
  }

  // サムネイルがない場合は元のファイルを使用
  return file.url_private || "";
}
