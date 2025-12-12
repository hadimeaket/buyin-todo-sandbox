const fs = require("fs");

const chats = JSON.parse(
  fs.readFileSync("evaluation/chat_task_attempts.json", "utf8")
);
const code = JSON.parse(
  fs.readFileSync("evaluation/deep_code_analysis.json", "utf8")
);

let summary = {
  total: Object.keys(chats).length,
  t1: { attempted: 0, implemented: 0, verified: 0, strategies: {} },
  t2: { attempted: 0, implemented: 0, verified: 0 },
  t3: { attempted: 0, implemented: 0, verified: 0 },
  t4: { attempted: 0, implemented: 0, verified: 0 },
  t5: { attempted: 0, implemented: 0, verified: 0 },
  lint: { total: 0, max: 0, min: 999 },
  tests: { total_pass: 0 },
};

Object.keys(chats).forEach((branch) => {
  const c = chats[branch];
  const d = code[branch] || {};

  // T1
  if (c.T1.attempted) summary.t1.attempted++;
  if (d.t1_persistence && d.t1_persistence !== "memory/other")
    summary.t1.implemented++;
  if (d.test_pass > 0) summary.t1.verified++; // Proxy
  const strat = d.t1_persistence || "unknown";
  summary.t1.strategies[strat] = (summary.t1.strategies[strat] || 0) + 1;

  // T2
  if (c.T2.attempted) summary.t2.attempted++;
  if (d.t2_auth === "implemented") summary.t2.implemented++;

  // T3
  if (c.T3.attempted) summary.t3.attempted++;
  if (d.t3_categories === "implemented") summary.t3.implemented++;

  // T4
  if (c.T4.attempted) summary.t4.attempted++;
  if (d.t4_attachments === "implemented") summary.t4.implemented++;

  // T5
  if (c.T5.attempted) summary.t5.attempted++;
  if (d.t5_calendar === "implemented") summary.t5.implemented++;

  // Metrics
  summary.lint.total += d.lint_errors || 0;
  summary.tests.total_pass += d.test_pass || 0;
});

console.log(JSON.stringify(summary, null, 2));
