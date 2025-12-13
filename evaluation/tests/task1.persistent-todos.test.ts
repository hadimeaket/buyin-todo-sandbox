import request from "supertest";
import { connectDB, closeDB, clearDB } from "./utils/testDb";
import {
  jest,
  describe,
  test,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  expect,
} from "@jest/globals";

describe("TASK1_PERSISTENT_TODOS", () => {
  let app: any;
  let token: string | undefined;
  let userId: string;

  beforeAll(async () => {
    process.env.PORT = "0"; // Avoid port conflicts
    await connectDB();

    // Silence logs
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      // Re-require to ensure fresh execution if needed
      app = require("../src/server").default;
    } catch (e) {
      console.warn("Could not load server", e);
    }
  });

  afterAll(async () => {
    await closeDB();
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    // Create a user for auth if needed
    const email = `test-${Date.now()}@example.com`;
    const password = "password123";

    // Try to register
    try {
      const res = await request(app).post("/api/auth/register").send({
        email,
        password,
        name: "Test User",
      });
      if (res.status === 201 || res.status === 200) {
        token = res.body.token;
        userId = res.body.user?.id;
      }
    } catch (e) {
      // Ignore
    }

    if (!userId) {
      userId = `test-user-${Date.now()}`;
    }
  });

  afterEach(async () => {
    await clearDB();
  });

  test("creates todos that can be retrieved afterwards", async () => {
    const todoData = {
      title: "Persistent Todo",
      description: "Should be saved in DB",
    };

    const req = request(app).post("/api/todos").send(todoData);
    if (token) req.set("Authorization", `Bearer ${token}`);
    req.set("x-user-id", userId); // Fallback

    const res = await req;

    // Expect success
    expect([200, 201]).toContain(res.status);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe(todoData.title);

    const todoId = res.body.id;

    // Retrieve
    const getReq = request(app).get(`/api/todos/${todoId}`);
    if (token) getReq.set("Authorization", `Bearer ${token}`);
    getReq.set("x-user-id", userId);

    const getRes = await getReq;
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe(todoData.title);
  });
});
