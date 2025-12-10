import DatabaseConnection from "../database/connection";
import { initializeSchema, clearDatabase } from "../database/schema";
import { todoRepository } from "./TodoRepository";
import { CreateTodoDto } from "../models/Todo";

describe("TodoRepository with SQLite", () => {
  const TEST_USER_ID = "test-user-123";

  // Setup: Initialisiere Test-Datenbank vor allen Tests
  beforeAll(() => {
    // Verwende separate Test-DB
    DatabaseConnection.initialize(":memory:"); // In-Memory DB für Tests
    initializeSchema();
  });

  // Cleanup: Lösche alle Daten vor jedem Test für Isolation
  beforeEach(() => {
    clearDatabase();
  });

  // Cleanup: Schließe DB-Verbindung nach allen Tests
  afterAll(() => {
    DatabaseConnection.close();
  });

  describe("create", () => {
    it("should create a new todo with all fields", async () => {
      const todoData: CreateTodoDto = {
        title: "Test Todo",
        description: "Test Description",
        priority: "high",
        dueDate: "2025-12-15",
      };

      const created = await todoRepository.create(todoData, TEST_USER_ID);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.userId).toBe(TEST_USER_ID);
      expect(created.title).toBe("Test Todo");
      expect(created.description).toBe("Test Description");
      expect(created.priority).toBe("high");
      expect(created.completed).toBe(false);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
    });

    it("should create a todo with minimal fields", async () => {
      const todoData: CreateTodoDto = {
        title: "Minimal Todo",
      };

      const created = await todoRepository.create(todoData, TEST_USER_ID);

      expect(created).toBeDefined();
      expect(created.title).toBe("Minimal Todo");
      expect(created.priority).toBe("medium"); // Default
      expect(created.completed).toBe(false);
    });
  });

  describe("findAll", () => {
    it("should return empty array when no todos exist", async () => {
      const todos = await todoRepository.findAll(TEST_USER_ID);
      expect(todos).toEqual([]);
    });

    it("should return all todos", async () => {
      await todoRepository.create({ title: "Todo 1" }, TEST_USER_ID);
      await todoRepository.create({ title: "Todo 2" }, TEST_USER_ID);
      await todoRepository.create({ title: "Todo 3" }, TEST_USER_ID);

      const todos = await todoRepository.findAll(TEST_USER_ID);

      expect(todos).toHaveLength(3);
      expect(todos[0].title).toBe("Todo 3"); // Newest first
      expect(todos[1].title).toBe("Todo 2");
      expect(todos[2].title).toBe("Todo 1");
    });
  });

  describe("findById", () => {
    it("should find todo by id", async () => {
      const created = await todoRepository.create({ title: "Find Me" }, TEST_USER_ID);
      const found = await todoRepository.findById(created.id, TEST_USER_ID);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe("Find Me");
    });

    it("should return null for non-existent id", async () => {
      const found = await todoRepository.findById("non-existent-id", TEST_USER_ID);
      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("should update todo fields", async () => {
      const created = await todoRepository.create({
        title: "Original Title",
        priority: "low",
      }, TEST_USER_ID);

      const updated = await todoRepository.update(created.id, TEST_USER_ID, {
        title: "Updated Title",
        priority: "high",
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.priority).toBe("high");
    });

    it("should return null for non-existent id", async () => {
      const updated = await todoRepository.update("non-existent-id", TEST_USER_ID, {
        title: "Won't Work",
      });

      expect(updated).toBeNull();
    });
  });

  describe("toggle", () => {
    it("should toggle completed status", async () => {
      const created = await todoRepository.create({ title: "Toggle Me" }, TEST_USER_ID);
      expect(created.completed).toBe(false);

      const toggled1 = await todoRepository.toggle(created.id, TEST_USER_ID);
      expect(toggled1?.completed).toBe(true);

      const toggled2 = await todoRepository.toggle(created.id, TEST_USER_ID);
      expect(toggled2?.completed).toBe(false);
    });

    it("should return null for non-existent id", async () => {
      const toggled = await todoRepository.toggle("non-existent-id", TEST_USER_ID);
      expect(toggled).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete existing todo", async () => {
      const created = await todoRepository.create({ title: "Delete Me" }, TEST_USER_ID);

      const deleted = await todoRepository.delete(created.id, TEST_USER_ID);
      expect(deleted).toBe(true);

      const found = await todoRepository.findById(created.id, TEST_USER_ID);
      expect(found).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const deleted = await todoRepository.delete("non-existent-id", TEST_USER_ID);
      expect(deleted).toBe(false);
    });
  });

  describe("findDuplicate", () => {
    it("should find duplicate by title", async () => {
      await todoRepository.create({
        title: "Duplicate Title",
        description: "Description 1",
      }, TEST_USER_ID);

      const duplicate = await todoRepository.findDuplicate(
        "Duplicate Title",
        TEST_USER_ID,
        "Different Description"
      );

      expect(duplicate).toBeDefined();
      expect(duplicate?.title).toBe("Duplicate Title");
    });

    it("should not find duplicate with different title", async () => {
      await todoRepository.create({ title: "Original Title" }, TEST_USER_ID);

      const duplicate = await todoRepository.findDuplicate("Different Title", TEST_USER_ID);

      expect(duplicate).toBeNull();
    });
  });
});
