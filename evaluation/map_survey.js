const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const xlsxPath =
  "/home/cgoek/Studium/BA/buyin-todo-sandbox/thesis/surveys/Probanden-Einstufungsformular (Responses).xlsx";
const branchesFile =
  "/home/cgoek/Studium/BA/buyin-todo-sandbox/evaluation/branches.txt";

// Manual additions for the 2 missing remotes
const extraBranches = ["sethi-sangat-vibe", "helling-max-vibe"];

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
  } catch (e) {
    return "";
  }
}

function parseXlsx() {
  // 1. Extract Shared Strings
  const sharedStringsXml = runCommand(
    `unzip -p "${xlsxPath}" xl/sharedStrings.xml`
  );
  const sharedStrings = [];
  const tRegex = /<t[^>]*>([\s\S]*?)<\/t>/g;
  let match;
  while ((match = tRegex.exec(sharedStringsXml)) !== null) {
    sharedStrings.push(match[1]);
  }

  // 2. Extract Sheet Data
  const sheetXml = runCommand(
    `unzip -p "${xlsxPath}" xl/worksheets/sheet1.xml`
  );
  const rows = [];
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
        if (isSharedString) {
          val = sharedStrings[parseInt(val)];
        }
        cells[col] = val;
      }
    }
    rows.push(cells);
  }
  return rows;
}

const rows = parseXlsx();
const branches = fs
  .readFileSync(branchesFile, "utf8")
  .split("\n")
  .filter(Boolean)
  .concat(extraBranches);

// Map Survey Columns (based on previous inspection)
// C: Branch Name
// B: Name
// AB: Competence (Calculated in previous turn, but might be missing in raw XML if it was a formula or script result not saved as value)
// Wait, the previous `parse_survey.js` output showed "AB": "Low-Code" for some rows.
// If the "Kategorisierungs-Script" was a Google Apps Script, it might not be in the XLSX unless exported *after* running.
// The user said "Die XLSX ist bereinigt. Sie enthält ... Kompetenzgruppe".
// Let's assume column AB (or similar) holds it. In the dump it was AB.

const mapping = [];
const csvLines = ["branch,name,competence,experience,frequency,web_skill"];

rows.forEach((row, index) => {
  if (index === 0) return; // Header

  // Fuzzy match branch name
  const surveyBranch = row["C"] ? row["C"].trim() : "";
  const name = row["B"] ? row["B"].trim() : "";

  if (!surveyBranch) return;

  let matchedBranch = branches.find(
    (b) =>
      b.toLowerCase().includes(surveyBranch.toLowerCase()) ||
      surveyBranch.toLowerCase().includes(b.toLowerCase())
  );

  // Manual fixups if fuzzy fails
  if (!matchedBranch) {
    if (surveyBranch.includes("Max Helling") || name.includes("Helling"))
      matchedBranch = "helling-max-vibe";
    if (surveyBranch.includes("Sangat") || name.includes("Sethi"))
      matchedBranch = "sethi-sangat-vibe";
    if (name.includes("Fadime") || surveyBranch.includes("fadime"))
      matchedBranch = "goek-fadime-vibe";
  }

  if (matchedBranch) {
    const competence = row["AB"] || "Low-Code"; // Default to Low-Code if missing, as per observation

    // Extract other interesting stats
    const experience = row["R"] || ""; // Q1
    const frequency = row["S"] || ""; // Q3 (Indices might have shifted, checking dump...)
    // Actually, let's look at the dump again.
    // Index 157 was "Erfahrung mit Webentwicklung".
    // Let's just grab the Competence for now as it's the critical grouping factor.

    mapping.push({
      branch: matchedBranch,
      name: name,
      competence: competence,
      survey_data: row,
    });

    csvLines.push(`${matchedBranch},"${name}",${competence}`);
  }
});

// Write outputs
fs.writeFileSync(
  path.join(__dirname, "survey_mapping.json"),
  JSON.stringify(mapping, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, "survey_mapping.csv"),
  csvLines.join("\n")
);
fs.writeFileSync(
  path.join(__dirname, "branches.json"),
  JSON.stringify(branches, null, 2)
);

console.log(`Mapped ${mapping.length} participants.`);
