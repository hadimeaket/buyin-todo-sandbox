import { useState, useRef, useEffect } from "react";
import "../../styles/ui/TimePicker.scss";

interface TimePickerProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
  position?: "start" | "end"; // To differentiate start time vs end time
}

function TimePicker({
  value,
  onChange,
  disabled = false,
  id,
  label,
  required = false,
  position = "start",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const currentHour = value ? parseInt(value.split(":")[0], 10) : null;
  const currentMinute = value ? parseInt(value.split(":")[1], 10) : null;

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes in 5-minute intervals (00, 05, 10, ..., 55)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && wrapperRef.current && dropdownRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdown = dropdownRef.current;

      // Use percentage-based positioning
      const topPercent = 60; // 60% from top
      let leftPercent: number;

      // Horizontal positioning based on position prop
      if (position === "start") {
        // Start time - position at 38%
        leftPercent = 38;
      } else {
        // End time - position at 68%
        leftPercent = 68;
      }

      const topPosition = (viewportHeight * topPercent) / 100;
      const leftPosition = (viewportWidth * leftPercent) / 100;

      // Calculate max height (35% of viewport height)
      const maxHeight = Math.min(320, viewportHeight * 0.35);

      // Determine visual position for animation
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
  }, [isOpen, position]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedHour(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
  };

  const handleMinuteClick = (minute: number) => {
    if (selectedHour !== null) {
      const timeString = `${String(selectedHour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      onChange(timeString);
      setIsOpen(false);
      setSelectedHour(null);
      setShowError(false);
    } else {
      // Show error if no hour selected
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return "Select time";
    return value;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSelectedHour(null);
  };

  return (
    <div className="time-picker" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="time-picker__label">
          {label}
          {required && <span className="time-picker__required">*</span>}
        </label>
      )}

      <div className="time-picker__wrapper" ref={wrapperRef}>
        <button
          id={id}
          type="button"
          className={`time-picker__input ${
            isOpen ? "time-picker__input--open" : ""
          } ${value ? "time-picker__input--has-value" : ""}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <svg
            className="time-picker__icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="time-picker__value">{formatDisplayValue()}</span>
          {value && !disabled && (
            <button
              type="button"
              className="time-picker__clear"
              onClick={handleClear}
              aria-label="Clear time"
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
            className="time-picker__chevron"
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
            className={`time-picker__dropdown time-picker__dropdown--${dropdownPosition} time-picker__dropdown--${position}`}
            ref={dropdownRef}
          >
            <div className="time-picker__columns">
              {/* Hour Column */}
              <div className="time-picker__column">
                <div className="time-picker__column-header">Hour</div>
                <div className="time-picker__options">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className={`time-picker__option ${
                        selectedHour === hour
                          ? "time-picker__option--selected"
                          : currentHour === hour && selectedHour === null
                          ? "time-picker__option--current"
                          : ""
                      }`}
                      onClick={() => handleHourClick(hour)}
                    >
                      {String(hour).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Column */}
              <div className="time-picker__column">
                <div className="time-picker__column-header">Minute</div>
                <div className="time-picker__options">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className={`time-picker__option ${
                        currentHour === selectedHour && currentMinute === minute
                          ? "time-picker__option--current"
                          : ""
                      }`}
                      onClick={() => handleMinuteClick(minute)}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Notification */}
            {showError && (
              <div className="time-picker__error">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Please select an hour first
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimePicker;
