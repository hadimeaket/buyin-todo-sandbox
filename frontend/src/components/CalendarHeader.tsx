import "../styles/CalendarHeader.scss";

interface CalendarHeaderProps {
  currentDate: Date;
  currentView: "month" | "week" | "day";
  onViewChange: (view: "month" | "week" | "day") => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  title: string;
}

function CalendarHeader({
  currentView,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  title,
}: CalendarHeaderProps) {
  return (
    <div className="calendar-header">
      <div className="calendar-header__left">
        <button
          className="calendar-header__nav-btn"
          onClick={onPrevious}
          aria-label="Previous"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          className="calendar-header__nav-btn"
          onClick={onNext}
          aria-label="Next"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button className="calendar-header__today-btn" onClick={onToday}>
          Today
        </button>
        <h2 className="calendar-header__title">{title}</h2>
      </div>

      <div className="calendar-header__right">
        <div
          className="calendar-header__view-toggle"
          role="group"
          aria-label="View mode"
        >
          <button
            className={`calendar-header__toggle-btn ${
              currentView === "day" ? "calendar-header__toggle-btn--active" : ""
            }`}
            onClick={() => onViewChange("day")}
            aria-pressed={currentView === "day"}
          >
            Day
          </button>
          <button
            className={`calendar-header__toggle-btn ${
              currentView === "week"
                ? "calendar-header__toggle-btn--active"
                : ""
            }`}
            onClick={() => onViewChange("week")}
            aria-pressed={currentView === "week"}
          >
            Week
          </button>
          <button
            className={`calendar-header__toggle-btn ${
              currentView === "month"
                ? "calendar-header__toggle-btn--active"
                : ""
            }`}
            onClick={() => onViewChange("month")}
            aria-pressed={currentView === "month"}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarHeader;
