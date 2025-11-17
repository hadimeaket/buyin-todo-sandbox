# Environment Configuration Guide

## Environment Variables

### Required Secrets in GitHub

Navigate to: `Settings > Secrets and variables > Actions`

#### Container Registry
```
DOCKER_USERNAME=<your-docker-hub-username>
DOCKER_PASSWORD=<your-docker-hub-password>
```

#### Cloud Provider Credentials (choose one)
```
# AWS
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=<your-region>

# Azure
AZURE_CREDENTIALS=<your-azure-sp-json>

# GCP
GCP_PROJECT_ID=<your-project-id>
GCP_SA_KEY=<your-service-account-json>
```

#### Deployment
```
SSH_PRIVATE_KEY=<deployment-ssh-key>
DEPLOY_HOST=<your-deployment-host>
DEPLOY_USER=<deployment-user>
```

#### Monitoring & Notifications
```
SLACK_WEBHOOK_URL=<your-slack-webhook>
DATADOG_API_KEY=<your-datadog-key>
SENTRY_DSN=<your-sentry-dsn>
```

#### Application Secrets
```
DATABASE_URL=<production-database-url>
REDIS_URL=<production-redis-url>
JWT_SECRET=<random-secret-key>
API_KEY=<external-api-key>
```

## Environment-Specific Variables

### Development
```env
NODE_ENV=development
API_URL=http://localhost:4000
LOG_LEVEL=debug
ENABLE_DEBUG=true
```

### Staging
```env
NODE_ENV=staging
API_URL=https://api-staging.your-app.com
LOG_LEVEL=info
ENABLE_DEBUG=true
```

### Production
```env
NODE_ENV=production
API_URL=https://api.your-app.com
LOG_LEVEL=warn
ENABLE_DEBUG=false
```

## GitHub Environments Setup

### 1. Development Environment
- **Reviewers**: None (auto-deploy)
- **Wait timer**: 0 minutes
- **Branch protection**: develop branch only

### 2. Staging Environment
- **Reviewers**: Optional (1 approval)
- **Wait timer**: 0 minutes
- **Branch protection**: main, release/* branches

### 3. Production Environment
- **Reviewers**: Required (2 approvals recommended)
- **Wait timer**: 5 minutes
- **Branch protection**: main branch only
- **Environment secrets**: Production credentials

## Branch Strategy

```
main (production)
  ├── develop (development)
  │     └── feature/* (feature branches)
  ├── release/* (staging + production)
  └── hotfix/* (production fixes)
```

### Branch Protection Rules

#### Main Branch
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Require conversation resolution
- No force pushes
- No deletions

#### Develop Branch
- Require pull request reviews (1 approval)
- Require status checks to pass
- Allow force pushes from admins only

## Pipeline Stages

### 1. Code Quality (parallel)
- ESLint/TSLint
- Prettier formatting
- TypeScript type checking
- Code complexity analysis

### 2. Security Scanning (parallel)
- npm audit (dependency vulnerabilities)
- CodeQL (static analysis)
- TruffleHog (secret scanning)
- License compliance

### 3. Testing (sequential)
- Unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright/Cypress)
- Code coverage (minimum 80%)

### 4. Build & Containerization
- Docker image build
- Multi-stage builds
- Layer caching
- Trivy container scanning
- Push to registry

### 5. Deployment
- Development: Auto-deploy on develop
- Staging: Auto-deploy on main/release
- Production: Manual approval required

### 6. Post-Deployment
- Smoke tests
- Health checks
- Performance monitoring
- Error rate tracking

## Monitoring & Observability

### Health Checks
```bash
# Backend
curl https://api.your-app.com/api/health

# Frontend
curl https://your-app.com
```

### Metrics to Monitor
- Response time (p50, p95, p99)
- Error rate (< 1%)
- Request throughput
- CPU/Memory usage
- Database connections
- Cache hit rate

### Alerting Thresholds
- Error rate > 5% → Critical alert
- Response time p95 > 1s → Warning
- CPU usage > 80% → Warning
- Memory usage > 85% → Warning
- Disk usage > 90% → Critical

## Rollback Procedures

### Automatic Rollback Triggers
- Health check failure > 3 consecutive times
- Error rate > 10%
- Response time p95 > 5s

### Manual Rollback
```bash
# Revert to previous deployment
kubectl rollout undo deployment/app-backend
kubectl rollout undo deployment/app-frontend

# Or using Docker tags
docker pull ghcr.io/hadimeaket/buyin-todo-sandbox/backend:previous
docker pull ghcr.io/hadimeaket/buyin-todo-sandbox/frontend:previous
```

## Cost Optimization

### CI/CD Optimization
- Use GitHub Actions cache
- Parallel job execution
- Skip unnecessary jobs on doc-only changes
- Clean up old artifacts (30-day retention)

### Container Optimization
- Multi-stage builds
- Minimal base images (alpine)
- Layer caching
- Remove dev dependencies in production

## Security Best Practices

### Secrets Management
✅ Never commit secrets to Git
✅ Use GitHub Secrets for sensitive data
✅ Rotate secrets regularly (90 days)
✅ Use different secrets per environment
✅ Encrypt secrets at rest

### Image Security
✅ Scan images with Trivy/Snyk
✅ Use official base images
✅ Keep base images updated
✅ Run as non-root user
✅ Sign images with Cosign

### Network Security
✅ Use HTTPS everywhere
✅ Implement rate limiting
✅ Configure CORS properly
✅ Use Web Application Firewall (WAF)
✅ DDoS protection

## Disaster Recovery

### Backup Strategy
- **Database**: Daily backups, 30-day retention
- **Files**: Real-time sync to S3/Azure Blob
- **Configuration**: Version controlled in Git
- **Secrets**: Stored in vault (HashiCorp/AWS Secrets Manager)

### Recovery Time Objectives
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 24 hours

### Incident Response
1. Detect incident (monitoring alert)
2. Assess impact and severity
3. Communicate to stakeholders
4. Execute rollback or fix
5. Verify resolution
6. Post-mortem analysis

## Compliance & Auditing

### Audit Logs
- All deployments logged
- Change approval trail
- Access logs (who did what, when)
- Retention: 1 year

### Compliance Checks
- GDPR compliance
- SOC 2 requirements
- ISO 27001 standards
- Industry-specific regulations

## Useful Commands

### Local Testing
```bash
# Test pipeline locally with act
act -j unit-tests

# Run security scan
npm audit --audit-level=moderate

# Build Docker images
docker compose build

# Run E2E tests
docker compose up -d && npm run test:e2e
```

### GitHub CLI
```bash
# Trigger workflow manually
gh workflow run ci-cd.yml

# View workflow runs
gh run list

# View logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id> --failed
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Docker Build Issues
```bash
# Clear Docker cache
docker system prune -af

# Build without cache
docker build --no-cache .
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- TodoItem.test.tsx
```

## Performance Benchmarks

### Target Metrics
- Build time: < 5 minutes
- Test execution: < 3 minutes
- Deployment time: < 2 minutes
- Total pipeline: < 15 minutes

### Optimization Tips
- Use matrix strategy for parallel jobs
- Cache dependencies (npm, Docker layers)
- Skip redundant jobs (docs-only changes)
- Use self-hosted runners for faster builds

## Contact & Support

- **DevOps Lead**: devops@your-company.com
- **On-Call**: Use PagerDuty
- **Documentation**: https://docs.your-company.com
- **Runbook**: https://runbook.your-company.com
