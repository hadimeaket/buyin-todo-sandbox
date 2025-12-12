const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const xlsxPath =
  "/home/cgoek/Studium/BA/buyin-todo-sandbox/thesis/surveys/Probanden-Einstufungsformular (Responses).xlsx";

function parseSurveyData() {
  try {
    const sharedStringsXml = runCommand(
      `unzip -p "${xlsxPath}" xl/sharedStrings.xml`
    );
    const sharedStrings = [];
    const tRegex = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let match;
    while ((match = tRegex.exec(sharedStringsXml)) !== null) {
      sharedStrings.push(match[1]);
    }

    const sheetXml = runCommand(
      `unzip -p "${xlsxPath}" xl/worksheets/sheet1.xml`
    );
    const surveyMap = {}; // normalizedBranch -> { competence, name }

    const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/g;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
      const rowContent = rowMatch[2];
      const cells = {};
      const cellRegex = /<c r="([A-Z]+)(\d+)"([^>]*)>(.*?)<\/c>/g;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const col = cellMatch[1];
        const attrs = cellMatch[3];
        const content = cellMatch[4];
        const isSharedString = attrs.includes('t="s"');
        const vMatch = /<v>(.*?)<\/v>/.exec(content);
        if (vMatch) {
          let val = vMatch[1];
          if (isSharedString) val = sharedStrings[parseInt(val)];
          cells[col] = val;
        }
      }

      // Column B: Name, C: Branch, AB: Competence
      if (cells["C"] && cells["AB"]) {
        const branchName = cells["C"].trim();
        const competence = cells["AB"].trim();
        const normalized = branchName.toLowerCase().replace(/[^a-z0-9]/g, "");
        surveyMap[normalized] = { competence, branchName };
      }
    }
    return surveyMap;
  } catch (e) {
    console.error("Error parsing survey:", e);
    return {};
  }
}

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
  // New local branches (simulated participants)
  "sethi-sangat-vibe",
  "helling-max-vibe",
];

const outputDir = path.join(__dirname);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// --- Helper Functions ---

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
  } catch (e) {
    return "";
  }
}

function extractDocxText(filePath) {
  try {
    const safePath = filePath.replace(/ /g, "\\ ");
    const xml = runCommand(`unzip -p "${filePath}" word/document.xml`);
    return xml.replace(/<[^>]+>/g, " ");
  } catch (e) {
    console.error(`Error reading docx ${filePath}: ${e.message}`);
    return "";
  }
}

function checkFileContent(filePath, pattern) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, "utf8");
  return content.includes(pattern);
}

// --- Analysis Logic ---

const participants = [];
const tasksPerParticipant = {};
const codeQualityMetrics = {};
const chatAnalysis = {};

console.log("Starting Deep Analysis...");

// Parse Survey Data
console.log("Parsing Survey Data...");
const surveyData = parseSurveyData();
console.log(
  `Loaded survey data for ${Object.keys(surveyData).length} participants.`
);

// 0. Stash changes to allow branch switching
console.log("Stashing local changes...");
try {
  execSync('git stash push -m "Auto-stash for analysis"', { stdio: "ignore" });
} catch (e) {
  console.log("Stash failed or nothing to stash.");
}

// 1. Chat Analysis
const chatDir = path.join(__dirname, "../thesis/chats");
const chatFiles = fs.readdirSync(chatDir).filter((f) => f.endsWith(".docx"));

const manualMapping = {
  "goek-cihad-vibe": "Cihad_Gök.docx",
  "tselekoglou-ioannis-vibe": "Janni_Tselekoglu.docx",
  "goek-yasin-vibe": "Goek_Yasin.docx",
  "sethi-sangat-vibe": "Sangat_Sethi.docx",
  "helling-max-vibe": "Max_Helling.docx",
};

chatFiles.forEach((file) => {
  const text = extractDocxText(path.join(chatDir, file));
  const wordCount = text.split(/\s+/).length;
  const errorCount = (text.match(/error|fail|exception/gi) || []).length;
  const promptCount = (text.match(/User:|Human:|Proband:/gi) || []).length;

  let matchedBranch = null;
  for (const [branch, mapFile] of Object.entries(manualMapping)) {
    if (file === mapFile) {
      matchedBranch = branch;
      break;
    }
  }

  if (!matchedBranch) {
    const nameParts = file.replace(".docx", "").toLowerCase().split(/_|\s/);
    for (const branch of branches) {
      const branchLower = branch.toLowerCase();
      if (manualMapping[branch.replace("origin/", "")]) continue;
      if (nameParts.every((part) => branchLower.includes(part))) {
        matchedBranch = branch.replace("origin/", "");
        break;
      }
    }
  }

  if (matchedBranch) {
    chatAnalysis[matchedBranch] = {
      file,
      wordCount,
      errorMentions: errorCount,
      estimatedPrompts:
        promptCount > 0 ? promptCount : Math.ceil(wordCount / 100),
      contentSnippet: text.substring(0, 200),
    };
  }
});

// 2. Branch Analysis
for (const branch of branches) {
  const branchName = branch.replace("origin/", "");
  console.log(`Analyzing Branch: ${branchName}`);

  let checkoutSuccess = false;
  try {
    // Try checkout (handle both remote and local branches)
    if (branch.startsWith("origin/")) {
      execSync(
        `git checkout ${branchName} 2>/dev/null || git checkout -b ${branchName} ${branch} 2>/dev/null`,
        { stdio: "ignore" }
      );
    } else {
      execSync(`git checkout ${branchName} 2>/dev/null`, { stdio: "ignore" });
    }

    // Verify we are on the correct branch
    const currentBranch = runCommand("git rev-parse --abbrev-ref HEAD");
    if (currentBranch === branchName) {
      checkoutSuccess = true;
    } else {
      console.log(
        `  Checkout mismatch: Wanted ${branchName}, got ${currentBranch}`
      );
    }
  } catch (e) {
    console.log(`  Checkout failed for ${branchName}`);
  }

  let tasks = {};
  let metrics = {};

  if (checkoutSuccess) {
    tasks = {
      T1_Persistence:
        checkFileContent(
          "backend/src/repositories/TodoRepository.ts",
          "save"
        ) ||
        checkFileContent(
          "backend/src/repositories/TodoRepository.ts",
          "create"
        ),
      T2_Auth:
        fs.existsSync("backend/src/middleware/auth.ts") ||
        fs.existsSync("backend/src/controllers/AuthController.ts"),
      T3_Categories:
        fs.existsSync("backend/src/models/Category.ts") ||
        fs.existsSync("frontend/src/features/categories"),
      T4_Attachments:
        fs.existsSync("backend/src/models/Attachment.ts") ||
        fs.existsSync("backend/src/repositories/AttachmentRepository.ts"),
      T5_Calendar: fs.existsSync(
        "frontend/src/features/calendar/CalendarView.tsx"
      ),
      T6_Email: fs.existsSync("backend/src/services/EmailService.ts"),
      T7_Performance:
        checkFileContent(
          "backend/src/controllers/TodoController.ts",
          "performance"
        ) || fs.existsSync("backend/src/utils/performance.ts"),
      T8_ICS:
        fs.existsSync("backend/src/services/IcsService.ts") ||
        fs.existsSync("todos-test.ics"),
    };

    const tsFiles = runCommand(
      'find . -name "*.ts" -not -path "*/node_modules/*"'
    )
      .split("\n")
      .filter(Boolean);
    const anyCount = runCommand(
      'grep -r ": any" backend/src frontend/src | wc -l'
    );
    const consoleCount = runCommand(
      'grep -r "console.log" backend/src frontend/src | wc -l'
    );
    const testCount = runCommand(
      'find backend/tests -name "*.test.ts" | wc -l'
    );

    metrics = {
      tsFileCount: tsFiles.length,
      anyUsage: parseInt(anyCount) || 0,
      consoleUsage: parseInt(consoleCount) || 0,
      testCount: parseInt(testCount) || 0,
      lintErrors: 0,
    };
  } else {
    tasks = {
      T1_Persistence: false,
      T2_Auth: false,
      T3_Categories: false,
      T4_Attachments: false,
      T5_Calendar: false,
      T6_Email: false,
      T7_Performance: false,
      T8_ICS: false,
    };
    metrics = {
      tsFileCount: 0,
      anyUsage: 0,
      consoleUsage: 0,
      testCount: 0,
      lintErrors: 0,
    };
  }

  tasksPerParticipant[branchName] = tasks;
  codeQualityMetrics[branchName] = metrics;

  const normalizedBranch = branchName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const surveyInfo = surveyData[normalizedBranch] || { competence: "Unknown" };

  participants.push({
    id: branchName,
    group: surveyInfo.competence,
    tasks: Object.values(tasks).filter(Boolean).length,
    hasRepo: checkoutSuccess,
  });
}

// Restore original state
console.log("Restoring original state...");
try {
  execSync("git checkout thesis", { stdio: "ignore" });
  execSync("git stash pop", { stdio: "ignore" });
} catch (e) {
  console.log("Error restoring state (maybe nothing to pop).");
}

// 3. Survey Mapping
const surveyMapping = {};
participants.forEach((p) => {
  const chat = chatAnalysis[p.id];
  const normalizedBranch = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
  const surveyInfo = surveyData[normalizedBranch] || {};

  surveyMapping[p.id] = {
    competence: surveyInfo.competence || "Unknown",
    stressLevelIndicator: chat ? chat.errorMentions : 0,
    interactionVolume: chat ? chat.wordCount : 0,
  };
});

// 4. Persist Data
fs.writeFileSync(
  path.join(outputDir, "participants.json"),
  JSON.stringify(participants, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, "tasks_per_participant.json"),
  JSON.stringify(tasksPerParticipant, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, "code_quality_metrics.json"),
  JSON.stringify(codeQualityMetrics, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, "chat_analysis.json"),
  JSON.stringify(chatAnalysis, null, 2)
);
fs.writeFileSync(
  path.join(outputDir, "survey_mapping.json"),
  JSON.stringify(surveyMapping, null, 2)
);

// Generate Summary MD
let summaryMd = "# Branch Summary\n\n";
summaryMd +=
  "| Branch | Tasks Completed | Any Usage | Console Logs | Chat Words | Repo Exists |\n";
summaryMd += "|---|---|---|---|---|---|\n";

for (const p of participants) {
  const t = tasksPerParticipant[p.id];
  const q = codeQualityMetrics[p.id];
  const c = chatAnalysis[p.id] || { wordCount: 0 };
  const taskCount = Object.values(t).filter(Boolean).length;

  summaryMd += `| ${p.id} | ${taskCount} | ${q.anyUsage} | ${
    q.consoleUsage
  } | ${c.wordCount} | ${p.hasRepo ? "Yes" : "No"} |\n`;
}

fs.writeFileSync(path.join(outputDir, "branch_summary.md"), summaryMd);

console.log("Analysis Complete. Data persisted in evaluation/ directory.");
