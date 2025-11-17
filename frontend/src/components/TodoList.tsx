import type { Todo } from "../types/todo";
import TodoItem from "./TodoItem";
import "../styles/TodoList.scss";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

function TodoList({ todos, onToggle, onDelete, onViewDetails }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="todo-list__empty">
        {/* Icon */}
        <div className="todo-list__empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        {/* Title */}
        <div className="todo-list__empty-title">No tasks yet</div>
        {/* Subtitle */}
        <div className="todo-list__empty-subtitle">
          Create your first task to get started
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

export default TodoList;
