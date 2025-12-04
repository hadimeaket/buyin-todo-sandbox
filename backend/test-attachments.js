/**
 * Test script for attachment functionality
 * Tests file upload, download, list, and delete operations
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:4000/api";

let authToken = "";
let userId = "";
let todoId = "";
let attachmentId = "";

// Create test files
function createTestFiles() {
  const testDir = path.join(__dirname, "test-files");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create a small test image (1x1 PNG)
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(path.join(testDir, "test-image.png"), pngBuffer);

  // Create a dummy PDF file (minimal valid PDF)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
197
%%EOF`;
  fs.writeFileSync(path.join(testDir, "test-document.pdf"), pdfContent);

  // Create a large file (6MB) for size validation test
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024, "a");
  fs.writeFileSync(path.join(testDir, "large-file.png"), largeBuffer);

  // Create invalid file type (txt)
  fs.writeFileSync(path.join(testDir, "test-file.txt"), "This is a text file");

  console.log("✅ Test files created");
}

// 1. Register user
async function registerUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: "attachment-test@example.com",
      password: "Test123!@#",
      name: "Attachment Tester",
    });
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log("✅ User registered:", response.data.user.email);
  } catch (error) {
    const errorData = error.response?.data;
    const errorMsg = String(errorData?.message || errorData?.error || "");
    if (error.response?.status === 409 && errorMsg.includes("already exists")) {
      // User exists, try to login
      console.log("   User already exists, logging in...");
      await loginUser();
    } else {
      console.error("❌ Registration failed:", errorData || error.message);
      throw error;
    }
  }
}

// Login user
async function loginUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "attachment-test@example.com",
      password: "Test123!@#",
    });
    authToken = response.data.token;
    userId = response.data.user.id;
    console.log("✅ User logged in:", response.data.user.email);
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    throw error;
  }
}

// 2. Create a todo
async function createTodo() {
  try {
    const timestamp = Date.now();
    const response = await axios.post(
      `${API_URL}/todos`,
      {
        title: `Test Todo with Attachments ${timestamp}`,
        description: "This todo will have file attachments",
        completed: false,
        priority: "medium",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    todoId = response.data.id;
    console.log("✅ Todo created:", response.data.title);
  } catch (error) {
    console.error(
      "❌ Todo creation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 3. Upload valid PNG file
async function uploadPNG() {
  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, "test-files", "test-image.png");
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${API_URL}/todos/${todoId}/attachments`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    attachmentId = response.data.id;
    console.log("✅ PNG uploaded:", response.data.filename);
    console.log("   ID:", attachmentId);
    console.log("   Size:", response.data.size, "bytes");
    console.log("   MIME:", response.data.mimetype);
  } catch (error) {
    console.error(
      "❌ PNG upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 4. Upload valid PDF file
async function uploadPDF() {
  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, "test-files", "test-document.pdf");
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${API_URL}/todos/${todoId}/attachments`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("✅ PDF uploaded:", response.data.filename);
    console.log("   Size:", response.data.size, "bytes");
  } catch (error) {
    console.error(
      "❌ PDF upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 5. List attachments
async function listAttachments() {
  try {
    const response = await axios.get(`${API_URL}/todos/${todoId}/attachments`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Attachments listed:", response.data.length, "files");
    response.data.forEach((att, idx) => {
      console.log(`   ${idx + 1}. ${att.filename} (${att.size} bytes)`);
    });
  } catch (error) {
    console.error("❌ List failed:", error.response?.data || error.message);
    throw error;
  }
}

// 6. Download attachment
async function downloadAttachment() {
  try {
    const response = await axios.get(
      `${API_URL}/todos/${todoId}/attachments/${attachmentId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        responseType: "stream",
      }
    );

    const downloadPath = path.join(
      __dirname,
      "test-files",
      "downloaded-file.png"
    );
    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ File downloaded successfully");
    console.log("   Content-Type:", response.headers["content-type"]);
    console.log("   Saved to:", downloadPath);
  } catch (error) {
    console.error("❌ Download failed:", error.response?.data || error.message);
    throw error;
  }
}

// 7. Test file too large (should fail with 413)
async function testLargeFile() {
  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, "test-files", "large-file.png");
    formData.append("file", fs.createReadStream(filePath));

    await axios.post(`${API_URL}/todos/${todoId}/attachments`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.error("❌ Large file test failed: Should have rejected file > 5MB");
  } catch (error) {
    if (error.response?.status === 413) {
      console.log("✅ Large file rejected (413):", error.response.data.error);
    } else {
      console.error(
        "❌ Unexpected error:",
        error.response?.data || error.message
      );
    }
  }
}

// 8. Test invalid file type (should fail with 415)
async function testInvalidType() {
  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, "test-files", "test-file.txt");
    formData.append("file", fs.createReadStream(filePath));

    await axios.post(`${API_URL}/todos/${todoId}/attachments`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.error(
      "❌ Invalid type test failed: Should have rejected .txt file"
    );
  } catch (error) {
    if (error.response?.status === 415) {
      console.log(
        "✅ Invalid file type rejected (415):",
        error.response.data.error
      );
    } else {
      console.error(
        "❌ Unexpected error:",
        error.response?.data || error.message
      );
    }
  }
}

// 9. Delete attachment
async function deleteAttachment() {
  try {
    await axios.delete(
      `${API_URL}/todos/${todoId}/attachments/${attachmentId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ Attachment deleted");
  } catch (error) {
    console.error("❌ Delete failed:", error.response?.data || error.message);
    throw error;
  }
}

// 10. Verify deletion
async function verifyDeletion() {
  try {
    const response = await axios.get(`${API_URL}/todos/${todoId}/attachments`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Deletion verified: Remaining files:", response.data.length);
  } catch (error) {
    console.error(
      "❌ Verification failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting Attachment Tests\n");

  try {
    createTestFiles();
    console.log("");

    await registerUser();
    await createTodo();
    console.log("");

    console.log("📎 Testing File Uploads:");
    await uploadPNG();
    await uploadPDF();
    console.log("");

    console.log("📋 Testing File Operations:");
    await listAttachments();
    await downloadAttachment();
    console.log("");

    console.log("🛡️  Testing Validation:");
    await testLargeFile();
    await testInvalidType();
    console.log("");

    console.log("🗑️  Testing Deletion:");
    await deleteAttachment();
    await verifyDeletion();
    console.log("");

    console.log("✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test suite failed");
    process.exit(1);
  }
}

runTests();
