/**
 * Authentication API Test Script
 * Tests all auth endpoints and protected routes
 */

const http = require("http");

const BASE_URL = "http://localhost:4000";
let authToken = "";

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🧪 Starting Authentication Tests\n");
  console.log("=".repeat(50));

  try {
    // Test 1: Register new user
    console.log("\n📝 Test 1: Register new user");
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    };
    const registerRes = await makeRequest(
      "POST",
      "/api/auth/register",
      registerData
    );
    console.log(`Status: ${registerRes.status}`);
    console.log("Response:", JSON.stringify(registerRes.data, null, 2));

    if (registerRes.status === 201 && registerRes.data.token) {
      authToken = registerRes.data.token;
      console.log("✅ Registration successful");
    } else {
      console.log("❌ Registration failed");
      return;
    }

    // Test 2: Login with registered user
    console.log("\n🔐 Test 2: Login with registered user");
    const loginRes = await makeRequest("POST", "/api/auth/login", {
      email: registerData.email,
      password: registerData.password,
    });
    console.log(`Status: ${loginRes.status}`);
    console.log("Response:", JSON.stringify(loginRes.data, null, 2));
    console.log(
      loginRes.status === 200 ? "✅ Login successful" : "❌ Login failed"
    );

    // Test 3: Get current user
    console.log("\n👤 Test 3: Get current user");
    const meRes = await makeRequest("GET", "/api/auth/me", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`Status: ${meRes.status}`);
    console.log("Response:", JSON.stringify(meRes.data, null, 2));
    console.log(
      meRes.status === 200 ? "✅ Get user successful" : "❌ Get user failed"
    );

    // Test 4: Get todos (should be empty)
    console.log("\n📋 Test 4: Get todos (should be empty)");
    const todosRes = await makeRequest("GET", "/api/todos", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`Status: ${todosRes.status}`);
    console.log("Response:", JSON.stringify(todosRes.data, null, 2));
    console.log(
      todosRes.status === 200 && Array.isArray(todosRes.data)
        ? "✅ Get todos successful"
        : "❌ Get todos failed"
    );

    // Test 5: Create a todo
    console.log("\n➕ Test 5: Create a todo");
    const createTodoRes = await makeRequest(
      "POST",
      "/api/todos",
      {
        title: "Test Todo",
        description: "This is a test todo",
        completed: false,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${createTodoRes.status}`);
    console.log("Response:", JSON.stringify(createTodoRes.data, null, 2));
    console.log(
      createTodoRes.status === 201
        ? "✅ Create todo successful"
        : "❌ Create todo failed"
    );

    // Test 6: Get todos (should have 1 todo)
    console.log("\n📋 Test 6: Get todos (should have 1 todo)");
    const todosRes2 = await makeRequest("GET", "/api/todos", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`Status: ${todosRes2.status}`);
    console.log("Response:", JSON.stringify(todosRes2.data, null, 2));
    console.log(
      todosRes2.status === 200 && todosRes2.data.length === 1
        ? "✅ Get todos successful"
        : "❌ Get todos failed"
    );

    // Test 7: Access todos without token
    console.log("\n🚫 Test 7: Access todos without token (should fail)");
    const unauthorizedRes = await makeRequest("GET", "/api/todos");
    console.log(`Status: ${unauthorizedRes.status}`);
    console.log("Response:", JSON.stringify(unauthorizedRes.data, null, 2));
    console.log(
      unauthorizedRes.status === 401
        ? "✅ Unauthorized access blocked"
        : "❌ Unauthorized access not blocked"
    );

    // Test 8: Login with wrong password
    console.log("\n🚫 Test 8: Login with wrong password (should fail)");
    const wrongPasswordRes = await makeRequest("POST", "/api/auth/login", {
      email: registerData.email,
      password: "wrongpassword",
    });
    console.log(`Status: ${wrongPasswordRes.status}`);
    console.log("Response:", JSON.stringify(wrongPasswordRes.data, null, 2));
    console.log(
      wrongPasswordRes.status === 401
        ? "✅ Wrong password rejected"
        : "❌ Wrong password not rejected"
    );

    // Test 9: Register with existing email
    console.log("\n🚫 Test 9: Register with existing email (should fail)");
    const duplicateRes = await makeRequest(
      "POST",
      "/api/auth/register",
      registerData
    );
    console.log(`Status: ${duplicateRes.status}`);
    console.log("Response:", JSON.stringify(duplicateRes.data, null, 2));
    console.log(
      duplicateRes.status === 409
        ? "✅ Duplicate email rejected"
        : "❌ Duplicate email not rejected"
    );

    // Test 10: Google SSO mock
    console.log("\n🔑 Test 10: Google SSO mock");
    const googleRes = await makeRequest("POST", "/api/auth/google", {
      email: `google${Date.now()}@example.com`,
      name: "Google User",
    });
    console.log(`Status: ${googleRes.status}`);
    console.log("Response:", JSON.stringify(googleRes.data, null, 2));
    console.log(
      googleRes.status === 200 && googleRes.data.token
        ? "✅ Google SSO successful"
        : "❌ Google SSO failed"
    );

    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Wait for server to be ready, then run tests
setTimeout(runTests, 2000);
