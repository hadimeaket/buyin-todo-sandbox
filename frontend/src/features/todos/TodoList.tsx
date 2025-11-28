import type { Todo } from "../../types/todo";
import type { Category } from "../../types/category";
import TodoItem from "./TodoItem";
import "./TodoList.scss";

interface TodoListProps {
  todos: Todo[];
  categories?: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

interface GroupedTodos {
  date: string;
  displayDate: string;
  todos: Todo[];
}

function TodoList({
  todos,
  categories = [],
  onToggle,
  onDelete,
  onViewDetails,
}: TodoListProps) {
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

  // Group todos by date
  const groupedTodos: GroupedTodos[] = todos.reduce(
    (groups: GroupedTodos[], todo) => {
      const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
      const dateKey = dueDate ? dueDate.toISOString().split("T")[0] : "no-date";

      // Format display date
      let displayDate = "No Due Date";
      if (dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const taskDate = new Date(dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
          displayDate = "Today";
        } else if (taskDate.getTime() === tomorrow.getTime()) {
          displayDate = "Tomorrow";
        } else if (taskDate.getTime() < today.getTime()) {
          displayDate = "Overdue";
        } else {
          displayDate = dueDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
        }
      }

      const existingGroup = groups.find((g) => g.date === dateKey);
      if (existingGroup) {
        existingGroup.todos.push(todo);
      } else {
        groups.push({
          date: dateKey,
          displayDate,
          todos: [todo],
        });
      }

      return groups;
    },
    []
  );

  // Sort groups by date (earliest first, no-date last)
  groupedTodos.sort((a, b) => {
    if (a.date === "no-date") return 1;
    if (b.date === "no-date") return -1;
    return a.date.localeCompare(b.date);
  });

  // Sort todos within each group by time
  groupedTodos.forEach((group) => {
    group.todos.sort((a, b) => {
      const timeA = a.startTime || "00:00";
      const timeB = b.startTime || "00:00";
      return timeA.localeCompare(timeB);
    });
  });

  return (
    <div className="todo-list">
      {groupedTodos.map((group) => (
        <div key={group.date} className="todo-list__group">
          <div className="todo-list__group-title">{group.displayDate}</div>
          <div className="todo-list__group-items">
            {group.todos.map((todo) => {
              const category = categories.find(
                (cat) => cat.id === todo.categoryId
              );
              return (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  category={category}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TodoList;
