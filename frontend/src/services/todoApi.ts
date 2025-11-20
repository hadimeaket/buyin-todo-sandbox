import axios, { AxiosError } from 'axios';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    const message = axiosError.response?.data?.message || axiosError.message || 'Unknown error';
    console.error(`API Error [${context}]:`, message);
    throw new ApiError(message, axiosError.response?.status, axiosError.response?.data);
  }
  console.error(`Unexpected Error [${context}]:`, error);
  throw new Error(`Unexpected error in ${context}`);
};

export const todoApi = {
  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<Todo[]>('/api/todos');
      return response.data;
    } catch (error) {
      handleApiError(error, 'getAllTodos');
    }
  },

  // Get a single todo by ID
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await api.get<Todo>(`/api/todos/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `getTodoById(${id})`);
    }
  },

  // Create a new todo
  async createTodo(data: CreateTodoDto): Promise<Todo> {
    try {
      const response = await api.post<Todo>('/api/todos', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'createTodo');
    }
  },

  // Update a todo
  async updateTodo(id: string, data: UpdateTodoDto): Promise<Todo> {
    try {
      const response = await api.put<Todo>(`/api/todos/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error, `updateTodo(${id})`);
    }
  },

  // Toggle todo completion status
  async toggleTodo(id: string): Promise<Todo> {
    try {
      const response = await api.patch<Todo>(`/api/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      handleApiError(error, `toggleTodo(${id})`);
    }
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    try {
      await api.delete(`/api/todos/${id}`);
    } catch (error) {
      handleApiError(error, `deleteTodo(${id})`);
    }
  },
};
