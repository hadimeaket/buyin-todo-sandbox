const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const branches = JSON.parse(fs.readFileSync('evaluation/branches.json', 'utf8'));
const outputDir = 'evaluation';

const results = {};

function runCmd(cmd, cwd = '.') {
    try {
        return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return e.stdout + e.stderr; // Return output even on failure
    }
}

function checkFileContent(filepath, regex) {
    if (!fs.existsSync(filepath)) return false;
    const content = fs.readFileSync(filepath, 'utf8');
    return regex.test(content);
}

function analyzeBranch(branch) {
    console.log(`Analyzing Code for ${branch}...`);
    const branchName = branch.replace('origin/', '');
    
    try {
        runCmd(`git checkout ${branchName} 2>/dev/null || git checkout -b ${branchName} origin/${branchName} 2>/dev/null`);
    } catch (e) {
        console.log(`Failed to checkout ${branchName}`);
        return;
    }

    const branchResults = {
        t1_persistence: 'unknown',
        t2_auth: 'none',
        t3_categories: 'none',
        t4_attachments: 'none',
        t5_calendar: 'none',
        lint_errors: 0,
        test_pass: 0,
        test_fail: 0
    };

    // T1: Persistence
    if (checkFileContent('backend/package.json', /sqlite3/)) branchResults.t1_persistence = 'sqlite';
    else if (checkFileContent('backend/package.json', /mongoose/)) branchResults.t1_persistence = 'mongo';
    else if (checkFileContent('backend/package.json', /pg/)) branchResults.t1_persistence = 'postgres';
    else if (checkFileContent('backend/src/repositories/TodoRepository.ts', /fs\.readFile/)) branchResults.t1_persistence = 'json-file';
    else branchResults.t1_persistence = 'memory/other';

    // T2: Auth
    const hasAuthFile = fs.existsSync('backend/src/controllers/authController.ts') || 
                        fs.existsSync('backend/src/routes/authRoutes.ts');
    const hasBcrypt = checkFileContent('backend/package.json', /bcrypt/);
    if (hasAuthFile && hasBcrypt) branchResults.t2_auth = 'implemented';
    else if (hasAuthFile) branchResults.t2_auth = 'partial';

    // T3: Categories
    if (checkFileContent('frontend/src/features/todos/TodoItem.tsx', /category/) || 
        checkFileContent('frontend/src/components/ui/CategoryBadge.tsx', /hex/i)) {
        branchResults.t3_categories = 'implemented';
    }

    // T4: Attachments
    if (checkFileContent('backend/package.json', /multer/) || 
        fs.existsSync('backend/src/controllers/uploadController.ts')) {
        branchResults.t4_attachments = 'implemented';
    }

    // T5: Calendar
    if (checkFileContent('frontend/src/features/calendar/CalendarView.tsx', /days/) || 
        checkFileContent('frontend/src/features/calendar/Calendar.tsx', /grid/)) {
        branchResults.t5_calendar = 'implemented';
    }

    // Linting (Backend)
    if (fs.existsSync('backend/package.json')) {
        try {
            // Install dependencies if needed (skip to save time if possible, but might be needed for eslint)
            // runCmd('npm install', 'backend'); 
            // Assuming node_modules might be shared or we skip install to be fast. 
            // If eslint fails due to missing deps, we record it.
            // Actually, we should try to run eslint if possible.
            // Let's assume we can run it if installed.
            const lintOut = runCmd('npx eslint . --format=json', 'backend');
            try {
                const lintJson = JSON.parse(lintOut);
                branchResults.lint_errors = lintJson.reduce((acc, curr) => acc + curr.errorCount, 0);
            } catch (e) {
                // If not json, maybe text output or error
                branchResults.lint_errors = (lintOut.match(/error/g) || []).length;
            }
        } catch (e) {
            branchResults.lint_errors = -1;
        }
    }

    // Tests (Backend)
    if (fs.existsSync('backend/package.json')) {
        const testOut = runCmd('npm test -- --json', 'backend');
        try {
            // Jest JSON output
            // It might be mixed with other output, try to find the JSON part
            const jsonMatch = testOut.match(/\{"numFailedTestSuites":.*\}/);
            if (jsonMatch) {
                const testJson = JSON.parse(jsonMatch[0]);
                branchResults.test_pass = testJson.numPassedTests;
                branchResults.test_fail = testJson.numFailedTests;
            } else {
                 // Fallback regex
                 const passMatch = testOut.match(/Tests:\s+(\d+)\s+passed/);
                 if (passMatch) branchResults.test_pass = parseInt(passMatch[1]);
            }
        } catch (e) {
            // ignore
        }
    }

    results[branch] = branchResults;
}

// Main Loop
for (const branch of branches) {
    analyzeBranch(branch);
}

// Restore Thesis Branch
runCmd('git checkout thesis');

fs.writeFileSync(path.join(outputDir, 'deep_code_analysis.json'), JSON.stringify(results, null, 2));
