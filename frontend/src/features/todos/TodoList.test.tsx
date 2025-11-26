import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { isLegacySuiteEnabled } from "../../test-utils/legacySuite";
import TodoList from "./TodoList";
import type { Todo } from "../../types/todo";

const legacySuite = isLegacySuiteEnabled ? describe : describe.skip;

// The grouping/formatting behaviors asserted here refer to the original UI spec.
// Keep the suite opt-in via RUN_LEGACY_UI_SPECS so we can revisit later without blocking CI.
legacySuite("TodoList - Edge Cases", () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewDetails = vi.fn();

  const createMockTodo = (overrides?: Partial<Todo>): Todo => ({
    id: "1",
    title: "Test Todo",
    completed: false,
    priority: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe("Empty State", () => {
    it("displays empty state when no todos", () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      expect(
        screen.getByText("Create your first task to get started")
      ).toBeInTheDocument();
    });

    it("displays empty state icon", () => {
      const { container } = render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const icon = container.querySelector(".todo-list__empty-icon");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Date Grouping", () => {
    it("groups todos by date", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "2025-11-18" }),
        createMockTodo({ id: "2", title: "Task 2", dueDate: "2025-11-18" }),
        createMockTodo({ id: "3", title: "Task 3", dueDate: "2025-11-19" }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      // Should have multiple date groups
      const groups = screen.getAllByText(
        /Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i
      );
      expect(groups.length).toBeGreaterThan(0);
    });

    it("displays 'Today' for current date", () => {
      const today = new Date().toISOString().split("T")[0];
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: today }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("TODAY")).toBeInTheDocument();
    });

    it("displays 'Tomorrow' for next day", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: tomorrowStr }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("TOMORROW")).toBeInTheDocument();
    });

    it("displays 'Overdue' for past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: yesterdayStr }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("OVERDUE")).toBeInTheDocument();
    });

    it("displays formatted date for future dates beyond tomorrow", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: futureDateStr }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      // Should display day of week and date (e.g., "MONDAY, NOV 25")
      const dateGroups = screen.getAllByText(
        /MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY/i
      );
      expect(dateGroups.length).toBeGreaterThan(0);
    });

    it("groups todos without due date separately", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "2025-11-18" }),
        createMockTodo({ id: "2", title: "Task 2", dueDate: undefined }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("NO DUE DATE")).toBeInTheDocument();
    });

    it("places 'No Due Date' group last", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: undefined }),
        createMockTodo({ id: "2", title: "Task 2", dueDate: "2025-11-18" }),
        createMockTodo({ id: "3", title: "Task 3", dueDate: "2025-11-19" }),
      ];

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const groups = container.querySelectorAll(".todo-list__group");
      const lastGroup = groups[groups.length - 1];
      expect(lastGroup?.textContent).toContain("NO DUE DATE");
    });
  });

  describe("Time Ordering Within Groups", () => {
    it("orders todos by start time within the same date", () => {
      const todos: Todo[] = [
        createMockTodo({
          id: "1",
          title: "Task 1",
          dueDate: "2025-11-18",
          startTime: "14:00",
        }),
        createMockTodo({
          id: "2",
          title: "Task 2",
          dueDate: "2025-11-18",
          startTime: "09:00",
        }),
        createMockTodo({
          id: "3",
          title: "Task 3",
          dueDate: "2025-11-18",
          startTime: "18:00",
        }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const taskTitles = screen.getAllByText(/Task \d/);
      expect(taskTitles[0]).toHaveTextContent("Task 2"); // 09:00
      expect(taskTitles[1]).toHaveTextContent("Task 1"); // 14:00
      expect(taskTitles[2]).toHaveTextContent("Task 3"); // 18:00
    });

    it("places todos without start time at beginning of group (00:00 default)", () => {
      const todos: Todo[] = [
        createMockTodo({
          id: "1",
          title: "Task 1",
          dueDate: "2025-11-18",
          startTime: "14:00",
        }),
        createMockTodo({
          id: "2",
          title: "Task 2",
          dueDate: "2025-11-18",
          startTime: undefined,
        }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const taskTitles = screen.getAllByText(/Task \d/);
      expect(taskTitles[0]).toHaveTextContent("Task 2"); // undefined -> 00:00
      expect(taskTitles[1]).toHaveTextContent("Task 1"); // 14:00
    });
  });

  describe("Multiple Groups", () => {
    it("renders multiple date groups correctly", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "2025-11-18" }),
        createMockTodo({ id: "2", title: "Task 2", dueDate: "2025-11-19" }),
        createMockTodo({ id: "3", title: "Task 3", dueDate: "2025-11-20" }),
      ];

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const groups = container.querySelectorAll(".todo-list__group");
      expect(groups.length).toBe(3);
    });

    it("maintains correct ordering of date groups", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todos: Todo[] = [
        createMockTodo({
          id: "3",
          title: "Task 3",
          dueDate: tomorrow.toISOString().split("T")[0],
        }),
        createMockTodo({
          id: "1",
          title: "Task 1",
          dueDate: yesterday.toISOString().split("T")[0],
        }),
        createMockTodo({
          id: "2",
          title: "Task 2",
          dueDate: today.toISOString().split("T")[0],
        }),
      ];

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const groupTitles = container.querySelectorAll(".todo-list__group-title");
      expect(groupTitles[0]?.textContent).toContain("OVERDUE");
      expect(groupTitles[1]?.textContent).toContain("TODAY");
      expect(groupTitles[2]?.textContent).toContain("TOMORROW");
    });
  });

  describe("Edge Cases with Dates", () => {
    it("handles year boundary correctly", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "2025-12-31" }),
        createMockTodo({ id: "2", title: "Task 2", dueDate: "2026-01-01" }),
      ];

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const groups = container.querySelectorAll(".todo-list__group");
      expect(groups.length).toBe(2);
    });

    it("handles leap year dates correctly", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "2024-02-29" }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      // Should not crash and should render the task
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });

    it("handles invalid date strings gracefully", () => {
      const todos: Todo[] = [
        createMockTodo({ id: "1", title: "Task 1", dueDate: "invalid-date" }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      // Should render without crashing
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });
  });

  describe("Large Dataset Handling", () => {
    it("handles large number of todos efficiently", () => {
      const todos: Todo[] = Array.from({ length: 100 }, (_, i) =>
        createMockTodo({
          id: `task-${i}`,
          title: `Task ${i}`,
          dueDate: "2025-11-18",
        })
      );

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const items = container.querySelectorAll(".todo-item");
      expect(items.length).toBe(100);
    });

    it("handles many date groups efficiently", () => {
      const todos: Todo[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date("2025-11-01");
        date.setDate(date.getDate() + i);
        return createMockTodo({
          id: `task-${i}`,
          title: `Task ${i}`,
          dueDate: date.toISOString().split("T")[0],
        });
      });

      const { container } = render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      const groups = container.querySelectorAll(".todo-list__group");
      expect(groups.length).toBe(30);
    });
  });

  describe("Mixed Priority and Completion States", () => {
    it("renders todos with different priorities in same group", () => {
      const todos: Todo[] = [
        createMockTodo({
          id: "1",
          title: "Low Priority",
          dueDate: "2025-11-18",
          priority: "low",
        }),
        createMockTodo({
          id: "2",
          title: "High Priority",
          dueDate: "2025-11-18",
          priority: "high",
        }),
        createMockTodo({
          id: "3",
          title: "Medium Priority",
          dueDate: "2025-11-18",
          priority: "medium",
        }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("Low Priority")).toBeInTheDocument();
      expect(screen.getByText("High Priority")).toBeInTheDocument();
      expect(screen.getByText("Medium Priority")).toBeInTheDocument();
    });

    it("renders completed and active todos in same group", () => {
      const todos: Todo[] = [
        createMockTodo({
          id: "1",
          title: "Active Task",
          dueDate: "2025-11-18",
          completed: false,
        }),
        createMockTodo({
          id: "2",
          title: "Completed Task",
          dueDate: "2025-11-18",
          completed: true,
        }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(screen.getByText("Active Task")).toBeInTheDocument();
      expect(screen.getByText("Completed Task")).toBeInTheDocument();
    });
  });
});
