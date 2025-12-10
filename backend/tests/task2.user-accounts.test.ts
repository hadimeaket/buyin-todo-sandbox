import { describe, it, expect } from "@jest/globals";

const API_BASE = process.env.API_BASE_URL || "http://localhost:4000";

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface ErrorResponse {
  message: string;
}

interface Todo {
  id: string;
  userId: string;
  title: string;
}

describe("TASK2_USER_ACCOUNTS", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";
  let authToken: string;

  it("registers a new user and receives a 201 response from POST /api/auth/register", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as AuthResponse;
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("user");
    expect(data.user.email).toBe(testEmail);
    authToken = data.token;
  });

  it("rejects passwords that are shorter than 8 characters with a validation error", async () => {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `short-${Date.now()}@example.com`, password: "short" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as ErrorResponse;
    expect(data.message).toContain("8 characters");
  });

  it("authenticates a registered user and scopes GET /api/todos responses to that user", async () => {
    // Create a todo for the authenticated user
    const createResponse = await fetch(`${API_BASE}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: "User-scoped todo" }),
    });

    expect(createResponse.status).toBe(201);
    const createdTodo = (await createResponse.json()) as Todo;

    // Fetch todos as the authenticated user
    const todosResponse = await fetch(`${API_BASE}/api/todos`, {
      headers: { "Authorization": `Bearer ${authToken}` },
    });

    expect(todosResponse.status).toBe(200);
    const todos = (await todosResponse.json()) as Todo[];
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.some((t) => t.id === createdTodo.id)).toBe(true);

    // Register a different user and verify they don't see the first user's todos
    const otherEmail = `other-${Date.now()}@example.com`;
    const otherRegister = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otherEmail, password: testPassword }),
    });

    const otherData = (await otherRegister.json()) as AuthResponse;
    const otherToken = otherData.token;

    const otherTodosResponse = await fetch(`${API_BASE}/api/todos`, {
      headers: { "Authorization": `Bearer ${otherToken}` },
    });

    const otherTodos = (await otherTodosResponse.json()) as Todo[];
    expect(otherTodos.some((t) => t.id === createdTodo.id)).toBe(false);
  });

  it("prevents access to protected endpoints when the session is missing or expired", async () => {
    // Try to access todos without a token
    const noTokenResponse = await fetch(`${API_BASE}/api/todos`);
    expect(noTokenResponse.status).toBe(401);

    // Try to access todos with an invalid token
    const invalidTokenResponse = await fetch(`${API_BASE}/api/todos`, {
      headers: { "Authorization": "Bearer invalid-token" },
    });
    expect(invalidTokenResponse.status).toBe(401);
  });
});
