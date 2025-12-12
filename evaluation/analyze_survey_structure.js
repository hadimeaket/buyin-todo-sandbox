const XLSX = require("xlsx");
const path = require("path");

const surveyPath =
  "thesis/surveys/Probanden-Einstufungsformular (Responses).xlsx";
const workbook = XLSX.readFile(surveyPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total Rows: ${data.length}`);
console.log("Columns:", Object.keys(data[0]));

const groups = {};
data.forEach((row) => {
  // Assuming there's a column for competence group, let's try to find it or infer it
  // Or just list the columns to see what we have.
});

console.log(JSON.stringify(data.slice(0, 1), null, 2));
