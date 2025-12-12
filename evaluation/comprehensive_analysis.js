const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const branches = JSON.parse(fs.readFileSync('evaluation/branches.json', 'utf8'));
const outputDir = 'evaluation';

const results = {
    test_results: {},
    lint_results: {},
    task_analysis: {},
    examples: []
};

function runCmd(cmd, cwd = '.') {
    try {
        return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return e.stdout + e.stderr;
    }
}

function checkFile(filepath, pattern = null) {
    if (!fs.existsSync(filepath)) return false;
    if (!pattern) return true;
    const content = fs.readFileSync(filepath, 'utf8');
    return pattern.test(content);
}

function analyzeBranch(branch) {
    console.log(`Analyzing ${branch}...`);
    const branchName = branch.replace('origin/', '');
    
    try {
        runCmd(`git checkout ${branchName} 2>/dev/null || git checkout -b ${branchName} origin/${branchName} 2>/dev/null`);
    } catch (e) {
        console.log(`Failed to checkout ${branchName}, trying local...`);
        try { runCmd(`git checkout ${branchName}`); } catch (e2) { return; }
    }

    // --- 4. Tool-based Analysis ---
    
    // 4.2 Tests
    let testOutput = "";
    let testCount = 0;
    let passCount = 0;
    
    // Backend Tests
    if (fs.existsSync('backend/package.json')) {
        runCmd('npm install', 'backend');
        const out = runCmd('npm test -- --json', 'backend');
        testOutput += out;
        try {
            const json = JSON.parse(out.substring(out.indexOf('{')));
            testCount += json.numTotalTests;
            passCount += json.numPassedTests;
        } catch (e) {}
    }
    
    results.test_results[branchName] = { total: testCount, passed: passCount, output: testOutput.substring(0, 500) };

    // 4.3 Lint
    let lintErrors = 0;
    if (fs.existsSync('backend/package.json')) {
        const out = runCmd('npx eslint . --format json', 'backend');
        try {
            const json = JSON.parse(out);
            json.forEach(f => lintErrors += f.errorCount);
        } catch (e) {}
    }
    results.lint_results[branchName] = { errors: lintErrors };

    // --- 5. Task Deep Dive ---
    const tasks = {};

    // T1: Persistence
    const repoFile = 'backend/src/repositories/TodoRepository.ts';
    const hasRepo = fs.existsSync(repoFile);
    const repoContent = hasRepo ? fs.readFileSync(repoFile, 'utf8') : "";
    
    tasks.T1 = {
        attempted: hasRepo,
        implemented: hasRepo && (repoContent.includes('save') || repoContent.includes('create')),
        verified: hasRepo && repoContent.includes('sqlite'), // Strict check for SQLite
        strategy: repoContent.includes('sqlite') ? 'SQLite' : (repoContent.includes('writeFile') ? 'JSON' : 'Memory/Other'),
        evidence: hasRepo ? repoFile : null
    };

    // T2: Auth
    const authFile = 'backend/src/middleware/auth.ts'; // Common location
    const userController = 'backend/src/controllers/UserController.ts';
    const hasAuth = fs.existsSync(authFile) || fs.existsSync(userController);
    const authContent = hasAuth ? (fs.existsSync(authFile) ? fs.readFileSync(authFile, 'utf8') : fs.readFileSync(userController, 'utf8')) : "";
    
    tasks.T2 = {
        attempted: hasAuth,
        implemented: hasAuth && (authContent.includes('jwt') || authContent.includes('verify')),
        verified: hasAuth && authContent.includes('verify') && authContent.includes('401'),
        evidence: hasAuth ? authFile : null
    };

    // T3: Categories
    const catModel = 'backend/src/models/Category.ts';
    const hasCat = fs.existsSync(catModel);
    const catContent = hasCat ? fs.readFileSync(catModel, 'utf8') : "";
    
    tasks.T3 = {
        attempted: hasCat,
        implemented: hasCat,
        verified: hasCat && /#[0-9A-Fa-f]{6}/.test(catContent), // Hex regex check
        evidence: hasCat ? catModel : null
    };

    // T4: Attachments
    const attachModel = 'backend/src/models/Attachment.ts';
    const hasAttach = fs.existsSync(attachModel);
    
    tasks.T4 = {
        attempted: hasAttach,
        implemented: hasAttach,
        verified: hasAttach && checkFile('backend/src/routes/todoRoutes.ts', /multer/),
        evidence: hasAttach ? attachModel : null
    };

    // T5: Calendar
    const calView = 'frontend/src/features/calendar/CalendarView.tsx';
    const hasCal = fs.existsSync(calView);
    const calContent = hasCal ? fs.readFileSync(calView, 'utf8') : "";
    
    tasks.T5 = {
        attempted: hasCal,
        implemented: hasCal && calContent.length > 500, // Non-empty component
        verified: hasCal && (calContent.includes('date-fns') || calContent.includes('moment')),
        evidence: hasCal ? calView : null
    };

    results.task_analysis[branchName] = tasks;

    // Capture Examples (Naive approach: grab first 10 lines of TodoRepository for T1)
    if (hasRepo) {
        results.examples.push({
            branch: branchName,
            task: "T1",
            code: repoContent.split('\n').slice(0, 15).join('\n'),
            type: tasks.T1.verified ? "good" : "bad" // Simplistic classification for now
        });
    }
}

// Run Analysis
try {
    runCmd('git stash');
    branches.forEach(analyzeBranch);
} finally {
    runCmd('git checkout thesis');
    runCmd('git stash pop');
}

// Write Results
fs.writeFileSync(path.join(outputDir, 'test_results.json'), JSON.stringify(results.test_results, null, 2));
fs.writeFileSync(path.join(outputDir, 'lint_results.json'), JSON.stringify(results.lint_results, null, 2));
fs.writeFileSync(path.join(outputDir, 'task_analysis.json'), JSON.stringify(results.task_analysis, null, 2));
fs.writeFileSync(path.join(outputDir, 'examples_good_bad.json'), JSON.stringify(results.examples, null, 2));

console.log("Comprehensive Analysis Complete.");
