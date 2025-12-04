export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export interface Attachment {
    id: string;
    todoId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: Date;
}
export interface Todo {
    id: string;
    userId: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    dueDate?: Date;
    dueEndDate?: Date;
    isAllDay?: boolean;
    startTime?: string;
    endTime?: string;
    recurrence?: RecurrenceType;
    categoryId?: string;
    attachments?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTodoDto {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    dueEndDate?: string;
    isAllDay?: boolean;
    startTime?: string;
    endTime?: string;
    recurrence?: RecurrenceType;
    categoryId?: string;
}
export interface UpdateTodoDto {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    dueEndDate?: string;
    isAllDay?: boolean;
    startTime?: string;
    endTime?: string;
    recurrence?: RecurrenceType;
    categoryId?: string;
}
//# sourceMappingURL=Todo.d.ts.map