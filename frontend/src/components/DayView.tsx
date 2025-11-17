import type { Todo } from "../types/todo";
import CalendarEvent from "./CalendarEvent";
import {
  getTodosForDate,
  generateTimeSlots,
  parseTime,
  calculateTimePosition,
  expandRecurringTodos,
  startOfDay,
  endOfDay,
} from "../utils/dateUtils";
import "../styles/DayView.scss";

interface DayViewProps {
  currentDate: Date;
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

const HOUR_HEIGHT = 80; // pixels per hour (taller for day view)

function DayView({ currentDate, todos, onTodoClick }: DayViewProps) {
  // Expand recurring todos for the day view
  const dayStart = startOfDay(currentDate);
  const dayEnd = endOfDay(currentDate);
  const expandedTodos = expandRecurringTodos(todos, dayStart, dayEnd);

  const dayTodos = getTodosForDate(expandedTodos, currentDate);
  const timeSlots = generateTimeSlots();

  // Separate all-day and timed events
  const allDayEvents = dayTodos.filter((todo) => todo.isAllDay);
  const timedEvents = dayTodos.filter((todo) => !todo.isAllDay);

  const renderTimeSlots = () => {
    return timeSlots.map((time) => (
      <div key={time} className="day-view__time-slot">
        <span className="day-view__time-label">{time}</span>
        <div className="day-view__slot-line"></div>
      </div>
    ));
  };

  return (
    <div className="day-view">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="day-view__all-day-section">
          <div className="day-view__all-day-label">All day</div>
          <div className="day-view__all-day-events">
            {allDayEvents.map((todo) => (
              <CalendarEvent
                key={todo.id}
                todo={todo}
                onClick={onTodoClick}
                variant="day"
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid and events */}
      <div className="day-view__grid-container">
        <div className="day-view__grid">
          {/* Time slots */}
          <div className="day-view__time-gutter">{renderTimeSlots()}</div>

          {/* Events column */}
          <div className="day-view__events-column">
            {timedEvents.map((todo) => {
              const startTime = parseTime(todo.startTime || todo.dueDate);
              const endTime = parseTime(todo.endTime);

              if (!startTime) return null;

              const top = calculateTimePosition(startTime, HOUR_HEIGHT);
              const duration = endTime
                ? endTime.hour * 60 +
                  endTime.minute -
                  (startTime.hour * 60 + startTime.minute)
                : 60; // Default 1 hour
              const height = (duration / 60) * HOUR_HEIGHT;

              return (
                <div
                  key={todo.id}
                  className="day-view__event-wrapper"
                  style={{
                    top: `${top}px`,
                    height: `${Math.max(height, 40)}px`,
                  }}
                >
                  <CalendarEvent
                    todo={todo}
                    onClick={onTodoClick}
                    variant="day"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
