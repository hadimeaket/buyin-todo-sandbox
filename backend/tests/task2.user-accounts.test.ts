import { describe, it } from "@jest/globals";

describe("TASK2_USER_ACCOUNTS", () => {
  it(
    "registers a new user and receives a 201 response from POST /api/auth/register",
    () => {
      throw new Error("NOT IMPLEMENTED: User registration feature not yet implemented");
    }
  );

  it(
    "rejects passwords that are shorter than 8 characters with a validation error",
    () => {
      throw new Error("NOT IMPLEMENTED: Password validation not yet implemented");
    }
  );

  it(
    "authenticates a registered user and scopes GET /api/todos responses to that user",
    () => {
      throw new Error("NOT IMPLEMENTED: User authentication and scoping not yet implemented");
    }
  );

  it(
    "prevents access to protected endpoints when the session is missing or expired",
    () => {
      throw new Error("NOT IMPLEMENTED: Session management not yet implemented");
    }
  );
});
