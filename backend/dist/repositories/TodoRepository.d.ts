import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import Database from "better-sqlite3";
export interface ITodoRepository {
    findAll(userId?: string): Promise<Todo[]>;
    findById(id: string, userId?: string): Promise<Todo | null>;
    findDuplicate(title: string, description?: string, userId?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId?: string): Promise<Todo>;
    update(id: string, data: UpdateTodoDto, userId?: string): Promise<Todo | null>;
    toggle(id: string, userId?: string): Promise<Todo | null>;
    delete(id: string, userId?: string): Promise<boolean>;
}
declare class SqliteTodoRepository implements ITodoRepository {
    private db;
    constructor(dbPath?: string);
    private initializeDatabase;
    getDatabase(): Database.Database;
    private rowToTodo;
    findAll(userId?: string): Promise<Todo[]>;
    findById(id: string, userId?: string): Promise<Todo | null>;
    findDuplicate(title: string, description?: string, userId?: string): Promise<Todo | null>;
    create(data: CreateTodoDto, userId?: string): Promise<Todo>;
    update(id: string, data: UpdateTodoDto, userId?: string): Promise<Todo | null>;
    toggle(id: string, userId?: string): Promise<Todo | null>;
    delete(id: string, userId?: string): Promise<boolean>;
    close(): void;
}
export declare const todoRepository: SqliteTodoRepository;
export {};
//# sourceMappingURL=TodoRepository.d.ts.map