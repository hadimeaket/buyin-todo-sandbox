/**
 * Category API Test Script
 * Tests all category endpoints and todo integration
 */

const http = require("http");

const BASE_URL = "http://localhost:4000";
let authToken = "";
let testCategoryId = "";
let testTodoId = "";

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
  console.log("🧪 Starting Category Tests\n");
  console.log("=".repeat(50));

  try {
    // Test 1: Register user
    console.log("\n📝 Test 1: Register user for testing");
    const registerRes = await makeRequest("POST", "/api/auth/register", {
      email: `cattest${Date.now()}@example.com`,
      password: "password123",
      name: "Category Test User",
    });
    console.log(`Status: ${registerRes.status}`);
    if (registerRes.status === 201 && registerRes.data.token) {
      authToken = registerRes.data.token;
      console.log("✅ User registered and authenticated");
    } else {
      console.log("❌ Registration failed");
      return;
    }

    // Test 2: Get categories (should be empty)
    console.log("\n📋 Test 2: Get categories (should be empty)");
    const emptyCategoriesRes = await makeRequest(
      "GET",
      "/api/categories",
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${emptyCategoriesRes.status}`);
    console.log("Response:", JSON.stringify(emptyCategoriesRes.data, null, 2));
    console.log(
      emptyCategoriesRes.status === 200 && emptyCategoriesRes.data.length === 0
        ? "✅ Empty categories list"
        : "❌ Expected empty array"
    );

    // Test 3: Create category
    console.log("\n➕ Test 3: Create category");
    const createCategoryRes = await makeRequest(
      "POST",
      "/api/categories",
      {
        name: "Work",
        color: "#FF5733",
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${createCategoryRes.status}`);
    console.log("Response:", JSON.stringify(createCategoryRes.data, null, 2));
    if (createCategoryRes.status === 201) {
      testCategoryId = createCategoryRes.data.id;
      console.log("✅ Category created");
    } else {
      console.log("❌ Category creation failed");
    }

    // Test 4: Get all categories (should have 1)
    console.log("\n📋 Test 4: Get categories (should have 1)");
    const categoriesRes = await makeRequest("GET", "/api/categories", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`Status: ${categoriesRes.status}`);
    console.log("Response:", JSON.stringify(categoriesRes.data, null, 2));
    console.log(
      categoriesRes.status === 200 && categoriesRes.data.length === 1
        ? "✅ Category list correct"
        : "❌ Expected 1 category"
    );

    // Test 5: Get category by ID
    console.log("\n🔍 Test 5: Get category by ID");
    const getCategoryRes = await makeRequest(
      "GET",
      `/api/categories/${testCategoryId}`,
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${getCategoryRes.status}`);
    console.log("Response:", JSON.stringify(getCategoryRes.data, null, 2));
    console.log(
      getCategoryRes.status === 200
        ? "✅ Get category successful"
        : "❌ Get category failed"
    );

    // Test 6: Update category
    console.log("\n✏️  Test 6: Update category");
    const updateCategoryRes = await makeRequest(
      "PUT",
      `/api/categories/${testCategoryId}`,
      {
        name: "Work Updated",
        color: "#3498DB",
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${updateCategoryRes.status}`);
    console.log("Response:", JSON.stringify(updateCategoryRes.data, null, 2));
    console.log(
      updateCategoryRes.status === 200 &&
        updateCategoryRes.data.name === "Work Updated"
        ? "✅ Category updated"
        : "❌ Category update failed"
    );

    // Test 7: Create duplicate category (should fail)
    console.log("\n🚫 Test 7: Create duplicate category (should fail)");
    const duplicateCategoryRes = await makeRequest(
      "POST",
      "/api/categories",
      {
        name: "Work Updated",
        color: "#000000",
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${duplicateCategoryRes.status}`);
    console.log(
      "Response:",
      JSON.stringify(duplicateCategoryRes.data, null, 2)
    );
    console.log(
      duplicateCategoryRes.status === 409
        ? "✅ Duplicate category rejected"
        : "❌ Duplicate category not rejected"
    );

    // Test 8: Create category with invalid HEX color (should fail)
    console.log("\n🚫 Test 8: Invalid HEX color (should fail)");
    const invalidColorRes = await makeRequest(
      "POST",
      "/api/categories",
      {
        name: "Invalid Color",
        color: "FF5733", // Missing #
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${invalidColorRes.status}`);
    console.log("Response:", JSON.stringify(invalidColorRes.data, null, 2));
    console.log(
      invalidColorRes.status === 400
        ? "✅ Invalid HEX color rejected"
        : "❌ Invalid HEX color not rejected"
    );

    // Test 9: Create category with invalid HEX format (should fail)
    console.log("\n🚫 Test 9: Invalid HEX format (should fail)");
    const invalidHexRes = await makeRequest(
      "POST",
      "/api/categories",
      {
        name: "Invalid Hex",
        color: "#GGGGGG", // Invalid hex characters
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${invalidHexRes.status}`);
    console.log("Response:", JSON.stringify(invalidHexRes.data, null, 2));
    console.log(
      invalidHexRes.status === 400
        ? "✅ Invalid HEX format rejected"
        : "❌ Invalid HEX format not rejected"
    );

    // Test 10: Create todo with category
    console.log("\n➕ Test 10: Create todo with category");
    const createTodoRes = await makeRequest(
      "POST",
      "/api/todos",
      {
        title: "Test Todo with Category",
        description: "This todo has a category",
        categoryId: testCategoryId,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${createTodoRes.status}`);
    console.log("Response:", JSON.stringify(createTodoRes.data, null, 2));
    if (createTodoRes.status === 201 && createTodoRes.data.category) {
      testTodoId = createTodoRes.data.id;
      console.log("✅ Todo created with category");
      console.log(
        `   Category: ${createTodoRes.data.category.name} (${createTodoRes.data.category.color})`
      );
    } else {
      console.log("❌ Todo creation with category failed");
    }

    // Test 11: Get todos (should show category)
    console.log("\n📋 Test 11: Get todos with category populated");
    const todosRes = await makeRequest("GET", "/api/todos", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`Status: ${todosRes.status}`);
    console.log("Response:", JSON.stringify(todosRes.data, null, 2));
    console.log(
      todosRes.status === 200 && todosRes.data[0]?.category
        ? "✅ Todo shows category details"
        : "❌ Category not populated in todo"
    );

    // Test 12: Update todo to remove category
    console.log("\n✏️  Test 12: Remove category from todo");
    const updateTodoRes = await makeRequest(
      "PUT",
      `/api/todos/${testTodoId}`,
      {
        categoryId: null,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${updateTodoRes.status}`);
    console.log("Response:", JSON.stringify(updateTodoRes.data, null, 2));
    console.log(
      updateTodoRes.status === 200 && !updateTodoRes.data.categoryId
        ? "✅ Category removed from todo"
        : "❌ Failed to remove category"
    );

    // Test 13: Try to delete category with todos (should fail after re-assignment)
    console.log("\n✏️  Test 13: Re-assign category to todo");
    await makeRequest(
      "PUT",
      `/api/todos/${testTodoId}`,
      {
        categoryId: testCategoryId,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );

    console.log(
      "\n🚫 Test 14: Try to delete category with todos (should fail)"
    );
    const deleteCategoryWithTodosRes = await makeRequest(
      "DELETE",
      `/api/categories/${testCategoryId}`,
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${deleteCategoryWithTodosRes.status}`);
    console.log(
      "Response:",
      JSON.stringify(deleteCategoryWithTodosRes.data, null, 2)
    );
    console.log(
      deleteCategoryWithTodosRes.status === 409
        ? "✅ Cannot delete category with todos"
        : "❌ Should not allow deleting category with todos"
    );

    // Test 15: Delete todo, then delete category
    console.log("\n🗑️  Test 15: Delete todo");
    const deleteTodoRes = await makeRequest(
      "DELETE",
      `/api/todos/${testTodoId}`,
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${deleteTodoRes.status}`);
    console.log(
      deleteTodoRes.status === 204
        ? "✅ Todo deleted"
        : "❌ Todo deletion failed"
    );

    console.log("\n🗑️  Test 16: Delete category (should succeed now)");
    const deleteCategoryRes = await makeRequest(
      "DELETE",
      `/api/categories/${testCategoryId}`,
      null,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log(`Status: ${deleteCategoryRes.status}`);
    console.log(
      deleteCategoryRes.status === 204
        ? "✅ Category deleted"
        : "❌ Category deletion failed"
    );

    // Test 17: Access categories without auth (should fail)
    console.log("\n🚫 Test 17: Access categories without auth (should fail)");
    const unauthRes = await makeRequest("GET", "/api/categories");
    console.log(`Status: ${unauthRes.status}`);
    console.log("Response:", JSON.stringify(unauthRes.data, null, 2));
    console.log(
      unauthRes.status === 401
        ? "✅ Unauthorized access blocked"
        : "❌ Unauthorized access not blocked"
    );

    console.log("\n" + "=".repeat(50));
    console.log("✅ All category tests completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Wait for server to be ready, then run tests
setTimeout(runTests, 2000);
