import axios from "axios";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types/category";
import { tokenStorage } from "./authApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const categoryApi = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>("/api/categories");
    return response.data;
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  // Create category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post<Category>("/api/categories", data);
    return response.data;
  },

  // Update category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },
};
