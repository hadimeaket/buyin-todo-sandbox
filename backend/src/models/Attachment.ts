export interface Attachment {
  id: string;
  todoId: string;
  userId: string;
  filename: string; // Stored filename (unique)
  originalName: string; // Original uploaded filename
  mimeType: string;
  size: number; // Size in bytes
  path: string; // Relative path to file
  createdAt: string;
}

export interface CreateAttachmentDto {
  todoId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}
