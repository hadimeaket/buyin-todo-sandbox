import type { Todo } from "../../types/todo";
import CalendarEvent from "./CalendarEvent";
import {
  buildMonthMatrix,
  isSameMonth,
  isSameDay,
  getTodosForDate,
  expandRecurringTodos,
  startOfDay,
} from "../../utils/dateUtils";
import { getCategoryConfig } from "../../utils/categoryUtils";
import "./MonthView.scss";

interface EventSpan {
  todo: Todo;
  startDay: number; // Index in flattened month grid (0-41)
  endDay: number; // Index in flattened month grid (0-41)
  row: number;
}

function getDayIndexInGrid(date: Date, monthMatrix: Date[][]): number {
  for (let weekIdx = 0; weekIdx < monthMatrix.length; weekIdx++) {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      if (isSameDay(monthMatrix[weekIdx][dayIdx], date)) {
        return weekIdx * 7 + dayIdx;
      }
    }
  }
  return -1;
}

function calculateEventSpans(
  todos: Todo[],
  monthMatrix: Date[][]
): EventSpan[] {
  const spans: EventSpan[] = [];

  // Filter todos that have dates in the visible range
  const visibleTodos = todos.filter((todo) => {
    if (!todo.dueDate) return false;

    const todoStart = startOfDay(new Date(todo.dueDate));
    const todoEnd = todo.dueEndDate
      ? startOfDay(new Date(todo.dueEndDate))
      : todoStart;

    const gridStart = startOfDay(monthMatrix[0][0]);
    const gridEnd = startOfDay(monthMatrix[monthMatrix.length - 1][6]);

    return todoStart <= gridEnd && todoEnd >= gridStart;
  });

  // Sort by start date, then by duration (longer first)
  visibleTodos.sort((a, b) => {
    const aStart = new Date(a.dueDate!).getTime();
    const bStart = new Date(b.dueDate!).getTime();
    if (aStart !== bStart) return aStart - bStart;

    const aEnd = a.dueEndDate ? new Date(a.dueEndDate).getTime() : aStart;
    const bEnd = b.dueEndDate ? new Date(b.dueEndDate).getTime() : bStart;
    return bEnd - aEnd; // Longer events first
  });

  // Track which grid positions are occupied by which row
  const rowOccupancy: Map<number, Set<number>> = new Map(); // row -> Set of occupied day indices

  visibleTodos.forEach((todo) => {
    const todoStart = startOfDay(new Date(todo.dueDate!));
    const todoEnd = todo.dueEndDate
      ? startOfDay(new Date(todo.dueEndDate))
      : todoStart;

    // Find start and end indices in grid
    let startIdx = getDayIndexInGrid(todoStart, monthMatrix);
    let endIdx = getDayIndexInGrid(todoEnd, monthMatrix);

    // If start is before grid, start from first day
    if (startIdx === -1) {
      startIdx = 0;
    }

    // If end is after grid, end at last day
    if (endIdx === -1) {
      endIdx = monthMatrix.length * 7 - 1;
    }

    // Find available row for this event
    let row = 0;
    let foundRow = false;

    while (!foundRow) {
      if (!rowOccupancy.has(row)) {
        rowOccupancy.set(row, new Set());
      }

      const occupied = rowOccupancy.get(row)!;
      let hasConflict = false;

      // Check if any day in the range is occupied
      for (let i = startIdx; i <= endIdx; i++) {
        if (occupied.has(i)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        // Mark all days as occupied
        for (let i = startIdx; i <= endIdx; i++) {
          occupied.add(i);
        }
        foundRow = true;
      } else {
        row++;
      }
    }

    spans.push({
      todo,
      startDay: startIdx,
      endDay: endIdx,
      row,
    });
  });

  return spans;
}

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

  // Calculate event spans for rendering
  const eventSpans = calculateEventSpans(expandedTodos, monthMatrix);

  const renderCell = (date: Date) => {
    const isToday = isSameDay(date, today);
    const isCurrentMonth = isSameMonth(date, currentDate);

    const cellClass = `month-view__cell ${
      isToday ? "month-view__cell--today" : ""
    } ${!isCurrentMonth ? "month-view__cell--other-month" : ""}`;

    return (
      <div key={date.toISOString()} className={cellClass}>
        <div className="month-view__date">{date.getDate()}</div>
      </div>
    );
  };

  const renderEventSpan = (span: EventSpan) => {
    const categoryConfig = getCategoryConfig(span.todo.category);
    const isCompleted = span.todo.completed;

    // Calculate position across entire calendar grid
    const startWeek = Math.floor(span.startDay / 7);
    const endWeek = Math.floor(span.endDay / 7);
    const startCol = span.startDay % 7;
    const endCol = span.endDay % 7;

    // Calculate absolute position as percentage
    const cellWidth = 100 / 7; // Each column is 1/7 of width
    const left = startCol * cellWidth;
    const right = (6 - endCol) * cellWidth;

    // Calculate top position based on week row and event row
    // Each week is roughly 120px, dates take ~30px, then events stack at 24px each
    const top = startWeek * 120 + 30 + span.row * 24;

    const style: React.CSSProperties = {
      position: "absolute",
      left: `${left}%`,
      right: `${right}%`,
      top: `${top}px`,
      height: "20px",
      backgroundColor: isCompleted ? "#e5e7eb" : categoryConfig.bgColor,
      borderLeft: `3px solid ${isCompleted ? "#9ca3af" : categoryConfig.color}`,
      opacity: isCompleted ? 0.6 : 1,
      color: "#374151",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      zIndex: 1,
    };

    return (
      <div
        key={`${span.todo.id}-${span.row}`}
        style={style}
        onClick={() => onTodoClick(span.todo)}
        title={span.todo.title}
      >
        {isCompleted && <span style={{ marginRight: "4px" }}>✓</span>}
        {span.todo.title}
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
      <div className="month-view__grid" style={{ position: "relative" }}>
        {monthMatrix.map((week, weekIndex) => (
          <div key={weekIndex} className="month-view__week">
            {week.map((date) => renderCell(date))}
          </div>
        ))}

        {/* Render all event spans in single overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              pointerEvents: "auto",
            }}
          >
            {eventSpans.map(renderEventSpan)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthView;
