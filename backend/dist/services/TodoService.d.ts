import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";
export declare class TodoService {
    getAllTodos(userId?: string): Promise<Todo[]>;
    getTodoById(id: string, userId?: string): Promise<Todo | null>;
    createTodo(data: CreateTodoDto, userId?: string): Promise<Todo>;
    updateTodo(id: string, data: UpdateTodoDto, userId?: string): Promise<Todo | null>;
    toggleTodo(id: string, userId?: string): Promise<Todo | null>;
    deleteTodo(id: string, userId?: string): Promise<boolean>;
}
export declare const todoService: TodoService;
//# sourceMappingURL=TodoService.d.ts.map