import { Todo, CreateTodoDto, UpdateTodoDto } from "../models/Todo";
export interface ITodoRepository {
    findAll(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    findDuplicate(title: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto): Promise<Todo>;
    update(id: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggle(id: string): Promise<Todo | null>;
    delete(id: string): Promise<boolean>;
}
declare class InMemoryTodoRepository implements ITodoRepository {
    private todos;
    findAll(): Promise<Todo[]>;
    findById(id: string): Promise<Todo | null>;
    findDuplicate(title: string, description?: string): Promise<Todo | null>;
    create(data: CreateTodoDto): Promise<Todo>;
    update(id: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggle(id: string): Promise<Todo | null>;
    delete(id: string): Promise<boolean>;
}
export declare const todoRepository: InMemoryTodoRepository;
export {};
//# sourceMappingURL=TodoRepository.d.ts.map