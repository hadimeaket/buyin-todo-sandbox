export interface Attachment {
  id: string;
  todoId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  return "📎";
};
