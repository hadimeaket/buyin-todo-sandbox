export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  categoryId?: string;
  dueDate?: Date;
  dueEndDate?: Date;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
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
}
