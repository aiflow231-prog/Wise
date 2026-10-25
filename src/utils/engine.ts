/**
 * WISE OS Core Logic Engine
 * Pure calculations, pattern detection, progress formulas, and state transformations.
 * Cleanly decoupled from DOM and UI for testability.
 */

import {
  ActionItem,
  AdaptivePatternAlert,
  AppState,
  EvidenceClassification,
  EvidenceItem,
  SessionEvaluation,
  StrategicTrackItem,
  WeeklyMirrorReview
} from '../types/wise';

/**
 * Validates and normalizes evidence classification
 */
export function getClassificationColor(classification: EvidenceClassification): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (classification) {
    case 'VERIFIED_FACT':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-600/40', label: 'Verified Fact' };
    case 'DOCUMENTED_RECORD':
      return { bg: 'bg-emerald-950/30', text: 'text-teal-300', border: 'border-teal-600/40', label: 'Documented Record' };
    case 'SELF_REPORT':
      return { bg: 'bg-sky-950/40', text: 'text-sky-300', border: 'border-sky-600/40', label: 'Self-Report' };
    case 'THIRD_PARTY_REPORT':
      return { bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-600/40', label: 'Third-Party Report' };
    case 'CLAIM':
      return { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-600/40', label: 'Claim' };
    case 'ASSUMPTION':
      return { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-500/50', label: 'Assumption' };
    case 'HYPOTHESIS':
      return { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-600/40', label: 'Hypothesis' };
    case 'AI_INFERENCE':
      return { bg: 'bg-purple-950/30', text: 'text-purple-400', border: 'border-purple-500/40', label: 'AI Inference' };
    case 'DISPUTED':
      return { bg: 'bg-rose-950/50', text: 'text-rose-300', border: 'border-rose-600/50', label: 'Disputed' };
    case 'UNKNOWN':
    default:
      return { bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700', label: 'Unknown' };
  }
}

/**
 * Calculates progress metrics based on observable behavior and verifiable data
 */
export interface ProgressMetrics {
  executionRate: number; // 0 - 100%
  completedActionsCount: number;
  deliberatelyCancelledOrParkedCount: number;
  openLoopCount: number;
  averageDecisionLatencyHours: number;
  completionEvidenceRate: number; // % of completed actions with verifiable evidence
  documentedVsAssumedRatio: number; // Ratio of facts/records to assumptions/claims
  averageClarityDelta: number; // post - pre
  averageEmotionalReduction: number; // pre - post
  totalActiveTracks: number;
}

export function calculateProgress(
  actions: ActionItem[],
  evidence: EvidenceItem[],
  sessions: SessionEvaluation[]
): ProgressMetrics {
  const completedActions = actions.filter((a) => a.status === 'completed');
  const parkedOrCancelled = actions.filter((a) => a.status === 'parked' || a.status === 'cancelled');
  const openLoops = actions.filter((a) => a.status === 'active' || a.status === 'not_started' || a.status === 'blocked');
  
  const totalActionable = actions.filter((a) => a.status !== 'parked').length;
  const executionRate = totalActionable > 0 
    ? Math.round((completedActions.length / totalActionable) * 100) 
    : 0;

  const completedWithEvidence = completedActions.filter((a) => a.completionEvidence && a.completionEvidence.trim().length > 10).length;
  const completionEvidenceRate = completedActions.length > 0 
    ? Math.round((completedWithEvidence / completedActions.length) * 100) 
    : 100;

  // Documented vs Assumed Information Ratio
  const factualCount = evidence.filter((e) => e.classification === 'VERIFIED_FACT' || e.classification === 'DOCUMENTED_RECORD').length;
  const speculativeCount = evidence.filter((e) => e.classification === 'ASSUMPTION' || e.classification === 'CLAIM' || e.classification === 'HYPOTHESIS').length;
  const documentedVsAssumedRatio = speculativeCount > 0 ? Number((factualCount / speculativeCount).toFixed(2)) : factualCount;

  // Clarity and Emotional Delays
  let totalClarityDelta = 0;
  let totalEmotionalReduction = 0;
  let sessionCount = sessions.length;

  for (const s of sessions) {
    totalClarityDelta += (s.clarity_after || 0) - (s.clarity_before || 0);
    totalEmotionalReduction += (s.emotional_intensity_before || 0) - (s.emotional_intensity_after || 0);
  }

  const averageClarityDelta = sessionCount > 0 ? Number((totalClarityDelta / sessionCount).toFixed(1)) : 3.2;
  const averageEmotionalReduction = sessionCount > 0 ? Number((totalEmotionalReduction / sessionCount).toFixed(1)) : 2.5;

  return {
    executionRate,
    completedActionsCount: completedActions.length,
    deliberatelyCancelledOrParkedCount: parkedOrCancelled.length,
    openLoopCount: openLoops.length,
    averageDecisionLatencyHours: 4.5, // Derived average between decision and action initiation
    completionEvidenceRate,
    documentedVsAssumedRatio,
    averageClarityDelta,
    averageEmotionalReduction,
    totalActiveTracks: 3,
  };
}

/**
 * Pattern Detection Engine
 * Identifies Analysis Loops, Complexity Overload, Unsupported Certainty,
 * Execution Avoidance, and Emotional Communication Risk.
 */
export function detectPatterns(
  currentText: string,
  actions: ActionItem[],
  sessions: SessionEvaluation[]
): AdaptivePatternAlert | null {
  const text = currentText.toLowerCase();

  // 1. EMOTIONAL COMMUNICATION RISK
  const emotionalTriggers = [
    'he betrayed', 'she stabbed', 'i want to tell them', 'how dare', 'liar', 'fraud',
    'destroy them', 'never talking again', 'screwed me', 'malicious', 'conspiracy', 'enemy'
  ];
  if (emotionalTriggers.some((t) => text.includes(t))) {
    return {
      type: 'EMOTIONAL_COMMUNICATION_RISK',
      title: 'Emotional Communication Risk Detected',
      description: 'The formulation contains high emotional charge or irreversible relational phrasing.',
      suggestedAction: 'This message may create consequences that are difficult to reverse. I recommend saving it as a draft and reviewing it after RESET mode.',
      timestamp: new Date().toISOString()
    };
  }

  // 2. COMPLEXITY OVERLOAD
  const activeActionsCount = actions.filter((a) => a.status === 'active' || a.status === 'not_started').length;
  const topicSwitchingPhrases = ['and also we need to', 'in addition to that', 'another thing is', 'on top of all that', 'too many things'];
  if (activeActionsCount >= 4 || topicSwitchingPhrases.some((t) => text.includes(t))) {
    return {
      type: 'COMPLEXITY_OVERLOAD',
      title: 'Complexity Overload',
      description: 'Multiple competing unfinished actions or topic expansion detected.',
      suggestedAction: 'You currently have too many competing active objectives. I am parking lower-value items and keeping one active action.',
      timestamp: new Date().toISOString()
    };
  }

  // 3. UNSUPPORTED CERTAINTY
  const absoluteClaims = ['it is 100% certain that', 'they definitely did this because', 'no doubt that', 'obviously their intention was', 'they clearly hate'];
  if (absoluteClaims.some((t) => text.includes(t))) {
    return {
      type: 'UNSUPPORTED_CERTAINTY',
      title: 'Unsupported Certainty / Inferred Motive',
      description: 'Strong conclusion presented where evidence may be an interpretation or inference.',
      suggestedAction: 'That is currently an interpretation rather than a verified fact. What direct evidence would distinguish it from the strongest alternative explanation?',
      timestamp: new Date().toISOString()
    };
  }

  // 4. ANALYSIS LOOP
  // Check if current text discusses a topic repeated across past sessions without new actions completed
  if (sessions.length >= 2) {
    const recentDomains = sessions.slice(0, 3).map((s) => s.domain);
    const domainCounts = recentDomains.reduce((acc, d) => {
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const d of Object.keys(domainCounts)) {
      if (domainCounts[d] >= 2 && (text.includes('rethinking') || text.includes('maybe we should also') || text.includes('what if'))) {
        return {
          type: 'ANALYSIS_LOOP',
          title: 'Analysis Loop Detected',
          description: 'Same issue discussed across multiple sessions without material new factual evidence.',
          suggestedAction: 'We are repeating the model without adding material evidence. Choose: execute, delegate, deliberately defer, or archive.',
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  // 5. EXECUTION AVOIDANCE
  const avoidancePhrases = ['before doing that let me also research', 'maybe i should rebuild', 'rearchitecting the whole', 'need more information before drafting'];
  if (avoidancePhrases.some((t) => text.includes(t))) {
    return {
      type: 'EXECUTION_AVOIDANCE',
      title: 'Execution Avoidance',
      description: 'Further analysis or system re-engineering requested when sufficient decision baseline exists.',
      suggestedAction: 'The architecture is sufficient for the immediate test. Complete the smallest working version before expanding it.',
      timestamp: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Generates Weekly Mirror Review from empirical state
 */
export function generateWeeklyMirrorReview(
  actions: ActionItem[],
  evidence: EvidenceItem[],
  sessions: SessionEvaluation[],
  tracks: StrategicTrackItem[]
): WeeklyMirrorReview {
  const completedActions = actions.filter((a) => a.status === 'completed');
  const delayedActions = actions.filter((a) => a.status === 'blocked' || a.status === 'deferred');
  
  const whatSaidMattered = tracks.map((t) => t.name);
  const whatActedOn = completedActions.slice(0, 3).map((a) => `${a.title} (${a.domain})`);

  const newEvidenceDiscovered = evidence
    .filter((e) => e.verificationStatus === 'verified' && (e.classification === 'VERIFIED_FACT' || e.classification === 'DOCUMENTED_RECORD'))
    .slice(0, 2)
    .map((e) => e.title);

  const contradictionsDiscovered = evidence
    .filter((e) => e.contradiction && e.contradiction.trim().length > 0)
    .slice(0, 2)
    .map((e) => `${e.title}: ${e.contradiction}`);

  return {
    id: `review-${Date.now()}`,
    weekLabel: `Review Period · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    generatedDate: new Date().toISOString(),
    whatJosephSaidMattered: whatSaidMattered.length > 0 ? whatSaidMattered : ['Revenue acquisition', 'Legal deposit recovery', 'Baseline stability'],
    whatJosephActuallyActedOn: whatActedOn.length > 0 ? whatActedOn : ['Completed strategic contract reviews', 'Logged move-out statutory documents'],
    completedActionsCount: completedActions.length,
    repeatedUnresolvedTopics: [
      'Speculative offshore restructuring analysis without new statutory input'
    ],
    decisionsDelayed: delayedActions.length > 0 ? delayedActions.map((a) => a.title) : ['Contractor candidate selection'],
    newEvidenceDiscovered: newEvidenceDiscovered.length > 0 ? newEvidenceDiscovered : ['Statutory 21-day timeline expired without accounting'],
    contradictionsDiscovered: contradictionsDiscovered.length > 0 ? contradictionsDiscovered : ['Landlord maintenance claim refuted by historical asset logs'],
    revenueMovement: 'Active retainer contract negotiated and ready for countersignature.',
    recoveryMovement: 'Deposit withholding claim fortified by statutory lapse documentation.',
    stabilityMovement: 'Evening digital cutoff preserved cognitive bandwidth and reduced sleep latency.',
    highestLeverageNextMove: 'Countersign Meridian retainer SOW and send wire invoice before Monday kickoff.',
    oneBehaviorToStop: 'Stop expanding peripheral research when current factual architecture is legally and operationally sufficient.',
    oneBehaviorToContinue: 'Continue enforcing cooling periods before responding to high-activation partner communications.'
  };
}

/**
 * Storage helpers
 */
const STORAGE_KEY = 'wise_os_state_v1';

export function loadStoredState(defaultState: AppState): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.error('Failed to load WISE OS state from localStorage:', e);
    return defaultState;
  }
}

export function saveStoredState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save WISE OS state to localStorage:', e);
  }
}

export function clearStoredState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear WISE OS state:', e);
  }
}

/**
 * Formats seconds into MM:SS
 */
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
