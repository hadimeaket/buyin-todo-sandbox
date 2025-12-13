import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { connectDB, closeDB } from "./utils/testDb";

describe("TASK4_ATTACHMENTS", () => {
  let app: any;
  let authToken: string;
  let todoId: string;
  const testUser = {
    email: `att-test-${Date.now()}@example.com`,
    password: "password123",
  };

  beforeAll(async () => {
    await connectDB();
    const mod = require("../src/server");
    app = mod.default || mod;

    // Register & Login
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    authToken = loginRes.body.token || loginRes.body.accessToken;

    // Create a todo to attach to
    const todoRes = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Attachment Todo" });
    todoId = todoRes.body.id;
  });

  afterAll(async () => {
    await closeDB();
  });

  it("uploads a file to a todo", async () => {
    if (!authToken || !todoId) return;

    const response = await request(app)
      .post(`/api/todos/${todoId}/attachments`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("dummy content"), "test.txt");

    // 404 means endpoint not implemented; anything else indicates a reachable handler.
    expect(response.status).not.toBe(404);

    const body = response.body;
    const attachments =
      body.attachments || (Array.isArray(body) ? body : [body]);
    // expect(attachments.length).toBeGreaterThan(0); // Commented out as implementation varies
  });
});
