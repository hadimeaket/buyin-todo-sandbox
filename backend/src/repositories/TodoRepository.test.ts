import { todoRepository } from "../repositories/TodoRepository";
import { CreateTodoDto, UpdateTodoDto } from "../models/Todo";

describe("TodoRepository", () => {
  beforeEach(() => {
    // Clear all todos before each test
    // Note: This requires exposing a clear method or accessing private state
    // For now, we'll work with the existing state
  });

  describe("create", () => {
    it("should create a new todo with correct properties", async () => {
      const createDto: CreateTodoDto = { title: "Test Todo" };
      const userId = "test-user-id";

      const todo = await todoRepository.create(createDto, userId);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe("Test Todo");
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return all todos", async () => {
      const userId = "test-user-id";
      const todo1 = await todoRepository.create({ title: "Todo 1" }, userId);
      const todo2 = await todoRepository.create({ title: "Todo 2" }, userId);

      const todos = await todoRepository.findAll();

      expect(todos.length).toBeGreaterThanOrEqual(2);
      expect(todos.some((t) => t.id === todo1.id)).toBe(true);
      expect(todos.some((t) => t.id === todo2.id)).toBe(true);
    });
  });

  describe("findById", () => {
    it("should return a todo when it exists", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create({ title: "Find Me" }, userId);

      const found = await todoRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe("Find Me");
    });

    it("should return null when todo does not exist", async () => {
      const found = await todoRepository.findById("non-existent-id");

      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a todo title", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create(
        { title: "Original" },
        userId
      );
      const updateDto: UpdateTodoDto = { title: "Updated" };

      const updated = await todoRepository.update(created.id, updateDto);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe("Updated");
      expect(updated?.completed).toBe(false);
    });

    it("should update a todo completed status", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create({ title: "Test" }, userId);
      const updateDto: UpdateTodoDto = { completed: true };

      const updated = await todoRepository.update(created.id, updateDto);

      expect(updated).toBeDefined();
      expect(updated?.completed).toBe(true);
    });

    it("should return null when updating non-existent todo", async () => {
      const updated = await todoRepository.update("non-existent", {
        title: "Test",
      });

      expect(updated).toBeNull();
    });
  });

  describe("toggle", () => {
    it("should toggle todo from not completed to completed", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create(
        { title: "Toggle Me" },
        userId
      );

      const toggled = await todoRepository.toggle(created.id);

      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(true);
    });

    it("should toggle todo from completed to not completed", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create(
        { title: "Toggle Me" },
        userId
      );
      await todoRepository.update(created.id, { completed: true });

      const toggled = await todoRepository.toggle(created.id);

      expect(toggled).toBeDefined();
      expect(toggled?.completed).toBe(false);
    });

    it("should return null when toggling non-existent todo", async () => {
      const toggled = await todoRepository.toggle("non-existent");

      expect(toggled).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete an existing todo", async () => {
      const userId = "test-user-id";
      const created = await todoRepository.create(
        { title: "Delete Me" },
        userId
      );

      const deleted = await todoRepository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await todoRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should return false when deleting non-existent todo", async () => {
      const deleted = await todoRepository.delete("non-existent");

      expect(deleted).toBe(false);
    });
  });
});
