import { useState, useRef, useEffect } from "react";
import type { Attachment } from "../../types/attachment";
import { attachmentApi } from "../../services/attachmentApi";
import "./AttachmentManager.scss";

interface AttachmentManagerProps {
  todoId: string;
  onAttachmentsChange?: () => void;
}

function AttachmentManager({ todoId, onAttachmentsChange }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
  }, [todoId]);

  const fetchAttachments = async () => {
    try {
      const data = await attachmentApi.getAttachmentsByTodo(todoId);
      setAttachments(data);
    } catch (err) {
      console.error("Failed to fetch attachments:", err);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PNG, JPG, and PDF files are allowed");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      await attachmentApi.uploadAttachment(todoId, file);
      await fetchAttachments();
      onAttachmentsChange?.();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await attachmentApi.deleteAttachment(attachmentId);
      await fetchAttachments();
      onAttachmentsChange?.();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete attachment");
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const url = attachmentApi.downloadAttachment(attachment.id);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="attachment-manager">
      <div className="attachment-manager__header">
        <h3 className="attachment-manager__title">Attachments</h3>
        <button
          type="button"
          className="attachment-manager__upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "+ Add File"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>

      {error && (
        <div className="attachment-manager__error">
          {error}
        </div>
      )}

      <div className="attachment-manager__hint">
        Allowed: PNG, JPG, PDF (max 5MB)
      </div>

      {attachments.length === 0 ? (
        <div className="attachment-manager__empty">
          No attachments yet
        </div>
      ) : (
        <ul className="attachment-manager__list">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="attachment-item">
              <div className="attachment-item__icon">
                {attachmentApi.getFileIcon(attachment.mimeType)}
              </div>
              <div className="attachment-item__info">
                <div className="attachment-item__name" title={attachment.originalName}>
                  {attachment.originalName}
                </div>
                <div className="attachment-item__meta">
                  {attachmentApi.formatFileSize(attachment.size)} •{" "}
                  {new Date(attachment.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="attachment-item__actions">
                <button
                  type="button"
                  className="attachment-item__download"
                  onClick={() => handleDownload(attachment)}
                  title="Download"
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  className="attachment-item__delete"
                  onClick={() => handleDelete(attachment.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AttachmentManager;
