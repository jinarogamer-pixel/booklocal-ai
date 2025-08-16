import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

export interface MonitoringConfig {
  environment: 'development' | 'staging' | 'production';
  prometheusEnabled: boolean;
  elasticsearchUrl: string;
  grafanaUrl: string;
  alertmanagerUrl: string;
  slackWebhookUrl?: string;
  emailAlerts?: string[];
  retentionDays: number;
}

export interface MetricDefinition {
  name: string;
  help: string;
  type: 'counter' | 'histogram' | 'gauge';
  labels?: string[];
}

export interface AlertRule {
  name: string;
  expression: string;
  duration: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  runbook?: string;
  annotations: Record<string, string>;
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  panels: DashboardPanel[];
  refresh: string;
  timeRange: string;
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'graph' | 'stat' | 'table' | 'heatmap' | 'logs';
  queries: string[];
  visualization: any;
  gridPos: { x: number; y: number; w: number; h: number };
}

export class MonitoringStack {
  private config: MonitoringConfig;
  private logger: winston.Logger;
  private metrics: Map<string, any> = new Map();
  private alertRules: AlertRule[] = [];
  private dashboards: Dashboard[] = [];

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.initializeMetrics();
    this.initializeLogging();
    this.setupAlertRules();
    this.createDashboards();
  }

  private initializeMetrics(): void {
    // Enable default Node.js metrics
    collectDefaultMetrics({ register });

    // Application-specific metrics
    const applicationMetrics: MetricDefinition[] = [
      {
        name: 'booklocal_http_requests_total',
        help: 'Total number of HTTP requests',
        type: 'counter',
        labels: ['method', 'route', 'status_code']
      },
      {
        name: 'booklocal_http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        type: 'histogram',
        labels: ['method', 'route']
      },
      {
        name: 'booklocal_active_users',
        help: 'Number of active users',
        type: 'gauge'
      },
      {
        name: 'booklocal_database_connections',
        help: 'Number of active database connections',
        type: 'gauge'
      },
      {
        name: 'booklocal_payment_transactions_total',
        help: 'Total number of payment transactions',
        type: 'counter',
        labels: ['provider', 'status', 'currency']
      },
      {
        name: 'booklocal_payment_amount_total',
        help: 'Total payment amount processed',
        type: 'counter',
        labels: ['provider', 'currency']
      },
      {
        name: 'booklocal_booking_requests_total',
        help: 'Total number of booking requests',
        type: 'counter',
        labels: ['service_type', 'status']
      },
      {
        name: 'booklocal_contractor_verification_duration_seconds',
        help: 'Time taken for contractor verification',
        type: 'histogram',
        labels: ['verification_type']
      },
      {
        name: 'booklocal_security_events_total',
        help: 'Total number of security events',
        type: 'counter',
        labels: ['event_type', 'severity']
      },
      {
        name: 'booklocal_cache_hits_total',
        help: 'Total number of cache hits',
        type: 'counter',
        labels: ['cache_type']
      },
      {
        name: 'booklocal_cache_misses_total',
        help: 'Total number of cache misses',
        type: 'counter',
        labels: ['cache_type']
      },
      {
        name: 'booklocal_queue_size',
        help: 'Current queue size',
        type: 'gauge',
        labels: ['queue_name']
      },
      {
        name: 'booklocal_background_job_duration_seconds',
        help: 'Background job execution time',
        type: 'histogram',
        labels: ['job_type', 'status']
      }
    ];

    // Register metrics
    applicationMetrics.forEach(metricDef => {
      let metric;
      switch (metricDef.type) {
        case 'counter':
          metric = new Counter({
            name: metricDef.name,
            help: metricDef.help,
            labelNames: metricDef.labels || [],
            registers: [register]
          });
          break;
        case 'histogram':
          metric = new Histogram({
            name: metricDef.name,
            help: metricDef.help,
            labelNames: metricDef.labels || [],
            registers: [register],
            buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
          });
          break;
        case 'gauge':
          metric = new Gauge({
            name: metricDef.name,
            help: metricDef.help,
            labelNames: metricDef.labels || [],
            registers: [register]
          });
          break;
      }
      if (metric) {
        this.metrics.set(metricDef.name, metric);
      }
    });
  }

  private initializeLogging(): void {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.json()
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.json()
      })
    ];

    // Add Elasticsearch transport for production
    if (this.config.environment === 'production' && this.config.elasticsearchUrl) {
      transports.push(
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: this.config.elasticsearchUrl
          },
          index: 'booklocal-logs',
          transformer: (logData: any) => ({
            '@timestamp': new Date().toISOString(),
            level: logData.level,
            message: logData.message,
            meta: logData.meta,
            environment: this.config.environment,
            service: 'booklocal-api'
          })
        })
      );
    }

    this.logger = winston.createLogger({
      level: this.config.environment === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
      ]
    });
  }

  private setupAlertRules(): void {
    this.alertRules = [
      {
        name: 'HighErrorRate',
        expression: 'rate(booklocal_http_requests_total{status_code=~"5.."}[5m]) > 0.1',
        duration: '5m',
        severity: 'critical',
        description: 'High error rate detected',
        runbook: 'https://runbooks.booklocal.com/high-error-rate',
        annotations: {
          summary: 'High error rate detected on {{ $labels.instance }}',
          description: 'Error rate is {{ $value | humanizePercentage }} for the last 5 minutes'
        }
      },
      {
        name: 'HighResponseTime',
        expression: 'histogram_quantile(0.95, rate(booklocal_http_request_duration_seconds_bucket[5m])) > 2',
        duration: '10m',
        severity: 'warning',
        description: 'High response time detected',
        annotations: {
          summary: 'High response time on {{ $labels.instance }}',
          description: '95th percentile response time is {{ $value }}s'
        }
      },
      {
        name: 'DatabaseConnectionsHigh',
        expression: 'booklocal_database_connections > 80',
        duration: '5m',
        severity: 'warning',
        description: 'High number of database connections',
        annotations: {
          summary: 'High database connection count',
          description: 'Database connections: {{ $value }}'
        }
      },
      {
        name: 'PaymentProcessingFailure',
        expression: 'rate(booklocal_payment_transactions_total{status="failed"}[5m]) > 0.05',
        duration: '2m',
        severity: 'critical',
        description: 'High payment processing failure rate',
        annotations: {
          summary: 'Payment processing failures detected',
          description: 'Payment failure rate: {{ $value | humanizePercentage }}'
        }
      },
      {
        name: 'SecurityEventSpike',
        expression: 'rate(booklocal_security_events_total{severity="critical"}[5m]) > 0',
        duration: '1m',
        severity: 'critical',
        description: 'Critical security events detected',
        annotations: {
          summary: 'Critical security events detected',
          description: 'Security event rate: {{ $value }}/min'
        }
      },
      {
        name: 'DiskSpaceHigh',
        expression: '(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10',
        duration: '5m',
        severity: 'warning',
        description: 'Low disk space',
        annotations: {
          summary: 'Low disk space on {{ $labels.instance }}',
          description: 'Disk space usage is above 90%'
        }
      },
      {
        name: 'MemoryUsageHigh',
        expression: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90',
        duration: '10m',
        severity: 'warning',
        description: 'High memory usage',
        annotations: {
          summary: 'High memory usage on {{ $labels.instance }}',
          description: 'Memory usage: {{ $value | humanizePercentage }}'
        }
      },
      {
        name: 'CPUUsageHigh',
        expression: '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80',
        duration: '15m',
        severity: 'warning',
        description: 'High CPU usage',
        annotations: {
          summary: 'High CPU usage on {{ $labels.instance }}',
          description: 'CPU usage: {{ $value | humanizePercentage }}'
        }
      }
    ];
  }

  private createDashboards(): void {
    // Application Overview Dashboard
    this.dashboards.push({
      id: 'booklocal-overview',
      title: 'BookLocal - Application Overview',
      description: 'High-level overview of application performance and health',
      refresh: '30s',
      timeRange: '1h',
      panels: [
        {
          id: 'requests-per-second',
          title: 'Requests per Second',
          type: 'graph',
          queries: ['rate(booklocal_http_requests_total[5m])'],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 0, w: 12, h: 8 }
        },
        {
          id: 'response-time',
          title: 'Response Time (95th percentile)',
          type: 'graph',
          queries: ['histogram_quantile(0.95, rate(booklocal_http_request_duration_seconds_bucket[5m]))'],
          visualization: { type: 'line' },
          gridPos: { x: 12, y: 0, w: 12, h: 8 }
        },
        {
          id: 'error-rate',
          title: 'Error Rate',
          type: 'stat',
          queries: ['rate(booklocal_http_requests_total{status_code=~"5.."}[5m])'],
          visualization: { type: 'percent' },
          gridPos: { x: 0, y: 8, w: 6, h: 4 }
        },
        {
          id: 'active-users',
          title: 'Active Users',
          type: 'stat',
          queries: ['booklocal_active_users'],
          visualization: { type: 'number' },
          gridPos: { x: 6, y: 8, w: 6, h: 4 }
        },
        {
          id: 'database-connections',
          title: 'Database Connections',
          type: 'stat',
          queries: ['booklocal_database_connections'],
          visualization: { type: 'number' },
          gridPos: { x: 12, y: 8, w: 6, h: 4 }
        },
        {
          id: 'payment-success-rate',
          title: 'Payment Success Rate',
          type: 'stat',
          queries: ['rate(booklocal_payment_transactions_total{status="success"}[5m]) / rate(booklocal_payment_transactions_total[5m])'],
          visualization: { type: 'percent' },
          gridPos: { x: 18, y: 8, w: 6, h: 4 }
        }
      ]
    });

    // Business Metrics Dashboard
    this.dashboards.push({
      id: 'booklocal-business',
      title: 'BookLocal - Business Metrics',
      description: 'Key business metrics and KPIs',
      refresh: '1m',
      timeRange: '24h',
      panels: [
        {
          id: 'booking-requests',
          title: 'Booking Requests',
          type: 'graph',
          queries: ['rate(booklocal_booking_requests_total[5m])'],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 0, w: 12, h: 8 }
        },
        {
          id: 'payment-volume',
          title: 'Payment Volume',
          type: 'graph',
          queries: ['rate(booklocal_payment_amount_total[5m])'],
          visualization: { type: 'line' },
          gridPos: { x: 12, y: 0, w: 12, h: 8 }
        },
        {
          id: 'contractor-verification-time',
          title: 'Contractor Verification Time',
          type: 'graph',
          queries: ['histogram_quantile(0.95, rate(booklocal_contractor_verification_duration_seconds_bucket[5m]))'],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 8, w: 12, h: 8 }
        },
        {
          id: 'payment-by-provider',
          title: 'Payments by Provider',
          type: 'graph',
          queries: ['rate(booklocal_payment_transactions_total[5m]) by (provider)'],
          visualization: { type: 'stacked' },
          gridPos: { x: 12, y: 8, w: 12, h: 8 }
        }
      ]
    });

    // Security Dashboard
    this.dashboards.push({
      id: 'booklocal-security',
      title: 'BookLocal - Security Monitoring',
      description: 'Security events and threat detection',
      refresh: '30s',
      timeRange: '4h',
      panels: [
        {
          id: 'security-events',
          title: 'Security Events',
          type: 'graph',
          queries: ['rate(booklocal_security_events_total[5m]) by (event_type)'],
          visualization: { type: 'stacked' },
          gridPos: { x: 0, y: 0, w: 24, h: 8 }
        },
        {
          id: 'failed-logins',
          title: 'Failed Login Attempts',
          type: 'graph',
          queries: ['rate(booklocal_security_events_total{event_type="failed_login"}[5m])'],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 8, w: 12, h: 8 }
        },
        {
          id: 'blocked-ips',
          title: 'Blocked IP Addresses',
          type: 'table',
          queries: ['booklocal_security_events_total{event_type="ip_blocked"}'],
          visualization: { type: 'table' },
          gridPos: { x: 12, y: 8, w: 12, h: 8 }
        }
      ]
    });

    // Infrastructure Dashboard
    this.dashboards.push({
      id: 'booklocal-infrastructure',
      title: 'BookLocal - Infrastructure',
      description: 'System resources and infrastructure health',
      refresh: '30s',
      timeRange: '1h',
      panels: [
        {
          id: 'cpu-usage',
          title: 'CPU Usage',
          type: 'graph',
          queries: ['100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 0, w: 8, h: 8 }
        },
        {
          id: 'memory-usage',
          title: 'Memory Usage',
          type: 'graph',
          queries: ['(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'],
          visualization: { type: 'line' },
          gridPos: { x: 8, y: 0, w: 8, h: 8 }
        },
        {
          id: 'disk-usage',
          title: 'Disk Usage',
          type: 'graph',
          queries: ['(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100'],
          visualization: { type: 'line' },
          gridPos: { x: 16, y: 0, w: 8, h: 8 }
        },
        {
          id: 'network-io',
          title: 'Network I/O',
          type: 'graph',
          queries: [
            'rate(node_network_receive_bytes_total[5m])',
            'rate(node_network_transmit_bytes_total[5m])'
          ],
          visualization: { type: 'line' },
          gridPos: { x: 0, y: 8, w: 12, h: 8 }
        },
        {
          id: 'disk-io',
          title: 'Disk I/O',
          type: 'graph',
          queries: [
            'rate(node_disk_read_bytes_total[5m])',
            'rate(node_disk_written_bytes_total[5m])'
          ],
          visualization: { type: 'line' },
          gridPos: { x: 12, y: 8, w: 12, h: 8 }
        }
      ]
    });
  }

  // Metric recording methods
  public recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    const requestCounter = this.metrics.get('booklocal_http_requests_total');
    const durationHistogram = this.metrics.get('booklocal_http_request_duration_seconds');

    if (requestCounter) {
      requestCounter.inc({ method, route, status_code: statusCode.toString() });
    }

    if (durationHistogram) {
      durationHistogram.observe({ method, route }, duration);
    }
  }

  public recordPaymentTransaction(provider: string, status: string, currency: string, amount: number): void {
    const transactionCounter = this.metrics.get('booklocal_payment_transactions_total');
    const amountCounter = this.metrics.get('booklocal_payment_amount_total');

    if (transactionCounter) {
      transactionCounter.inc({ provider, status, currency });
    }

    if (amountCounter && status === 'success') {
      amountCounter.inc({ provider, currency }, amount);
    }
  }

  public recordBookingRequest(serviceType: string, status: string): void {
    const bookingCounter = this.metrics.get('booklocal_booking_requests_total');
    if (bookingCounter) {
      bookingCounter.inc({ service_type: serviceType, status });
    }
  }

  public recordSecurityEvent(eventType: string, severity: string): void {
    const securityCounter = this.metrics.get('booklocal_security_events_total');
    if (securityCounter) {
      securityCounter.inc({ event_type: eventType, severity });
    }

    // Log security events
    this.logger.warn('Security event detected', {
      eventType,
      severity,
      timestamp: new Date().toISOString()
    });
  }

  public setActiveUsers(count: number): void {
    const activeUsersGauge = this.metrics.get('booklocal_active_users');
    if (activeUsersGauge) {
      activeUsersGauge.set(count);
    }
  }

  public setDatabaseConnections(count: number): void {
    const dbConnectionsGauge = this.metrics.get('booklocal_database_connections');
    if (dbConnectionsGauge) {
      dbConnectionsGauge.set(count);
    }
  }

  public recordCacheHit(cacheType: string): void {
    const cacheHitsCounter = this.metrics.get('booklocal_cache_hits_total');
    if (cacheHitsCounter) {
      cacheHitsCounter.inc({ cache_type: cacheType });
    }
  }

  public recordCacheMiss(cacheType: string): void {
    const cacheMissesCounter = this.metrics.get('booklocal_cache_misses_total');
    if (cacheMissesCounter) {
      cacheMissesCounter.inc({ cache_type: cacheType });
    }
  }

  public setQueueSize(queueName: string, size: number): void {
    const queueSizeGauge = this.metrics.get('booklocal_queue_size');
    if (queueSizeGauge) {
      queueSizeGauge.set({ queue_name: queueName }, size);
    }
  }

  public recordBackgroundJob(jobType: string, status: string, duration: number): void {
    const jobDurationHistogram = this.metrics.get('booklocal_background_job_duration_seconds');
    if (jobDurationHistogram) {
      jobDurationHistogram.observe({ job_type: jobType, status }, duration);
    }
  }

  // Logging methods
  public logInfo(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public logWarn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public logError(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, { error: error?.stack, ...meta });
  }

  public logDebug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Health check endpoint
  public getHealthStatus(): any {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
  }

  // Metrics endpoint for Prometheus
  public getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Configuration methods
  public getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  public getDashboards(): Dashboard[] {
    return this.dashboards;
  }

  public exportPrometheusConfig(): string {
    return `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "booklocal_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - "${this.config.alertmanagerUrl}"

scrape_configs:
  - job_name: 'booklocal-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['localhost:8080']
`;
  }

  public exportAlertmanagerConfig(): string {
    return `
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@booklocal.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    slack_configs:
      - api_url: '${this.config.slackWebhookUrl}'
        channel: '#alerts'
        title: 'BookLocal Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    email_configs:
      - to: '${this.config.emailAlerts?.join(', ')}'
        subject: 'BookLocal Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
`;
  }
}

// Default configuration
const defaultConfig: MonitoringConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  prometheusEnabled: true,
  elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  grafanaUrl: process.env.GRAFANA_URL || 'http://localhost:3001',
  alertmanagerUrl: process.env.ALERTMANAGER_URL || 'http://localhost:9093',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  emailAlerts: process.env.EMAIL_ALERTS?.split(','),
  retentionDays: 30
};

// Singleton instance
export const monitoring = new MonitoringStack(defaultConfig);