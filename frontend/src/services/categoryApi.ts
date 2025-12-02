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

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>("/api/categories");
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post<Category>("/api/categories", data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },
};
