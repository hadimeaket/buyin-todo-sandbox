import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateTodoDto } from "../types/todo";

interface TodoFormProps {
  onAdd: (data: CreateTodoDto) => void;
  disabled?: boolean;
}

function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setShowAdvanced(false);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-main">
        <input
          type="text"
          placeholder="What needs to be done?"
          className="todo-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="toggle-advanced-button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={disabled}
          title={showAdvanced ? "Hide details" : "Show details"}
        >
          {showAdvanced ? "−" : "+"}
        </button>
        <button type="submit" className="add-button" disabled={disabled}>
          Add
        </button>
      </div>

      {showAdvanced && (
        <div className="form-advanced">
          <div className="form-group">
            <textarea
              placeholder="Add a description (optional)..."
              className="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={disabled}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                disabled={disabled}
                className="priority-select"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={disabled}
                className="date-input"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default TodoForm;
