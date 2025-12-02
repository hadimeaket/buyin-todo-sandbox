import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];

export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size exceeds 5MB limit",
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only PNG, JPEG, and PDF files are allowed",
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );
  if (!hasValidExtension) {
    return {
      valid: false,
      error:
        "Invalid file extension. Only .png, .jpg, .jpeg, and .pdf are allowed",
    };
  }

  return { valid: true };
};

export const uploadAttachment = async (todoId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/todos/${todoId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const downloadAttachment = async (
  todoId: string,
  attachmentId: string,
  originalFilename: string
) => {
  const response = await api.get(
    `/api/todos/${todoId}/attachments/${attachmentId}`,
    {
      responseType: "blob",
    }
  );

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", originalFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteAttachment = async (
  todoId: string,
  attachmentId: string
) => {
  const response = await api.delete(
    `/api/todos/${todoId}/attachments/${attachmentId}`
  );
  return response.data;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
