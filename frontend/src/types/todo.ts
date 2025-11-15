export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
}
