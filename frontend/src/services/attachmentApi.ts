import axios from "axios";
import type { Attachment } from "../types/attachment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const attachmentApi = {
  async uploadAttachment(todoId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/todos/${todoId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async getAttachmentsByTodoId(todoId: string): Promise<Attachment[]> {
    const response = await axios.get(
      `${API_BASE_URL}/todos/${todoId}/attachments`
    );
    return response.data;
  },

  async downloadAttachment(attachmentId: string, filename: string): Promise<void> {
    const response = await axios.get(
      `${API_BASE_URL}/attachments/${attachmentId}/download`,
      {
        responseType: "blob",
      }
    );

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/attachments/${attachmentId}`);
  },
};
