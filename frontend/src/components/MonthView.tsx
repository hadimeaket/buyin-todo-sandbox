import type { Todo } from "../types/todo";
import CalendarEvent from "./CalendarEvent";
import {
  buildMonthMatrix,
  isSameMonth,
  isSameDay,
  getTodosForDate,
  expandRecurringTodos,
} from "../utils/dateUtils";
import "../styles/MonthView.scss";

interface MonthViewProps {
  currentDate: Date;
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_EVENTS = 3;

function MonthView({ currentDate, todos, onTodoClick }: MonthViewProps) {
  const monthMatrix = buildMonthMatrix(currentDate);
  const today = new Date();

  // Expand recurring todos for the entire month view
  const monthStart = monthMatrix[0][0]; // First day shown in grid
  const monthEnd = monthMatrix[monthMatrix.length - 1][6]; // Last day shown in grid
  const expandedTodos = expandRecurringTodos(todos, monthStart, monthEnd);

  const renderCell = (date: Date) => {
    const dayTodos = getTodosForDate(expandedTodos, date);
    const isToday = isSameDay(date, today);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const visibleTodos = dayTodos.slice(0, MAX_VISIBLE_EVENTS);
    const remainingCount = dayTodos.length - MAX_VISIBLE_EVENTS;

    const cellClass = `month-view__cell ${
      isToday ? "month-view__cell--today" : ""
    } ${!isCurrentMonth ? "month-view__cell--other-month" : ""}`;

    return (
      <div key={date.toISOString()} className={cellClass}>
        <div className="month-view__date">{date.getDate()}</div>
        <div className="month-view__events">
          {visibleTodos.map((todo) => (
            <CalendarEvent
              key={todo.id}
              todo={todo}
              onClick={onTodoClick}
              variant="month"
            />
          ))}
          {remainingCount > 0 && (
            <div className="month-view__more">+{remainingCount} more</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="month-view">
      {/* Weekday headers */}
      <div className="month-view__header">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="month-view__weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="month-view__grid">
        {monthMatrix.map((week, weekIndex) => (
          <div key={weekIndex} className="month-view__week">
            {week.map((date) => renderCell(date))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthView;
