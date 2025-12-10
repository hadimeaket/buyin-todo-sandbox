export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // HEX format: #RRGGBB
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  dueEndDate?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  categoryId?: string;
  priority?: "low" | "medium" | "high";
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
  categoryId?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  dueEndDate?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  recurrence?: RecurrenceType;
}
