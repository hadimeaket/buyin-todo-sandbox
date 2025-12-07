import type { Todo } from "../../types/todo";
import type { Category } from "../../types/category";
import CalendarEvent from "./CalendarEvent";
import {
  buildMonthMatrix,
  isSameMonth,
  isSameDay,
  getSingleDayTodosForDate,
  expandRecurringTodos,
  getTodoSpanInWeek,
  getMultiDayTodosForWeek,
  startOfDay,
} from "../../utils/dateUtils";
import "./MonthView.scss";

interface MonthViewProps {
  currentDate: Date;
  todos: Todo[];
  categories?: Category[];
  onTodoClick: (todo: Todo) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE_EVENTS = 3;

interface MultiDayTodoRender {
  todo: Todo;
  startIndex: number;
  spanDays: number;
  row: number;
}

function MonthView({ currentDate, todos, categories = [], onTodoClick }: MonthViewProps) {
  const monthMatrix = buildMonthMatrix(currentDate);
  const today = new Date();

  // Expand recurring todos for the entire month view
  const monthStart = monthMatrix[0][0]; // First day shown in grid
  const monthEnd = monthMatrix[monthMatrix.length - 1][6]; // Last day shown in grid
  const expandedTodos = expandRecurringTodos(todos, monthStart, monthEnd);

  // Get category color for a todo
  const getCategoryColor = (todo: Todo): string | undefined => {
    if (!todo.category_id || categories.length === 0) return undefined;
    const category = categories.find((c) => c.id === todo.category_id);
    return category?.color;
  };

  // Calculate multi-day todo layout for each week
  const getMultiDayLayout = (weekDays: Date[]): MultiDayTodoRender[] => {
    const multiDayTodos = getMultiDayTodosForWeek(expandedTodos, weekDays);
    const layout: MultiDayTodoRender[] = [];
    const occupiedRows: Map<number, Set<number>> = new Map();

    multiDayTodos.forEach((todo) => {
      const span = getTodoSpanInWeek(todo, weekDays);
      if (!span) return;

      // Find first available row
      let row = 0;
      while (true) {
        if (!occupiedRows.has(row)) {
          occupiedRows.set(row, new Set());
        }
        const occupied = occupiedRows.get(row)!;

        // Check if this row is free for all days in the span
        let canFit = true;
        for (let i = 0; i < span.spanDays; i++) {
          if (occupied.has(span.startIndex + i)) {
            canFit = false;
            break;
          }
        }

        if (canFit) {
          // Mark days as occupied
          for (let i = 0; i < span.spanDays; i++) {
            occupied.add(span.startIndex + i);
          }
          break;
        }
        row++;
      }

      layout.push({
        todo,
        startIndex: span.startIndex,
        spanDays: span.spanDays,
        row,
      });
    });

    return layout.sort((a, b) => a.row - b.row);
  };

  const renderCell = (date: Date, weekDays: Date[]) => {
    const dayTodos = getSingleDayTodosForDate(expandedTodos, date);
    const isToday = isSameDay(date, today);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const visibleTodos = dayTodos.slice(0, MAX_VISIBLE_EVENTS);
    const remainingCount = dayTodos.length - MAX_VISIBLE_EVENTS;

    const cellClass = `month-view__cell ${
      isToday ? "month-view__cell--today" : ""
    } ${!isCurrentMonth ? "month-view__cell--other-month" : ""}`;

    const dayIndex = weekDays.findIndex((d) => isSameDay(d, date));

    return (
      <div key={date.toISOString()} className={cellClass} data-day-index={dayIndex}>
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

  const renderWeek = (weekDays: Date[], weekIndex: number) => {
    const multiDayLayout = getMultiDayLayout(weekDays);

    return (
      <div key={weekIndex} className="month-view__week">
        {/* Multi-day todo bars */}
        {multiDayLayout.length > 0 && (
          <div className="month-view__multiday-container">
            {multiDayLayout.map((item) => {
              const categoryColor = getCategoryColor(item.todo);
              const style: React.CSSProperties = {
                gridColumnStart: item.startIndex + 1,
                gridColumnEnd: item.startIndex + 1 + item.spanDays,
                gridRow: item.row + 1,
              };

              return (
                <div
                  key={`${item.todo.id}-${item.startIndex}`}
                  className="month-view__multiday-bar"
                  style={style}
                  onClick={() => onTodoClick(item.todo)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTodoClick(item.todo);
                    }
                  }}
                >
                  <div
                    className={`month-view__multiday-content ${
                      categoryColor
                        ? "month-view__multiday-content--category"
                        : `month-view__multiday-content--${item.todo.priority}`
                    }`}
                    style={categoryColor ? { backgroundColor: categoryColor } : undefined}
                    data-completed={item.todo.completed}
                  >
                    <span className="month-view__multiday-title">
                      {item.todo.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Day cells */}
        <div className="month-view__week-cells">
          {weekDays.map((date) => renderCell(date, weekDays))}
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
        {monthMatrix.map((week, weekIndex) => renderWeek(week, weekIndex))}
      </div>
    </div>
  );
}

export default MonthView;
