import { useState, useRef, useEffect } from "react";
import "../../styles/ui/Select.scss";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  id?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

function Select({
  value,
  onChange,
  options,
  disabled = false,
  id,
  label,
  required = false,
  placeholder = "Select an option",
  hint,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="select" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="select__label">
          {label}
          {required && <span className="select__required">*</span>}
        </label>
      )}

      <div className="select__wrapper" ref={wrapperRef}>
        <button
          id={id}
          type="button"
          className={`select__input ${isOpen ? "select__input--open" : ""} ${
            value ? "select__input--has-value" : ""
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="select__value">{displayValue}</span>
          <svg
            className="select__chevron"
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
          <div className="select__dropdown">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`select__option ${
                  value === option.value ? "select__option--selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {value === option.value && (
                  <svg
                    className="select__check"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {hint && <p className="select__hint">{hint}</p>}
    </div>
  );
}

export default Select;
