import axios, { type AxiosError } from "axios";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get user ID from localStorage
const getUserId = (): string | null => {
  const stored = localStorage.getItem("buyin_user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      return user.id;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper to add user ID header
const getHeaders = () => {
  const userId = getUserId();
  return userId ? { "x-user-id": userId } : {};
};

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

export const categoryApi = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>("/api/categories", {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "getAllCategories");
    }
  },

  // Get a single category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`/api/categories/${id}`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `getCategoryById(${id})`);
    }
  },

  // Create a new category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      const response = await api.post<Category>("/api/categories", data, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "createCategory");
    }
  },

  // Update a category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      const response = await api.put<Category>(`/api/categories/${id}`, data, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `updateCategory(${id})`);
    }
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/api/categories/${id}`, {
        headers: getHeaders(),
      });
    } catch (error) {
      throw handleApiError(error, `deleteCategory(${id})`);
    }
  },
};
