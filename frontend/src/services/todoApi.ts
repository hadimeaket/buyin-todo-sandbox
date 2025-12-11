import axios, { AxiosError } from "axios";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    console.error(`API Error [${context}]:`, message);
    throw new ApiError(
      message,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  console.error(`Unexpected Error [${context}]:`, error);
  throw new Error(`Unexpected error in ${context}`);
};

export const todoApi = {
  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    try {
      const response = await api.get<Todo[]>("/api/todos");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "getAllTodos");
    }
  },

  // Get a single todo by ID
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await api.get<Todo>(`/api/todos/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `getTodoById(${id})`);
    }
  },

  // Create a new todo
  async createTodo(data: CreateTodoDto): Promise<Todo> {
    try {
      const response = await api.post<Todo>("/api/todos", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "createTodo");
    }
  },

  // Update a todo
  async updateTodo(id: string, data: UpdateTodoDto): Promise<Todo> {
    try {
      const response = await api.put<Todo>(`/api/todos/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `updateTodo(${id})`);
    }
  },

  // Toggle todo completion status
  async toggleTodo(id: string): Promise<Todo> {
    try {
      const response = await api.patch<Todo>(`/api/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `toggleTodo(${id})`);
    }
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    try {
      await api.delete(`/api/todos/${id}`);
    } catch (error) {
      throw handleApiError(error, `deleteTodo(${id})`);
    }
  },
};

export const categoryApi = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>("/api/categories");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "getAllCategories");
    }
  },

  // Get a single category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `getCategoryById(${id})`);
    }
  },

  // Create a new category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      const response = await api.post<Category>("/api/categories", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "createCategory");
    }
  },

  // Update a category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      const response = await api.put<Category>(`/api/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `updateCategory(${id})`);
    }
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/api/categories/${id}`);
    } catch (error) {
      throw handleApiError(error, `deleteCategory(${id})`);
    }
  },
};
