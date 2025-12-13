const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function readJsonIfExists(absPath, fallback) {
  if (!fs.existsSync(absPath)) return fallback;
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

function getLocalVibeBranches() {
  try {
    const out = execSync('git branch --list "*-vibe"', {
      cwd: repoRoot,
      encoding: "utf8",
    });
    return out
      .split(/\r?\n/)
      .map((l) => l.replace(/^\*\s*/, "").trim())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function firstExistingPath(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return paths[0];
}

const branchesPath = firstExistingPath([
  path.join(repoRoot, "evaluation/branches.json"),
  path.join(repoRoot, "evaluation/data_safe/branches.json"),
]);
const chatsPath = firstExistingPath([
  path.join(repoRoot, "evaluation/chat_task_attempts.json"),
  path.join(repoRoot, "evaluation/data_safe/chat_task_attempts.json"),
]);
const codePath = firstExistingPath([
  path.join(repoRoot, "evaluation/deep_code_analysis.json"),
  path.join(repoRoot, "evaluation/data_safe/deep_code_analysis.json"),
]);

const branches = readJsonIfExists(branchesPath, getLocalVibeBranches());
const chats = readJsonIfExists(chatsPath, {});
const code = readJsonIfExists(codePath, {});

const results = {};

const args = process.argv.slice(2);
const onlyTask2 =
  args.includes("--only-task2") || process.env.ONLY_TASK2 === "1";
const branchFilterArg = args.find((a) => a.startsWith("--branches="));
const branchFilter = branchFilterArg
  ? branchFilterArg
      .replace("--branches=", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

function readFileOrThrow(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

// Read injection files once from evaluation/tests (stable across branch checkouts)
const injectedFiles = [
  {
    rel: "backend/tests/task2.user-accounts.test.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/task2.user-accounts.test.ts")
    ),
  },
  {
    rel: "backend/tests/task3.categories.test.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/task3.categories.test.ts")
    ),
  },
  {
    rel: "backend/tests/task4.attachments.test.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/task4.attachments.test.ts")
    ),
  },
  {
    rel: "backend/tests/task5.calendar.test.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/task5.calendar.test.ts")
    ),
  },
  {
    rel: "backend/tests/utils/testDb.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/utils/testDb.ts")
    ),
  },
  {
    rel: "backend/tests/task1.persistent-todos.test.ts",
    content: readFileOrThrow(
      path.join(repoRoot, "evaluation/tests/task1.persistent-todos.test.ts")
    ),
  },
];

function runCmd(cmd, cwd = ".") {
  try {
    return execSync(`${cmd} 2>&1`, { cwd, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "");
  }
}

function runCmdOk(cmd, cwd = ".") {
  try {
    execSync(`${cmd} 2>&1`, { cwd, encoding: "utf8", stdio: "pipe" });
    return { ok: true, output: "" };
  } catch (e) {
    const out = (e.stdout || "") + (e.stderr || "");
    return { ok: false, output: out };
  }
}

function analyzeBranch(branch) {
  console.log(`Analyzing Tests for ${branch}...`);
  const branchName = branch.replace("origin/", "");

  try {
    runCmd(
      `git checkout ${branchName} 2>/dev/null || git checkout -b ${branchName} origin/${branchName} 2>/dev/null`
    );
  } catch (e) {
    console.log(`Failed to checkout ${branchName}`);
    return;
  }

  // Inject tests into the branch working tree
  for (const f of injectedFiles) {
    const absTarget = path.join(repoRoot, f.rel);
    fs.mkdirSync(path.dirname(absTarget), { recursive: true });
    fs.writeFileSync(absTarget, f.content);
  }

  // Remove common persistent DB artifacts so branches don't interfere with each other.
  runCmd('find backend -maxdepth 3 -type f -name "*.db" -delete || true');
  runCmd('find backend -maxdepth 3 -type f -name "*.sqlite" -delete || true');
  runCmd('find backend -maxdepth 3 -type f -name "*.sqlite3" -delete || true');
  runCmd("rm -rf backend/data backend/.data backend/tmp backend/.tmp || true");

  // Install test deps if missing
  if (fs.existsSync("backend/package.json")) {
    runCmd("npm install", "backend");

    const pkg = fs.readFileSync("backend/package.json", "utf8");
    if (!pkg.includes("supertest")) {
      runCmd("npm install --save-dev supertest @types/supertest", "backend");
    }
    if (!pkg.includes("mongodb-memory-server")) {
      runCmd("npm install --save-dev mongodb-memory-server", "backend");
    }
  }

  // Parse Results
  const verified = { T1: false, T2: false, T3: false, T4: false, T5: false };

  const debugDir = path.join(repoRoot, "evaluation/debug");
  if (onlyTask2) fs.mkdirSync(debugDir, { recursive: true });

  const testFiles = [
    { key: "T1", path: "tests/task1.persistent-todos.test.ts" },
    { key: "T2", path: "tests/task2.user-accounts.test.ts" },
    { key: "T3", path: "tests/task3.categories.test.ts" },
    { key: "T4", path: "tests/task4.attachments.test.ts" },
    { key: "T5", path: "tests/task5.calendar.test.ts" },
  ];

  for (const tf of testFiles) {
    if (onlyTask2 && tf.key !== "T2") continue;
    const cmd = `npm test -- --runTestsByPath ${tf.path} --runInBand --forceExit`;
    const result = runCmdOk(cmd, "backend");
    verified[tf.key] = result.ok;
    if (onlyTask2 && tf.key === "T2") {
      fs.writeFileSync(
        path.join(debugDir, `${branchName}.task2.out.txt`),
        result.output || ""
      );
    }
  }

  // Combine with existing data
  const chatData = chats[branchName] || {};
  const codeData = code[branchName] || {};

  results[branchName] = {
    branch_id: branchName,
    attempted: {
      T1: chatData.T1?.attempted || false,
      T2: chatData.T2?.attempted || false,
      T3: chatData.T3?.attempted || false,
      T4: chatData.T4?.attempted || false,
      T5: chatData.T5?.attempted || false,
    },
    implemented: {
      T1: codeData.t1_persistence && codeData.t1_persistence !== "memory/other",
      T2: codeData.t2_auth === "implemented",
      T3: codeData.t3_categories === "implemented",
      T4: codeData.t4_attachments === "implemented",
      T5: codeData.t5_calendar === "implemented",
    },
    verified: verified,
  };

  // Clean up injected/modified files so the next checkout doesn't fail.
  runCmd("git reset --hard");
}

// Backup tests first
runCmd("mkdir -p temp_tests");
runCmd("cp backend/tests/*.ts temp_tests/");

// Main Loop
for (const branch of branches) {
  const branchName = branch.replace("origin/", "");
  if (branchFilter && !branchFilter.includes(branchName)) continue;
  analyzeBranch(branch);
}

// Restore Thesis Branch
runCmd("git checkout thesis");

fs.writeFileSync(
  "evaluation/task_pipeline_v3.json",
  JSON.stringify(results, null, 2)
);

// CSV Generation
let csv =
  "branch_id,attempted_T1,implemented_T1,verified_T1,attempted_T2,implemented_T2,verified_T2,attempted_T3,implemented_T3,verified_T3,attempted_T4,implemented_T4,verified_T4,attempted_T5,implemented_T5,verified_T5\n";
Object.values(results).forEach((r) => {
  csv += `${r.branch_id},${r.attempted.T1},${r.implemented.T1},${r.verified.T1},${r.attempted.T2},${r.implemented.T2},${r.verified.T2},${r.attempted.T3},${r.implemented.T3},${r.verified.T3},${r.attempted.T4},${r.implemented.T4},${r.verified.T4},${r.attempted.T5},${r.implemented.T5},${r.verified.T5}\n`;
});
fs.writeFileSync("evaluation/task_pipeline_v3.csv", csv);
