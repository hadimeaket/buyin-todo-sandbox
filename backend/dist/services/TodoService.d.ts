import { CreateTodoDto, UpdateTodoDto, Todo } from "../models/Todo";
import { Category } from "../models/Category";
export interface TodoWithCategory extends Todo {
    category?: Category;
}
export declare class TodoService {
    getAllTodos(userId: string): Promise<TodoWithCategory[]>;
    private enrichTodosWithCategories;
    getTodoById(id: string, userId: string): Promise<TodoWithCategory | null>;
    createTodo(data: CreateTodoDto, userId: string): Promise<TodoWithCategory>;
    updateTodo(id: string, userId: string, data: UpdateTodoDto): Promise<TodoWithCategory | null>;
    toggleTodo(id: string, userId: string): Promise<TodoWithCategory | null>;
    deleteTodo(id: string, userId: string): Promise<boolean>;
}
export declare const todoService: TodoService;
//# sourceMappingURL=TodoService.d.ts.map