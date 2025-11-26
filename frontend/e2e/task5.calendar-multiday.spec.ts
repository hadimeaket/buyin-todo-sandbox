import { test } from "@playwright/test";

test.describe("TASK5_CALENDAR_MULTIDAY_E2E", () => {
  test.fixme(
    "renders a multi-day task as one continuous block spanning dueDate to dueEndDate",
    async ({ page }) => {
      await page.goto("/");
      // TODO: Seed backend with a multi-day todo, switch to calendar view, and
      // verify that the same event spans consecutive days without gaps.
    }
  );

  test.fixme(
    "keeps overlapping multi-day bars visible without clipping",
    async ({ page }) => {
      await page.goto("/");
      // TODO: Seed overlapping tasks and ensure z-index layering keeps both visible.
    }
  );
});
