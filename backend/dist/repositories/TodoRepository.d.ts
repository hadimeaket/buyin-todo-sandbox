import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
export interface ITodoRepository {
    findAll(userId: string): Promise<Todo[]>;
    findById(id: string, userId: string): Promise<Todo | null>;
    findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId: string): Promise<Todo>;
    update(id: string, data: UpdateTodoDto, userId: string): Promise<Todo | null>;
    toggle(id: string, userId: string): Promise<Todo | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
declare class SqliteTodoRepository implements ITodoRepository {
    findAll(userId: string): Promise<Todo[]>;
    findById(id: string, userId: string): Promise<Todo | null>;
    findDuplicate(title: string, userId: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId: string): Promise<Todo>;
    update(id: string, data: UpdateTodoDto, userId: string): Promise<Todo | null>;
    toggle(id: string, userId: string): Promise<Todo | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
export declare const todoRepository: SqliteTodoRepository;
export {};
//# sourceMappingURL=TodoRepository.d.ts.map