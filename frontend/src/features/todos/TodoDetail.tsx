import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Todo, UpdateTodoDto } from "../../types/todo";
import type { Attachment } from "../../types/attachment";
import {
  isValidMimeType,
  isValidFileSize,
  formatFileSize,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "../../types/attachment";
import { todoApi } from "../../services/todoApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DatePicker from "../../components/ui/DatePicker";
import TimePicker from "../../components/ui/TimePicker";
import Checkbox from "../../components/ui/Checkbox";
import "./TodoDetail.scss";

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateTodoDto) => Promise<void>;
}

function TodoDetail({ todo, onClose, onUpdate }: TodoDetailProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    todo.priority
  );
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? todo.dueDate.substring(0, 10) : ""
  );
  const [dueEndDate, setDueEndDate] = useState(
    todo.dueEndDate ? todo.dueEndDate.substring(0, 10) : ""
  );
  const [isAllDay, setIsAllDay] = useState(todo.isAllDay ?? false);
  const [startTime, setStartTime] = useState(todo.startTime || "");
  const [endTime, setEndTime] = useState(todo.endTime || "");
  const [recurrence, setRecurrence] = useState<
    "none" | "daily" | "weekly" | "monthly" | "yearly"
  >(todo.recurrence || "none");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Attachment state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDeletingAttachment, setIsDeletingAttachment] = useState<
    string | null
  >(null);

  // Auto-set all-day when date range is selected and disable recurrence
  useEffect(() => {
    if (dueDate && dueEndDate && dueDate !== dueEndDate) {
      setIsAllDay(true);
      // Can't have both multi-day range and recurrence
      if (recurrence !== "none") {
        setRecurrence("none");
      }
    }
  }, [dueDate, dueEndDate, recurrence]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Load attachments
  useEffect(() => {
    const loadAttachments = async () => {
      try {
        const data = await todoApi.getAttachments(todo.id);
        setAttachments(data);
      } catch (error) {
        console.error("Failed to load attachments:", error);
      }
    };
    loadAttachments();
  }, [todo.id]);

  const isFormValid = (): boolean => {
    // Check title
    if (!title.trim()) {
      return false;
    }

    // Check time validation if not all-day
    if (!isAllDay && startTime && endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      await onUpdate(todo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        dueEndDate: dueEndDate || undefined,
        isAllDay,
        startTime: !isAllDay && startTime ? startTime : undefined,
        endTime: !isAllDay && endTime ? endTime : undefined,
        recurrence,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Error is handled by parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.substring(0, 10) : "");
    setDueEndDate(todo.dueEndDate ? todo.dueEndDate.substring(0, 10) : "");
    setIsAllDay(todo.isAllDay ?? true);
    setStartTime(todo.startTime || "");
    setEndTime(todo.endTime || "");
    setRecurrence(todo.recurrence || "none");
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset errors
    setUploadError("");

    // Validate file type
    if (!isValidMimeType(file.type)) {
      setUploadError(
        `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed.`
      );
      e.target.value = ""; // Reset file input
      return;
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      setUploadError(
        `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
      );
      e.target.value = ""; // Reset file input
      return;
    }

    setIsUploadingFile(true);
    try {
      const attachment = await todoApi.uploadAttachment(todo.id, file);
      setAttachments((prev) => [...prev, attachment]);
      e.target.value = ""; // Reset file input
    } catch (error: any) {
      console.error("Failed to upload attachment:", error);
      setUploadError(
        error.message || "Failed to upload file. Please try again."
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    setIsDeletingAttachment(attachmentId);
    try {
      await todoApi.deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      alert("Failed to delete attachment. Please try again.");
    } finally {
      setIsDeletingAttachment(null);
    }
  };

  const handleDownloadAttachment = (attachmentId: string) => {
    const url = todoApi.getAttachmentDownloadUrl(attachmentId);
    window.open(url, "_blank");
  };

  const formatDate = (
    dateString?: string,
    endDateString?: string,
    isAllDay?: boolean,
    startTime?: string,
    endTime?: string
  ) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // If there's an end date and it's different, show range
    if (endDateString && endDateString !== dateString) {
      const endDate = new Date(endDateString);
      const endDateStr = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${dateStr} - ${endDateStr} (Multi-day)`;
    }

    if (isAllDay) {
      return `${dateStr} (All day)`;
    } else if (startTime && endTime) {
      return `${dateStr} from ${startTime} to ${endTime}`;
    } else if (startTime) {
      return `${dateStr} at ${startTime}`;
    }
    return dateStr;
  };

  const formatRecurrence = (rec?: string) => {
    if (!rec || rec === "none") return "Does not repeat";
    return rec.charAt(0).toUpperCase() + rec.slice(1);
  };

  return (
    <div className="todo-detail__overlay" onClick={onClose}>
      <Card
        className="todo-detail__modal"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="todo-detail__header">
          <h2 className="todo-detail__title">Task Details</h2>
          <button
            className="todo-detail__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Edit Mode */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="todo-detail__form">
            {/* Title Field */}
            <div className="todo-detail__field">
              <label htmlFor="edit-title" className="todo-detail__label">
                Task name
              </label>
              <input
                id="edit-title"
                type="text"
                className="todo-detail__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSaving}
                placeholder="Enter task name"
              />
            </div>

            {/* Description Field */}
            <div className="todo-detail__field">
              <label htmlFor="edit-description" className="todo-detail__label">
                Description
              </label>
              <textarea
                id="edit-description"
                className="todo-detail__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add details about this task..."
                disabled={isSaving}
              />
            </div>

            {/* Priority and Due Date Grid */}
            <div className="todo-detail__grid">
              <div className="todo-detail__field">
                <label htmlFor="edit-priority" className="todo-detail__label">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  className="todo-detail__select"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  disabled={isSaving}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <DatePicker
                id="edit-dueDate"
                label="Due date"
                value={dueDate}
                endValue={dueEndDate}
                onChange={(start, end) => {
                  setDueDate(start);
                  setDueEndDate(end || "");
                }}
                disabled={isSaving}
                allowRange={true}
              />
            </div>

            {/* Time Configuration */}
            {dueDate && (
              <div className="todo-detail__time-config">
                <Checkbox
                  id="edit-isAllDay"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  disabled={
                    isSaving ||
                    !!(dueDate && dueEndDate && dueDate !== dueEndDate)
                  }
                  label="All-day event"
                />

                {!isAllDay && (!dueEndDate || dueDate === dueEndDate) && (
                  <div className="todo-detail__grid">
                    <TimePicker
                      id="edit-startTime"
                      label="Start time"
                      value={startTime}
                      onChange={setStartTime}
                      disabled={isSaving}
                    />

                    <TimePicker
                      id="edit-endTime"
                      label="End time"
                      value={endTime}
                      onChange={setEndTime}
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Recurrence */}
            <div className="todo-detail__field">
              <label htmlFor="edit-recurrence" className="todo-detail__label">
                Recurrence
                {dueDate && dueEndDate && dueDate !== dueEndDate && (
                  <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                    {" "}
                    (disabled for date ranges)
                  </span>
                )}
              </label>
              <select
                id="edit-recurrence"
                className="todo-detail__select"
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(
                    e.target.value as
                      | "none"
                      | "daily"
                      | "weekly"
                      | "monthly"
                      | "yearly"
                  )
                }
                disabled={
                  isSaving ||
                  !!(dueDate && dueEndDate && dueDate !== dueEndDate)
                }
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="todo-detail__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving || !isFormValid()}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="todo-detail__content">
            {/* Title */}
            <div className="todo-detail__task-header">
              <h3 className="todo-detail__task-title">{todo.title}</h3>
              {todo.completed && (
                <span className="todo-detail__completed-badge">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Completed
                </span>
              )}
            </div>

            {/* Description */}
            {todo.description && (
              <div className="todo-detail__section">
                <h4 className="todo-detail__section-title">Description</h4>
                <p className="todo-detail__description">{todo.description}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="todo-detail__metadata">
              <div className="todo-detail__section">
                <h4 className="todo-detail__section-title">Priority</h4>
                <Badge variant={todo.priority}>
                  {todo.priority.charAt(0).toUpperCase() +
                    todo.priority.slice(1)}
                </Badge>
              </div>

              <div className="todo-detail__section">
                <h4 className="todo-detail__section-title">Due date</h4>
                <p className="todo-detail__due-date">
                  {formatDate(
                    todo.dueDate,
                    todo.dueEndDate,
                    todo.isAllDay,
                    todo.startTime,
                    todo.endTime
                  )}
                </p>
              </div>

              {todo.recurrence && todo.recurrence !== "none" && (
                <div className="todo-detail__section">
                  <h4 className="todo-detail__section-title">Recurrence</h4>
                  <Badge variant="low">
                    {formatRecurrence(todo.recurrence)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div className="todo-detail__section">
              <h4 className="todo-detail__section-title">Attachments</h4>

              {/* Upload Section */}
              <div className="todo-detail__upload-section">
                <label
                  htmlFor="file-upload"
                  className="todo-detail__upload-label"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                    style={{ display: "none" }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isUploadingFile}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    {isUploadingFile ? "Uploading..." : "Upload File"}
                  </Button>
                </label>
                <p className="todo-detail__upload-hint">
                  PNG, JPG, PDF (max 5MB)
                </p>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div className="todo-detail__upload-error">{uploadError}</div>
              )}

              {/* Attachments List */}
              {attachments.length > 0 ? (
                <ul className="todo-detail__attachments-list">
                  {attachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="todo-detail__attachment-item"
                    >
                      <div className="todo-detail__attachment-info">
                        <span className="todo-detail__attachment-icon">
                          {attachment.mimeType.startsWith("image/")
                            ? "🖼️"
                            : "📄"}
                        </span>
                        <div className="todo-detail__attachment-details">
                          <span className="todo-detail__attachment-name">
                            {attachment.originalFilename}
                          </span>
                          <span className="todo-detail__attachment-size">
                            {formatFileSize(attachment.fileSize)}
                          </span>
                        </div>
                      </div>
                      <div className="todo-detail__attachment-actions">
                        <button
                          type="button"
                          className="todo-detail__attachment-btn"
                          onClick={() =>
                            handleDownloadAttachment(attachment.id)
                          }
                          title="Download"
                        >
                          ⬇️
                        </button>
                        <button
                          type="button"
                          className="todo-detail__attachment-btn todo-detail__attachment-btn--delete"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                          disabled={isDeletingAttachment === attachment.id}
                          title="Delete"
                        >
                          {isDeletingAttachment === attachment.id
                            ? "..."
                            : "🗑️"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="todo-detail__no-attachments">
                  No attachments yet
                </p>
              )}
            </div>

            {/* Timestamps */}
            <div className="todo-detail__timestamps">
              <div className="todo-detail__timestamps-grid">
                <div>
                  <span className="todo-detail__timestamp-label">Created</span>
                  <p className="todo-detail__timestamp-value">
                    {new Date(todo.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <span className="todo-detail__timestamp-label">
                    Last updated
                  </span>
                  <p className="todo-detail__timestamp-value">
                    {new Date(todo.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="todo-detail__edit-section">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsEditing(true)}
                style={{ width: "100%" }}
              >
                Edit task
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default TodoDetail;
