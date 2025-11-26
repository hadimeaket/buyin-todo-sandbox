import { test, expect } from "@playwright/test";

test.describe("TASK1_PERSISTENT_TODOS_E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/todos", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else if (route.request().method() === "POST") {
        const body = JSON.parse(route.request().postData() || "{}");
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "generated-id",
            title: body.title,
            description: body.description,
            completed: false,
            priority: body.priority ?? "medium",
            dueDate: body.dueDate ?? null,
            dueEndDate: body.dueEndDate ?? null,
            isAllDay: body.isAllDay ?? true,
            startTime: body.startTime ?? null,
            endTime: body.endTime ?? null,
            recurrence: body.recurrence ?? "none",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({ status: 204 });
      }
    });
  });

  test("requires mandatory fields before enabling submission", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("drawer-add-task").click();

    const submit = page.getByTestId("add-task-submit");
    await expect(submit).toBeDisabled();
  });

  test.fixme(
    "persists a newly created todo after browser reload and backend restart",
    async ({ page }) => {
      await page.goto("/");
      await page.getByTestId("drawer-add-task").click();
      // TODO: Implement once real persistence layer is available (Task 1)
    }
  );
});
