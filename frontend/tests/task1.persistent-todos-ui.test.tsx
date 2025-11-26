import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AddTaskModal from "../src/features/todos/AddTaskModal";

describe("TASK1_PERSISTENT_TODOS_UI", () => {
  it("disables the Add Task button when required fields are empty", () => {
    render(
      <AddTaskModal
        onClose={() => undefined}
        onAdd={async () => undefined}
        existingTodos={[]}
      />
    );

    const submitButton = screen.getByRole("button", { name: /add task/i });
    expect(submitButton).toBeDisabled();
  });

  it.todo(
    "keeps todos visible after a page reload when persistence is implemented"
  );
});
