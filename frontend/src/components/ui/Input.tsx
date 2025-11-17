import type { InputHTMLAttributes } from "react";
import "../../styles/ui/Input.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="input">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input__field ${
          error ? "input__field--error" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="input__error">{error}</p>}
    </div>
  );
}

export default Input;
