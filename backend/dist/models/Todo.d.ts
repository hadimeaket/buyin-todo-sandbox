export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export interface Todo {
    id: string;
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
}
//# sourceMappingURL=Todo.d.ts.map