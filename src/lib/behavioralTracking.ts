// Advanced Behavioral Tracking and Personality Detection System
"use client";

export interface MouseMovement {
  x: number;
  y: number;
  timestamp: number;
  velocity?: number;
  acceleration?: number;
}

export interface ClickPattern {
  x: number;
  y: number;
  timestamp: number;
  element: string;
  elementType: string;
  duration?: number; // time between mousedown and mouseup
  pressure?: number; // for devices that support it
}

export interface ScrollBehavior {
  position: number;
  timestamp: number;
  direction: 'up' | 'down';
  velocity: number;
  element: string;
}

export interface DecisionTime {
  action: string;
  duration: number;
  timestamp: number;
  context: string;
  hesitationPoints?: number; // number of times user paused
}

export interface UserPersonalityProfile {
  decisionMakingStyle: 'fast' | 'methodical' | 'mixed';
  informationPreference: 'visual' | 'textual' | 'mixed';
  trustBuildingNeeds: 'security-focused' | 'convenience-focused' | 'balanced';
  socialProofSensitivity: 'high' | 'medium' | 'low';
  priceSensitivity: 'budget-conscious' | 'quality-focused' | 'balanced';
  confidenceLevel: number; // 0-100
  cognitiveLoad: number; // 0-100
  attentionSpan: number; // seconds
  preferredInteractionSpeed: 'fast' | 'normal' | 'deliberate';
  errorTolerance: 'high' | 'medium' | 'low';
  explorationTendency: 'high' | 'medium' | 'low';
}

export interface EmotionalState {
  currentMood: 'frustrated' | 'confident' | 'uncertain' | 'impatient' | 'satisfied' | 'curious' | 'overwhelmed';
  engagementLevel: number; // 0-100
  stressLevel: number; // 0-100
  trustLevel: number; // 0-100
  urgencyLevel: number; // 0-100
  satisfactionLevel: number; // 0-100
  lastUpdated: number;
}

export interface BehavioralPattern {
  patternType: 'navigation' | 'search' | 'comparison' | 'booking' | 'exploration';
  frequency: number;
  efficiency: number; // how quickly user completes tasks
  successRate: number; // how often user completes intended actions
  commonErrors: string[];
  preferredPaths: string[];
}

export interface AdaptiveRecommendation {
  type: 'layout' | 'content' | 'interaction' | 'timing' | 'help';
  recommendation: string;
  confidence: number; // 0-100
  reasoning: string;
  expectedImpact: 'high' | 'medium' | 'low';
  testable: boolean;
}

class BehavioralTracker {
  private mouseMovements: MouseMovement[] = [];
  private clickPatterns: ClickPattern[] = [];
  private scrollBehavior: ScrollBehavior[] = [];
  private decisionTimes: DecisionTime[] = [];
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private currentDecisionStart: number | null = null;
  private currentAction: string | null = null;
  private hesitationCount: number = 0;
  private rapidClickCount: number = 0;
  private lastClickTime: number = 0;

  // Personality detection thresholds
  private readonly FAST_DECISION_THRESHOLD = 5000; // 5 seconds
  private readonly METHODICAL_DECISION_THRESHOLD = 30000; // 30 seconds
  private readonly HIGH_MOUSE_VELOCITY_THRESHOLD = 500; // pixels per second
  private readonly RAPID_CLICK_THRESHOLD = 500; // milliseconds between clicks
  private readonly FRUSTRATION_CLICK_COUNT = 3;

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Mouse movement tracking
    document.addEventListener('mousemove', this.trackMouseMovement.bind(this));
    
    // Click pattern tracking
    document.addEventListener('mousedown', this.trackClickStart.bind(this));
    document.addEventListener('mouseup', this.trackClickEnd.bind(this));
    
    // Scroll behavior tracking
    document.addEventListener('scroll', this.trackScrollBehavior.bind(this), { passive: true });
    
    // Decision time tracking
    document.addEventListener('focus', this.trackDecisionStart.bind(this), true);
    document.addEventListener('click', this.trackDecisionEnd.bind(this));
    
    // Page visibility for attention tracking
    document.addEventListener('visibilitychange', this.trackAttention.bind(this));
    
    // Keyboard interaction tracking
    document.addEventListener('keydown', this.trackKeyboardInteraction.bind(this));
    
    // Form interaction tracking
    this.trackFormInteractions();
  }

  private trackMouseMovement(event: MouseEvent): void {
    const now = Date.now();
    const lastMovement = this.mouseMovements[this.mouseMovements.length - 1];
    
    let velocity = 0;
    let acceleration = 0;
    
    if (lastMovement) {
      const timeDiff = now - lastMovement.timestamp;
      const distance = Math.sqrt(
        Math.pow(event.clientX - lastMovement.x, 2) + 
        Math.pow(event.clientY - lastMovement.y, 2)
      );
      velocity = distance / timeDiff * 1000; // pixels per second
      
      if (lastMovement.velocity) {
        acceleration = (velocity - lastMovement.velocity) / timeDiff * 1000;
      }
    }

    this.mouseMovements.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: now,
      velocity,
      acceleration
    });

    // Keep only last 100 movements for performance
    if (this.mouseMovements.length > 100) {
      this.mouseMovements = this.mouseMovements.slice(-100);
    }

    // Detect hesitation (slow mouse movement after fast movement)
    if (velocity < 50 && lastMovement?.velocity && lastMovement.velocity > 200) {
      this.hesitationCount++;
    }

    this.lastActivityTime = now;
  }

  private trackClickStart(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.currentClickStart = Date.now();
    
    // Detect rapid clicking (potential frustration)
    if (this.lastClickTime && Date.now() - this.lastClickTime < this.RAPID_CLICK_THRESHOLD) {
      this.rapidClickCount++;
    } else {
      this.rapidClickCount = 0;
    }
    
    this.lastClickTime = Date.now();
  }

  private trackClickEnd(event: MouseEvent): void {
    if (!this.currentClickStart) return;
    
    const target = event.target as HTMLElement;
    const duration = Date.now() - this.currentClickStart;
    
    this.clickPatterns.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      element: target.tagName.toLowerCase(),
      elementType: target.type || target.className || 'unknown',
      duration,
      pressure: (event as any).pressure || 0.5
    });

    // Keep only last 50 clicks for performance
    if (this.clickPatterns.length > 50) {
      this.clickPatterns = this.clickPatterns.slice(-50);
    }

    this.currentClickStart = null;
  }

  private trackScrollBehavior(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || window.pageYOffset;
    const lastScroll = this.scrollBehavior[this.scrollBehavior.length - 1];
    
    let direction: 'up' | 'down' = 'down';
    let velocity = 0;
    
    if (lastScroll) {
      direction = scrollTop > lastScroll.position ? 'down' : 'up';
      const timeDiff = Date.now() - lastScroll.timestamp;
      const distance = Math.abs(scrollTop - lastScroll.position);
      velocity = distance / timeDiff * 1000; // pixels per second
    }

    this.scrollBehavior.push({
      position: scrollTop,
      timestamp: Date.now(),
      direction,
      velocity,
      element: target.tagName?.toLowerCase() || 'window'
    });

    // Keep only last 30 scroll events for performance
    if (this.scrollBehavior.length > 30) {
      this.scrollBehavior = this.scrollBehavior.slice(-30);
    }
  }

  private trackDecisionStart(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (this.isDecisionElement(target)) {
      this.currentDecisionStart = Date.now();
      this.currentAction = this.getActionName(target);
      this.hesitationCount = 0;
    }
  }

  private trackDecisionEnd(event: MouseEvent): void {
    if (!this.currentDecisionStart || !this.currentAction) return;
    
    const duration = Date.now() - this.currentDecisionStart;
    
    this.decisionTimes.push({
      action: this.currentAction,
      duration,
      timestamp: Date.now(),
      context: this.getCurrentContext(),
      hesitationPoints: this.hesitationCount
    });

    // Keep only last 20 decisions for performance
    if (this.decisionTimes.length > 20) {
      this.decisionTimes = this.decisionTimes.slice(-20);
    }

    this.currentDecisionStart = null;
    this.currentAction = null;
  }

  private trackAttention(): void {
    if (document.hidden) {
      // User switched away - potential distraction or multitasking
      this.lastActivityTime = Date.now();
    }
  }

  private trackKeyboardInteraction(event: KeyboardEvent): void {
    // Track typing patterns, shortcuts usage, etc.
    this.lastActivityTime = Date.now();
  }

  private trackFormInteractions(): void {
    // Track form field interactions
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.type === 'text' || target.type === 'email' || target.tagName === 'TEXTAREA') {
        this.lastActivityTime = Date.now();
      }
    });
  }

  private isDecisionElement(element: HTMLElement): boolean {
    const decisionElements = ['button', 'a', 'select', 'input'];
    const isDecisionClass = element.className.includes('btn') || 
                          element.className.includes('button') ||
                          element.className.includes('link');
    
    return decisionElements.includes(element.tagName.toLowerCase()) || isDecisionClass;
  }

  private getActionName(element: HTMLElement): string {
    return element.textContent?.trim() || 
           element.getAttribute('aria-label') || 
           element.className || 
           element.tagName.toLowerCase();
  }

  private getCurrentContext(): string {
    return window.location.pathname + window.location.search;
  }

  // Personality analysis methods
  public analyzeDecisionMakingStyle(): UserPersonalityProfile['decisionMakingStyle'] {
    if (this.decisionTimes.length < 3) return 'mixed';
    
    const avgDecisionTime = this.decisionTimes.reduce((sum, dt) => sum + dt.duration, 0) / this.decisionTimes.length;
    const fastDecisions = this.decisionTimes.filter(dt => dt.duration < this.FAST_DECISION_THRESHOLD).length;
    const slowDecisions = this.decisionTimes.filter(dt => dt.duration > this.METHODICAL_DECISION_THRESHOLD).length;
    
    const fastRatio = fastDecisions / this.decisionTimes.length;
    const slowRatio = slowDecisions / this.decisionTimes.length;
    
    if (fastRatio > 0.7) return 'fast';
    if (slowRatio > 0.4) return 'methodical';
    return 'mixed';
  }

  public analyzeInformationPreference(): UserPersonalityProfile['informationPreference'] {
    // Analyze scroll patterns, time spent on different content types
    const avgScrollVelocity = this.scrollBehavior.length > 0 
      ? this.scrollBehavior.reduce((sum, sb) => sum + sb.velocity, 0) / this.scrollBehavior.length
      : 0;
    
    // Fast scrolling might indicate preference for visual content
    // Slow scrolling might indicate reading text carefully
    if (avgScrollVelocity > 500) return 'visual';
    if (avgScrollVelocity < 100) return 'textual';
    return 'mixed';
  }

  public analyzeTrustBuildingNeeds(): UserPersonalityProfile['trustBuildingNeeds'] {
    // Analyze hesitation patterns, time spent on security elements
    const avgHesitation = this.decisionTimes.length > 0
      ? this.decisionTimes.reduce((sum, dt) => sum + (dt.hesitationPoints || 0), 0) / this.decisionTimes.length
      : 0;
    
    if (avgHesitation > 3) return 'security-focused';
    if (avgHesitation < 1) return 'convenience-focused';
    return 'balanced';
  }

  public detectEmotionalState(): EmotionalState {
    const now = Date.now();
    
    // Frustration indicators
    const recentRapidClicks = this.rapidClickCount > this.FRUSTRATION_CLICK_COUNT;
    const highMouseVelocity = this.mouseMovements.length > 0 && 
      this.mouseMovements.slice(-5).some(mm => (mm.velocity || 0) > this.HIGH_MOUSE_VELOCITY_THRESHOLD);
    
    // Engagement indicators
    const timeSinceLastActivity = now - this.lastActivityTime;
    const isEngaged = timeSinceLastActivity < 30000; // 30 seconds
    
    // Confidence indicators
    const recentDecisionTime = this.decisionTimes.length > 0 
      ? this.decisionTimes[this.decisionTimes.length - 1].duration
      : 0;
    const isConfident = recentDecisionTime < this.FAST_DECISION_THRESHOLD && this.hesitationCount < 2;
    
    let mood: EmotionalState['currentMood'] = 'satisfied';
    if (recentRapidClicks || highMouseVelocity) mood = 'frustrated';
    else if (!isEngaged) mood = 'uncertain';
    else if (isConfident) mood = 'confident';
    else if (this.hesitationCount > 5) mood = 'overwhelmed';
    
    return {
      currentMood: mood,
      engagementLevel: isEngaged ? Math.min(100, 100 - (timeSinceLastActivity / 1000)) : 0,
      stressLevel: recentRapidClicks ? 80 : this.hesitationCount * 10,
      trustLevel: Math.max(0, 100 - (this.hesitationCount * 5)),
      urgencyLevel: this.rapidClickCount * 20,
      satisfactionLevel: isConfident ? 90 : 60,
      lastUpdated: now
    };
  }

  public generatePersonalityProfile(): UserPersonalityProfile {
    return {
      decisionMakingStyle: this.analyzeDecisionMakingStyle(),
      informationPreference: this.analyzeInformationPreference(),
      trustBuildingNeeds: this.analyzeTrustBuildingNeeds(),
      socialProofSensitivity: this.hesitationCount > 3 ? 'high' : 'medium',
      priceSensitivity: 'balanced', // Would need more specific tracking
      confidenceLevel: Math.max(0, 100 - (this.hesitationCount * 5)),
      cognitiveLoad: Math.min(100, this.hesitationCount * 10 + this.rapidClickCount * 15),
      attentionSpan: Math.max(10, (Date.now() - this.sessionStartTime) / 1000),
      preferredInteractionSpeed: this.analyzeDecisionMakingStyle() === 'fast' ? 'fast' : 'normal',
      errorTolerance: this.rapidClickCount > 2 ? 'low' : 'high',
      explorationTendency: this.mouseMovements.length > 50 ? 'high' : 'medium'
    };
  }

  public generateAdaptiveRecommendations(): AdaptiveRecommendation[] {
    const personality = this.generatePersonalityProfile();
    const emotional = this.detectEmotionalState();
    const recommendations: AdaptiveRecommendation[] = [];

    // Layout recommendations
    if (personality.decisionMakingStyle === 'fast') {
      recommendations.push({
        type: 'layout',
        recommendation: 'Use streamlined interface with prominent CTAs',
        confidence: 85,
        reasoning: 'User shows fast decision-making patterns',
        expectedImpact: 'high',
        testable: true
      });
    }

    if (personality.informationPreference === 'visual') {
      recommendations.push({
        type: 'content',
        recommendation: 'Increase visual content and reduce text density',
        confidence: 75,
        reasoning: 'User scrolls quickly, prefers visual information',
        expectedImpact: 'medium',
        testable: true
      });
    }

    // Emotional state recommendations
    if (emotional.currentMood === 'frustrated') {
      recommendations.push({
        type: 'interaction',
        recommendation: 'Show immediate help options and simplify current task',
        confidence: 90,
        reasoning: 'Detected frustration through rapid clicking patterns',
        expectedImpact: 'high',
        testable: false
      });
    }

    if (personality.trustBuildingNeeds === 'security-focused') {
      recommendations.push({
        type: 'content',
        recommendation: 'Prominently display security badges and guarantees',
        confidence: 80,
        reasoning: 'User shows high hesitation, needs trust signals',
        expectedImpact: 'medium',
        testable: true
      });
    }

    // Cognitive load recommendations
    if (personality.cognitiveLoad > 70) {
      recommendations.push({
        type: 'layout',
        recommendation: 'Reduce information density and use progressive disclosure',
        confidence: 85,
        reasoning: 'High cognitive load detected from hesitation patterns',
        expectedImpact: 'high',
        testable: true
      });
    }

    return recommendations;
  }

  // Utility methods
  public getSessionSummary() {
    return {
      sessionDuration: Date.now() - this.sessionStartTime,
      totalMouseMovements: this.mouseMovements.length,
      totalClicks: this.clickPatterns.length,
      totalScrollEvents: this.scrollBehavior.length,
      totalDecisions: this.decisionTimes.length,
      frustrationEvents: this.rapidClickCount,
      hesitationEvents: this.hesitationCount,
      lastActivity: this.lastActivityTime
    };
  }

  public exportData() {
    return {
      mouseMovements: this.mouseMovements,
      clickPatterns: this.clickPatterns,
      scrollBehavior: this.scrollBehavior,
      decisionTimes: this.decisionTimes,
      personality: this.generatePersonalityProfile(),
      emotionalState: this.detectEmotionalState(),
      recommendations: this.generateAdaptiveRecommendations(),
      sessionSummary: this.getSessionSummary()
    };
  }

  public destroy(): void {
    // Clean up event listeners
    document.removeEventListener('mousemove', this.trackMouseMovement.bind(this));
    document.removeEventListener('mousedown', this.trackClickStart.bind(this));
    document.removeEventListener('mouseup', this.trackClickEnd.bind(this));
    document.removeEventListener('scroll', this.trackScrollBehavior.bind(this));
    document.removeEventListener('focus', this.trackDecisionStart.bind(this));
    document.removeEventListener('click', this.trackDecisionEnd.bind(this));
    document.removeEventListener('visibilitychange', this.trackAttention.bind(this));
    document.removeEventListener('keydown', this.trackKeyboardInteraction.bind(this));
  }
}

// Singleton instance
let behavioralTracker: BehavioralTracker | null = null;

export const getBehavioralTracker = (): BehavioralTracker => {
  if (!behavioralTracker && typeof window !== 'undefined') {
    behavioralTracker = new BehavioralTracker();
  }
  return behavioralTracker!;
};

export const destroyBehavioralTracker = (): void => {
  if (behavioralTracker) {
    behavioralTracker.destroy();
    behavioralTracker = null;
  }
};

// React hook for using behavioral tracking
export const useBehavioralTracking = () => {
  const [personality, setPersonality] = React.useState<UserPersonalityProfile | null>(null);
  const [emotionalState, setEmotionalState] = React.useState<EmotionalState | null>(null);
  const [recommendations, setRecommendations] = React.useState<AdaptiveRecommendation[]>([]);

  React.useEffect(() => {
    const tracker = getBehavioralTracker();
    
    const updateInterval = setInterval(() => {
      setPersonality(tracker.generatePersonalityProfile());
      setEmotionalState(tracker.detectEmotionalState());
      setRecommendations(tracker.generateAdaptiveRecommendations());
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  return {
    personality,
    emotionalState,
    recommendations,
    tracker: getBehavioralTracker()
  };
};

export default BehavioralTracker;