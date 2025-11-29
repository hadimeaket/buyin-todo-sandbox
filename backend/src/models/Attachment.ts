export interface Attachment {
  id: string;
  todoId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface CreateAttachmentInput {
  todoId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}
