import React, { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { attachmentApi } from "../../services/attachmentApi";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
} from "../../types/attachment";
import "./AttachmentUpload.scss";

interface AttachmentUploadProps {
  todoId: string;
  onUploadComplete: () => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  todoId,
  onUploadComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Only PNG, JPG, and PDF files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit.`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await attachmentApi.uploadAttachment(todoId, file);
      onUploadComplete();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload attachment"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="attachment-upload">
      <div
        className={`attachment-upload__dropzone ${
          isDragging ? "attachment-upload__dropzone--dragging" : ""
        } ${isUploading ? "attachment-upload__dropzone--uploading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={isUploading}
        />
        <div className="attachment-upload__icon">📎</div>
        <div className="attachment-upload__text">
          {isUploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <span className="attachment-upload__text-primary">
                Click to upload or drag and drop
              </span>
              <span className="attachment-upload__text-secondary">
                PNG, JPG, PDF (max {formatFileSize(MAX_FILE_SIZE)})
              </span>
            </>
          )}
        </div>
      </div>
      {error && <div className="attachment-upload__error">{error}</div>}
    </div>
  );
};
