import { describe, it } from "@jest/globals";

describe("TASK4_FILE_ATTACHMENTS", () => {
  it.todo(
    "uploads a small PNG via POST /api/todos/:id/attachments and stores metadata"
  );

  it.todo("rejects files larger than 5MB with a descriptive error message");

  it.todo(
    "downloads an attachment via GET /api/attachments/:id with correct headers"
  );
});
