import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
export interface ITodoRepository {
    findAll(userId: string): Promise<Todo[]>;
    findById(id: string, userId: string): Promise<Todo | null>;
    findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId: string): Promise<Todo>;
    update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggle(id: string, userId: string): Promise<Todo | null>;
    delete(id: string, userId: string): Promise<boolean>;
    clear?(): Promise<void>;
}
declare class SQLiteTodoRepository implements ITodoRepository {
    findAll(userId: string): Promise<Todo[]>;
    findById(id: string, userId: string): Promise<Todo | null>;
    findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId: string): Promise<Todo>;
    update(id: string, userId: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggle(id: string, userId: string): Promise<Todo | null>;
    delete(id: string, userId: string): Promise<boolean>;
    removeCategoryFromTodos(categoryId: string, userId: string): Promise<void>;
    clear(): Promise<void>;
}
export declare const todoRepository: SQLiteTodoRepository;
export {};
//# sourceMappingURL=TodoRepository.d.ts.map