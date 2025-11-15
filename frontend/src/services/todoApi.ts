import axios from 'axios';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = {
  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<Todo[]>('/api/todos');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  },

  // Get a single todo by ID
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await api.get<Todo>(`/api/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      throw new Error('Failed to fetch todo');
    }
  },

  // Create a new todo
  async createTodo(data: CreateTodoDto): Promise<Todo> {
    try {
      const response = await api.post<Todo>('/api/todos', data);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  },

  // Update a todo
  async updateTodo(id: string, data: UpdateTodoDto): Promise<Todo> {
    try {
      const response = await api.put<Todo>(`/api/todos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw new Error('Failed to update todo');
    }
  },

  // Toggle todo completion status
  async toggleTodo(id: string): Promise<Todo> {
    try {
      const response = await api.patch<Todo>(`/api/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling todo ${id}:`, error);
      throw new Error('Failed to toggle todo');
    }
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    try {
      await api.delete(`/api/todos/${id}`);
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw new Error('Failed to delete todo');
    }
  },
};
