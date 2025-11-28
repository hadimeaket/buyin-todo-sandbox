export interface Attachment {
  id: string;
  todoId: string;
  userId: string;
  filename: string; // Stored filename (UUID-based)
  originalName: string; // Original filename from user
  mimeType: string;
  size: number; // Size in bytes
  uploadedAt: Date;
}

export interface CreateAttachmentDto {
  todoId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"] as const;
