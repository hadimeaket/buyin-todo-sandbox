# Monitoring & Observability Configuration

## Metrics Collection

### Prometheus Metrics

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Backend API metrics
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:4000']
    metrics_path: '/api/metrics'
    
  # Frontend nginx metrics  
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:80']
    
  # Node exporter for system metrics
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Key Performance Indicators (KPIs)

#### Application Metrics
```
# Request metrics
http_requests_total                  # Total HTTP requests
http_request_duration_seconds        # Request latency histogram
http_request_size_bytes             # Request body size
http_response_size_bytes            # Response body size

# Error metrics
http_requests_failed_total          # Failed requests count
error_rate                          # Error rate percentage

# Business metrics
todos_created_total                 # Total todos created
todos_completed_total               # Total todos completed
active_users                        # Active users count
```

#### Infrastructure Metrics
```
# CPU
process_cpu_seconds_total           # CPU time
node_cpu_utilization               # CPU percentage

# Memory
process_resident_memory_bytes      # Memory usage
node_memory_utilization           # Memory percentage

# Network
node_network_receive_bytes_total   # Network ingress
node_network_transmit_bytes_total  # Network egress

# Disk
node_disk_io_time_seconds_total    # Disk I/O time
node_filesystem_avail_bytes        # Available disk space
```

## Alerting Rules

### Grafana Alerts

```yaml
# alerts.yml
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_failed_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% (threshold: 5%)"
          
      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "95th percentile response time is {{ $value }}s"
          
      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service has been down for 1 minute"

  - name: infrastructure_alerts
    interval: 30s
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: node_cpu_utilization > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"
          
      # High memory usage
      - alert: HighMemoryUsage
        expr: node_memory_utilization > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"
          
      # Low disk space
      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value }}% disk space remaining"
```

## Logging Configuration

### Structured Logging Format

```json
{
  "timestamp": "2025-11-17T22:00:00.000Z",
  "level": "info",
  "service": "backend",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user123",
  "method": "GET",
  "path": "/api/todos",
  "statusCode": 200,
  "duration": 45,
  "message": "Request completed"
}
```

### Log Levels

- **ERROR**: System errors, exceptions
- **WARN**: Warnings, degraded functionality
- **INFO**: Important business events
- **DEBUG**: Detailed diagnostic information
- **TRACE**: Very detailed information (development only)

### Log Retention

| Environment | Retention | Storage |
|------------|-----------|---------|
| Development | 7 days | Local |
| Staging | 30 days | Cloud storage |
| Production | 90 days | Cloud storage + Archive |

## Dashboard Configuration

### Grafana Dashboards

#### 1. Application Overview Dashboard

**Panels:**
- Request rate (req/s)
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- Todos created/completed (today)

#### 2. Infrastructure Dashboard

**Panels:**
- CPU usage (%)
- Memory usage (%)
- Disk I/O
- Network traffic
- Container health status

#### 3. Business Metrics Dashboard

**Panels:**
- Daily active users
- Todo completion rate
- User engagement metrics
- Feature usage statistics

### Example Dashboard JSON

```json
{
  "dashboard": {
    "title": "BuyIn Todo - Application Overview",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "id": 2,
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_failed_total[5m]) / rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "id": 3,
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

## Tracing Configuration

### OpenTelemetry Setup

```javascript
// tracing.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'buyin-todo-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
});

const exporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();
```

## Uptime Monitoring

### External Monitoring Services

1. **Pingdom**
   - Check interval: 1 minute
   - Locations: Multiple global regions
   - Alert channels: Email, SMS, Slack

2. **UptimeRobot**
   - HTTP(s) monitoring
   - Keyword monitoring
   - SSL certificate monitoring

3. **StatusPage**
   - Public status page
   - Incident management
   - Subscriber notifications

### Health Check Endpoints

```bash
# Liveness probe (is the app running?)
GET /api/health
Expected: 200 OK

# Readiness probe (is the app ready for traffic?)
GET /api/ready
Expected: 200 OK (or 503 if not ready)

# Metrics endpoint
GET /api/metrics
Expected: 200 OK with Prometheus metrics
```

## Incident Response

### On-Call Rotation

```yaml
# PagerDuty schedule
schedule:
  timezone: UTC
  rotation:
    - engineer_1: Mon-Wed
    - engineer_2: Thu-Sat
    - engineer_3: Sun
  escalation:
    - level_1: On-call engineer (5 min)
    - level_2: Team lead (15 min)
    - level_3: Engineering manager (30 min)
```

### Incident Severity Levels

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| P0 (Critical) | Complete outage | 15 minutes | API down, database crash |
| P1 (High) | Major degradation | 1 hour | High error rate, slow response |
| P2 (Medium) | Partial degradation | 4 hours | Feature not working |
| P3 (Low) | Minor issue | 1 business day | UI glitch, logging issue |

### Incident Response Runbook

1. **Detection** (0-5 min)
   - Alert triggered
   - On-call engineer paged
   - Acknowledge incident

2. **Assessment** (5-15 min)
   - Check dashboards
   - Review logs
   - Determine severity
   - Update status page

3. **Response** (15-60 min)
   - Execute mitigation steps
   - Rollback if needed
   - Communicate updates
   - Engage additional help if needed

4. **Resolution** (varies)
   - Implement fix
   - Verify resolution
   - Update status page
   - Close incident

5. **Post-Mortem** (within 48 hours)
   - Root cause analysis
   - Action items
   - Process improvements
   - Documentation updates

## SLA/SLO Definitions

### Service Level Objectives (SLOs)

```yaml
slos:
  availability:
    target: 99.9%
    measurement_window: 30 days
    
  latency:
    p50: < 100ms
    p95: < 500ms
    p99: < 1000ms
    
  error_rate:
    target: < 0.1%
    measurement_window: 24 hours
    
  throughput:
    target: > 1000 req/s
    measurement_window: 1 hour
```

### Service Level Agreements (SLAs)

- **Uptime**: 99.9% monthly uptime guarantee
- **Support Response**: 
  - P0: 15 minutes
  - P1: 1 hour
  - P2: 4 hours
  - P3: Next business day
- **Data Backup**: Daily backups, 30-day retention
- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 24 hours

## Cost Monitoring

### Monthly Budget Alerts

```yaml
budgets:
  infrastructure:
    limit: $500
    alerts:
      - threshold: 80%
        action: email
      - threshold: 100%
        action: slack + email
        
  monitoring:
    limit: $100
    alerts:
      - threshold: 90%
        action: email
```

### Cost Optimization Strategies

1. **Right-sizing**: Adjust resources based on usage
2. **Auto-scaling**: Scale down during low traffic
3. **Reserved Instances**: Long-term commitments for savings
4. **Spot Instances**: Use for non-critical workloads
5. **Storage Tiering**: Archive old logs to cheaper storage

## Integration Examples

### Slack Notifications

```javascript
// slack-notifier.js
const axios = require('axios');

async function sendAlert(alert) {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `🚨 *${alert.severity}*: ${alert.title}`,
    attachments: [{
      color: alert.severity === 'critical' ? 'danger' : 'warning',
      fields: [
        { title: 'Service', value: alert.service, short: true },
        { title: 'Environment', value: alert.environment, short: true },
        { title: 'Description', value: alert.description },
      ],
      footer: 'BuyIn Todo Monitoring',
      ts: Date.now() / 1000
    }]
  });
}
```

### DataDog Integration

```javascript
// datadog.js
const StatsD = require('hot-shots');

const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: 8125,
  prefix: 'buyin.todo.',
  globalTags: {
    env: process.env.NODE_ENV,
    service: 'backend'
  }
});

// Track metrics
dogstatsd.increment('api.request');
dogstatsd.histogram('api.response_time', responseTime);
dogstatsd.gauge('api.active_connections', activeConnections);
```

## Security Monitoring

### Security Metrics

- Failed authentication attempts
- Unauthorized access attempts
- Rate limit violations
- Suspicious IP addresses
- API key usage patterns

### Security Alerts

```yaml
security_alerts:
  - name: BruteForceDetection
    condition: failed_login_attempts > 5 in 5 minutes
    action: block_ip, notify_security_team
    
  - name: AnomalousTraffic
    condition: request_rate > 10x baseline
    action: enable_rate_limiting, investigate
    
  - name: SuspiciousPayload
    condition: sql_injection_pattern detected
    action: block_request, log_incident
```

## Useful Queries

### Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate percentage
(rate(http_requests_failed_total[5m]) / rate(http_requests_total[5m])) * 100

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage percentage
(node_memory_active_bytes / node_memory_total_bytes) * 100

# Top 5 slowest endpoints
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### Log Queries (ELK/Splunk)

```
# Find errors in last hour
level:ERROR AND timestamp:[now-1h TO now]

# Slow requests (>1s)
duration:>1000 AND path:/api/*

# User activity
userId:* AND action:(created OR completed)

# Failed deployments
service:deployment AND status:failed
```
