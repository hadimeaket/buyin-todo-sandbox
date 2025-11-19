import type { Todo } from "../../types/todo";
import Checkbox from "../../components/ui/Checkbox";
import "./TodoItem.scss";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

function TodoItem({ todo, onToggle, onDelete, onViewDetails }: TodoItemProps) {
  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;

    // For date ranges, use the end date for overdue calculation
    const relevantDate =
      todo.dueEndDate && todo.dueEndDate !== todo.dueDate
        ? new Date(todo.dueEndDate)
        : new Date(todo.dueDate);

    // Compare at start of day to avoid time zone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    relevantDate.setHours(0, 0, 0, 0);

    return relevantDate < today;
  };

  const formatDueDate = (dateString?: string, endDateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // If there's an end date and it's different, show range (don't show time for ranges)
    if (endDateString && endDateString !== dateString) {
      const startStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endDate = new Date(endDateString);
      const endStr = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${startStr} - ${endStr}`;
    }

    // Don't show time for all-day events
    if (todo.isAllDay) {
      if (diffDays < 0) {
        return `Overdue`;
      } else if (diffDays === 0) {
        return `Today`;
      } else if (diffDays === 1) {
        return `Tomorrow`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays < 0) {
      return `Overdue`;
    } else if (diffDays === 0) {
      return `Today ${timeStr}`;
    } else if (diffDays === 1) {
      return `Tomorrow ${timeStr}`;
    } else if (diffDays < 7) {
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "short",
      });
      return `${dayName} ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${dateStr} ${timeStr}`;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "todo-item__priority-badge--high";
      case "medium":
        return "todo-item__priority-badge--medium";
      case "low":
        return "todo-item__priority-badge--low";
      default:
        return "todo-item__priority-badge--default";
    }
  };

  const dueDateText = formatDueDate(todo.dueDate, todo.dueEndDate);

  return (
    <div
      className={`todo-item ${todo.completed ? "todo-item--completed" : ""}`}
    >
      <div className="todo-item__container">
        {/* Left Side: Checkbox + Text Content */}
        <div className="todo-item__left">
          {/* Checkbox */}
          <div className="todo-item__checkbox-wrapper">
            <Checkbox
              id={`todo-${todo.id}`}
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              aria-label={`Mark "${todo.title}" as ${
                todo.completed ? "incomplete" : "complete"
              }`}
            />
          </div>

          {/* Text Content */}
          <div
            className="todo-item__content"
            onClick={() => onViewDetails(todo)}
          >
            {/* Title */}
            <div
              className={`todo-item__title ${
                todo.completed ? "todo-item__title--completed" : ""
              }`}
            >
              {todo.title}
            </div>

            {/* Description */}
            {todo.description && (
              <p className="todo-item__description">{todo.description}</p>
            )}
          </div>
        </div>

        {/* Right Side: Metadata and Actions */}
        <div className="todo-item__right">
          {/* Metadata */}
          <div className="todo-item__metadata">
            {/* Priority Badge */}
            <span
              className={`todo-item__priority-badge ${getPriorityClass(
                todo.priority
              )}`}
            >
              {todo.priority}
            </span>

            {/* Due Date */}
            {dueDateText && (
              <div
                className={`todo-item__due-date ${
                  isOverdue() && !todo.completed
                    ? "todo-item__due-date--overdue"
                    : ""
                }`}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  className={`todo-item__due-date-text ${
                    isOverdue() && !todo.completed
                      ? "todo-item__due-date-text--overdue"
                      : ""
                  }`}
                >
                  {dueDateText}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="todo-item__actions">
            {/* Edit Button */}
            <button
              className="todo-item__edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(todo);
              }}
              aria-label={`Edit "${todo.title}"`}
              title="Edit task"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              className="todo-item__delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
              aria-label={`Delete "${todo.title}"`}
              title="Delete task"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
