import type { Todo } from "../types/todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

function TodoList({ todos, onToggle, onDelete, onViewDetails }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="todo-list empty">
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>No todos yet</h3>
          <p>Add a new todo to get started!</p>
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
