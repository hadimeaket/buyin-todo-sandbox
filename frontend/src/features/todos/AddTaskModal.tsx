import { useState, useEffect, useRef } from "react";
import type { CreateTodoDto, Todo } from "../../types/todo";
import DatePicker from "../../components/ui/DatePicker";
import TimePicker from "../../components/ui/TimePicker";
import Select from "../../components/ui/Select";
import "./AddTaskModal.scss";

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (data: CreateTodoDto) => Promise<void>;
  disabled?: boolean;
  existingTodos?: Todo[];
}

export default function AddTaskModal({
  onClose,
  onAdd,
  disabled,
  existingTodos = [],
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueEndDate, setDueEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Todo[]>([]);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Handle title change with autocomplete
  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (value.trim().length >= 2) {
      const matches = existingTodos.filter((todo) =>
        todo.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Autofill form with selected todo
  const handleSelectSuggestion = (todo: Todo) => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.substring(0, 10) : "");
    setDueEndDate(todo.dueEndDate ? todo.dueEndDate.substring(0, 10) : "");
    setIsAllDay(todo.isAllDay ?? false);
    setStartTime(todo.startTime || "");
    setEndTime(todo.endTime || "");
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (start: string, end?: string) => {
    setDueDate(start);
    setDueEndDate(end || "");

    // Automatically set to all-day when a date range is selected
    if (end && end !== start) {
      setIsAllDay(true);
    }
  };

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);

    // If unchecking all-day and a range is selected, remove the range
    if (!checked && dueEndDate && dueEndDate !== dueDate) {
      setDueEndDate("");
    }
  };

  const isFormValid = (): boolean => {
    // Check title
    if (!title.trim()) {
      return false;
    }

    // Check description (required)
    if (!description.trim()) {
      return false;
    }

    // Check date (required)
    if (!dueDate) {
      return false;
    }

    // Check time if not all-day (required)
    if (!isAllDay) {
      if (!startTime || !endTime) {
        return false;
      }

      // Validate end time is after start time
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const todoData: CreateTodoDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        dueEndDate: dueEndDate || undefined,
        isAllDay,
        startTime: !isAllDay && startTime ? startTime : undefined,
        endTime: !isAllDay && endTime ? endTime : undefined,
      };

      await onAdd(todoData);
      onClose();
    } catch (error) {
      console.error("Failed to add task:", error);
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task-modal__overlay" onClick={onClose}>
      <div
        className="add-task-modal__modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-task-modal__header">
          <h2 className="add-task-modal__title">Add New Task</h2>
          <button
            onClick={onClose}
            className="add-task-modal__close-btn"
            aria-label="Close"
            type="button"
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
        </div>

        <form onSubmit={handleSubmit} className="add-task-modal__form">
          {/* Title with Autocomplete - Full Width */}
          <div
            className="add-task-modal__field add-task-modal__field--autocomplete add-task-modal__field--full-width"
            ref={titleInputRef}
          >
            <label htmlFor="title" className="add-task-modal__label">
              Title <span className="add-task-modal__required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter task title..."
              className="add-task-modal__input"
              disabled={disabled || isSubmitting}
              required
              autoFocus
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="add-task-modal__suggestions">
                {filteredSuggestions.map((todo) => (
                  <button
                    key={todo.id}
                    type="button"
                    className="add-task-modal__suggestion"
                    onClick={() => handleSelectSuggestion(todo)}
                  >
                    <div className="add-task-modal__suggestion-title">
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div className="add-task-modal__suggestion-desc">
                        {todo.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description - Full Width */}
          <div className="add-task-modal__field add-task-modal__field--full-width">
            <label htmlFor="description" className="add-task-modal__label">
              Description <span className="add-task-modal__required">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="add-task-modal__textarea"
              disabled={disabled || isSubmitting}
              rows={2}
              required
            />
          </div>

          {/* Priority */}
          <div className="add-task-modal__field">
            <Select
              id="priority"
              label="Priority"
              value={priority}
              onChange={(value) =>
                setPriority(value as "low" | "medium" | "high")
              }
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              disabled={disabled || isSubmitting}
            />
          </div>

          {/* Due Date */}
          <div className="add-task-modal__field">
            <label className="add-task-modal__label">
              Due Date <span className="add-task-modal__required">*</span>
            </label>
            <DatePicker
              value={dueDate}
              endValue={dueEndDate}
              onChange={handleDateChange}
              disabled={disabled || isSubmitting}
              allowRange={true}
            />
          </div>

          {/* All-day Event - Full Width */}
          <div className="add-task-modal__field add-task-modal__field--full-width">
            <label className="add-task-modal__checkbox-label">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => handleAllDayChange(e.target.checked)}
                disabled={disabled || isSubmitting}
              />
              <span>All-day event</span>
            </label>
          </div>

          {/* Time Fields - Full Width, side by side */}
          {!isAllDay && (
            <div className="add-task-modal__field add-task-modal__field--full-width">
              <div className="add-task-modal__time-fields">
                <div className="add-task-modal__time-field">
                  <label className="add-task-modal__label">
                    Start time{" "}
                    <span className="add-task-modal__required">*</span>
                  </label>
                  <TimePicker
                    value={startTime}
                    onChange={setStartTime}
                    disabled={disabled || isSubmitting}
                    position="start"
                  />
                </div>
                <div className="add-task-modal__time-field">
                  <label className="add-task-modal__label">
                    End time <span className="add-task-modal__required">*</span>
                  </label>
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
                    disabled={disabled || isSubmitting}
                    position="end"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="add-task-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="add-task-modal__button add-task-modal__button--secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-task-modal__button add-task-modal__button--primary"
              disabled={disabled || isSubmitting || !isFormValid()}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
