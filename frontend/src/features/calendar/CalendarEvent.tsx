import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [showCard, setShowCard] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const timeoutRef = useRef<number | null>(null);
  const eventRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (eventRef.current) {
      const rect = eventRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setShowCard(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowCard(false);
    }, 300);
  };

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowCard(false);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      return "All Day";
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
    <>
      <div
        ref={eventRef}
        className={getEventClassName()}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={getAriaLabel()}
      >
        <div className="calendar-event__content">
          {time && variant === "day" && time !== "All Day" && (
            <span className="calendar-event__time">{time}</span>
          )}
          <span className="calendar-event__title">{todo.title}</span>
        </div>
      </div>

      {showCard &&
        coords &&
        createPortal(
          <div
            className="calendar-event-hover-card"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="calendar-event-hover-card__header">
              <div
                className={`calendar-event-hover-card__priority calendar-event-hover-card__priority--${todo.priority}`}
              >
                {todo.priority}
              </div>
              <button
                className="calendar-event-hover-card__expand"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(todo);
                  setShowCard(false);
                }}
                aria-label="Open details"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>

            <div
              className="calendar-event-hover-card__body"
              onClick={() => {
                onClick(todo);
                setShowCard(false);
              }}
            >
              <h4 className="calendar-event-hover-card__title">{todo.title}</h4>

              <div className="calendar-event-hover-card__meta">
                {time && (
                  <div className="calendar-event-hover-card__row">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{time}</span>
                  </div>
                )}

                {todo.recurrence && todo.recurrence !== "none" && (
                  <div className="calendar-event-hover-card__row">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                    <span style={{ textTransform: "capitalize" }}>
                      {todo.recurrence}
                    </span>
                  </div>
                )}
              </div>

              {todo.description && (
                <div className="calendar-event-hover-card__description">
                  {todo.description}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default CalendarEvent;
