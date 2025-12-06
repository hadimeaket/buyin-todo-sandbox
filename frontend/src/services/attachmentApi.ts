import axios from "axios";
import type { Attachment } from "../types/attachment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/attachments`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const attachmentApi = {
  uploadAttachment: async (
    todoId: string,
    file: File
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("todoId", todoId);

    const response = await api.post<Attachment>("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  getAttachmentsByTodo: async (todoId: string): Promise<Attachment[]> => {
    const response = await api.get<Attachment[]>(`/todo/${todoId}`);
    return response.data;
  },

  downloadAttachment: (attachmentId: string): string => {
    const token = localStorage.getItem("token");
    return `${API_BASE_URL}/attachments/${attachmentId}/download?token=${token}`;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await api.delete(`/${attachmentId}`);
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getFileIcon: (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    return "📎";
  },
};
