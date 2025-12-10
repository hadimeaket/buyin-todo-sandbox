import { TodoService } from "./TodoService";
import DatabaseConnection from "../database/connection";
import { initializeSchema, clearDatabase } from "../database/schema";

describe("TodoService - Validation", () => {
  let todoService: TodoService;

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
        todoService.createTodo({ title: "" })
      ).rejects.toThrow("Title is required");
    });

    it("should throw error for whitespace-only title", async () => {
      await expect(
        todoService.createTodo({ title: "   " })
      ).rejects.toThrow("Title is required");
    });

    it("should create todo with valid title", async () => {
      const todo = await todoService.createTodo({ title: "Valid Title" });

      expect(todo).toBeDefined();
      expect(todo.title).toBe("Valid Title");
    });
  });

  describe("createTodo - Duplicate Detection", () => {
    it("should throw error for duplicate title", async () => {
      await todoService.createTodo({ title: "Duplicate" });

      await expect(
        todoService.createTodo({ title: "Duplicate" })
      ).rejects.toThrow("A todo with this title already exists");
    });

    it("should allow same title after deletion", async () => {
      const first = await todoService.createTodo({ title: "Reusable Title" });
      await todoService.deleteTodo(first.id);

      const second = await todoService.createTodo({ title: "Reusable Title" });

      expect(second).toBeDefined();
      expect(second.title).toBe("Reusable Title");
    });
  });

  describe("getAllTodos", () => {
    it("should return empty array initially", async () => {
      const todos = await todoService.getAllTodos();
      expect(todos).toEqual([]);
    });

    it("should return all created todos", async () => {
      await todoService.createTodo({ title: "Todo 1" });
      await todoService.createTodo({ title: "Todo 2" });

      const todos = await todoService.getAllTodos();

      expect(todos).toHaveLength(2);
    });
  });

  describe("getTodoById", () => {
    it("should return todo by id", async () => {
      const created = await todoService.createTodo({ title: "Find Me" });
      const found = await todoService.getTodoById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it("should return null for non-existent id", async () => {
      const found = await todoService.getTodoById("non-existent");
      expect(found).toBeNull();
    });
  });

  describe("updateTodo", () => {
    it("should update existing todo", async () => {
      const created = await todoService.createTodo({ title: "Original" });
      const updated = await todoService.updateTodo(created.id, {
        title: "Updated",
      });

      expect(updated?.title).toBe("Updated");
    });
  });

  describe("toggleTodo", () => {
    it("should toggle completed status", async () => {
      const created = await todoService.createTodo({ title: "Toggle" });
      const toggled = await todoService.toggleTodo(created.id);

      expect(toggled?.completed).toBe(true);
    });
  });

  describe("deleteTodo", () => {
    it("should delete existing todo", async () => {
      const created = await todoService.createTodo({ title: "Delete Me" });
      const deleted = await todoService.deleteTodo(created.id);

      expect(deleted).toBe(true);

      const found = await todoService.getTodoById(created.id);
      expect(found).toBeNull();
    });

    it("should return false for non-existent todo", async () => {
      const deleted = await todoService.deleteTodo("non-existent");
      expect(deleted).toBe(false);
    });
  });
});
