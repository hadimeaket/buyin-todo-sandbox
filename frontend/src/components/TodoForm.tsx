import { useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
  onAdd: (title: string) => void;
  disabled?: boolean;
}

function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") {
      return;
    }

    onAdd(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-input-section">
      <input
        type="text"
        placeholder="Enter a new todo..."
        className="todo-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" className="add-button" disabled={disabled}>
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;
