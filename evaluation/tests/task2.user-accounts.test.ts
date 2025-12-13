import request, { Response } from "supertest";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { connectDB, closeDB, clearDB } from "./utils/testDb";

jest.setTimeout(30_000);

type AuthArtifacts =
  | { kind: "bearer"; token: string }
  | { kind: "cookie"; cookies: string[] }
  | { kind: "none" };

function pickToken(res: Response): string | undefined {
  const body: any = res.body;
  return (
    body?.token ||
    body?.accessToken ||
    body?.access_token ||
    body?.jwt ||
    body?.data?.token ||
    body?.data?.accessToken
  );
}

function pickCookies(res: Response): string[] | undefined {
  const raw = res.headers["set-cookie"];
  if (!raw) return undefined;
  return Array.isArray(raw) ? raw : [raw];
}

function withAuth(req: request.Test, auth: AuthArtifacts): request.Test {
  if (auth.kind === "bearer")
    return req.set("Authorization", `Bearer ${auth.token}`);
  if (auth.kind === "cookie") return req.set("Cookie", auth.cookies);
  return req;
}

async function postFirstMatch(
  app: any,
  endpoints: string[],
  payloads: Array<Record<string, unknown>>
): Promise<{ endpoint: string; response: Response } | undefined> {
  for (const endpoint of endpoints) {
    for (const payload of payloads) {
      const res = await request(app).post(endpoint).send(payload);
      if ([404, 405].includes(res.status)) continue;
      return { endpoint, response: res };
    }
  }
  return undefined;
}

async function registerUser(app: any, email: string, password: string) {
  const endpoints = [
    "/api/auth/register",
    "/api/auth/signup",
    "/api/users/register",
    "/api/users",
    "/auth/register",
    "/auth/signup",
    "/users/register",
    "/users",
  ];

  const payloads = [
    { email, password },
    { email, password, name: "Test User" },
    { username: email, password },
    { username: email, password, email },
    { email, password, passwordConfirmation: password },
    { email, password, confirmPassword: password },
  ];

  const match = await postFirstMatch(app, endpoints, payloads);
  if (!match) {
    throw new Error(
      `No working registration endpoint found. Tried: ${endpoints.join(", ")}`
    );
  }
  return match;
}

async function loginUser(app: any, email: string, password: string) {
  const endpoints = [
    "/api/auth/login",
    "/api/auth/signin",
    "/api/auth/token",
    "/api/sessions",
    "/auth/login",
    "/auth/signin",
    "/sessions",
  ];

  const payloads = [
    { email, password },
    { username: email, password },
    { identifier: email, password },
    { login: email, password },
  ];

  const match = await postFirstMatch(app, endpoints, payloads);
  if (!match) {
    throw new Error(
      `No working login endpoint found. Tried: ${endpoints.join(", ")}`
    );
  }
  return match;
}

function authFromLogin(res: Response): AuthArtifacts {
  const token = pickToken(res);
  if (token) return { kind: "bearer", token };
  const cookies = pickCookies(res);
  if (cookies?.length) return { kind: "cookie", cookies };
  return { kind: "none" };
}

describe("TASK2_USER_ACCOUNTS", () => {
  let app: any;

  beforeAll(async () => {
    process.env.PORT = "0";
    await connectDB();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    const mod = require("../src/server");
    app = mod.default || mod;
  });

  afterAll(async () => {
    await closeDB();
    jest.restoreAllMocks();
  });

  it("registers and logs in a user (token or cookie)", async () => {
    const email = `t2-${Date.now()}@example.com`;
    const password = "password123";

    const reg = await registerUser(app, email, password);
    expect([200, 201]).toContain(reg.response.status);

    const login = await loginUser(app, email, password);
    expect([200, 201]).toContain(login.response.status);
    const auth = authFromLogin(login.response);
    expect(auth.kind).not.toBe("none");
  });

  it("rejects passwords shorter than 8 characters (or equivalent policy)", async () => {
    const email = `t2-short-${Date.now()}@example.com`;
    const shortPassword = "1234567";

    const reg = await registerUser(app, email, shortPassword);
    if ([400, 401, 409, 422].includes(reg.response.status)) return;

    const login = await loginUser(app, email, shortPassword);
    const auth = authFromLogin(login.response);
    expect(auth.kind).toBe("none");
  });

  it("enforces auth and user scoping for /api/todos", async () => {
    await clearDB();

    const userA = {
      email: `t2-a-${Date.now()}@example.com`,
      password: "password123",
    };
    const userB = {
      email: `t2-b-${Date.now()}@example.com`,
      password: "password123",
    };

    await registerUser(app, userA.email, userA.password);
    const loginA = await loginUser(app, userA.email, userA.password);
    const authA = authFromLogin(loginA.response);
    expect(authA.kind).not.toBe("none");

    const unauth = await request(app).get("/api/todos");
    expect([401, 403]).toContain(unauth.status);

    const todoTitle = `Scoped ${Date.now()}`;
    const created = await withAuth(
      request(app).post("/api/todos").send({ title: todoTitle }),
      authA
    );
    expect([200, 201]).toContain(created.status);

    const listA = await withAuth(request(app).get("/api/todos"), authA);
    expect(listA.status).toBe(200);
    expect(Array.isArray(listA.body)).toBe(true);
    expect((listA.body as any[]).some((t) => t?.title === todoTitle)).toBe(
      true
    );

    await registerUser(app, userB.email, userB.password);
    const loginB = await loginUser(app, userB.email, userB.password);
    const authB = authFromLogin(loginB.response);
    expect(authB.kind).not.toBe("none");

    const listB = await withAuth(request(app).get("/api/todos"), authB);
    expect(listB.status).toBe(200);
    expect((listB.body as any[]).some((t) => t?.title === todoTitle)).toBe(
      false
    );
  });
});
