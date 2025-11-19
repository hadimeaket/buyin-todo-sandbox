import type { Todo } from "../../types/todo";
import "./CalendarEvent.scss";

interface CalendarEventProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
  variant?: "month" | "week" | "day";
}

function CalendarEvent({
  todo,
  onClick,
  variant = "month",
}: CalendarEventProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(todo);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(todo);
    }
  };

  const getEventClassName = () => {
    const baseClass = "calendar-event";
    const classes = [baseClass];

    if (todo.completed) {
      classes.push(`${baseClass}--completed`);
    } else {
      classes.push(`${baseClass}--${todo.priority}`);
    }

    classes.push(`${baseClass}--${variant}`);

    return classes.join(" ");
  };

  const getAriaLabel = () => {
    const timeStr = todo.dueDate
      ? new Date(todo.dueDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "";
    const statusStr = todo.completed
      ? "completed"
      : todo.priority + " priority";
    return `${todo.title}, ${timeStr}, ${statusStr}`;
  };

  const formatTime = () => {
    if (!todo.dueDate) return null;

    const date = new Date(todo.dueDate);

    // For all-day events
    if (todo.isAllDay) {
      return null;
    }

    // Show start time, or time range if both start and end exist
    if (todo.startTime && todo.endTime) {
      return `${todo.startTime} – ${todo.endTime}`;
    } else if (todo.startTime) {
      return todo.startTime;
    }

    // Fallback to dueDate time
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const time = formatTime();

  return (
    <div
      className={getEventClassName()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
    >
      <div className="calendar-event__content">
        {time && variant !== "month" && (
          <span className="calendar-event__time">{time}</span>
        )}
        <span className="calendar-event__title">{todo.title}</span>
      </div>
    </div>
  );
}

export default CalendarEvent;
