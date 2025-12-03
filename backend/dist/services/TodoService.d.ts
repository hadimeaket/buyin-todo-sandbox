import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";
export declare class TodoService {
    getAllTodos(): Promise<Todo[]>;
    getTodoById(id: string): Promise<Todo | null>;
    createTodo(data: CreateTodoDto): Promise<Todo>;
    updateTodo(id: string, data: UpdateTodoDto): Promise<Todo | null>;
    toggleTodo(id: string): Promise<Todo | null>;
    deleteTodo(id: string): Promise<boolean>;
}
export declare const todoService: TodoService;
//# sourceMappingURL=TodoService.d.ts.map