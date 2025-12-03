import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
import { ITodoRepository } from "./TodoRepository";
export declare class SqliteTodoRepository implements ITodoRepository {
    private db;
    constructor();
    /**
     * Convert database row to Todo object
     */
    private rowToTodo;
    findAll(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    findDuplicate(title: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto): Promise<Todo>;
    update(id: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggle(id: string): Promise<Todo | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=SqliteTodoRepository.d.ts.map