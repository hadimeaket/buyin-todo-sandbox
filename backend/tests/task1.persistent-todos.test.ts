import { describe, expect, it, beforeEach } from "@jest/globals";
import { todoService } from "../src/services/TodoService";
import { getDatabase } from "../src/db/database";

describe("TASK1_PERSISTENT_TODOS", () => {
  beforeEach(async () => {
    // Clear todos table before each test
    const db = getDatabase();
    db.exec("DELETE FROM todos");
  });

  it("rejects todos without a title", async () => {
    await expect(todoService.createTodo({ title: "" })).rejects.toThrow(
      "Title is required"
    );
  });

  it("creates todos that can be retrieved afterwards", async () => {
    const uniqueTitle = `challenge-${Date.now()}-${Math.random()}`;
    const created = await todoService.createTodo({
      title: uniqueTitle,
      description: "ensures repository returns persisted todo",
    });

    const todos = await todoService.getAllTodos();
    const found = todos.find((todo) => todo.id === created.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe(uniqueTitle);
  });

  it.todo(
    "persists todos across service restarts (requires database-backed repository)"
  );
});
