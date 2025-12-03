import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../src/server";
import { getDatabase } from "../src/db/database";

describe("TASK2_USER_ACCOUNTS", () => {
  beforeEach(() => {
    // Clear database before each test
    const db = getDatabase();
    db.exec("DELETE FROM users");
    db.exec("DELETE FROM todos");
  });

  it("registers a new user and receives a 201 response from POST /api/auth/register", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("rejects passwords that are shorter than 8 characters with a validation error", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("8 characters");
  });

  it("authenticates a registered user and scopes GET /api/todos responses to that user", async () => {
    // Register and login as user1
    const user1Response = await request(app).post("/api/auth/register").send({
      email: "user1@example.com",
      password: "password123",
    });

    const user1Cookie = user1Response.headers["set-cookie"];

    // Create todo for user1
    await request(app).post("/api/todos").set("Cookie", user1Cookie).send({
      title: "User1 Todo",
    });

    // Register and login as user2
    const user2Response = await request(app).post("/api/auth/register").send({
      email: "user2@example.com",
      password: "password123",
    });

    const user2Cookie = user2Response.headers["set-cookie"];

    // Create todo for user2
    await request(app).post("/api/todos").set("Cookie", user2Cookie).send({
      title: "User2 Todo",
    });

    // Get todos for user1 - should only see their own
    const user1Todos = await request(app)
      .get("/api/todos")
      .set("Cookie", user1Cookie);

    expect(user1Todos.status).toBe(200);
    expect(user1Todos.body).toHaveLength(1);
    expect(user1Todos.body[0].title).toBe("User1 Todo");

    // Get todos for user2 - should only see their own
    const user2Todos = await request(app)
      .get("/api/todos")
      .set("Cookie", user2Cookie);

    expect(user2Todos.status).toBe(200);
    expect(user2Todos.body).toHaveLength(1);
    expect(user2Todos.body[0].title).toBe("User2 Todo");
  });

  it("prevents access to protected endpoints when the session is missing or expired", async () => {
    const response = await request(app).get("/api/todos");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});
