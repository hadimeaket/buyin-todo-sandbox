import type { Todo } from "../../types/todo";
import { isSameDay, startOfDay } from "../../utils/dateUtils";
import "./MultiDayEventBar.scss";

interface MultiDayEventBarProps {
  todo: Todo;
  weekDays: Date[];
  categoryColor?: string;
  onClick: (todo: Todo) => void;
}

function MultiDayEventBar({
  todo,
  weekDays,
  categoryColor,
  onClick,
}: MultiDayEventBarProps) {
  // Calculate which day this bar starts and ends on within the week
  const todoStart = startOfDay(new Date(todo.dueDate!));
  const todoEnd = startOfDay(new Date(todo.dueEndDate!));

  // Find the indices for this week's segment
  let startIdx = -1;
  let endIdx = -1;

  weekDays.forEach((day, idx) => {
    const dayStart = startOfDay(day);
    if (
      isSameDay(dayStart, todoStart) ||
      (dayStart > todoStart && startIdx === -1)
    ) {
      startIdx = idx;
    }
    if (isSameDay(dayStart, todoEnd)) {
      endIdx = idx;
    }
  });

  // If the event ends after this week, set endIdx to last day
  if (endIdx === -1 && todoEnd >= startOfDay(weekDays[weekDays.length - 1])) {
    endIdx = weekDays.length - 1;
  }

  // If the event starts before this week, start from first day
  if (startIdx === -1) {
    startIdx = 0;
  }

  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    return null;
  }
  const isStart = isSameDay(todoStart, weekDays[startIdx] || weekDays[0]);
  const isEnd = isSameDay(
    todoEnd,
    weekDays[endIdx] || weekDays[weekDays.length - 1]
  );

  const style: React.CSSProperties = {
    gridColumnStart: startIdx + 1,
    gridColumnEnd: endIdx + 2,
    backgroundColor: categoryColor || "var(--priority-" + todo.priority + ")",
  };

  const className = `multi-day-event-bar ${
    todo.completed ? "multi-day-event-bar--completed" : ""
  } ${isStart ? "multi-day-event-bar--start" : ""} ${
    isEnd ? "multi-day-event-bar--end" : ""
  }`;

  return (
    <div
      className={className}
      style={style}
      onClick={() => onClick(todo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(todo);
        }
      }}
      title={todo.title}
    >
      <span className="multi-day-event-bar__title">{todo.title}</span>
    </div>
  );
}

export default MultiDayEventBar;
