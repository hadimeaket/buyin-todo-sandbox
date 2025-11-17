# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration and continuous deployment. The pipeline is designed with enterprise-grade best practices, security, and reliability in mind.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Code Push / PR                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Parallel Quality Checks                     │
├───────────────────┬─────────────────┬───────────────────────┤
│  Code Quality     │  Security Scan  │   Unit Tests          │
│  - Linting        │  - npm audit    │   - Jest/Vitest       │
│  - Formatting     │  - CodeQL       │   - Coverage          │
│  - Type Check     │  - Secrets      │                       │
└───────────────────┴─────────────────┴───────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Integration & E2E Tests                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          Build & Containerization                           │
│  - Docker build                                             │
│  - Image scanning (Trivy)                                   │
│  - Push to registry                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Deployment Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│  develop    → Development (auto)                            │
│  main       → Staging (auto) → Production (manual approval) │
│  release/*  → Staging (auto) → Production (manual approval) │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Post-Deployment Monitoring                        │
│  - Health checks                                            │
│  - Smoke tests                                              │
│  - Metrics validation                                       │
└─────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. Main CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**

- Push to `main`, `develop`, `release/*`
- Pull requests to `main`, `develop`
- Manual workflow dispatch

**Jobs:**

1. **code-quality**: ESLint, Prettier, TypeScript type checking
2. **security-scan**: npm audit, CodeQL, secret scanning
3. **unit-tests**: Jest/Vitest with coverage reporting
4. **integration-tests**: API and service integration tests
5. **e2e-tests**: End-to-end testing with Docker Compose
6. **build**: Docker image building and vulnerability scanning
7. **deploy-development**: Auto-deploy to dev environment
8. **deploy-staging**: Auto-deploy to staging environment
9. **deploy-production**: Manual approval required
10. **post-deployment-checks**: Health monitoring

**Duration:** ~15-20 minutes (depending on tests)

### 2. Security Audit (`security-audit.yml`)

**Triggers:**

- Daily at 2 AM UTC (cron)
- Manual workflow dispatch
- Push to main

**Checks:**

- npm audit for both backend and frontend
- OWASP dependency check
- License compliance verification

**Artifacts:**

- Security audit results (90-day retention)
- License reports

### 3. Performance Testing (`performance-testing.yml`)

**Triggers:**

- Nightly at 3 AM UTC (cron)
- Manual workflow dispatch with environment selection

**Tests:**

- Load testing with k6
- Lighthouse performance audit
- API response time benchmarks

**Thresholds:**

- p95 response time: < 500ms
- p99 response time: < 1000ms
- Error rate: < 1%

### 4. Dependabot Auto-Merge (`dependabot-auto-merge.yml`)

**Triggers:**

- Dependabot pull requests

**Behavior:**

- Auto-merge: patch and minor updates
- Manual review: major version updates
- Runs all CI checks before merging

## Environment Setup

### Required GitHub Secrets

Navigate to: `Repository Settings → Secrets and variables → Actions`

#### Essential Secrets

```bash
# Container Registry
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password/token

# Cloud Provider (choose your platform)
AWS_ACCESS_KEY_ID       # AWS credentials
AWS_SECRET_ACCESS_KEY
AWS_REGION

# or Azure
AZURE_CREDENTIALS       # Azure service principal JSON

# or GCP
GCP_PROJECT_ID
GCP_SA_KEY             # Service account key JSON

# Monitoring (optional but recommended)
SLACK_WEBHOOK_URL      # Slack notifications
DATADOG_API_KEY        # Datadog monitoring
SENTRY_DSN             # Sentry error tracking
```

### GitHub Environments

Create three environments in repository settings:

1. **development**

   - No approval required
   - Secrets: Development credentials
   - URL: https://dev.your-app.com

2. **staging**

   - Optional: 1 reviewer
   - Secrets: Staging credentials
   - URL: https://staging.your-app.com

3. **production**
   - Required: 2 reviewers
   - Wait timer: 5 minutes
   - Secrets: Production credentials
   - URL: https://your-app.com

## Branch Strategy

```
main (protected)
├── develop (protected)
│   ├── feature/user-auth
│   ├── feature/new-ui
│   └── feature/*
├── release/v1.2.0
├── release/v1.3.0
└── hotfix/critical-bug
```

### Branch Protection Rules

#### `main` branch

- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date
- ✅ Require conversation resolution before merging
- ✅ Include administrators
- ❌ Allow force pushes: No
- ❌ Allow deletions: No

#### `develop` branch

- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass before merging
- ✅ Allow administrators to bypass

### Workflow

1. **Feature Development**

   ```bash
   git checkout develop
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   # Create PR to develop
   ```

2. **Release Process**

   ```bash
   git checkout main
   git checkout -b release/v1.2.0
   # Update version, changelog
   git push origin release/v1.2.0
   # Create PR to main
   # After merge, tag the release
   git tag v1.2.0
   git push origin v1.2.0
   ```

3. **Hotfix**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug
   # Fix the bug
   git commit -m "fix: critical bug"
   git push origin hotfix/critical-bug
   # Create PR to main
   # After merge, also merge to develop
   ```

## Status Badges

Add these to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/hadimeaket/buyin-todo-sandbox/actions/workflows/ci-cd.yml/badge.svg)
![Security Audit](https://github.com/hadimeaket/buyin-todo-sandbox/actions/workflows/security-audit.yml/badge.svg)
![Performance Tests](https://github.com/hadimeaket/buyin-todo-sandbox/actions/workflows/performance-testing.yml/badge.svg)
```

## Deployment Process

### Automatic Deployments

**Development Environment**

- Triggered on: Push to `develop`
- No approval required
- Deploy time: ~2 minutes

**Staging Environment**

- Triggered on: Push to `main` or `release/*`
- No approval required
- Deploy time: ~3 minutes
- Includes smoke tests

**Production Environment**

- Triggered on: After staging success
- **Requires manual approval** from 2 reviewers
- Wait timer: 5 minutes
- Deploy time: ~5 minutes
- Includes health checks and rollback capability

### Manual Deployment

Trigger via GitHub UI:

1. Go to `Actions` tab
2. Select `CI/CD Pipeline`
3. Click `Run workflow`
4. Choose environment: development, staging, or production
5. Click `Run workflow`

### Rollback Procedure

#### Automatic Rollback

Triggered when:

- Health check fails 3 consecutive times
- Error rate > 10%
- Response time p95 > 5 seconds

#### Manual Rollback

```bash
# Via GitHub UI
1. Go to Actions → CI/CD Pipeline → Latest Production Run
2. Click "Re-run jobs" → Select previous successful deployment

# Via command line
gh workflow run ci-cd.yml -f environment=production -f version=v1.1.0
```

## Monitoring & Alerts

### Health Endpoints

```bash
# Backend health (liveness)
curl https://api.your-app.com/api/health

# Backend readiness
curl https://api.your-app.com/api/ready

# Backend metrics
curl https://api.your-app.com/api/metrics
```

### Key Metrics

| Metric              | Target    | Warning  | Critical |
| ------------------- | --------- | -------- | -------- |
| Response time (p95) | < 300ms   | > 500ms  | > 1000ms |
| Error rate          | < 0.1%    | > 1%     | > 5%     |
| CPU usage           | < 70%     | > 80%    | > 90%    |
| Memory usage        | < 75%     | > 85%    | > 95%    |
| Request throughput  | > 100 rps | < 50 rps | < 10 rps |

### Alert Channels

- **Slack**: #alerts channel for all warnings
- **PagerDuty**: Critical alerts only
- **Email**: Daily digest of all alerts
- **GitHub Issues**: Automatic issue creation for recurring problems

## Troubleshooting

### Pipeline Failures

#### Build Failure

```bash
# Check logs
gh run view <run-id> --log

# Common fixes:
- Clear npm cache: npm ci --cache .npm --prefer-offline
- Rebuild without cache: docker build --no-cache
- Check Node version compatibility
```

#### Test Failures

```bash
# Run tests locally
npm test

# Run specific test
npm test -- TodoItem.test.tsx

# Update snapshots
npm test -- -u
```

#### Deployment Failure

```bash
# Check deployment logs
kubectl logs -f deployment/app-backend

# Check service health
curl https://api.your-app.com/api/health

# Manual rollback
kubectl rollout undo deployment/app-backend
```

### Common Issues

**Issue: "No space left on device"**

```bash
# Clean up GitHub Actions cache
gh cache list
gh cache delete <cache-id>

# Clean up Docker
docker system prune -af
```

**Issue: "Tests timeout"**

```bash
# Increase timeout in jest.config.js
testTimeout: 30000

# Or in individual test
jest.setTimeout(30000)
```

**Issue: "Rate limit exceeded"**

```bash
# Use GitHub token for npm
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" > .npmrc

# Wait for rate limit reset
# Or use personal access token
```

## Performance Optimization

### Pipeline Speed

- **Current**: ~15-20 minutes
- **Target**: < 10 minutes

#### Optimization Strategies

1. ✅ Parallel job execution (implemented)
2. ✅ Dependency caching (npm, Docker)
3. ✅ Skip redundant jobs (doc-only changes)
4. 🔄 Use self-hosted runners (faster builds)
5. 🔄 Incremental builds
6. 🔄 Matrix strategy for tests

### Cost Optimization

**Current monthly cost estimate:**

- GitHub Actions minutes: ~500 minutes/month × $0.008 = $4
- Artifact storage: ~10 GB × $0.25 = $2.50
- **Total**: ~$6.50/month

**Optimization tips:**

- Cache dependencies (saves ~2 minutes per run)
- Use artifact retention (30 days vs 90 days)
- Clean up old workflow runs
- Use concurrency control (cancel old runs)

## Security Best Practices

### ✅ Implemented

- Secret scanning (TruffleHog)
- Dependency vulnerability scanning (npm audit)
- Static code analysis (CodeQL)
- Container scanning (Trivy)
- License compliance checks
- Least privilege principle (GITHUB_TOKEN permissions)

### 🔄 Recommended Additions

- SAST (SonarQube/SonarCloud)
- DAST (OWASP ZAP/Burp Suite)
- Infrastructure scanning (Checkov/Terraform)
- Penetration testing (quarterly)
- Security training for developers

## Contributing

### Testing Pipeline Changes

1. **Test locally with act**

   ```bash
   # Install act
   brew install act  # macOS
   # or
   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

   # Run specific job
   act -j unit-tests

   # Run entire workflow
   act push
   ```

2. **Test in feature branch**

   - Create PR from feature branch
   - Pipeline runs automatically
   - Review results before merging

3. **Review workflow logs**
   ```bash
   gh run list
   gh run view <run-id>
   gh run view <run-id> --log
   ```

## Support

- **Pipeline Issues**: Create issue with label `pipeline`
- **Security Concerns**: security@your-company.com
- **Emergency**: Page on-call DevOps engineer

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
