import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateTodoDto } from "../types/todo";
import DatePicker from "./ui/DatePicker";
import TimePicker from "./ui/TimePicker";
import Checkbox from "./ui/Checkbox";
import "../styles/TodoForm.scss";

interface TodoFormProps {
  onAdd: (data: CreateTodoDto) => void;
  disabled?: boolean;
}

function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueEndDate, setDueEndDate] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [recurrence, setRecurrence] = useState<
    "none" | "daily" | "weekly" | "monthly" | "yearly"
  >("none");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Automatically set all-day to true when multi-day range is selected
  const isMultiDay = dueDate && dueEndDate && dueDate !== dueEndDate;
  const effectiveIsAllDay = isMultiDay || isAllDay;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      return;
    }

    // Validate time: end time must be after start time
    if (!effectiveIsAllDay && startTime && endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        alert("End time must be after start time");
        return;
      }
    }

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      dueEndDate: dueEndDate || undefined,
      isAllDay: effectiveIsAllDay,
      startTime: !effectiveIsAllDay && startTime ? startTime : undefined,
      endTime: !effectiveIsAllDay && endTime ? endTime : undefined,
      recurrence: isMultiDay ? "none" : recurrence,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setDueEndDate("");
    setIsAllDay(false);
    setStartTime("");
    setEndTime("");
    setRecurrence("none");
    setShowAdvanced(false);
  };

  return (
    <div className="todo-form">
      <div className="todo-form__container">
        <form onSubmit={handleSubmit}>
          {/* Main Input Row */}
          <div className="todo-form__main-row">
            <input
              type="text"
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
              required
              className="todo-form__input"
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={disabled}
              className="todo-form__toggle-btn"
              title={showAdvanced ? "Hide options" : "Show options"}
              aria-label={showAdvanced ? "Hide options" : "Show options"}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showAdvanced ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                )}
              </svg>
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="todo-form__submit-btn"
            >
              Add task
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="todo-form__advanced">
              {/* Description */}
              <div className="todo-form__field">
                <label htmlFor="description" className="todo-form__label">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Add more details..."
                  className="todo-form__textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={disabled}
                  rows={3}
                />
              </div>

              {/* Priority and Due Date Grid */}
              <div className="todo-form__grid">
                <div className="todo-form__field">
                  <label htmlFor="priority" className="todo-form__label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    disabled={disabled}
                    className="todo-form__select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <DatePicker
                  id="dueDate"
                  label="Due date"
                  value={dueDate}
                  endValue={dueEndDate}
                  onChange={(start, end) => {
                    setDueDate(start);
                    setDueEndDate(end || "");
                  }}
                  disabled={disabled}
                  allowRange={true}
                />
              </div>

              {/* Time Configuration */}
              {dueDate && (
                <div className="todo-form__time-config">
                  <Checkbox
                    id="isAllDay"
                    checked={effectiveIsAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    disabled={
                      disabled ||
                      !!(dueDate && dueEndDate && dueDate !== dueEndDate)
                    }
                    label="All-day event"
                  />

                  {!effectiveIsAllDay &&
                    (!dueEndDate || dueDate === dueEndDate) && (
                      <div className="todo-form__grid">
                        <TimePicker
                          id="startTime"
                          label="Start time"
                          value={startTime}
                          onChange={setStartTime}
                          disabled={disabled}
                        />

                        <TimePicker
                          id="endTime"
                          label="End time"
                          value={endTime}
                          onChange={setEndTime}
                          disabled={disabled}
                        />
                      </div>
                    )}
                </div>
              )}

              {/* Recurrence */}
              <div className="todo-form__field">
                <label htmlFor="recurrence" className="todo-form__label">
                  Recurrence
                  {dueDate && dueEndDate && dueDate !== dueEndDate && (
                    <span className="todo-form__label-hint">
                      {" "}
                      (disabled for date ranges)
                    </span>
                  )}
                </label>
                <select
                  id="recurrence"
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(
                      e.target.value as
                        | "none"
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "yearly"
                    )
                  }
                  disabled={
                    disabled ||
                    !!(dueDate && dueEndDate && dueDate !== dueEndDate)
                  }
                  className="todo-form__select"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default TodoForm;
