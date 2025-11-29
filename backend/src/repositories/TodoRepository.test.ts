import { todoRepository } from '../repositories/TodoRepository';
import { CreateTodoDto, UpdateTodoDto } from '../models/Todo';

// Test user ID for all operations
const TEST_USER_ID = 'test-user-id';

describe('TodoRepository', () => {
  beforeEach(() => {
    // Clear all todos before each test
    // Note: This requires exposing a clear method or accessing private state
    // For now, we'll work with the existing state
  });

  describe('create', () => {
    it('should create a new todo with correct properties', async () => {
      const createDto: CreateTodoDto = { title: 'Test Todo' };
      
      const todo = await todoRepository.create(TEST_USER_ID, createDto);
      
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Test Todo');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const todo1 = await todoRepository.create(TEST_USER_ID, { title: 'Todo 1' });
      const todo2 = await todoRepository.create(TEST_USER_ID, { title: 'Todo 2' });
      
      const todos = await todoRepository.findAll(TEST_USER_ID);
      
      expect(todos.length).toBeGreaterThanOrEqual(2);
      expect(todos.some(t => t.id === todo1.id)).toBe(true);
      expect(todos.some(t => t.id === todo2.id)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return a todo when it exists', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Find Me' });
      
      const found = await todoRepository.findById(created.id, TEST_USER_ID);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Me');
    });

    it('should return null when todo does not exist', async () => {
      const found = await todoRepository.findById('non-existent-id', TEST_USER_ID);
      
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a todo title', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Original' });
      const updateDto: UpdateTodoDto = { title: 'Updated' };
      
      const updated = await todoRepository.update(created.id, TEST_USER_ID, updateDto);
      
      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated');
      expect(updated?.completed).toBe(false);
    });

    it('should update a todo completed status', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Test' });
      const updateDto: UpdateTodoDto = { completed: true };
      
      const updated = await todoRepository.update(created.id, TEST_USER_ID, updateDto);
      
      expect(updated).toBeDefined();
      expect(updated?.completed).toBe(true);
    });

    it('should return null when updating non-existent todo', async () => {
      const updated = await todoRepository.update('non-existent', TEST_USER_ID, { title: 'Test' });
      
      expect(updated).toBeNull();
    });
  });

  describe('toggle', () => {
    it('should toggle todo from not completed to completed', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Toggle Me' });
      
      const toggled = await todoRepository.toggle(created.id, TEST_USER_ID);
      
      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(true);
    });

    it('should toggle todo from completed to not completed', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Toggle Me' });
      await todoRepository.update(created.id, TEST_USER_ID, { completed: true });
      
      const toggled = await todoRepository.toggle(created.id, TEST_USER_ID);
      
      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(false);
    });

    it('should return null when toggling non-existent todo', async () => {
      const toggled = await todoRepository.toggle('non-existent', TEST_USER_ID);
      
      expect(toggled).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing todo', async () => {
      const created = await todoRepository.create(TEST_USER_ID, { title: 'Delete Me' });
      
      const deleted = await todoRepository.delete(created.id, TEST_USER_ID);
      
      expect(deleted).toBe(true);
      
      const found = await todoRepository.findById(created.id, TEST_USER_ID);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent todo', async () => {
      const deleted = await todoRepository.delete('non-existent', TEST_USER_ID);
      
      expect(deleted).toBe(false);
    });
  });
});
