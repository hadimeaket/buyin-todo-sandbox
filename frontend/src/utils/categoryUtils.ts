import type { TodoCategory } from '../types/todo';

export const CATEGORY_CONFIG: Record<TodoCategory, { label: string; color: string; bgColor: string }> = {
  task: {
    label: 'Task',
    color: '#2563eb', // Blue
    bgColor: '#dbeafe',
  },
  idea: {
    label: 'Idea',
    color: '#7c3aed', // Purple
    bgColor: '#ede9fe',
  },
  action: {
    label: 'Action',
    color: '#dc2626', // Red
    bgColor: '#fee2e2',
  },
};

export const getCategoryConfig = (category: TodoCategory) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.task;
};
