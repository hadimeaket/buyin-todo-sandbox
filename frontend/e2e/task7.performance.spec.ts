import { test } from "@playwright/test";

test.describe("TASK7_PERFORMANCE_E2E", () => {
  test.fixme(
    "keeps scroll interactions responsive with 1000 todos",
    async ({ page }) => {
      await page.goto("/");
      // TODO: Seed 1000 todos, measure scroll performance, and assert there is no frame drop.
    }
  );

  test.fixme(
    "renders at most 200 DOM rows at any time via virtualization/pagination",
    async ({ page }) => {
      await page.goto("/");
      // TODO: Inspect DOM node counts to ensure virtualization or pagination is enabled.
    }
  );
});
