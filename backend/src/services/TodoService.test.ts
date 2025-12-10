import { TodoService } from "./TodoService";
import DatabaseConnection from "../database/connection";
import { initializeSchema, clearDatabase } from "../database/schema";

describe("TodoService - Validation", () => {
  let todoService: TodoService;
  const TEST_USER_ID = "test-user-123";

  beforeAll(() => {
    DatabaseConnection.initialize(":memory:");
    initializeSchema();
    todoService = new TodoService();
  });

  beforeEach(() => {
    clearDatabase();
  });

  afterAll(() => {
    DatabaseConnection.close();
  });

  describe("createTodo - Title Validation", () => {
    it("should throw error for empty title", async () => {
      await expect(
        todoService.createTodo({ title: "" }, TEST_USER_ID)
      ).rejects.toThrow("Title is required");
    });

    it("should throw error for whitespace-only title", async () => {
      await expect(
        todoService.createTodo({ title: "   " }, TEST_USER_ID)
      ).rejects.toThrow("Title is required");
    });

    it("should create todo with valid title", async () => {
      const todo = await todoService.createTodo({ title: "Valid Title" }, TEST_USER_ID);

      expect(todo).toBeDefined();
      expect(todo.title).toBe("Valid Title");
      expect(todo.userId).toBe(TEST_USER_ID);
    });
  });

  describe("createTodo - Duplicate Detection", () => {
    it("should throw error for duplicate title", async () => {
      await todoService.createTodo({ title: "Duplicate" }, TEST_USER_ID);

      await expect(
        todoService.createTodo({ title: "Duplicate" }, TEST_USER_ID)
      ).rejects.toThrow("A todo with this title already exists");
    });

    it("should allow same title after deletion", async () => {
      const first = await todoService.createTodo({ title: "Reusable Title" }, TEST_USER_ID);
      await todoService.deleteTodo(first.id, TEST_USER_ID);

      const second = await todoService.createTodo({ title: "Reusable Title" }, TEST_USER_ID);

      expect(second).toBeDefined();
      expect(second.title).toBe("Reusable Title");
    });
  });

  describe("getAllTodos", () => {
    it("should return empty array initially", async () => {
      const todos = await todoService.getAllTodos(TEST_USER_ID);
      expect(todos).toEqual([]);
    });

    it("should return all created todos", async () => {
      await todoService.createTodo({ title: "Todo 1" }, TEST_USER_ID);
      await todoService.createTodo({ title: "Todo 2" }, TEST_USER_ID);

      const todos = await todoService.getAllTodos(TEST_USER_ID);

      expect(todos).toHaveLength(2);
    });
  });

  describe("getTodoById", () => {
    it("should return todo by id", async () => {
      const created = await todoService.createTodo({ title: "Find Me" }, TEST_USER_ID);
      const found = await todoService.getTodoById(created.id, TEST_USER_ID);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it("should return null for non-existent id", async () => {
      const found = await todoService.getTodoById("non-existent", TEST_USER_ID);
      expect(found).toBeNull();
    });
  });

  describe("updateTodo", () => {
    it("should update existing todo", async () => {
      const created = await todoService.createTodo({ title: "Original" }, TEST_USER_ID);
      const updated = await todoService.updateTodo(created.id, TEST_USER_ID, {
        title: "Updated",
      });

      expect(updated?.title).toBe("Updated");
    });
  });

  describe("toggleTodo", () => {
    it("should toggle completed status", async () => {
      const created = await todoService.createTodo({ title: "Toggle" }, TEST_USER_ID);
      const toggled = await todoService.toggleTodo(created.id, TEST_USER_ID);

      expect(toggled?.completed).toBe(true);
    });
  });

  describe("deleteTodo", () => {
    it("should delete existing todo", async () => {
      const created = await todoService.createTodo({ title: "Delete Me" }, TEST_USER_ID);
      const deleted = await todoService.deleteTodo(created.id, TEST_USER_ID);

      expect(deleted).toBe(true);

      const found = await todoService.getTodoById(created.id, TEST_USER_ID);
      expect(found).toBeNull();
    });

    it("should return false for non-existent todo", async () => {
      const deleted = await todoService.deleteTodo("non-existent", TEST_USER_ID);
      expect(deleted).toBe(false);
    });
  });
});
