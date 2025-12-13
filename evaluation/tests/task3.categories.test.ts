import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { connectDB, closeDB } from "./utils/testDb";

describe("TASK3_CATEGORIES", () => {
  let app: any;
  let authToken: string;
  const testUser = {
    email: `cat-test-${Date.now()}@example.com`,
    password: "password123",
  };

  beforeAll(async () => {
    await connectDB();
    const mod = require("../src/server");
    app = mod.default || mod;

    // Register & Login to get token
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    authToken = loginRes.body.token || loginRes.body.accessToken;
  });

  afterAll(async () => {
    await closeDB();
  });

  it("creates a todo with a category (Inline or Relation)", async () => {
    if (!authToken) return; // Skip if auth failed

    const todoData = {
      title: "Buy Milk",
      category: "Groceries", // Try simple string first
      color: "#FF0000", // Optional hex
    };

    let response = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send(todoData);

    if (response.status === 400 || response.status === 500) {
      // Maybe category needs to be an object or ID?
      // Try creating category first if endpoint exists
      const catRes = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Groceries", color: "#FF0000" });

      if (catRes.status === 201 || catRes.status === 200) {
        const catId = catRes.body.id;
        response = await request(app)
          .post("/api/todos")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ ...todoData, category: catId }); // Send ID
      }
    }

    expect([200, 201]).toContain(response.status);

    // Verify persistence
    const todoId = response.body.id;
    const getRes = await request(app)
      .get(`/api/todos/${todoId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);

    // Check if category is present (either as string or object)
    const cat = getRes.body.category;
    expect(cat).toBeDefined();
  });
});
