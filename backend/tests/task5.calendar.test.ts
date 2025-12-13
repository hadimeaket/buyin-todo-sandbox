import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { connectDB, closeDB } from "./utils/testDb";

type AnyObj = Record<string, any>;

function toYyyyMmDd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseTodos(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.todos)) return body.todos;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

function getTodoId(todo: AnyObj | undefined): string | undefined {
  if (!todo) return undefined;
  return (
    todo.id ||
    todo._id ||
    todo.todoId ||
    todo.todo_id ||
    todo.uuid ||
    todo.uid
  );
}

function extractRange(todo: AnyObj | undefined): { start: Date; end: Date } | null {
  if (!todo) return null;

  const pairs: Array<[string, string]> = [
    ["dueDate", "dueEndDate"],
    ["startDate", "endDate"],
    ["start", "end"],
    ["from", "to"],
  ];

  for (const [startKey, endKey] of pairs) {
    const startRaw = todo[startKey];
    const endRaw = todo[endKey];
    if (!startRaw || !endRaw) continue;
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) continue;
    return { start, end };
  }

  return null;
}

async function getFilteredTodos(app: any, headers: Record<string, string>, start: string, end: string) {
  const resIso = await request(app)
    .get("/api/todos")
    .query({ start, end })
    .set(headers);
  if (resIso.status === 200 && Array.isArray(parseTodos(resIso.body))) return resIso;

  // Some implementations expect dates without time component (YYYY-MM-DD).
  const resDateOnly = await request(app)
    .get("/api/todos")
    .query({ start: start.slice(0, 10), end: end.slice(0, 10) })
    .set(headers);
  return resDateOnly;
}

describe("TASK5_CALENDAR", () => {
  let app: any;
  let authToken: string | undefined;
  const testUser = {
    email: `cal-test-${Date.now()}@example.com`,
    password: "password123",
  };

  beforeAll(async () => {
    await connectDB();
    const mod = require("../src/server");
    app = mod.default || mod;

    // Register & Login
    try {
      await request(app).post("/api/auth/register").send(testUser);
      const loginRes = await request(app).post("/api/auth/login").send(testUser);
      authToken = loginRes.body?.token || loginRes.body?.accessToken;
    } catch {
      // Some branches might not implement auth at all. We'll still try to evaluate
      // Task 5 via public todo routes (authenticated or not).
      authToken = undefined;
    }
  });

  afterAll(async () => {
    await closeDB();
  });

  it("supports multi-day todos for calendar queries (persisted range + overlap filtering)", async () => {
    const headers: Record<string, string> = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    // If auth is required but not available, we cannot evaluate Task 5 reliably.
    const probe = await request(app).get("/api/todos").set(headers);
    if (probe.status === 401 || probe.status === 403) {
      throw new Error(
        "Cannot access /api/todos (auth required) and no token was obtained; cannot evaluate Task 5 calendar behavior."
      );
    }
    expect([200, 401, 403]).toContain(probe.status);

    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 86400000);
    const middle = new Date(start.getTime() + 86400000);
    const outside = new Date(start.getTime() + 10 * 86400000);

    const spanTitle = `Span-${Date.now()}`;
    const outsideTitle = `Outside-${Date.now()}`;

    // Create a true multi-day todo (end > start).
    const createAttempts: AnyObj[] = [
      { title: spanTitle, dueDate: start.toISOString(), dueEndDate: end.toISOString() },
      { title: spanTitle, startDate: start.toISOString(), endDate: end.toISOString() },
      { title: spanTitle, start: start.toISOString(), end: end.toISOString() },
      { title: spanTitle, from: start.toISOString(), to: end.toISOString() },
    ];

    let createdOk = false;
    for (const payload of createAttempts) {
      const res = await request(app).post("/api/todos").set(headers).send(payload);
      if ([200, 201].includes(res.status)) {
        createdOk = true;
        break;
      }
    }
    expect(createdOk).toBe(true);

    const createOutside = await request(app)
      .post("/api/todos")
      .set(headers)
      .send({ title: outsideTitle, dueDate: outside.toISOString() });
    expect([200, 201]).toContain(createOutside.status);

    const unfiltered = await request(app).get("/api/todos").set(headers);
    expect(unfiltered.status).toBe(200);
    const allTodos = parseTodos(unfiltered.body);
    expect(Array.isArray(allTodos)).toBe(true);

    const spanTodo = allTodos.find((t) => t?.title === spanTitle);
    expect(spanTodo).toBeTruthy();
    const range = extractRange(spanTodo);
    expect(range).toBeTruthy();
    expect(range!.end.getTime()).toBeGreaterThan(range!.start.getTime());

    // Calendar queries: when requesting a single day within the span,
    // the spanning todo must be included and a clearly outside todo must be excluded.
    const filtered = await getFilteredTodos(app, headers, middle.toISOString(), middle.toISOString());
    expect(filtered.status).toBe(200);
    const filteredTodos = parseTodos(filtered.body);
    expect(Array.isArray(filteredTodos)).toBe(true);

    const filteredTitles = filteredTodos.map((t) => t?.title);
    expect(filteredTitles).toContain(spanTitle);
    expect(filteredTitles).not.toContain(outsideTitle);

    // Negative control: end == start must not be treated as multi-day.
    const eqTitle = `Eq-${Date.now()}`;
    const eqCreate = await request(app)
      .post("/api/todos")
      .set(headers)
      .send({ title: eqTitle, dueDate: start.toISOString(), dueEndDate: start.toISOString() });
    expect([200, 201, 400, 409, 422]).toContain(eqCreate.status);
    if ([200, 201].includes(eqCreate.status)) {
      const afterEq = await request(app).get("/api/todos").set(headers);
      const eqTodo = parseTodos(afterEq.body).find((t) => t?.title === eqTitle);
      if (eqTodo) {
        const eqRange = extractRange(eqTodo);
        if (eqRange) {
          expect(eqRange.end.getTime()).not.toBeGreaterThan(eqRange.start.getTime());
        }
      }
    }
  });
});
