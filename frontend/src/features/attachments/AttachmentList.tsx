import React, { useState } from "react";
import type { Attachment } from "../../types/attachment";
import { formatFileSize, getFileIcon } from "../../types/attachment";
import { attachmentApi } from "../../services/attachmentApi";
import "./AttachmentList.scss";

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete: () => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentApi.downloadAttachment(
        attachment.id,
        attachment.originalName
      );
    } catch (error) {
      console.error("Failed to download attachment:", error);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    setDeletingId(attachmentId);
    try {
      await attachmentApi.deleteAttachment(attachmentId);
      onDelete();
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      alert("Failed to delete attachment");
    } finally {
      setDeletingId(null);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="attachment-list attachment-list--empty">
        No attachments yet
      </div>
    );
  }

  return (
    <div className="attachment-list">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={`attachment-list__item ${
            deletingId === attachment.id
              ? "attachment-list__item--deleting"
              : ""
          }`}
        >
          <div className="attachment-list__icon">
            {getFileIcon(attachment.mimeType)}
          </div>
          <div className="attachment-list__info">
            <div className="attachment-list__name">
              {attachment.originalName}
            </div>
            <div className="attachment-list__meta">
              {formatFileSize(attachment.size)} •{" "}
              {new Date(attachment.uploadedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="attachment-list__actions">
            <button
              className="attachment-list__button attachment-list__button--download"
              onClick={() => handleDownload(attachment)}
              disabled={deletingId === attachment.id}
              title="Download"
            >
              ⬇️
            </button>
            <button
              className="attachment-list__button attachment-list__button--delete"
              onClick={() => handleDelete(attachment.id)}
              disabled={deletingId === attachment.id}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
