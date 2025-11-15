import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from './TodoItem';
import type { Todo } from '../types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders todo title correctly', () => {
    render(
      <TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Todo')).toBeDefined();
  });

  it('renders checkbox with correct checked state', () => {
    render(
      <TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('renders checkbox as checked when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    
    render(
      <TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(
      <TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('applies line-through style when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    
    render(
      <TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const title = screen.getByText('Test Todo');
    expect(title.style.textDecoration).toBe('line-through');
  });

  it('does not apply line-through style when todo is not completed', () => {
    render(
      <TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const title = screen.getByText('Test Todo');
    expect(title.style.textDecoration).toBe('none');
  });
});
