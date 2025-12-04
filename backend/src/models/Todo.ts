export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Attachment {
  id: string;
  filename: string; // Original filename
  storedFilename: string; // Unique filename in storage
  mimetype: string; // MIME type: image/png, image/jpeg, application/pdf
  size: number; // File size in bytes
  uploadedAt: Date; // Upload timestamp
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  dueDate?: Date;
  dueEndDate?: Date;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  categoryId?: string;
  dueDate?: string;
  dueEndDate?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  categoryId?: string;
  dueDate?: string;
  dueEndDate?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  attachments?: Attachment[];
}
