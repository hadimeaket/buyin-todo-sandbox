export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type TodoCategory = "task" | "idea" | "action";

export interface TodoAttachment {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: TodoCategory;
  dueDate?: Date;
  dueEndDate?: Date;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  attachments: TodoAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  category?: TodoCategory;
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
  category?: TodoCategory;
  dueDate?: string;
  dueEndDate?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
}
