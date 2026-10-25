/**
 * WISE OS Type Definitions
 * Evidence-first personal executive system: WITNESS → INTEGRATE → SELECT → EXECUTE
 */

export type OperatingMode = 'clear' | 'decide' | 'execute' | 'reset' | 'relationship' | 'general';

export type StrategicTrack = 'recovery' | 'revenue' | 'stability' | 'operations';

export type ActionStatus = 
  | 'not_started' 
  | 'active' 
  | 'blocked' 
  | 'completed' 
  | 'delegated' 
  | 'deferred' 
  | 'cancelled' 
  | 'archived'
  | 'parked';

export type EvidenceClassification =
  | 'VERIFIED_FACT'
  | 'DOCUMENTED_RECORD'
  | 'SELF_REPORT'
  | 'THIRD_PARTY_REPORT'
  | 'CLAIM'
  | 'ASSUMPTION'
  | 'HYPOTHESIS'
  | 'AI_INFERENCE'
  | 'DISPUTED'
  | 'UNKNOWN';

export type EvidenceDomain =
  | 'legal'
  | 'financial'
  | 'business'
  | 'technical'
  | 'personal'
  | 'relationship'
  | 'stability'
  | 'other';

export interface EvidenceItem {
  id: string;
  title: string;
  domain: EvidenceDomain;
  classification: EvidenceClassification;
  source: string;
  date: string;
  directSupport: string;
  contradiction: string;
  alternativeExplanation: string;
  confidence: number; // 0 to 100
  relatedObjective: string;
  relatedDecision: string;
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'superseded';
  lastReviewedDate: string;
  isDemo?: boolean;
}

export interface ActionItem {
  id: string;
  title: string;
  domain: StrategicTrack;
  status: ActionStatus;
  estimatedMinutes: number;
  actualMinutes?: number;
  completionEvidence: string;
  followUpTrigger: string;
  targetDate?: string;
  parkedReason?: string;
  delegatedTo?: string;
  createdAt: string;
  completedAt?: string;
  isDemo?: boolean;
}

export interface StrategicTrackItem {
  id: string;
  name: string;
  track: StrategicTrack;
  description: string;
  status: 'active' | 'on_track' | 'at_risk' | 'paused';
  nextMilestone: string;
  targetDate: string;
  isDemo?: boolean;
}

export interface SessionEvaluation {
  session_id: string;
  timestamp: string;
  mode: OperatingMode;
  domain: EvidenceDomain;
  raw_objective: string;
  true_objective: string;
  verified_facts: string[];
  documented_records: string[];
  self_reports: string[];
  claims: string[];
  assumptions: string[];
  hypotheses: string[];
  ai_inferences: string[];
  contradictions: string[];
  alternative_explanations: string[];
  unknowns: string[];
  emotional_intensity_before: number; // 0-10
  emotional_intensity_after: number; // 0-10
  clarity_before: number; // 0-10
  clarity_after: number; // 0-10
  decision_required: string;
  decision: string;
  recommended_option: string;
  primary_risk: string;
  next_physical_action: string;
  action_owner: string; // Defaults to "Joseph"
  target_date: string;
  completion_evidence: string;
  status: ActionStatus;
  follow_up_trigger: string;
  new_evidence_detected: boolean;
  repetition_detected: boolean;
  requires_professional_review: boolean;
}

export interface DraftMessage {
  id: string;
  recipient: string;
  subject?: string;
  content: string;
  emotionalRating: number;
  coolingPeriodHours: number;
  createdAt: string;
  readyAfter: string;
  status: 'draft' | 'reviewed' | 'discarded' | 'approved_to_send';
  notes?: string;
  isDemo?: boolean;
}

export interface MorningCheckinData {
  id: string;
  date: string;
  dailyObjective: string;
  mainRisk: string;
  firstAction: string;
  completionEvidence: string;
  plannedReviewTime: string;
  createdAt: string;
}

export interface EveningCheckinData {
  id: string;
  date: string;
  whatActuallyHappened: string;
  whatWasCompleted: string;
  whatChanged: string;
  continueCorrectDelegateDrop: string;
  createdAt: string;
}

export interface WeeklyMirrorReview {
  id: string;
  weekLabel: string;
  generatedDate: string;
  whatJosephSaidMattered: string[];
  whatJosephActuallyActedOn: string[];
  completedActionsCount: number;
  repeatedUnresolvedTopics: string[];
  decisionsDelayed: string[];
  newEvidenceDiscovered: string[];
  contradictionsDiscovered: string[];
  revenueMovement: string;
  recoveryMovement: string;
  stabilityMovement: string;
  highestLeverageNextMove: string;
  oneBehaviorToStop: string;
  oneBehaviorToContinue: string;
}

export interface AdaptivePatternAlert {
  type: 'ANALYSIS_LOOP' | 'COMPLEXITY_OVERLOAD' | 'UNSUPPORTED_CERTAINTY' | 'EXECUTION_AVOIDANCE' | 'EMOTIONAL_COMMUNICATION_RISK' | 'COMPLETION';
  title: string;
  description: string;
  suggestedAction: string;
  timestamp: string;
}

export interface AppState {
  isDemo: boolean;
  activeObjective: string;
  activeActionId: string | null;
  actions: ActionItem[];
  evidence: EvidenceItem[];
  tracks: StrategicTrackItem[];
  sessions: SessionEvaluation[];
  draftMessages: DraftMessage[];
  morningCheckins: MorningCheckinData[];
  eveningCheckins: EveningCheckinData[];
  weeklyReviews: WeeklyMirrorReview[];
  focusTimer: {
    isRunning: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    actionId: string | null;
  };
}
