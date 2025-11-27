import axios, { AxiosError } from "axios";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";
import type { Attachment } from "../types/attachment";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
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

  // Get attachments for a todo
  async getAttachments(todoId: string): Promise<Attachment[]> {
    try {
      const response = await api.get<Attachment[]>(
        `/api/todos/${todoId}/attachments`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, `getAttachments(${todoId})`);
    }
  },

  // Upload attachment
  async uploadAttachment(todoId: string, file: File): Promise<Attachment> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<Attachment>(
        `/api/todos/${todoId}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, `uploadAttachment(${todoId})`);
    }
  },

  // Download attachment
  getAttachmentDownloadUrl(attachmentId: string): string {
    const token = localStorage.getItem("auth_token");
    return `${API_BASE_URL}/api/attachments/${attachmentId}/download?token=${token}`;
  },

  // Delete attachment
  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      await api.delete(`/api/attachments/${attachmentId}`);
    } catch (error) {
      throw handleApiError(error, `deleteAttachment(${attachmentId})`);
    }
  },

  // Export todos as ICS file
  async exportICS(): Promise<void> {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await api.get("/api/ics/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([response.data], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "todos.ics";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw handleApiError(error, "exportICS");
    }
  },
};
