import type { Todo } from "../../types/todo";
import type { Category } from "../../types/category";
import CalendarEvent from "./CalendarEvent";
import MultiDayEventBar from "./MultiDayEventBar";
import {
  buildMonthMatrix,
  isSameMonth,
  isSameDay,
  getTodosForDate,
  expandRecurringTodos,
  startOfDay,
} from "../../utils/dateUtils";
import "./MonthView.scss";

interface MonthViewProps {
  currentDate: Date;
  todos: Todo[];
  categories: Category[];
  onTodoClick: (todo: Todo) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_EVENTS = 3;

// Helper to check if a todo is multi-day
function isMultiDayTodo(todo: Todo): boolean {
  if (!todo.dueDate || !todo.dueEndDate) return false;
  const start = new Date(todo.dueDate);
  const end = new Date(todo.dueEndDate);
  return !isSameDay(start, end);
}

// Helper to get the category color for a todo
function getCategoryColor(
  todo: Todo,
  categories: Category[]
): string | undefined {
  if (!todo.categoryId) return undefined;
  const category = categories.find((c) => c.id === todo.categoryId);
  return category?.color;
}

function MonthView({
  currentDate,
  todos,
  categories,
  onTodoClick,
}: MonthViewProps) {
  const monthMatrix = buildMonthMatrix(currentDate);
  const today = new Date();

  // Expand recurring todos for the entire month view
  const monthStart = monthMatrix[0][0]; // First day shown in grid
  const monthEnd = monthMatrix[monthMatrix.length - 1][6]; // Last day shown in grid
  const expandedTodos = expandRecurringTodos(todos, monthStart, monthEnd);

  const renderCell = (date: Date) => {
    // Only show single-day events in cells (multi-day events are rendered as bars)
    const dayTodos = getTodosForDate(expandedTodos, date).filter(
      (todo) => !isMultiDayTodo(todo)
    );
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

  // Render multi-day events for a week
  const renderMultiDayEvents = (week: Date[]) => {
    const multiDayTodos = expandedTodos.filter((todo) => isMultiDayTodo(todo));

    // Filter to only show events that overlap with this week
    const weekStart = startOfDay(week[0]);
    const weekEnd = startOfDay(week[6]);

    const relevantTodos = multiDayTodos.filter((todo) => {
      const todoStart = startOfDay(new Date(todo.dueDate!));
      const todoEnd = startOfDay(new Date(todo.dueEndDate!));
      return todoEnd >= weekStart && todoStart <= weekEnd;
    });

    return relevantTodos.map((todo) => (
      <MultiDayEventBar
        key={`${todo.id}-${week[0].toISOString()}`}
        todo={todo}
        weekDays={week}
        categoryColor={getCategoryColor(todo, categories)}
        onClick={onTodoClick}
      />
    ));
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
          <div key={weekIndex} className="month-view__week-container">
            {/* Multi-day event bars */}
            <div className="month-view__multi-day-events">
              {renderMultiDayEvents(week)}
            </div>
            {/* Regular week grid with cells */}
            <div className="month-view__week">
              {week.map((date) => renderCell(date))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthView;
