import axios, { AxiosError } from "axios";
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
