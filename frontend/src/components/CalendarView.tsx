import { useState } from "react";
import type { Todo, UpdateTodoDto } from "../types/todo";
import CalendarHeader from "./CalendarHeader";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import {
  formatMonthYear,
  formatWeekRange,
  formatDayFull,
  addMonths,
  addWeeks,
  addDays,
  startOfWeek,
} from "../utils/dateUtils";
import "../styles/CalendarView.scss";

interface CalendarViewProps {
  todos: Todo[];
  onUpdateTodo: (id: string, data: UpdateTodoDto) => Promise<void>;
  onTodoClick: (todo: Todo) => void;
}

function CalendarView({ todos, onTodoClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">(
    "month"
  );

  const getTitle = (): string => {
    switch (currentView) {
      case "month":
        return formatMonthYear(currentDate);
      case "week":
        return formatWeekRange(startOfWeek(currentDate));
      case "day":
        return formatDayFull(currentDate);
      default:
        return "";
    }
  };

  const handlePrevious = () => {
    switch (currentView) {
      case "month":
        setCurrentDate(addMonths(currentDate, -1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (view: "month" | "week" | "day") => {
    setCurrentView(view);
  };

  return (
    <div className="calendar-view">
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        title={getTitle()}
      />

      <div className="calendar-view__content">
        {currentView === "month" && (
          <MonthView
            currentDate={currentDate}
            todos={todos}
            onTodoClick={onTodoClick}
          />
        )}
        {currentView === "week" && (
          <WeekView
            currentDate={currentDate}
            todos={todos}
            onTodoClick={onTodoClick}
          />
        )}
        {currentView === "day" && (
          <DayView
            currentDate={currentDate}
            todos={todos}
            onTodoClick={onTodoClick}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarView;
