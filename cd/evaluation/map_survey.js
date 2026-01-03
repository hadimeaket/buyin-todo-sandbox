const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const repoRoot = path.resolve(__dirname, "..");
const xlsxPath = path.join(
  repoRoot,
  "thesis/surveys/Probanden-Einstufungsformular (Responses).xlsx"
);
const branchesFile = path.join(repoRoot, "evaluation/branches.txt");

// Manual additions for the 2 missing remotes
const extraBranches = ["sethi-sangat-vibe", "helling-max-vibe"];

function normalizeLooseId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function pickHeaderKey(headers, predicate) {
  return headers.find((h) => predicate(String(h || "")));
}

function loadSurveyRows() {
  if (!fs.existsSync(xlsxPath)) {
    throw new Error(`Survey XLSX not found at: ${xlsxPath}`);
  }
  const workbook = XLSX.readFile(xlsxPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

const surveyRows = loadSurveyRows();
const branches = fs
  .readFileSync(branchesFile, "utf8")
  .split("\n")
  .filter(Boolean)
  .concat(extraBranches);

const mapping = [];
const csvLines = ["branch,name,competence"];

const headers = surveyRows.length ? Object.keys(surveyRows[0]) : [];
const nameKey = pickHeaderKey(headers, (h) =>
  /vor-\s*und\s*nachname|full name/i.test(h)
);
const branchKey = pickHeaderKey(headers, (h) =>
  /branch-?name|branch name/i.test(h)
);
const categoryKey = headers.includes("Kategorie") ? "Kategorie" : null;

if (!branchKey) {
  throw new Error(
    `Could not find the branch column in survey headers. Headers: ${headers.join(
      ", "
    )}`
  );
}
if (!categoryKey) {
  throw new Error(
    `Could not find 'Kategorie' column in survey headers. Headers: ${headers.join(
      ", "
    )}`
  );
}

const branchesByNormalized = new Map(
  branches.map((b) => [normalizeLooseId(b), b])
);

function matchBranchFromSurvey(rawSurveyBranch, rawName) {
  const surveyNorm = normalizeLooseId(rawSurveyBranch);
  if (branchesByNormalized.has(surveyNorm))
    return branchesByNormalized.get(surveyNorm);

  const withVibe = surveyNorm.endsWith("-vibe")
    ? surveyNorm
    : `${surveyNorm}-vibe`;
  if (branchesByNormalized.has(withVibe))
    return branchesByNormalized.get(withVibe);

  const surveyLower = String(rawSurveyBranch || "").toLowerCase();
  const byContains = branches.find(
    (b) =>
      b.toLowerCase().includes(surveyLower) ||
      surveyLower.includes(b.toLowerCase())
  );
  if (byContains) return byContains;

  const nameLower = String(rawName || "").toLowerCase();
  if (nameLower.includes("helling") || surveyLower.includes("helling"))
    return "helling-max-vibe";
  if (
    nameLower.includes("sethi") ||
    nameLower.includes("sangat") ||
    surveyLower.includes("sangat")
  ) {
    return "sethi-sangat-vibe";
  }
  if (nameLower.includes("fadime") || surveyLower.includes("fadime"))
    return "goek-fadime-vibe";

  return null;
}

for (const row of surveyRows) {
  const surveyBranch = String(row[branchKey] || "").trim();
  if (!surveyBranch) continue;

  const name = nameKey ? String(row[nameKey] || "").trim() : "";
  const competence = String(row[categoryKey] || "").trim();
  const matchedBranch = matchBranchFromSurvey(surveyBranch, name);

  if (!matchedBranch) continue;
  if (!competence) continue;

  mapping.push({
    branch: matchedBranch,
    name,
    competence,
    survey_data: row,
  });

  csvLines.push(
    `${matchedBranch},"${name.replaceAll('"', '""')}",${competence}`
  );
}

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
