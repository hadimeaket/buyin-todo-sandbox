# CI Pipeline - Solo Developer Setup

## Overview

This is a simplified CI pipeline for solo development. It focuses on:

- ✅ Code quality (linting, type checking)
- 🔒 Security scanning (dependency vulnerabilities)
- 🧪 Automated testing with coverage
- 🏗️ Build verification
- 🐳 Docker build testing (no deployment)

**No deployment, approvals, or external services required!**

---

## What Runs Automatically

### On Every Push to `main`, `develop`, or `feature/*`

The pipeline runs these checks in parallel:

```
┌─────────────────────────────────────┐
│         Code Quality                │
│  • ESLint (Backend + Frontend)      │
│  • TypeScript Type Checking         │
└─────────────────────────────────────┘
              │
              ├──────────────┬─────────────────┐
              ▼              ▼                 ▼
┌─────────────────┐  ┌────────────────┐  ┌──────────────┐
│ Security Scan   │  │  Unit Tests    │  │              │
│ • npm audit     │  │  • Jest/Vitest │  │              │
│ • Backend       │  │  • Coverage    │  │              │
│ • Frontend      │  │  • Backend     │  │              │
│                 │  │  • Frontend    │  │              │
└─────────────────┘  └────────────────┘  │              │
                                          │              │
                     ┌────────────────────┴──────┐       │
                     ▼                            ▼       ▼
              ┌──────────────┐            ┌─────────────────┐
              │    Build     │            │  Docker Build   │
              │  • Backend   │            │  • Backend img  │
              │  • Frontend  │            │  • Frontend img │
              └──────────────┘            └─────────────────┘
                     │                            │
                     └────────────┬───────────────┘
                                  ▼
                         ┌─────────────────┐
                         │  Summary        │
                         │  ✅ All passed  │
                         └─────────────────┘
```

### Total Time: ~10-15 minutes

---

## Quick Start

### 1. Enable GitHub Actions (Already Done)

The workflows are in `.github/workflows/` and will run automatically.

### 2. View Pipeline Status

**Option A: In Your Repository**

1. Go to: https://github.com/hadimeaket/buyin-todo-sandbox
2. Click **Actions** tab
3. See all workflow runs

**Option B: On Pull Requests**

1. Create a PR
2. Scroll to bottom → see "Checks" section
3. Green ✅ = passed, Red ❌ = failed

**Option C: README Badge** (add this to your README.md)

```markdown
![CI](https://github.com/hadimeaket/buyin-todo-sandbox/actions/workflows/ci.yml/badge.svg)
```

### 3. Local Testing Before Push

```bash
# Run tests locally
cd backend && npm test
cd frontend && npm test

# Check types
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Build locally
cd backend && npm run build
cd frontend && npm run build

# Check for vulnerabilities
npm audit
```

---

## What Each Job Does

### 1. **Code Quality** (2-3 minutes)

- Runs ESLint to check code style
- Runs TypeScript compiler to check types
- Fails if there are type errors
- Warns if there are linting issues

**View logs**: Click on "Code Quality & Linting" job

### 2. **Security Scan** (1-2 minutes)

- Scans `package.json` dependencies for known vulnerabilities
- Uses npm audit with HIGH severity threshold
- Creates audit report artifacts
- Continues even if vulnerabilities found (warns you)

**View results**: Download "security-audit-results" artifact

### 3. **Unit Tests** (3-5 minutes)

- Runs all Jest/Vitest tests
- Generates code coverage report
- Tests both backend and frontend
- Uploads coverage artifacts

**View coverage**: Download "coverage-backend" or "coverage-frontend" artifacts

### 4. **Build** (2-3 minutes)

- Runs `npm run build` for backend and frontend
- Compiles TypeScript to JavaScript
- Verifies the application can be built
- Uploads build artifacts

**View build**: Download "build-backend" or "build-frontend" artifacts

### 5. **Docker Build** (3-5 minutes)

- Tests Docker image build process
- Uses local cache for speed
- Does NOT push to any registry
- Just verifies Dockerfile works

### 6. **Summary**

- Shows pass/fail status of all jobs
- Pipeline fails if critical checks fail
- Shows emoji summary 🎉

---

## Understanding the Results

### ✅ All Green - Perfect!

```
✅ Code Quality: success
🔒 Security Scan: success
🧪 Unit Tests: success
🏗️  Build: success
🐳 Docker Build: success
```

Everything passed! Safe to merge.

### ⚠️ Yellow/Orange - Warnings

```
✅ Code Quality: success
⚠️  Security Scan: success (with warnings)
✅ Unit Tests: success
✅ Build: success
✅ Docker Build: success
```

Pipeline passed but there are security warnings. Check the logs.

### ❌ Red - Failed

```
❌ Code Quality: failure
🔒 Security Scan: success
❌ Unit Tests: failure
✅ Build: success
✅ Docker Build: success
```

Pipeline failed. Click on the red jobs to see error logs.

---

## Common Issues & Fixes

### ❌ TypeScript errors

```
Error: src/App.tsx(42,5): error TS2322: Type 'string' is not assignable to type 'number'
```

**Fix**: Correct the type error in your code

### ❌ Tests failing

```
FAIL src/components/TodoItem.test.tsx
  ● TodoItem › should render correctly
```

**Fix**: Update the test or fix the component

### ❌ Build fails

```
Error: Cannot find module './missing-file'
```

**Fix**: Check imports and make sure all files exist

### ⚠️ Security vulnerabilities

```
found 3 vulnerabilities (1 moderate, 2 high)
```

**Fix**: Run `npm audit fix` to automatically patch

### ❌ Linting errors

```
error  'useState' is defined but never used  @typescript-eslint/no-unused-vars
```

**Fix**: Remove unused imports or fix the linting rule

---

## Workflow Files

### Main Pipeline: `.github/workflows/ci.yml`

The simplified CI pipeline that runs all checks.

**Triggers:**

- Push to `main`, `develop`, or `feature/*`
- Pull requests to `main`
- Manual trigger from Actions tab

### Dependencies: `.github/dependabot.yml`

Automatically creates PRs for dependency updates.

**Schedule:** Weekly on Mondays

**What it updates:**

- Backend npm packages
- Frontend npm packages
- GitHub Actions versions

---

## Customization

### Skip Pipeline for Docs

Add this to your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

### Run Pipeline Manually

1. Go to Actions tab
2. Click "CI Pipeline (Solo Dev)"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Adjust Test Timeout

Edit `jest.config.js` or `vitest.config.ts`:

```javascript
export default {
  testTimeout: 10000, // 10 seconds
};
```

### Change Security Threshold

Edit `.github/workflows/ci.yml` line ~70:

```yaml
npm audit --audit-level=high # Change to: moderate, low, or critical
```

---

## Artifacts & Logs

### Download Artifacts

1. Go to Actions tab
2. Click on a workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `security-audit-results` - JSON audit reports
   - `coverage-backend` - Backend test coverage
   - `coverage-frontend` - Frontend test coverage
   - `build-backend` - Compiled backend code
   - `build-frontend` - Built frontend assets

### View Logs

1. Click on any job (e.g., "Unit Tests")
2. Expand the steps to see detailed logs
3. Use Ctrl+F to search logs
4. Click "Download logs" for offline viewing

---

## Cost

**GitHub Actions is FREE for public repositories!**

For private repos:

- Free tier: 2,000 minutes/month
- This pipeline uses ~15 minutes per run
- You can run it ~130 times/month for free

**Storage:**

- Artifacts are deleted after 30 days
- No external storage costs

---

## Tips

### Speed Up Pipeline

```yaml
# Add to workflow if you have many tests
strategy:
  matrix:
    shard: [1, 2, 3, 4] # Run tests in parallel
```

### Cache Dependencies

The pipeline already caches npm dependencies for speed!

### Run Locally

Use [act](https://github.com/nektos/act) to run GitHub Actions locally:

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run the pipeline locally
act push
```

---

## What Was Removed

These were removed to simplify for solo development:

❌ Docker registry push (no DOCKER_USERNAME/PASSWORD needed)
❌ Deployment steps (dev/staging/production)
❌ Environment approvals and reviewers
❌ Slack/Discord notifications
❌ Complex branch protection rules
❌ Performance testing (k6, Lighthouse)
❌ Manual approval gates
❌ Multiple environments
❌ Cloud provider integrations

---

## What You Get

✅ **Code Quality**: Catch bugs before they reach production
✅ **Security**: Know about vulnerable dependencies
✅ **Tests**: Ensure your code works as expected
✅ **Build**: Verify the app can be built
✅ **Logs**: Debug failures with detailed logs
✅ **History**: See all past runs and trends
✅ **Badges**: Show build status in README
✅ **Automation**: No manual work needed

---

## Next Steps

1. **Add more tests** to increase coverage
2. **Fix any security warnings** from npm audit
3. **Add pre-commit hooks** with Husky
4. **Set up VS Code** to run tests on save
5. **Add E2E tests** with Playwright/Cypress (optional)

---

## Support

- **View logs** in Actions tab
- **Download artifacts** for detailed reports
- **Re-run failed jobs** by clicking "Re-run jobs"
- **Cancel runs** if you pushed by mistake

**That's it!** The pipeline now runs automatically on every push. No configuration needed. 🚀
