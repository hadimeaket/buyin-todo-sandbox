import { describe, it } from "@jest/globals";

describe("TASK4_FILE_ATTACHMENTS", () => {
  it(
    "uploads a small PNG via POST /api/todos/:id/attachments and stores metadata",
    () => {
      throw new Error("NOT IMPLEMENTED: File upload feature not yet implemented");
    }
  );

  it("rejects files larger than 5MB with a descriptive error message", () => {
    throw new Error("NOT IMPLEMENTED: File size validation not yet implemented");
  });

  it(
    "downloads an attachment via GET /api/attachments/:id with correct headers",
    () => {
      throw new Error("NOT IMPLEMENTED: File download feature not yet implemented");
    }
  );
});
