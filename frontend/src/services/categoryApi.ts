import axios from "axios";
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

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const categoryApi = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>("/api/categories");
    return response.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post<Category>("/api/categories", data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },
};
