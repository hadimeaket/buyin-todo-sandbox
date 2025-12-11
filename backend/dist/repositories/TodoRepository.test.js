"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TodoRepository_1 = require("../repositories/TodoRepository");
const TEST_USER_ID = 'test-user-123';
describe('TodoRepository', () => {
    beforeEach(() => {
        // Clear all todos before each test
        // Note: This requires exposing a clear method or accessing private state
        // For now, we'll work with the existing state
    });
    describe('create', () => {
        it('should create a new todo with correct properties', async () => {
            const createDto = { title: 'Test Todo' };
            const todo = await TodoRepository_1.todoRepository.create(createDto, TEST_USER_ID);
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
            const todo1 = await TodoRepository_1.todoRepository.create({ title: 'Todo 1' }, TEST_USER_ID);
            const todo2 = await TodoRepository_1.todoRepository.create({ title: 'Todo 2' }, TEST_USER_ID);
            const todos = await TodoRepository_1.todoRepository.findAll(TEST_USER_ID);
            expect(todos.length).toBeGreaterThanOrEqual(2);
            expect(todos.some(t => t.id === todo1.id)).toBe(true);
            expect(todos.some(t => t.id === todo2.id)).toBe(true);
        });
    });
    describe('findById', () => {
        it('should return a todo when it exists', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Find Me' }, TEST_USER_ID);
            const found = await TodoRepository_1.todoRepository.findById(created.id, TEST_USER_ID);
            expect(found).toBeDefined();
            expect(found?.id).toBe(created.id);
            expect(found?.title).toBe('Find Me');
        });
        it('should return null when todo does not exist', async () => {
            const found = await TodoRepository_1.todoRepository.findById('non-existent-id', TEST_USER_ID);
            expect(found).toBeNull();
        });
    });
    describe('update', () => {
        it('should update a todo title', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Original' }, TEST_USER_ID);
            const updateDto = { title: 'Updated' };
            const updated = await TodoRepository_1.todoRepository.update(created.id, updateDto, TEST_USER_ID);
            expect(updated).toBeDefined();
            expect(updated?.title).toBe('Updated');
            expect(updated?.completed).toBe(false);
        });
        it('should update a todo completed status', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Test' }, TEST_USER_ID);
            const updateDto = { completed: true };
            const updated = await TodoRepository_1.todoRepository.update(created.id, updateDto, TEST_USER_ID);
            expect(updated).toBeDefined();
            expect(updated?.completed).toBe(true);
        });
        it('should return null when updating non-existent todo', async () => {
            const updated = await TodoRepository_1.todoRepository.update('non-existent', { title: 'Test' }, TEST_USER_ID);
            expect(updated).toBeNull();
        });
    });
    describe('toggle', () => {
        it('should toggle todo from not completed to completed', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Toggle Me' }, TEST_USER_ID);
            const toggled = await TodoRepository_1.todoRepository.toggle(created.id, TEST_USER_ID);
            expect(toggled).toBeDefined();
            expect(toggled?.completed).toBe(true);
        });
        it('should toggle todo from completed to not completed', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Toggle Me' }, TEST_USER_ID);
            await TodoRepository_1.todoRepository.update(created.id, { completed: true }, TEST_USER_ID);
            const toggled = await TodoRepository_1.todoRepository.toggle(created.id, TEST_USER_ID);
            expect(toggled).toBeDefined();
            expect(toggled?.completed).toBe(false);
        });
        it('should return null when toggling non-existent todo', async () => {
            const toggled = await TodoRepository_1.todoRepository.toggle('non-existent', TEST_USER_ID);
            expect(toggled).toBeNull();
        });
    });
    describe('delete', () => {
        it('should delete an existing todo', async () => {
            const created = await TodoRepository_1.todoRepository.create({ title: 'Delete Me' }, TEST_USER_ID);
            const deleted = await TodoRepository_1.todoRepository.delete(created.id, TEST_USER_ID);
            expect(deleted).toBe(true);
            const found = await TodoRepository_1.todoRepository.findById(created.id, TEST_USER_ID);
            expect(found).toBeNull();
        });
        it('should return false when deleting non-existent todo', async () => {
            const deleted = await TodoRepository_1.todoRepository.delete('non-existent', TEST_USER_ID);
            expect(deleted).toBe(false);
        });
    });
});
//# sourceMappingURL=TodoRepository.test.js.map