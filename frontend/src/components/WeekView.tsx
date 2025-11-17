import type { Todo } from "../types/todo";
import CalendarEvent from "./CalendarEvent";
import {
  buildWeekDays,
  isSameDay,
  getTodosForDate,
  generateTimeSlots,
  parseTime,
  calculateTimePosition,
  expandRecurringTodos,
} from "../utils/dateUtils";
import "../styles/WeekView.scss";

interface WeekViewProps {
  currentDate: Date;
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

const HOUR_HEIGHT = 60; // pixels per hour
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeekView({ currentDate, todos, onTodoClick }: WeekViewProps) {
  const weekDays = buildWeekDays(currentDate);
  const timeSlots = generateTimeSlots();
  const today = new Date();

  // Expand recurring todos for the week view
  const weekStart = weekDays[0];
  const weekEnd = weekDays[weekDays.length - 1];
  const expandedTodos = expandRecurringTodos(todos, weekStart, weekEnd);

  const renderTimeSlots = () => {
    return timeSlots.map((time) => (
      <div key={time} className="week-view__time-slot">
        <span className="week-view__time-label">{time}</span>
      </div>
    ));
  };

  const renderDayColumn = (date: Date) => {
    const dayTodos = getTodosForDate(expandedTodos, date);
    const isToday = isSameDay(date, today);

    // Separate all-day and timed events
    const allDayEvents = dayTodos.filter((todo) => todo.isAllDay);
    const timedEvents = dayTodos.filter((todo) => !todo.isAllDay);

    return (
      <div
        key={date.toISOString()}
        className={`week-view__day-column ${
          isToday ? "week-view__day-column--today" : ""
        }`}
      >
        {/* All-day events section */}
        {allDayEvents.length > 0 && (
          <div className="week-view__all-day-section">
            {allDayEvents.map((todo) => (
              <CalendarEvent
                key={todo.id}
                todo={todo}
                onClick={onTodoClick}
                variant="week"
              />
            ))}
          </div>
        )}

        {/* Timed events with absolute positioning */}
        <div className="week-view__timed-events">
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
                className="week-view__event-wrapper"
                style={{
                  top: `${top}px`,
                  height: `${Math.max(height, 30)}px`,
                }}
              >
                <CalendarEvent
                  todo={todo}
                  onClick={onTodoClick}
                  variant="week"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="week-view">
      {/* Header with day labels */}
      <div className="week-view__header">
        <div className="week-view__time-gutter"></div>
        {weekDays.map((date, index) => {
          const isToday = isSameDay(date, today);
          return (
            <div
              key={date.toISOString()}
              className={`week-view__day-header ${
                isToday ? "week-view__day-header--today" : ""
              }`}
            >
              <div className="week-view__day-label">
                {WEEKDAY_LABELS[index]}
              </div>
              <div
                className={`week-view__day-number ${
                  isToday ? "week-view__day-number--today" : ""
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid with time slots and events */}
      <div className="week-view__grid-container">
        <div className="week-view__grid">
          {/* Time gutter */}
          <div className="week-view__time-gutter">{renderTimeSlots()}</div>

          {/* Day columns */}
          {weekDays.map((date) => renderDayColumn(date))}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
