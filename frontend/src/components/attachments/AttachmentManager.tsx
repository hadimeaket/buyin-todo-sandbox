import { useState, useRef } from "react";
import type { Todo, TodoAttachment } from "../../types/todo";
import {
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
  validateFile,
  formatFileSize,
} from "../../services/attachmentApi";
import "./AttachmentManager.scss";

interface AttachmentManagerProps {
  todo: Todo;
  onUpdate: (updatedTodo: Todo) => void;
  disabled?: boolean;
}

export default function AttachmentManager({
  todo,
  onUpdate,
  disabled = false,
}: AttachmentManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Upload file
    setUploading(true);
    try {
      const updatedTodo = await uploadAttachment(todo.id, file);
      onUpdate(updatedTodo);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: TodoAttachment) => {
    try {
      await downloadAttachment(
        todo.id,
        attachment.id,
        attachment.originalFilename
      );
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download file");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      const updatedTodo = await deleteAttachment(todo.id, attachmentId);
      onUpdate(updatedTodo);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete attachment");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    } else if (mimeType === "application/pdf") {
      return "📄";
    }
    return "📎";
  };

  return (
    <div className="attachment-manager">
      <div className="attachment-manager__header">
        <h4 className="attachment-manager__title">Attachments</h4>
        <div className="attachment-manager__upload-btn">
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="attachment-manager__file-input"
          />
          <button
            type="button"
            className="attachment-manager__btn"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "+ Add File"}
          </button>
        </div>
      </div>

      {error && (
        <div className="attachment-manager__error">
          <span className="attachment-manager__error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="attachment-manager__hint">
        Accepted formats: PNG, JPEG, PDF (max 5MB)
      </div>

      {todo.attachments && todo.attachments.length > 0 && (
        <div className="attachment-manager__list">
          {todo.attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <div className="attachment-item__icon">
                {getFileIcon(attachment.mimeType)}
              </div>
              <div className="attachment-item__info">
                <div className="attachment-item__name">
                  {attachment.originalFilename}
                </div>
                <div className="attachment-item__size">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
              <div className="attachment-item__actions">
                <button
                  type="button"
                  className="attachment-item__btn attachment-item__btn--download"
                  onClick={() => handleDownload(attachment)}
                  disabled={disabled}
                  title="Download"
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  className="attachment-item__btn attachment-item__btn--delete"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={disabled}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
