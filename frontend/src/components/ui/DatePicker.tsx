import { useState, useRef, useEffect } from "react";
import "../../styles/ui/DatePicker.scss";

interface DatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  endValue?: string; // For date range (optional)
  onChange: (value: string, endValue?: string) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
  allowRange?: boolean;
}

function DatePicker({
  value,
  endValue,
  onChange,
  disabled = false,
  id,
  label,
  required = false,
  allowRange = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && wrapperRef.current && dropdownRef.current) {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdown = dropdownRef.current;

      // Use percentage-based positioning for better flexibility
      // Center the calendar with slight offset to the right
      const topPercent = 20; // 20% from top
      const leftPercent = 60; // 60% from left

      const topPosition = (viewportHeight * topPercent) / 100;
      const leftPosition = (viewportWidth * leftPercent) / 100;

      // Calculate max height (60% of viewport height)
      const maxHeight = Math.min(480, viewportHeight * 0.6);

      // Determine visual position for animation
      const rect = wrapperRef.current.getBoundingClientRect();
      if (topPosition < rect.top) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }

      dropdown.style.top = `${topPosition}px`;
      dropdown.style.left = `${leftPosition}px`;
      dropdown.style.bottom = "auto";
      dropdown.style.maxHeight = `${maxHeight}px`;
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setRangeStart(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  };

  const generateCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Previous month days
    const prevMonthDays = daysInMonth(new Date(year, month - 1));
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayValue = () => {
    if (!value) return "Select date";

    const startDate = new Date(value + "T00:00:00");
    if (endValue) {
      const end = new Date(endValue + "T00:00:00");
      return `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isDateInRange = (dateStr: string): boolean => {
    if (!value) return false;
    if (!endValue) return dateStr === value;

    return dateStr >= value && dateStr <= endValue;
  };

  const isDateRangeEdge = (dateStr: string): boolean => {
    return dateStr === value || dateStr === endValue;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToISO(date);

    if (allowRange) {
      if (!rangeStart) {
        // First click - set range start
        setRangeStart(dateStr);
      } else {
        // Second click - complete range
        const start = rangeStart < dateStr ? rangeStart : dateStr;
        const end = rangeStart < dateStr ? dateStr : rangeStart;

        if (start === end) {
          // Same day selected, treat as single date
          onChange(dateStr);
        } else {
          // Range selected
          onChange(start, end);
        }

        setRangeStart(null);
        setIsOpen(false);
      }
    } else {
      // Single date selection
      onChange(dateStr);
      setIsOpen(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (!allowRange) {
      onChange(formatDateToISO(today));
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setRangeStart(null);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const calendar = generateCalendar();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="date-picker" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="date-picker__label">
          {label}
          {required && <span className="date-picker__required">*</span>}
        </label>
      )}

      <div className="date-picker__wrapper" ref={wrapperRef}>
        <button
          id={id}
          type="button"
          className={`date-picker__input ${
            isOpen ? "date-picker__input--open" : ""
          } ${value ? "date-picker__input--has-value" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <svg
            className="date-picker__icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="date-picker__value">{formatDisplayValue()}</span>
          {value && !disabled && (
            <button
              type="button"
              className="date-picker__clear"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <svg
            className="date-picker__chevron"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`date-picker__dropdown date-picker__dropdown--${dropdownPosition}`}
          >
            {/* Calendar Header */}
            <div className="date-picker__header">
              <button
                type="button"
                className="date-picker__nav-btn"
                onClick={handlePreviousMonth}
                aria-label="Previous month"
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

              <div className="date-picker__month-year">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <button
                type="button"
                className="date-picker__nav-btn"
                onClick={handleNextMonth}
                aria-label="Next month"
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
            </div>

            {/* Week Days */}
            <div className="date-picker__weekdays">
              {weekDays.map((day) => (
                <div key={day} className="date-picker__weekday">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="date-picker__calendar">
              {calendar.map((item, index) => {
                const dateStr = formatDateToISO(item.date);
                const isSelected = isDateInRange(dateStr);
                const isEdge = isDateRangeEdge(dateStr);
                const isRangeStarting = rangeStart === dateStr;

                return (
                  <button
                    key={index}
                    type="button"
                    className={`date-picker__day ${
                      !item.isCurrentMonth
                        ? "date-picker__day--other-month"
                        : ""
                    } ${isSelected ? "date-picker__day--selected" : ""} ${
                      isEdge ? "date-picker__day--edge" : ""
                    } ${
                      isRangeStarting ? "date-picker__day--range-start" : ""
                    } ${isToday(item.date) ? "date-picker__day--today" : ""}`}
                    onClick={() => handleDateClick(item.date)}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="date-picker__footer">
              <button
                type="button"
                className="date-picker__today-btn"
                onClick={handleToday}
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatePicker;
