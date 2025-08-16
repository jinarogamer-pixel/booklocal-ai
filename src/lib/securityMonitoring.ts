import { getSupabase } from './supabaseClient';
import { captureError } from './errorMonitoring';
import { sendTransactionalEmail } from './sendEmail';

export interface SecurityEvent {
  userId?: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ThreatPattern {
  pattern: string;
  threshold: number;
  timeWindow: number; // minutes
  action: 'LOG' | 'ALERT' | 'BLOCK';
}

// Predefined threat patterns
const THREAT_PATTERNS: ThreatPattern[] = [
  {
    pattern: 'FAILED_LOGIN',
    threshold: 5,
    timeWindow: 15,
    action: 'BLOCK'
  },
  {
    pattern: 'MFA_FAILED',
    threshold: 3,
    timeWindow: 10,
    action: 'ALERT'
  },
  {
    pattern: 'ADMIN_ACCESS',
    threshold: 10,
    timeWindow: 60,
    action: 'ALERT'
  },
  {
    pattern: 'DATA_EXPORT',
    threshold: 5,
    timeWindow: 60,
    action: 'ALERT'
  },
  {
    pattern: 'FILE_UPLOAD_REJECTED',
    threshold: 10,
    timeWindow: 30,
    action: 'BLOCK'
  },
  {
    pattern: 'SUSPICIOUS_QUERY',
    threshold: 3,
    timeWindow: 5,
    action: 'BLOCK'
  }
];

// Log security event and check for threats
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabase = getSupabase();
    
    // Log the event
    await supabase.from('security_logs').insert({
      user_id: event.userId,
      event_type: event.eventType,
      severity: event.severity,
      details: event.details,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      timestamp: event.timestamp
    });

    // Check for threat patterns
    await checkThreatPatterns(event);
    
    // Send immediate alerts for critical events
    if (event.severity === 'CRITICAL') {
      await sendSecurityAlert(event);
    }

  } catch (error) {
    await captureError(error as Error, { event, context: 'SECURITY_MONITORING' });
  }
}

// Check if current event matches any threat patterns
async function checkThreatPatterns(event: SecurityEvent): Promise<void> {
  const supabase = getSupabase();
  
  for (const pattern of THREAT_PATTERNS) {
    if (event.eventType.includes(pattern.pattern)) {
      const timeThreshold = new Date();
      timeThreshold.setMinutes(timeThreshold.getMinutes() - pattern.timeWindow);

      // Count similar events in time window
      const { data: recentEvents, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('event_type', event.eventType)
        .eq('ip_address', event.ipAddress)
        .gte('timestamp', timeThreshold.toISOString());

      if (error) continue;

      const eventCount = recentEvents?.length || 0;

      if (eventCount >= pattern.threshold) {
        await handleThreatDetection(pattern, event, eventCount);
      }
    }
  }
}

// Handle detected threats
async function handleThreatDetection(
  pattern: ThreatPattern, 
  event: SecurityEvent, 
  eventCount: number
): Promise<void> {
  const supabase = getSupabase();

  const threatEvent: SecurityEvent = {
    userId: event.userId,
    eventType: `THREAT_DETECTED_${pattern.pattern}`,
    severity: 'CRITICAL',
    details: {
      originalEvent: event.eventType,
      pattern: pattern.pattern,
      threshold: pattern.threshold,
      actualCount: eventCount,
      timeWindow: pattern.timeWindow,
      action: pattern.action
    },
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: new Date().toISOString()
  };

  // Log threat detection
  await supabase.from('security_logs').insert({
    user_id: threatEvent.userId,
    event_type: threatEvent.eventType,
    severity: threatEvent.severity,
    details: threatEvent.details,
    ip_address: threatEvent.ipAddress,
    user_agent: threatEvent.userAgent,
    timestamp: threatEvent.timestamp
  });

  // Take action based on pattern
  switch (pattern.action) {
    case 'BLOCK':
      await blockIPAddress(event.ipAddress!, pattern.timeWindow);
      await sendSecurityAlert(threatEvent);
      break;
    case 'ALERT':
      await sendSecurityAlert(threatEvent);
      break;
    case 'LOG':
      // Already logged above
      break;
  }
}

// Block IP address temporarily
async function blockIPAddress(ipAddress: string, durationMinutes: number): Promise<void> {
  try {
    const supabase = getSupabase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    await supabase.from('blocked_ips').upsert({
      ip_address: ipAddress,
      reason: 'Automated threat detection',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });

  } catch (error) {
    await captureError(error as Error, { ipAddress, context: 'IP_BLOCKING' });
  }
}

// Check if IP is currently blocked
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .gt('expires_at', now)
      .single();

    return !error && !!data;
  } catch (error) {
    await captureError(error as Error, { ipAddress, context: 'IP_CHECK' });
    return false;
  }
}

// Send security alerts to admin team
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  try {
    const adminEmails = process.env.SECURITY_ADMIN_EMAILS?.split(',') || [];
    
    for (const email of adminEmails) {
      await sendTransactionalEmail({
        to: email.trim(),
        subject: `🚨 BookLocal Security Alert - ${event.eventType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #dc2626;">Security Alert</h2>
            <p><strong>Event:</strong> ${event.eventType}</p>
            <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(event.severity)}">${event.severity}</span></p>
            <p><strong>Time:</strong> ${event.timestamp}</p>
            <p><strong>IP Address:</strong> ${event.ipAddress || 'Unknown'}</p>
            <p><strong>User ID:</strong> ${event.userId || 'Anonymous'}</p>
            
            <h3>Details:</h3>
            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px;">
${JSON.stringify(event.details, null, 2)}
            </pre>
            
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/security" 
                 style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                View Security Dashboard
              </a>
            </p>
          </div>
        `
      });
    }
  } catch (error) {
    await captureError(error as Error, { event, context: 'SECURITY_ALERT' });
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return '#dc2626';
    case 'HIGH': return '#ea580c';
    case 'MEDIUM': return '#d97706';
    case 'LOW': return '#65a30d';
    default: return '#6b7280';
  }
}

// Detect suspicious user behavior
export async function detectSuspiciousActivity(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - 24);

    // Check for suspicious patterns in last 24 hours
    const { data: events, error } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', timeThreshold.toISOString());

    if (error || !events) return false;

    // Analyze patterns
    const failedLogins = events.filter(e => e.event_type === 'FAILED_LOGIN').length;
    const mfaFailures = events.filter(e => e.event_type === 'MFA_FAILED').length;
    const adminAccess = events.filter(e => e.event_type.includes('ADMIN')).length;
    const dataExports = events.filter(e => e.event_type === 'DATA_EXPORT').length;

    // Suspicious if multiple indicators
    const suspiciousScore = 
      (failedLogins > 3 ? 1 : 0) +
      (mfaFailures > 2 ? 1 : 0) +
      (adminAccess > 5 ? 1 : 0) +
      (dataExports > 3 ? 1 : 0);

    if (suspiciousScore >= 2) {
      await logSecurityEvent({
        userId,
        eventType: 'SUSPICIOUS_ACTIVITY_DETECTED',
        severity: 'HIGH',
        details: {
          failedLogins,
          mfaFailures,
          adminAccess,
          dataExports,
          suspiciousScore
        },
        timestamp: new Date().toISOString()
      });
      return true;
    }

    return false;
  } catch (error) {
    await captureError(error as Error, { userId, context: 'SUSPICIOUS_ACTIVITY' });
    return false;
  }
}

// Generate security report for admin dashboard
export async function generateSecurityReport(days: number = 7): Promise<any> {
  try {
    const supabase = getSupabase();
    const timeThreshold = new Date();
    timeThreshold.setDate(timeThreshold.getDate() - days);

    const { data: events, error } = await supabase
      .from('security_logs')
      .select('*')
      .gte('timestamp', timeThreshold.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Aggregate statistics
    const report = {
      totalEvents: events?.length || 0,
      criticalEvents: events?.filter(e => e.severity === 'CRITICAL').length || 0,
      highEvents: events?.filter(e => e.severity === 'HIGH').length || 0,
      blockedIPs: new Set(events?.filter(e => e.event_type.includes('BLOCKED')).map(e => e.ip_address)).size,
      topEventTypes: getTopEventTypes(events || []),
      topIPs: getTopIPs(events || []),
      timeline: getEventTimeline(events || [])
    };

    return report;
  } catch (error) {
    await captureError(error as Error, { context: 'SECURITY_REPORT' });
    return null;
  }
}

function getTopEventTypes(events: any[]): any[] {
  const counts = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }));
}

function getTopIPs(events: any[]): any[] {
  const counts = events.reduce((acc, event) => {
    if (event.ip_address) {
      acc[event.ip_address] = (acc[event.ip_address] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));
}

function getEventTimeline(events: any[]): any[] {
  const timeline = events.reduce((acc, event) => {
    const date = event.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}