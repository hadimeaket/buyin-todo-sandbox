import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { UIEvent } from "react";
import type { Todo } from "../../types/todo";
import type { Category } from "../../types/category";
import TodoItem from "./TodoItem";
import "./TodoList.scss";

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (todo: Todo) => void;
}

interface GroupedTodos {
  date: string;
  displayDate: string;
  todos: Todo[];
}

const ITEM_HEIGHT = 80; // Approximate height of a todo item
const OVERSCAN = 5; // Number of items to render outside viewport

function VirtualizedTodoList({ todos, categories, onToggle, onDelete, onViewDetails }: TodoListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Update container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll with throttling
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Memoize grouped todos
  const groupedTodos: GroupedTodos[] = useMemo(() => {
    const groups: GroupedTodos[] = todos.reduce(
      (acc: GroupedTodos[], todo) => {
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const dateKey = dueDate ? dueDate.toISOString().split("T")[0] : "no-date";

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

        const existingGroup = acc.find((g) => g.date === dateKey);
        if (existingGroup) {
          existingGroup.todos.push(todo);
        } else {
          acc.push({
            date: dateKey,
            displayDate,
            todos: [todo],
          });
        }

        return acc;
      },
      []
    );

    // Sort groups and todos
    groups.sort((a, b) => {
      if (a.date === "no-date") return 1;
      if (b.date === "no-date") return -1;
      return a.date.localeCompare(b.date);
    });

    groups.forEach((group) => {
      group.todos.sort((a, b) => {
        const timeA = a.startTime || "00:00";
        const timeB = b.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  }, [todos]);

  // Calculate visible range
  const { visibleItems, totalHeight } = useMemo(() => {
    const items: Array<{ type: 'header' | 'item'; groupIndex: number; todoIndex?: number; offset: number }> = [];
    let currentOffset = 0;

    groupedTodos.forEach((group, groupIndex) => {
      // Add group header
      items.push({ type: 'header', groupIndex, offset: currentOffset });
      currentOffset += 40; // Header height

      // Add todos
      group.todos.forEach((_, todoIndex) => {
        items.push({ type: 'item', groupIndex, todoIndex, offset: currentOffset });
        currentOffset += ITEM_HEIGHT;
      });
    });

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );

    return {
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: currentOffset,
    };
  }, [groupedTodos, scrollTop, containerHeight]);

  if (todos.length === 0) {
    return (
      <div className="todo-list__empty">
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
        <div className="todo-list__empty-title">No tasks yet</div>
        <div className="todo-list__empty-subtitle">
          Create your first task to get started
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="todo-list todo-list--virtualized" 
      onScroll={handleScroll}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item) => {
          if (item.type === 'header') {
            const group = groupedTodos[item.groupIndex];
            return (
              <div 
                key={`header-${item.groupIndex}`}
                className="todo-list__group-title"
                style={{
                  position: 'absolute',
                  top: item.offset,
                  left: 0,
                  right: 0,
                }}
              >
                {group.displayDate}
              </div>
            );
          } else {
            const group = groupedTodos[item.groupIndex];
            const todo = group.todos[item.todoIndex!];
            const category = categories.find((c) => c.id === todo.categoryId);
            
            return (
              <div
                key={`item-${todo.id}`}
                style={{
                  position: 'absolute',
                  top: item.offset,
                  left: 0,
                  right: 0,
                }}
              >
                <TodoItem
                  todo={todo}
                  category={category}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default VirtualizedTodoList;
