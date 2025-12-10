import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";

describe("TodoRepository", () => {
  const testUserId = "test-user-id";

  beforeEach(() => {
    // Clear all todos before each test
    // Note: This requires exposing a clear method or accessing private state
    // For now, we'll work with the existing state
  });

  describe("create", () => {
    it("should create a new todo with correct properties", async () => {
      const createDto: CreateTodoDto = { title: "Test Todo" };

      const todo = await todoRepository.create(createDto, testUserId);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe("Test Todo");
      expect(todo.completed).toBe(false);
      expect(todo.userId).toBe(testUserId);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return all todos", async () => {
      const todo1 = await todoRepository.create(
        { title: "Todo 1" },
        testUserId
      );
      const todo2 = await todoRepository.create(
        { title: "Todo 2" },
        testUserId
      );

      const todos = await todoRepository.findAll(testUserId);

      expect(todos.length).toBeGreaterThanOrEqual(2);
      expect(todos.some((t) => t.id === todo1.id)).toBe(true);
      expect(todos.some((t) => t.id === todo2.id)).toBe(true);
    });
  });

  describe("findById", () => {
    it("should return a todo when it exists", async () => {
      const created = await todoRepository.create(
        { title: "Find Me" },
        testUserId
      );

      const found = await todoRepository.findById(created.id, testUserId);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe("Find Me");
    });

    it("should return null when todo does not exist", async () => {
      const found = await todoRepository.findById(
        "non-existent-id",
        testUserId
      );

      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a todo title", async () => {
      const created = await todoRepository.create(
        { title: "Original" },
        testUserId
      );
      const updateDto: UpdateTodoDto = { title: "Updated" };

      const updated = await todoRepository.update(
        created.id,
        testUserId,
        updateDto
      );

      expect(updated).toBeDefined();
      expect(updated?.title).toBe("Updated");
      expect(updated?.completed).toBe(false);
    });

    it("should update a todo completed status", async () => {
      const created = await todoRepository.create(
        { title: "Test" },
        testUserId
      );
      const updateDto: UpdateTodoDto = { completed: true };

      const updated = await todoRepository.update(
        created.id,
        testUserId,
        updateDto
      );

      expect(updated).toBeDefined();
      expect(updated?.completed).toBe(true);
    });

    it("should return null when updating non-existent todo", async () => {
      const updated = await todoRepository.update("non-existent", testUserId, {
        title: "Test",
      });

      expect(updated).toBeNull();
    });
  });

  describe("toggle", () => {
    it("should toggle todo from not completed to completed", async () => {
      const created = await todoRepository.create(
        { title: "Toggle Me" },
        testUserId
      );

      const toggled = await todoRepository.toggle(created.id, testUserId);

      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(true);
    });

    it("should toggle todo from completed to not completed", async () => {
      const created = await todoRepository.create(
        { title: "Toggle Me" },
        testUserId
      );
      await todoRepository.update(created.id, testUserId, { completed: true });

      const toggled = await todoRepository.toggle(created.id, testUserId);

      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(false);
    });

    it("should return null when toggling non-existent todo", async () => {
      const toggled = await todoRepository.toggle("non-existent", testUserId);

      expect(toggled).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete an existing todo", async () => {
      const created = await todoRepository.create(
        { title: "Delete Me" },
        testUserId
      );

      const deleted = await todoRepository.delete(created.id, testUserId);

      expect(deleted).toBe(true);

      const found = await todoRepository.findById(created.id, testUserId);
      expect(found).toBeNull();
    });

    it("should return false when deleting non-existent todo", async () => {
      const deleted = await todoRepository.delete("non-existent", testUserId);

      expect(deleted).toBe(false);
    });
  });
});
