import { useState, useRef, useEffect } from "react";
import "../../styles/ui/TimePicker.scss";

interface TimePickerProps {
  value: string; // Format: "HH:MM"
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
}

function TimePicker({
  value,
  onChange,
  disabled = false,
  id,
  label,
  required = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const currentHour = value ? parseInt(value.split(":")[0], 10) : null;
  const currentMinute = value ? parseInt(value.split(":")[1], 10) : null;

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes in 5-minute intervals (00, 05, 10, ..., 55)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

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

      <div className="time-picker__wrapper">
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
          <div className="time-picker__dropdown">
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
