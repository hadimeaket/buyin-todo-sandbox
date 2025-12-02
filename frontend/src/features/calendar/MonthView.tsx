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

interface EventSegment {
  todo: Todo;
  startCol: number;
  span: number;
  row: number;
  weekIndex: number;
}

function getDateColumnIndex(date: Date, weekStart: Date): number {
  const diff = Math.floor(
    (startOfDay(date).getTime() - startOfDay(weekStart).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diff;
}

function calculateEventSegments(
  todos: Todo[],
  monthMatrix: Date[][]
): EventSegment[] {
  const segments: EventSegment[] = [];
  const processedTodos = new Set<string>();

  monthMatrix.forEach((week, weekIndex) => {
    const weekStart = week[0];
    const weekEnd = week[6];

    // Get todos that appear in this week
    const weekTodos = todos.filter((todo) => {
      if (!todo.dueDate || processedTodos.has(`${todo.id}-${weekIndex}`)) return false;

      const todoStart = startOfDay(new Date(todo.dueDate));
      const todoEnd = todo.dueEndDate
        ? startOfDay(new Date(todo.dueEndDate))
        : todoStart;

      // Check if todo overlaps with this week
      return todoStart <= startOfDay(weekEnd) && todoEnd >= startOfDay(weekStart);
    });

    // Sort by start date, then by end date (longer events first), then by category
    weekTodos.sort((a, b) => {
      const aStart = new Date(a.dueDate!).getTime();
      const bStart = new Date(b.dueDate!).getTime();
      if (aStart !== bStart) return aStart - bStart;

      const aEnd = a.dueEndDate ? new Date(a.dueEndDate).getTime() : aStart;
      const bEnd = b.dueEndDate ? new Date(b.dueEndDate).getTime() : bStart;
      if (aEnd !== bEnd) return bEnd - aEnd; // Longer events first

      return a.category.localeCompare(b.category);
    });

    // Assign rows to avoid conflicts
    const rowAssignments = new Map<number, number>(); // row -> lastUsedColumn

    weekTodos.forEach((todo) => {
      const todoStart = startOfDay(new Date(todo.dueDate!));
      const todoEnd = todo.dueEndDate
        ? startOfDay(new Date(todo.dueEndDate))
        : todoStart;

      // Calculate start column and span for this week
      const segmentStart = todoStart < startOfDay(weekStart) ? weekStart : todoStart;
      const segmentEnd = todoEnd > startOfDay(weekEnd) ? weekEnd : todoEnd;

      const startCol = getDateColumnIndex(segmentStart, weekStart);
      const endCol = getDateColumnIndex(segmentEnd, weekStart);
      const span = endCol - startCol + 1;

      // Find available row
      let row = 0;
      while (rowAssignments.has(row) && rowAssignments.get(row)! >= startCol) {
        row++;
      }

      rowAssignments.set(row, endCol);
      processedTodos.add(`${todo.id}-${weekIndex}`);

      segments.push({
        todo,
        startCol,
        span,
        row,
        weekIndex,
      });
    });
  });

  return segments;
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

  // Calculate event segments for spanning
  const eventSegments = calculateEventSegments(expandedTodos, monthMatrix);

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

  const renderEventSegment = (segment: EventSegment) => {
    const categoryConfig = getCategoryConfig(segment.todo.category);
    const isCompleted = segment.todo.completed;
    
    const style: React.CSSProperties = {
      gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
      top: `${2.5 + segment.row * 1.5}rem`,
      backgroundColor: isCompleted ? '#e5e7eb' : categoryConfig.bgColor,
      borderLeft: `3px solid ${isCompleted ? '#9ca3af' : categoryConfig.color}`,
      opacity: isCompleted ? 0.6 : 1,
    };

    return (
      <div
        key={`${segment.todo.id}-${segment.weekIndex}-${segment.row}`}
        className="month-view__event-span"
        style={style}
        onClick={() => onTodoClick(segment.todo)}
      >
        <span className="month-view__event-title">
          {isCompleted && <span className="month-view__event-check">✓ </span>}
          {segment.todo.title}
        </span>
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
            {/* Render event spans for this week */}
            <div className="month-view__events-layer">
              {eventSegments
                .filter((seg) => seg.weekIndex === weekIndex)
                .map(renderEventSegment)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthView;
