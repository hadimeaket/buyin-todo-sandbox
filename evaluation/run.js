#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { mkdirSync, writeFileSync, existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const evaluationDir = path.join(rootDir, "evaluation");
const LOG_CHAR_LIMIT = Number(process.env.EVAL_LOG_CHAR_LIMIT || 20000);

const checks = [
  {
    id: "backend:lint",
    label: "Backend ESLint",
    cwd: "backend",
    command: "npm",
    args: ["run", "lint"],
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
    command: "npm",
    args: ["run", "lint"],
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
    args: ["run", "test:e2e", "--", "--reporter=line", "--workers=1"],
    type: "e2e",
  },
];

mkdirSync(evaluationDir, { recursive: true });

const results = checks.map((check) => runCheck(check));
const summary = buildSummary(results);
const payload = {
  generatedAt: new Date().toISOString(),
  checks: results,
  summary,
  overallStatus: summary.failed > 0 ? "failed" : "passed",
};

const jsonPath = path.join(evaluationDir, "result.json");
writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const mdPath = path.join(evaluationDir, "result.md");
writeFileSync(mdPath, buildMarkdown(payload));

printConsoleSummary(payload);

function runCheck({ id, label, cwd, command, args, type, jsonReport }) {
  const start = Date.now();
  const proc = spawnSync(command, args, {
    cwd: path.join(rootDir, cwd),
    env: { ...process.env, CI: "1" },
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 15,
    shell: false,
  });

  const durationMs = Date.now() - start;
  const output = `${proc.stdout || ""}${proc.stderr || ""}`;
  const trimmedOutput = trimOutput(output);
  const reportPath = jsonReport ? path.join(rootDir, cwd, jsonReport) : null;
  const failureSummary =
    proc.status !== 0 && reportPath ? extractTestFailureSummary(reportPath) : null;

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
  lines.push(`Generated: ${payload.generatedAt}`);
  lines.push("");
  lines.push(`Overall Status: **${payload.overallStatus.toUpperCase()}**`);
  lines.push("");
  lines.push("| Check | Status | Duration (s) | Command |");
  lines.push("| --- | --- | --- | --- |");

  payload.checks.forEach((check) => {
    const durationSeconds = (check.durationMs / 1000).toFixed(1);
    lines.push(
      `| ${check.label} | ${formatStatus(check.status)} | ${durationSeconds} | \`${check.command}\` |`
    );
  });

  const failedChecks = payload.checks.filter((check) => check.status === "failed");
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
  payload.checks.forEach((check) => {
    const durationSeconds = (check.durationMs / 1000).toFixed(1);
    console.log(` - ${check.label}: ${check.status.toUpperCase()} (${durationSeconds}s)`);
  });
  console.log(`Overall: ${payload.overallStatus.toUpperCase()}`);
  console.log(`Results written to ${path.relative(rootDir, jsonPath)} and ${path.relative(rootDir, mdPath)}`);
}

function extractTestFailureSummary(reportPath) {
  if (!existsSync(reportPath)) {
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(reportPath, "utf-8"));
    const failingAssertions = [];
    for (const suite of data.testResults || []) {
      for (const assertion of suite.assertionResults || []) {
        if (assertion.status === "failed") {
          failingAssertions.push({
            name: assertion.fullName || buildAssertionName(suite, assertion),
            message: sanitizeMessage((assertion.failureMessages || [])[0] || ""),
          });
        }
      }
    }

    if (!failingAssertions.length) {
      return null;
    }

    const maxEntries = 5;
    const summaryLines = failingAssertions.slice(0, maxEntries).map((entry, index) => {
      const header = `${index + 1}. ${entry.name || "Unnamed test"}`;
      if (!entry.message) {
        return header;
      }
      const truncatedMessage = entry.message.length > 400 ? `${entry.message.slice(0, 400)}…` : entry.message;
      const indented = truncatedMessage
        .split("\n")
        .map((line) => `   ${line}`)
        .join("\n");
      return `${header}\n${indented}`;
    });

    if (failingAssertions.length > maxEntries) {
      summaryLines.push(`...and ${failingAssertions.length - maxEntries} more failing tests.`);
    }

    return summaryLines.join("\n");
  } catch (error) {
    return `Unable to parse ${path.basename(reportPath)}: ${error.message}`;
  }
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
