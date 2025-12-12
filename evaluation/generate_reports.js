const fs = require('fs');
const path = require('path');

const taskAnalysis = JSON.parse(fs.readFileSync('evaluation/task_analysis.json', 'utf8'));
const surveyMapping = JSON.parse(fs.readFileSync('evaluation/survey_mapping.json', 'utf8'));
const examples = JSON.parse(fs.readFileSync('evaluation/examples_good_bad.json', 'utf8'));

// Helper to get group
function getGroup(branch) {
    const p = surveyMapping.find(m => m.branch === branch);
    return p ? p.competence : "Unknown";
}

// 1. Task Summary by Task
const tasks = ['T1', 'T2', 'T3', 'T4', 'T5'];
let csvTask = "Task,Attempted,Implemented,Verified\n";

tasks.forEach(t => {
    let att = 0, imp = 0, ver = 0;
    Object.values(taskAnalysis).forEach(b => {
        if (b[t].attempted) att++;
        if (b[t].implemented) imp++;
        if (b[t].verified) ver++;
    });
    csvTask += `${t},${att},${imp},${ver}\n`;
});
fs.writeFileSync('evaluation/task_summary_by_task.csv', csvTask);

// 2. Task Summary by Group
const groups = {};
Object.keys(taskAnalysis).forEach(branch => {
    const g = getGroup(branch);
    if (!groups[g]) groups[g] = { count: 0, verifiedSum: 0 };
    groups[g].count++;
    
    let v = 0;
    tasks.forEach(t => { if (taskAnalysis[branch][t].verified) v++; });
    groups[g].verifiedSum += v;
});

let csvGroup = "Group,Participants,Avg_Verified_Tasks\n";
Object.keys(groups).forEach(g => {
    csvGroup += `${g},${groups[g].count},${(groups[g].verifiedSum / groups[g].count).toFixed(2)}\n`;
});
fs.writeFileSync('evaluation/task_summary_by_group.csv', csvGroup);

// 3. Examples MD
let mdExamples = "# Code Examples (Good vs Bad)\n\n";
examples.forEach(ex => {
    mdExamples += `## ${ex.task} - ${ex.branch} (${ex.type})\n`;
    mdExamples += "```typescript\n" + ex.code + "\n```\n\n";
});
fs.writeFileSync('evaluation/examples_good_bad.md', mdExamples);

// 4. Branch Reports
let mdReports = "# Branch Deep Dives\n\n";
Object.keys(taskAnalysis).forEach(branch => {
    mdReports += `## ${branch}\n`;
    mdReports += `**Group:** ${getGroup(branch)}\n\n`;
    tasks.forEach(t => {
        const task = taskAnalysis[branch][t];
        mdReports += `- **${t}:** ${task.verified ? '✅ Verified' : (task.implemented ? '⚠️ Implemented' : (task.attempted ? '⭕ Attempted' : '❌ Not Started'))}\n`;
        if (task.strategy) mdReports += `  - Strategy: ${task.strategy}\n`;
        if (task.evidence) mdReports += `  - Evidence: ${task.evidence}\n`;
    });
    mdReports += "\n";
});
fs.writeFileSync('evaluation/branch_reports.md', mdReports);

console.log("Reports generated.");
