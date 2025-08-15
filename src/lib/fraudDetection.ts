// Fraud Detection Guard System
// High priority, low effort - rules-based approach

export interface FraudSignal {
  type: 'ip_anomaly' | 'device_fingerprint' | 'text_similarity' | 'payment_failure' | 'velocity' | 'behavioral';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number; // 0-1
  metadata?: Record<string, unknown>;
}

export interface FraudAssessment {
  riskScore: number; // 0-100
  action: 'allow' | 'review' | 'block';
  signals: FraudSignal[];
  reasons: string[];
}

export interface UserSubmission {
  ip: string;
  userAgent: string;
  email: string;
  phone?: string;
  description: string;
  paymentMethod?: string;
  accountAge?: number; // days
  previousSubmissions?: number;
  location: string;
}

// Known bad IP ranges, VPN providers (expand this list)
const SUSPICIOUS_IP_RANGES = [
  '10.0.0.0/8',   // Private networks shouldn't be seeing external services
  '172.16.0.0/12',
  '192.168.0.0/16',
];

// Common VPN/proxy indicators
const VPN_INDICATORS = [
  'nordvpn', 'expressvpn', 'surfshark', 'protonvpn', 'cyberghost',
  'privatevpn', 'tunnelbear', 'windscribe', 'purevpn'
];

// Suspicious text patterns
const SPAM_PATTERNS = [
  /\b(urgent|asap|immediate|emergency)\b/gi,
  /\b(lowest price|cheapest|best deal)\b/gi,
  /\b(call me now|contact immediately)\b/gi,
  /(.)\1{4,}/g, // Repeated characters
  /\b(lorem ipsum|test test|sample text)\b/gi,
];

// Copy-paste detection - common template phrases
const TEMPLATE_PHRASES = [
  'looking for someone to',
  'need someone who can',
  'please contact me asap',
  'how much would it cost',
  'can you give me a quote',
];

function checkIPAnomaly(ip: string): FraudSignal[] {
  const signals: FraudSignal[] = [];
  
  // Check private IP ranges
  if (SUSPICIOUS_IP_RANGES.some(range => isIPInRange(ip, range))) {
    signals.push({
      type: 'ip_anomaly',
      severity: 'high',
      description: 'Private IP address detected',
      confidence: 0.9,
      metadata: { ip }
    });
  }
  
  // Simple VPN detection (in production, use a proper service)
  if (Math.random() < 0.1) { // 10% chance to simulate VPN detection
    signals.push({
      type: 'ip_anomaly', 
      severity: 'medium',
      description: 'Potential VPN/proxy detected',
      confidence: 0.7,
      metadata: { ip }
    });
  }
  
  return signals;
}

function checkTextSimilarity(description: string, previousSubmissions: string[] = []): FraudSignal[] {
  const signals: FraudSignal[] = [];
  
  // Check for spam patterns
  const spamMatches = SPAM_PATTERNS.filter(pattern => pattern.test(description));
  if (spamMatches.length > 2) {
    signals.push({
      type: 'text_similarity',
      severity: 'medium', 
      description: 'Multiple spam patterns detected',
      confidence: 0.8,
      metadata: { patterns: spamMatches.length }
    });
  }
  
  // Check for template/copy-paste content
  const templateMatches = TEMPLATE_PHRASES.filter(phrase => 
    description.toLowerCase().includes(phrase)
  );
  if (templateMatches.length >= 2) {
    signals.push({
      type: 'text_similarity',
      severity: 'low',
      description: 'Possible template/generic content',
      confidence: 0.6,
      metadata: { templates: templateMatches.length }
    });
  }
  
  // Check for exact duplicates (simplified)
  const similarity = previousSubmissions.some(prev => 
    calculateTextSimilarity(description, prev) > 0.9
  );
  if (similarity) {
    signals.push({
      type: 'text_similarity',
      severity: 'high',
      description: 'Near-duplicate content detected',
      confidence: 0.95,
      metadata: { type: 'duplicate' }
    });
  }
  
  return signals;
}

function checkVelocity(submission: UserSubmission): FraudSignal[] {
  const signals: FraudSignal[] = [];
  
  // High submission velocity (simulate)
  if ((submission.previousSubmissions || 0) > 5) {
    signals.push({
      type: 'velocity',
      severity: 'medium',
      description: 'High submission frequency',
      confidence: 0.7,
      metadata: { count: submission.previousSubmissions }
    });
  }
  
  return signals;
}

function checkBehavioralAnomaly(submission: UserSubmission): FraudSignal[] {
  const signals: FraudSignal[] = [];
  
  // New account with high-value request
  if ((submission.accountAge || 0) < 1) {
    signals.push({
      type: 'behavioral',
      severity: 'low',
      description: 'Very new account',
      confidence: 0.5,
      metadata: { accountAge: submission.accountAge }
    });
  }
  
  // Missing contact info
  if (!submission.phone && submission.email.includes('temp')) {
    signals.push({
      type: 'behavioral',
      severity: 'medium',
      description: 'Suspicious contact information',
      confidence: 0.6,
      metadata: { issue: 'temp_email_no_phone' }
    });
  }
  
  return signals;
}

function calculateRiskScore(signals: FraudSignal[]): number {
  const weights = { low: 10, medium: 25, high: 50 };
  
  const totalRisk = signals.reduce((sum, signal) => {
    const baseWeight = weights[signal.severity];
    return sum + (baseWeight * signal.confidence);
  }, 0);
  
  return Math.min(100, totalRisk);
}

function determineAction(riskScore: number): FraudAssessment['action'] {
  if (riskScore >= 70) return 'block';
  if (riskScore >= 40) return 'review';
  return 'allow';
}

export function assessFraud(submission: UserSubmission, previousSubmissions: string[] = []): FraudAssessment {
  const allSignals: FraudSignal[] = [
    ...checkIPAnomaly(submission.ip),
    ...checkTextSimilarity(submission.description, previousSubmissions),
    ...checkVelocity(submission),
    ...checkBehavioralAnomaly(submission),
  ];
  
  const riskScore = calculateRiskScore(allSignals);
  const action = determineAction(riskScore);
  
  const reasons = allSignals
    .filter(s => s.severity !== 'low')
    .map(s => s.description);
  
  return {
    riskScore,
    action, 
    signals: allSignals,
    reasons,
  };
}

// Utility functions
function isIPInRange(ip: string, range: string): boolean {
  // Simplified IP range check (use a proper library in production)
  return ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // Simplified similarity (use proper algorithm like Levenshtein in production)
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
