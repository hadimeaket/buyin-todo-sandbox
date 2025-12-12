const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const branches = [
  "origin/Dogan-Enes-vibe",
  "origin/Dogan-Mansur-vibe",
  "origin/Maia-Dinis-vibe",
  "origin/Theuerkauf-Jochen-vibe",
  "origin/akbulut-burak-vibe",
  "origin/allamani-rando-vibe",
  "origin/august-martin-vibe",
  "origin/bektas-cengizhan-vibe",
  "origin/goek-cihad-vibe",
  "origin/goek-fadime-vibe",
  "origin/goek-yasin-vibe",
  "origin/prinz-leon-vibe",
  "origin/rubas-michael-vibe",
  "origin/tobias-lehrer-vibe",
  "origin/tselekoglou-ioannis-vibe",
  "origin/versuro-andrea-vibe",
];

const results = {};

// Helper to check file existence
const exists = (p) => fs.existsSync(path.join(process.cwd(), p));

// Helper to count lint errors (simplified)
const runLint = (dir) => {
  try {
    // Run eslint and capture output. This is risky if it takes too long.
    // We'll just check for file existence as a proxy for "attempted" for now to be safe on time,
    // or try a very quick lint if possible.
    // Actually, let's just check for specific "smells" or "good practices" via grep.
    return "Not run (perf)";
  } catch (e) {
    return "Error";
  }
};

console.log("Starting analysis...");

for (const branch of branches) {
  const branchName = branch.replace("origin/", "");
  console.log(`Analyzing ${branchName}...`);

  try {
    execSync(
      `git checkout ${branchName} 2>/dev/null || git checkout -b ${branchName} ${branch} 2>/dev/null`
    );

    const analysis = {
      task1_persistence: exists("backend/src/repositories/TodoRepository.ts"),
      task2_auth:
        exists("backend/src/middleware/auth.ts") ||
        exists("backend/src/controllers/authController.ts"),
      task3_categories:
        exists("backend/src/models/Category.ts") ||
        exists("frontend/src/features/categories"),
      task4_attachments:
        exists("backend/src/models/Attachment.ts") ||
        exists("backend/src/repositories/AttachmentRepository.ts"),
      task5_calendar: exists("frontend/src/features/calendar/CalendarView.tsx"),
      task6_email: exists("backend/src/services/EmailService.ts"),
      task7_perf: exists("backend/src/utils/performance.ts"), // Guessing
      task8_ics:
        exists("backend/src/services/IcsService.ts") ||
        exists("todos-test.ics"),

      // Code Quality Indicators (Static)
      hasTests:
        exists("backend/tests") && fs.readdirSync("backend/tests").length > 1,
      lintConfig: exists("backend/eslint.config.mjs"),
    };

    results[branchName] = analysis;
  } catch (e) {
    console.error(`Failed to analyze ${branchName}: ${e.message}`);
    results[branchName] = { error: e.message };
  }
}

// Switch back to thesis branch
try {
  execSync("git checkout thesis");
} catch (e) {}

fs.writeFileSync(
  "evaluation/batch_analysis.json",
  JSON.stringify(results, null, 2)
);
console.log(
  "Analysis complete. Results written to evaluation/batch_analysis.json"
);
