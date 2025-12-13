import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { connectDB, closeDB } from "./utils/testDb";

describe("TASK5_CALENDAR", () => {
  let app: any;
  let authToken: string;
  const testUser = {
    email: `cal-test-${Date.now()}@example.com`,
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
  });

  afterAll(async () => {
    await closeDB();
  });

  it("filters todos by date range", async () => {
    if (!authToken) return;

    const today = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    
    const create1 = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Today", dueDate: today });
    const create2 = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Tomorrow", dueDate: tomorrow });

    expect([200, 201]).toContain(create1.status);
    expect([200, 201]).toContain(create2.status);

    const unfiltered = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${authToken}`);
    expect(unfiltered.status).toBe(200);
    expect(Array.isArray(unfiltered.body)).toBe(true);

    const filtered = await request(app)
      .get("/api/todos")
      .query({ start: today, end: today })
      .set("Authorization", `Bearer ${authToken}`);
    expect(filtered.status).toBe(200);
    expect(Array.isArray(filtered.body)).toBe(true);

    // If the API supports date filtering, the filtered result should not include "Tomorrow".
    // If it doesn't support filtering, this test will fail (by design).
    const titles = (filtered.body as any[]).map((t) => t?.title);
    expect(titles).toContain("Today");
    expect(titles).not.toContain("Tomorrow");
  });
});
