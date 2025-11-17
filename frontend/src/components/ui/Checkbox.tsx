import type { InputHTMLAttributes } from "react";
import "../../styles/ui/Checkbox.scss";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  className?: string;
}

function Checkbox({
  label,
  className = "",
  checked,
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`checkbox ${className}`}>
      <div className="checkbox__wrapper">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          className="checkbox__input"
          {...props}
        />
        <svg
          className="checkbox__checkmark"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      {label && (
        <label htmlFor={checkboxId} className="checkbox__label">
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;
