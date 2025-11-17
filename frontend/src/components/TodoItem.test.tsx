import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TodoItem from "./TodoItem";
import type { Todo } from "../types/todo";

describe("TodoItem", () => {
  const mockTodo: Todo = {
    id: "1",
    title: "Test Todo",
    completed: false,
    priority: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewDetails = vi.fn();

  it("renders todo title correctly", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText("Test Todo")).toBeDefined();
  });

  it("renders checkbox with correct checked state", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("renders checkbox as checked when todo is completed", () => {
    const completedTodo = { ...mockTodo, completed: true };

    render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("calls onToggle when checkbox is clicked", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("has completed class when todo is completed", () => {
    const completedTodo = { ...mockTodo, completed: true };

    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const todoItem = container.querySelector(".todo-item");
    expect(todoItem?.classList.contains("completed")).toBe(true);
  });

  it("does not have completed class when todo is not completed", () => {
    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onViewDetails={mockOnViewDetails}
      />
    );

    const todoItem = container.querySelector(".todo-item");
    expect(todoItem?.classList.contains("completed")).toBe(false);
  });
});
