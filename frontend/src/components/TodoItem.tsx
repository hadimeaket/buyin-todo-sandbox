import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

function TodoItem({ todo, onToggle, onDelete, onViewDetails }: TodoItemProps) {
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

  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue`;
    } else if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const dueDateText = formatDueDate(todo.dueDate);

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""} ${isOverdue() ? "overdue" : ""}`}>
      <div className="todo-item-main">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
        />
        
        <div className="todo-content" onClick={() => onViewDetails(todo)}>
          <div className="todo-title-row">
            <span className="todo-title">{todo.title}</span>
            <div
              className="priority-indicator"
              style={{ backgroundColor: getPriorityColor(todo.priority) }}
              title={`Priority: ${todo.priority}`}
            />
          </div>
          
          {todo.description && (
            <div className="todo-description-preview">{todo.description}</div>
          )}
          
          {dueDateText && (
            <div className={`todo-due-date ${isOverdue() ? "overdue" : ""}`}>
              <span className="due-date-icon">🕐</span>
              {dueDateText}
            </div>
          )}
        </div>

        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          aria-label={`Delete "${todo.title}"`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TodoItem;
