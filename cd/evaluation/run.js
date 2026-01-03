#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
} = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const evaluationDir = path.join(rootDir, "evaluation");
const LOG_CHAR_LIMIT = Number(process.env.EVAL_LOG_CHAR_LIMIT || 20000);

const TASK_DEFINITIONS = [
  { id: 1, name: "Persistent Todos" },
  { id: 2, name: "User Accounts" },
  { id: 3, name: "Categories" },
  { id: 4, name: "Attachments" },
  { id: 5, name: "Multi-day Calendar" },
  { id: 6, name: "Email Verification" },
  { id: 7, name: "Performance with 1000+ Todos" },
  { id: 8, name: "ICS Export" },
];

const checks = [
  {
    id: "backend:lint",
    label: "Backend ESLint",
    cwd: "backend",
    command: "npx",
    args: [
      "eslint",
      "src",
      "--ext",
      ".ts",
      "--format",
      "json",
      "--output-file",
      "lint-results.json",
    ],
    type: "lint",
  },
  {
    id: "backend:test",
    label: "Backend Jest Suite",
    cwd: "backend",
    command: "npm",
    args: ["run", "test:ci"],
    type: "unit",
    jsonReport: "test-results.json",
  },
  {
    id: "frontend:lint",
    label: "Frontend ESLint",
    cwd: "frontend",
    command: "npx",
    args: [
      "eslint",
      "src",
      "--ext",
      ".ts,.tsx",
      "--format",
      "json",
      "--output-file",
      "lint-results.json",
    ],
    type: "lint",
  },
  {
    id: "frontend:test",
    label: "Frontend Vitest Suite",
    cwd: "frontend",
    command: "npm",
    args: ["run", "test:ci"],
    type: "unit",
    jsonReport: "test-results.json",
  },
  {
    id: "frontend:e2e",
    label: "Frontend Playwright E2E",
    cwd: "frontend",
    command: "npm",
    args: [
      "run",
      "test:e2e",
      "--",
      "--reporter=line,json=playwright-report.json",
      "--workers=1",
    ],
    type: "e2e",
    env: { FRONTEND_PORT: "4174" },
    jsonReport: "playwright-report.json",
  },
];

mkdirSync(evaluationDir, { recursive: true });

const results = checks.map((check) => runCheck(check));
const branchName = detectBranchName();
const generatedAt = new Date().toISOString();

const lintSummary = {
  backendErrors: readLintErrorCount(
    path.join(rootDir, "backend", "lint-results.json")
  ),
  frontendErrors: readLintErrorCount(
    path.join(rootDir, "frontend", "lint-results.json")
  ),
};

const tasks = buildTaskOutcomes({
  backendReport: path.join(rootDir, "backend", "test-results.json"),
  frontendReport: path.join(rootDir, "frontend", "test-results.json"),
  e2eReport: path.join(rootDir, "frontend", "playwright-report.json"),
});

const evaluationResult = {
  branch: branchName,
  tasks,
  lint: lintSummary,
  meta: { generatedAt },
};

const jsonPath = path.join(evaluationDir, "result.json");
writeFileSync(jsonPath, JSON.stringify(evaluationResult, null, 2));

const csvPath = path.join(evaluationDir, "result.csv");
writeFileSync(csvPath, buildCsv(evaluationResult));

const summary = buildSummary(results);
const overallStatus = summary.failed > 0 ? "failed" : "passed";

const mdPath = path.join(evaluationDir, "result.md");
writeFileSync(
  mdPath,
  buildMarkdown({
    ...evaluationResult,
    checks: results,
    overallStatus,
  })
);

printConsoleSummary({
  branch: branchName,
  checks: results,
  overallStatus,
  jsonPath,
  csvPath,
  mdPath,
});

function runCheck({ id, label, cwd, command, args, type, jsonReport, env }) {
  const start = Date.now();
  const proc = spawnSync(command, args, {
    cwd: path.join(rootDir, cwd),
    env: { ...process.env, CI: "1", ...env },
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 15,
    shell: false,
  });

  const durationMs = Date.now() - start;
  const output = `${proc.stdout || ""}${proc.stderr || ""}`;
  const trimmedOutput = trimOutput(output);
  const reportPath = jsonReport ? path.join(rootDir, cwd, jsonReport) : null;
  const failureSummary =
    proc.status !== 0 && reportPath
      ? extractTestFailureSummary(reportPath)
      : null;

  return {
    id,
    label,
    type,
    command: `${command} ${args.join(" ")}`.trim(),
    cwd,
    status: proc.status === 0 ? "passed" : "failed",
    exitCode: proc.status,
    durationMs,
    output: trimmedOutput,
    failureSummary,
  };
}

function trimOutput(output) {
  if (!output) {
    return "";
  }

  if (output.length <= LOG_CHAR_LIMIT) {
    return output;
  }

  const head = output.slice(0, LOG_CHAR_LIMIT);
  return `${head}\n...\n[truncated ${output.length - LOG_CHAR_LIMIT} chars]`;
}

function buildSummary(items) {
  const failed = items.filter((item) => item.status === "failed").length;
  const passed = items.length - failed;
  return { total: items.length, passed, failed };
}

function buildMarkdown(payload) {
  const lines = [];
  lines.push("# Vibe Challenge Evaluation");
  lines.push("");
  lines.push(`Generated: ${payload.meta.generatedAt}`);
  lines.push(`Branch: ${payload.branch}`);
  lines.push("");
  lines.push(`Overall Status: **${payload.overallStatus.toUpperCase()}**`);
  lines.push("");
  lines.push("## Task Scores");
  lines.push("");
  lines.push(
    "| Task | Score | Passed | Backend | Frontend | E2E |"
  );
  lines.push("| --- | --- | --- | --- | --- | --- |");
  payload.tasks.forEach((task) => {
    lines.push(
      `| TASK${task.id} - ${task.name} | ${task.score.toFixed(2)} | ${formatStatus(
        task.passed ? "passed" : "failed"
      )} | ${formatAreaSummary(task.backend)} | ${formatAreaSummary(
        task.frontend
      )} | ${formatAreaSummary(task.e2e)} |`
    );
  });

  lines.push("");
  lines.push("## Lint Summary");
  lines.push("");
  lines.push(`- Backend ESLint errors: ${payload.lint.backendErrors}`);
  lines.push(`- Frontend ESLint errors: ${payload.lint.frontendErrors}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  lines.push("| Check | Status | Duration (s) | Command |");
  lines.push("| --- | --- | --- | --- |");
  payload.checks.forEach((check) => {
    const durationSeconds = (check.durationMs / 1000).toFixed(1);
    lines.push(
      `| ${check.label} | ${formatStatus(
        check.status
      )} | ${durationSeconds} | \`${check.command}\` |`
    );
  });

  const failedChecks = payload.checks.filter(
    (check) => check.status === "failed"
  );
  if (failedChecks.length) {
    lines.push("");
    lines.push("## Failure Details");
    lines.push("");
    failedChecks.forEach((check) => {
      lines.push(`### ${check.label}`);
      lines.push("");
      if (check.failureSummary) {
        lines.push("**Detected failing tests:**");
        lines.push("");
        lines.push("```text");
        lines.push(check.failureSummary);
        lines.push("```");
        lines.push("");
      }
      lines.push("**Raw output (trimmed):**");
      lines.push("");
      lines.push("```text");
      lines.push(check.output || "<no output captured>");
      lines.push("```");
      lines.push("");
    });
  }

  return `${lines.join("\n")}\n`;
}

function formatStatus(status) {
  return status === "passed" ? "✅ Passed" : "❌ Failed";
}

function printConsoleSummary(payload) {
  console.log("\n=== Vibe Challenge Evaluation Summary ===");
  console.log(`Branch: ${payload.branch}`);
  payload.checks.forEach((check) => {
    const durationSeconds = (check.durationMs / 1000).toFixed(1);
    console.log(
      ` - ${check.label}: ${check.status.toUpperCase()} (${durationSeconds}s)`
    );
  });
  console.log(`Overall: ${payload.overallStatus.toUpperCase()}`);
  console.log(
    `Results written to ${path.relative(rootDir, payload.jsonPath)}, ${path.relative(
      rootDir,
      payload.mdPath
    )}, and ${path.relative(rootDir, payload.csvPath)}`
  );
}

function extractTestFailureSummary(reportPath) {
  const data = readJsonFile(reportPath, { warnOnMissing: false });
  if (!data) {
    return null;
  }

  const suites = extractSuites(data);
  const failingAssertions = [];
  suites.forEach((suite) => {
    const assertions = suite.assertionResults || suite.tests || [];
    assertions.forEach((assertion) => {
      if ((assertion.status || assertion.state) === "failed") {
        failingAssertions.push({
          name: assertion.fullName || buildAssertionName(suite, assertion),
          message: sanitizeMessage((assertion.failureMessages || [])[0] || ""),
        });
      }
    });
  });

  if (!failingAssertions.length) {
    return null;
  }

  const maxEntries = 5;
  const summaryLines = failingAssertions.slice(0, maxEntries).map((entry, i) => {
    const header = `${i + 1}. ${entry.name || "Unnamed test"}`;
    if (!entry.message) {
      return header;
    }
    const truncatedMessage =
      entry.message.length > 400
        ? `${entry.message.slice(0, 400)}…`
        : entry.message;
    const indented = truncatedMessage
      .split("\n")
      .map((line) => `   ${line}`)
      .join("\n");
    return `${header}\n${indented}`;
  });

  if (failingAssertions.length > maxEntries) {
    summaryLines.push(
      `...and ${failingAssertions.length - maxEntries} more failing tests.`
    );
  }

  return summaryLines.join("\n");
}

function buildAssertionName(suite, assertion) {
  const parts = [];
  if (suite?.name) {
    const relativeSuite = path.isAbsolute(suite.name)
      ? path.relative(rootDir, suite.name)
      : suite.name;
    parts.push(relativeSuite);
  }
  if (assertion?.ancestorTitles?.length) {
    parts.push(assertion.ancestorTitles.join(" › "));
  }
  if (assertion?.title) {
    parts.push(assertion.title);
  }
  return parts.filter(Boolean).join(" - ");
}

function sanitizeMessage(message) {
  if (!message) {
    return "";
  }
  return stripAnsi(message).trim();
}

function stripAnsi(input) {
  if (!input) {
    return "";
  }
  return input.replace(/\u001b\[[0-9;]*m/g, "");
}

function detectBranchName() {
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }
  try {
    const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: rootDir,
      encoding: "utf-8",
    });
    if (result.status === 0) {
      return result.stdout.trim() || "local";
    }
  } catch (error) {
    // ignore and fall back
  }
  return "local";
}

function readLintErrorCount(reportPath) {
  const data = readJsonFile(reportPath);
  if (!data || !Array.isArray(data)) {
    return 0;
  }
  return data.reduce(
    (total, entry) => total + (entry.errorCount || 0) + (entry.fatalErrorCount || 0),
    0
  );
}

function buildTaskOutcomes(reportPaths) {
  const tasks = TASK_DEFINITIONS.map((def) => ({
    id: def.id,
    name: def.name,
    backend: createEmptyAreaStats(),
    frontend: createEmptyAreaStats(),
    e2e: createEmptyAreaStats(),
    score: 0,
    passed: false,
  }));

  const taskMap = new Map(tasks.map((task) => [task.id, task]));

  const allAssertions = [
    ...collectUnitAssertions(reportPaths.backendReport),
    ...collectUnitAssertions(reportPaths.frontendReport),
    ...collectPlaywrightAssertions(reportPaths.e2eReport),
  ];

  allAssertions.forEach((assertion) => {
    const classification = classifyTaskFromName(assertion.fullName);
    if (!classification) {
      return;
    }
    const task = taskMap.get(classification.taskId);
    if (!task) {
      return;
    }
    const bucket = task[classification.area];
    if (!bucket) {
      return;
    }
    const normalized = normalizeStatus(assertion.status);
    if (!normalized) {
      return;
    }
    bucket.total += 1;
    if (normalized === "passed") {
      bucket.passed += 1;
    } else if (normalized === "failed") {
      bucket.failed += 1;
    }
  });

  tasks.forEach((task) => finalizeTaskScore(task));
  return tasks;
}

function collectUnitAssertions(reportPath) {
  const data = readJsonFile(reportPath);
  if (!data) {
    return [];
  }

  const suites = extractSuites(data);
  const assertions = [];
  suites.forEach((suite) => {
    const suiteAssertions = suite.assertionResults || suite.tests || [];
    suiteAssertions.forEach((assertion) => {
      assertions.push({
        fullName:
          assertion.fullName ||
          buildAssertionName(suite, assertion) ||
          assertion.title ||
          "",
        status: assertion.status || assertion.state,
      });
    });
  });
  return assertions;
}

function collectPlaywrightAssertions(reportPath) {
  const data = readJsonFile(reportPath);
  if (!data) {
    return [];
  }

  const assertions = [];
  const queue = Array.isArray(data.suites) ? [...data.suites] : [];
  while (queue.length) {
    const suite = queue.shift();
    (suite.tests || []).forEach((test) => {
      const pathParts = Array.isArray(test.titlePath)
        ? test.titlePath
        : [suite.title, test.title].filter(Boolean);
      assertions.push({
        fullName: pathParts.join(" "),
        status: test.outcome || test.status,
      });
    });
    (suite.suites || []).forEach((child) => queue.push(child));
  }
  return assertions;
}

function classifyTaskFromName(fullName = "") {
  const match = fullName.match(/TASK(\d+)_(BACKEND|FRONTEND|E2E)_/i);
  if (!match) {
    return null;
  }
  const area = match[2].toLowerCase();
  const normalizedArea = area === "frontend" ? "frontend" : area === "backend" ? "backend" : "e2e";
  return {
    taskId: Number(match[1]),
    area: normalizedArea,
  };
}

function normalizeStatus(status) {
  const value = (status || "").toLowerCase();
  if (!value) {
    return null;
  }
  if (["passed", "ok", "success", "expected"].includes(value)) {
    return "passed";
  }
  if (["failed", "failure", "unexpected", "errored"].includes(value)) {
    return "failed";
  }
  return null;
}

function createEmptyAreaStats() {
  return { total: 0, failed: 0, passed: 0 };
}

function finalizeTaskScore(task) {
  const hasTests = task.backend.total + task.frontend.total + task.e2e.total > 0;
  if (!hasTests) {
    task.score = 0;
    task.passed = false;
    return;
  }

  let score = 0;
  if (task.backend.failed === 0) {
    score += 0.4;
  }
  if (task.frontend.failed === 0) {
    score += 0.3;
  }
  if (task.e2e.failed === 0) {
    score += 0.3;
  }
  task.score = Number(Math.min(score, 1).toFixed(2));
  task.passed = task.score >= 0.8;
}

function buildCsv(result) {
  const header = [
    "branch",
    "taskId",
    "taskName",
    "score",
    "passed",
    "backendTotal",
    "backendFailed",
    "frontendTotal",
    "frontendFailed",
    "e2eTotal",
    "e2eFailed",
    "backendLintErrors",
    "frontendLintErrors",
  ];

  const rows = result.tasks.map((task) => [
    result.branch,
    task.id,
    task.name,
    task.score.toFixed(2),
    task.passed,
    task.backend.total,
    task.backend.failed,
    task.frontend.total,
    task.frontend.failed,
    task.e2e.total,
    task.e2e.failed,
    result.lint.backendErrors,
    result.lint.frontendErrors,
  ]);

  const csvLines = [header, ...rows].map((cols) =>
    cols.map((value) => csvEscape(value)).join(",")
  );
  return `${csvLines.join("\n")}\n`;
}

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatAreaSummary(area) {
  if (!area.total) {
    return "0 tests";
  }
  return `${area.passed}/${area.total} passed (${area.failed} failed)`;
}

function readJsonFile(filePath, options = {}) {
  const { warnOnMissing = true } = options;
  if (!existsSync(filePath)) {
    if (warnOnMissing) {
      console.warn(` [evaluation] Missing report: ${path.relative(rootDir, filePath)}`);
    }
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (error) {
    if (warnOnMissing) {
      console.warn(
        ` [evaluation] Failed to parse ${path.relative(
          rootDir,
          filePath
        )}: ${error.message}`
      );
    }
    return null;
  }
}

function extractSuites(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data.testResults)) {
    return data.testResults;
  }
  if (Array.isArray(data.results)) {
    return data.results;
  }
  if (Array.isArray(data.suites)) {
    return data.suites;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}
