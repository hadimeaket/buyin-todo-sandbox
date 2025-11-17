# Step-by-Step Pipeline Setup Guide

## Prerequisites

- ✅ GitHub repository: `hadimeaket/buyin-todo-sandbox`
- ✅ Admin access to the repository
- ✅ Pipeline files already committed to `main` branch

---

## Step 1: Configure GitHub Secrets

### 1.1 Navigate to Repository Settings

1. Go to your repository: https://github.com/hadimeaket/buyin-todo-sandbox
2. Click on **Settings** tab (top right)
3. In the left sidebar, scroll down to **Security** section
4. Click on **Secrets and variables** → **Actions**

### 1.2 Add Required Secrets

Click **New repository secret** for each of the following:

#### Essential Secrets (Required for Pipeline to Work)

**Secret 1: DOCKER_USERNAME**

```
Name: DOCKER_USERNAME
Value: <your-docker-hub-username>
```

- Go to https://hub.docker.com/ to get your username
- Example: If your Docker Hub profile is `docker.com/u/johnsmith`, enter `johnsmith`

**Secret 2: DOCKER_PASSWORD**

```
Name: DOCKER_PASSWORD
Value: <your-docker-hub-access-token>
```

- **Important**: Use an access token, NOT your password
- To create one:
  1. Log in to Docker Hub: https://hub.docker.com/
  2. Click your profile → **Account Settings**
  3. Click **Security** → **New Access Token**
  4. Name it: `github-actions-buyin-todo`
  5. Copy the token (you'll only see it once!)
  6. Paste it as the secret value

#### Optional Secrets (Recommended for Production)

**Secret 3: SLACK_WEBHOOK_URL** (for notifications)

```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

- Create one at: https://api.slack.com/messaging/webhooks
- Skip this if you don't use Slack

**Secret 4: CODECOV_TOKEN** (for test coverage)

```
Name: CODECOV_TOKEN
Value: <your-codecov-token>
```

- Sign up at https://codecov.io with GitHub
- Add your repository
- Copy the upload token
- Skip this for now if not needed

### 1.3 Verify Secrets

After adding secrets, you should see them listed like:

```
DOCKER_USERNAME         Updated now
DOCKER_PASSWORD         Updated now
SLACK_WEBHOOK_URL       Updated now (optional)
```

**Note**: You can't view secret values after saving (security feature).

---

## Step 2: Create GitHub Environments

### 2.1 Navigate to Environments

1. Still in **Settings** tab
2. In left sidebar, click on **Environments**
3. You'll see "There are no environments for this repository" initially

### 2.2 Create Development Environment

1. Click **New environment** button
2. Enter name: `development`
3. Click **Configure environment**

**Configuration:**

- ❌ **Environment protection rules**: Leave UNCHECKED (no approvals needed for dev)
- ❌ **Deployment branches**: Leave as "All branches" (or select `develop` only)
- **Environment secrets**: Add if you have dev-specific credentials
  - Click **Add secret** if needed (e.g., `DEV_DATABASE_URL`)
- **Environment variables**: Click **Add variable**
  - Name: `ENVIRONMENT_NAME`
  - Value: `development`

4. Click **Save protection rules**

### 2.3 Create Staging Environment

1. Click **New environment** button (you're back on the Environments page)
2. Enter name: `staging`
3. Click **Configure environment**

**Configuration:**

- ✅ **Required reviewers**: Check this box
  - Click **Add reviewers**
  - Select yourself (or team members)
  - You can add 1-6 reviewers
  - Recommendation: **1 reviewer** for staging
- ❌ **Wait timer**: Leave at 0 minutes (or set to 5 if you want a delay)
- **Deployment branches**: Select "Selected branches"
  - Click **Add deployment branch rule**
  - Pattern: `main`
  - Click **Add rule**
  - Click **Add deployment branch rule** again
  - Pattern: `release/*`
  - Click **Add rule**
- **Environment variables**:
  - Name: `ENVIRONMENT_NAME`
  - Value: `staging`

4. Click **Save protection rules**

### 2.4 Create Production Environment

1. Click **New environment** button
2. Enter name: `production`
3. Click **Configure environment**

**Configuration:**

- ✅ **Required reviewers**: Check this box
  - Click **Add reviewers**
  - Select at least 2 people (you + 1 other, or just you for testing)
  - Recommendation: **2 reviewers** for production
- ✅ **Wait timer**: Set to **5 minutes**
  - This gives time to catch mistakes before deployment
- **Deployment branches**: Select "Selected branches"
  - Click **Add deployment branch rule**
  - Pattern: `main`
  - Click **Add rule**
- **Environment secrets**: Add production credentials
  - Example: `PROD_DATABASE_URL`, `PROD_API_KEY`
- **Environment variables**:
  - Name: `ENVIRONMENT_NAME`
  - Value: `production`

4. Click **Save protection rules**

### 2.5 Verify Environments

You should now see three environments listed:

```
development    0 reviewers required
staging        1 reviewer required
production     2 reviewers required, 5 minute wait timer
```

---

## Step 3: Set Branch Protection Rules

### 3.1 Navigate to Branch Settings

1. Still in **Settings** tab
2. In left sidebar, click **Branches** (under "Code and automation")
3. You'll see "Branch protection rules" section

### 3.2 Protect the `main` Branch

1. Click **Add branch protection rule** (or **Add rule**)
2. In "Branch name pattern" field, enter: `main`

**Configure these settings:**

#### Branch Protection Settings ✅

- ✅ **Require a pull request before merging**

  - ✅ Check "Require approvals": Set to **2**
  - ✅ Check "Dismiss stale pull request approvals when new commits are pushed"
  - ✅ Check "Require review from Code Owners" (if you have CODEOWNERS file)
  - ❌ Uncheck "Require approval of the most recent reviewable push"

- ✅ **Require status checks to pass before merging**

  - ✅ Check "Require branches to be up to date before merging"
  - In the search box, type and select these checks (they'll appear after first pipeline run):
    ```
    code-quality (backend)
    code-quality (frontend)
    security-scan
    unit-tests (backend)
    unit-tests (frontend)
    build (backend)
    build (frontend)
    ```
  - **Note**: These won't appear until you run the pipeline once. Come back and add them later.

- ✅ **Require conversation resolution before merging**

- ❌ **Require signed commits** (optional, skip for now)

- ❌ **Require linear history** (optional)

- ✅ **Require deployments to succeed before merging** (optional)
  - Select `staging` environment if you want staging to deploy before merging to main

#### Additional Settings

- ✅ **Do not allow bypassing the above settings** (even admins must follow rules)
  - For testing, you might want to UNCHECK this temporarily
- ✅ **Restrict who can push to matching branches**

  - Leave empty for now (or add specific people/teams)

- ❌ **Allow force pushes** → Keep UNCHECKED

  - Or check "Specify who can force push" and add yourself for emergencies

- ❌ **Allow deletions** → Keep UNCHECKED

3. Scroll down and click **Create** (or **Save changes**)

### 3.3 Protect the `develop` Branch

1. Click **Add branch protection rule** again
2. In "Branch name pattern" field, enter: `develop`

**Configure these settings (lighter than main):**

- ✅ **Require a pull request before merging**

  - ✅ Require approvals: Set to **1**
  - ✅ Dismiss stale pull request approvals

- ✅ **Require status checks to pass before merging**

  - ✅ Require branches to be up to date
  - Select same status checks as main

- ❌ **Require conversation resolution** (optional for develop)

- ❌ **Do not allow bypassing** → You can check this or leave it unchecked for more flexibility

- ✅ **Allow force pushes** → Check "Specify who can force push"

  - Add yourself (useful for rebasing feature branches)

- ❌ **Allow deletions** → Keep UNCHECKED

3. Click **Create**

### 3.4 Verify Branch Protection

Go to **Settings** → **Branches**, you should see:

```
Branch protection rules
main       2 required approvals, 7+ status checks
develop    1 required approval, 7+ status checks
```

**Note**: The first time you try to push/merge, GitHub might ask you to confirm the protection rules work as expected.

---

## Step 4: Update Deployment URLs in Workflow Files

### 4.1 Update Development Environment URL

1. Open file: `.github/workflows/ci-cd.yml`
2. Find line ~332 (search for "deploy-development")
3. Update the URL:

```yaml
deploy-development:
  name: Deploy to Development
  runs-on: ubuntu-latest
  needs: [build, integration-tests]
  if: github.ref == 'refs/heads/develop'
  environment:
    name: development
    url: https://dev.your-app.com # ← CHANGE THIS
```

**Replace with your actual dev URL**, for example:

- If using Vercel: `https://buyin-todo-dev.vercel.app`
- If using Netlify: `https://dev--buyin-todo.netlify.app`
- If using your own server: `https://dev.buyin-todo.com`
- If testing locally: `http://localhost:5173` (but this won't work in GitHub Actions)

**For now, you can use a placeholder:**

```yaml
url: https://dev-buyin-todo-sandbox.herokuapp.com
```

### 4.2 Update Staging Environment URL

Find line ~360 (search for "deploy-staging"):

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build, integration-tests, e2e-tests]
  if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/heads/release/')
  environment:
    name: staging
    url: https://staging.your-app.com # ← CHANGE THIS
```

**Replace with:**

```yaml
url: https://staging-buyin-todo-sandbox.herokuapp.com
```

### 4.3 Update Production Environment URL

Find line ~385 (search for "deploy-production"):

```yaml
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [deploy-staging]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  environment:
    name: production
    url: https://your-app.com # ← CHANGE THIS
```

**Replace with:**

```yaml
url: https://buyin-todo-sandbox.herokuapp.com
```

### 4.4 Add Actual Deployment Commands (Optional for now)

Find the deployment steps and add your commands:

**Development (line ~340):**

```yaml
- name: Deploy to development environment
  run: |
    echo "Deploying to development..."
    # Add your deployment commands here
    # Examples:
    # - kubectl apply -f k8s/development/
    # - vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
    # - heroku container:push web --app buyin-todo-dev
    # For now, just echo for testing:
    echo "✅ Deployment simulation complete"
```

**Staging (line ~368):**

```yaml
- name: Deploy to staging environment
  run: |
    echo "Deploying to staging..."
    echo "✅ Deployment simulation complete"
```

**Production (line ~395):**

```yaml
- name: Deploy to production (Blue-Green)
  run: |
    echo "Deploying to production..."
    echo "✅ Deployment simulation complete"
```

### 4.5 Commit the Changes

```bash
cd /home/cgoek/Studium/BA/buyin-todo-sandbox

# Check what changed
git diff .github/workflows/ci-cd.yml

# Add and commit
git add .github/workflows/ci-cd.yml
git commit -m "chore: Update deployment URLs in CI/CD pipeline"
git push origin main
```

---

## Step 5: Test the Pipeline with a PR

### 5.1 Create a Test Branch

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create a test branch
git checkout -b test/pipeline-verification
```

### 5.2 Make a Small Change

Let's add a comment to test the pipeline:

```bash
# Edit App.tsx (or any file)
echo "// Pipeline test $(date)" >> frontend/src/App.tsx
```

Or manually edit `frontend/src/App.tsx` and add a comment at the top:

```tsx
// Pipeline test - 2025-11-17
// src/App.tsx
import { useState, useEffect } from "react";
```

### 5.3 Commit and Push

```bash
# Stage the change
git add frontend/src/App.tsx

# Commit with a message
git commit -m "test: Verify CI/CD pipeline configuration"

# Push to GitHub
git push origin test/pipeline-verification
```

### 5.4 Create Pull Request

**Option A: Using GitHub Web Interface**

1. Go to https://github.com/hadimeaket/buyin-todo-sandbox
2. You'll see a banner: "test/pipeline-verification had recent pushes"
3. Click **Compare & pull request**
4. Set:
   - Base: `main`
   - Compare: `test/pipeline-verification`
5. Title: `test: Verify CI/CD pipeline configuration`
6. Description:

   ```markdown
   ## Purpose

   Testing the CI/CD pipeline configuration

   ## What to verify

   - [ ] Code quality checks pass
   - [ ] Security scans complete
   - [ ] Unit tests pass
   - [ ] Docker builds succeed
   - [ ] Branch protection rules work
   ```

7. Click **Create pull request**

**Option B: Using GitHub CLI**

```bash
gh pr create \
  --base main \
  --head test/pipeline-verification \
  --title "test: Verify CI/CD pipeline configuration" \
  --body "Testing the CI/CD pipeline setup"
```

### 5.5 Watch the Pipeline Run

1. On the PR page, scroll down to see **Checks** section
2. You should see: "Some checks haven't completed yet"
3. Click **Show all checks** or **Details** to watch the pipeline

**Expected checks:**

```
✓ code-quality (backend)     ~ 2 minutes
✓ code-quality (frontend)    ~ 2 minutes
✓ security-scan              ~ 3 minutes
✓ unit-tests (backend)       ~ 2 minutes
✓ unit-tests (frontend)      ~ 2 minutes
✓ integration-tests          ~ 3 minutes
✓ e2e-tests                  ~ 5 minutes
✓ build (backend)            ~ 3 minutes
✓ build (frontend)           ~ 3 minutes
```

**Total time**: ~15-20 minutes

### 5.6 Monitor the Workflow

Click on **Actions** tab to see detailed logs:

1. Go to https://github.com/hadimeaket/buyin-todo-sandbox/actions
2. Click on the latest workflow run
3. You'll see a visual diagram of all jobs
4. Click on any job to see logs

**What to look for:**

- ✅ Green checkmarks = passing
- ❌ Red X = failed (check logs)
- ⏸️ Yellow circle = running
- ⊘ Gray circle = skipped/cancelled

### 5.7 Handle First-Run Issues

**Common first-run failures:**

**Issue 1: Status checks not found**

```
Solution: The first run needs to complete before branch protection
can reference the checks. After this PR, go back to Settings →
Branches → Edit main rule → Add the status checks that now appear
```

**Issue 2: Docker push fails (no credentials)**

```
Error: denied: requested access to the resource is denied
Solution: Verify DOCKER_USERNAME and DOCKER_PASSWORD secrets are set correctly
```

**Issue 3: Build fails on dependencies**

```
Error: npm ci failed
Solution: Usually fixes itself, click "Re-run failed jobs"
```

**Issue 4: Tests fail**

```
Check the test logs to see which specific test failed
Most likely a flaky test or environment issue
```

### 5.8 Approve and Merge (After Pipeline Passes)

Once all checks are ✅ green:

1. On the PR page, you'll see: "All checks have passed"
2. Request review (if required by branch protection)
3. After approval, click **Squash and merge** (or Merge pull request)
4. Confirm the merge
5. Delete the branch: Click **Delete branch**

### 5.9 Verify Main Branch Update

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Your test commit is now in main!
git log --oneline -n 5
```

---

## Step 6: Add Status Checks to Branch Protection (After First Run)

Now that the pipeline has run once, the status checks exist:

1. Go to **Settings** → **Branches**
2. Click **Edit** on the `main` rule
3. Scroll to **Require status checks to pass before merging**
4. In the search box, you'll now see the actual check names:
   ```
   Type to search for checks:
   ✓ code-quality (backend)
   ✓ code-quality (frontend)
   ✓ security-scan
   ✓ unit-tests (backend)
   ✓ unit-tests (frontend)
   ✓ integration-tests
   ✓ e2e-tests
   ✓ build (backend)
   ✓ build (frontend)
   ```
5. Click each one to add it
6. Click **Save changes**
7. Repeat for `develop` branch

---

## Verification Checklist

After completing all steps, verify:

### Secrets ✅

- [ ] Go to Settings → Secrets → Actions
- [ ] See `DOCKER_USERNAME` listed
- [ ] See `DOCKER_PASSWORD` listed

### Environments ✅

- [ ] Go to Settings → Environments
- [ ] See `development` (0 reviewers)
- [ ] See `staging` (1 reviewer)
- [ ] See `production` (2 reviewers, 5 min wait)

### Branch Protection ✅

- [ ] Go to Settings → Branches
- [ ] See `main` rule with 2 approvals required
- [ ] See `develop` rule with 1 approval required
- [ ] Both have status checks configured

### Pipeline ✅

- [ ] Go to Actions tab
- [ ] See successful workflow run
- [ ] All checks green ✅
- [ ] Logs show no errors

### URLs Updated ✅

- [ ] Open `.github/workflows/ci-cd.yml`
- [ ] Search for "url:" (should find 3)
- [ ] All three have your actual URLs (not placeholders)

---

## Troubleshooting

### Problem: "No status checks found"

**Solution**: Run the pipeline at least once, then add the checks to branch protection.

### Problem: "Can't push to protected branch"

**Solution**: Create a PR instead of pushing directly to `main` or `develop`.

### Problem: "Docker login failed"

**Solution**:

1. Verify secrets are spelled exactly: `DOCKER_USERNAME` and `DOCKER_PASSWORD`
2. Ensure DOCKER_PASSWORD is an access token, not your password
3. Check token hasn't expired

### Problem: "Required reviewers but I'm alone"

**Solution**:

- For staging: Set reviewers to 1 (yourself)
- For production: Set reviewers to 1 temporarily, or add a team member

### Problem: "Checks never complete"

**Solution**:

1. Go to Actions tab
2. Click the running workflow
3. Check which job is stuck
4. Click "Cancel workflow" and re-run

### Problem: "Deploy-production requires manual approval but nothing happens"

**Solution**:

1. Go to Actions → Click the workflow run
2. Scroll to "deploy-production" job
3. You'll see "Review deployments" button
4. Click it → Check `production` → Click "Approve and deploy"

---

## Next Steps

After successfully testing the pipeline:

1. **Create more feature branches**

   ```bash
   git checkout -b feature/add-user-auth
   # Make changes
   git push origin feature/add-user-auth
   # Create PR
   ```

2. **Set up a develop branch**

   ```bash
   git checkout -b develop
   git push origin develop
   # Update branch protection rules
   ```

3. **Add actual deployment commands**

   - Choose a hosting platform (Heroku, Vercel, AWS, etc.)
   - Add deployment scripts to the workflow
   - Test with staging first

4. **Configure monitoring**

   - Set up Datadog/New Relic
   - Add SLACK_WEBHOOK_URL secret
   - Test alerts

5. **Invite team members**
   - Settings → Collaborators → Add people
   - Assign them as reviewers in environments
   - Add them to CODEOWNERS file

---

## Quick Reference Commands

```bash
# Create and test a feature
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
gh pr create --base main

# Check pipeline status
gh run list
gh run view <run-id>
gh run view <run-id> --log

# Emergency: Cancel a running workflow
gh run cancel <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed

# View secrets (names only, not values)
gh secret list

# Add a secret via CLI
gh secret set SECRET_NAME
```

---

## Time Estimates

- **Step 1** (Secrets): 5 minutes
- **Step 2** (Environments): 10 minutes
- **Step 3** (Branch Protection): 10 minutes
- **Step 4** (Update URLs): 5 minutes
- **Step 5** (Test PR): 20-30 minutes (mostly waiting for pipeline)
- **Total**: ~50-60 minutes

---

## Support

If you get stuck:

1. Check the logs in Actions tab
2. Read PIPELINE.md for detailed explanations
3. Check GitHub's documentation: https://docs.github.com/en/actions
4. Search for the error message

**Common documentation:**

- GitHub Actions: https://docs.github.com/en/actions
- Environments: https://docs.github.com/en/actions/deployment/targeting-different-environments
- Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches

---

Good luck! 🚀 The pipeline is production-ready once you complete these steps.
