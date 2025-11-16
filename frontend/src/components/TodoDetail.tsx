import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { Todo, UpdateTodoDto } from "../types/todo";

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
    todo.dueDate ? todo.dueDate.substring(0, 16) : ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onUpdate(todo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.substring(0, 16) : "");
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Todo Details</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="todo-detail-form">
            <div className="form-group">
              <label htmlFor="edit-title">Title *</label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add a description..."
                disabled={isSaving}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
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

              <div className="form-group">
                <label htmlFor="edit-dueDate">Due Date</label>
                <input
                  id="edit-dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="button-secondary"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isSaving || !title.trim()}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="todo-detail-view">
            <div className="detail-section">
              <h3>Title</h3>
              <p>{todo.title}</p>
            </div>

            {todo.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p className="description-text">{todo.description}</p>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-section">
                <h3>Priority</h3>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  {todo.priority}
                </span>
              </div>

              <div className="detail-section">
                <h3>Due Date</h3>
                <p>{formatDate(todo.dueDate)}</p>
              </div>
            </div>

            <div className="detail-section">
              <h3>Status</h3>
              <span className={`status-badge ${todo.completed ? "completed" : "pending"}`}>
                {todo.completed ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="detail-row">
              <div className="detail-section">
                <h3>Created</h3>
                <p className="date-text">
                  {new Date(todo.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="detail-section">
                <h3>Updated</h3>
                <p className="date-text">
                  {new Date(todo.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="button-primary"
              >
                Edit Todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoDetail;
