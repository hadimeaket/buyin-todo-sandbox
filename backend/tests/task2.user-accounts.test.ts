import { describe, it } from "@jest/globals";

describe("TASK2_USER_ACCOUNTS", () => {
  it.todo(
    "registers a new user and receives a 201 response from POST /api/auth/register"
  );

  it.todo(
    "rejects passwords that are shorter than 8 characters with a validation error"
  );

  it.todo(
    "authenticates a registered user and scopes GET /api/todos responses to that user"
  );

  it.todo(
    "prevents access to protected endpoints when the session is missing or expired"
  );
});
