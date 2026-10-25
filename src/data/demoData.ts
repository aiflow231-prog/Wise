/**
 * WISE OS Fictional Demo Dataset
 * Clearly isolated, realistic scenario data for Joseph.
 * Never mixed implicitly with real records.
 */

import { ActionItem, DraftMessage, EvidenceItem, SessionEvaluation, StrategicTrackItem, WeeklyMirrorReview } from '../types/wise';

export const DEMO_TRACKS: StrategicTrackItem[] = [
  {
    id: 'track-recovery-demo',
    name: 'Disputed Commercial Deposit Recovery',
    track: 'recovery',
    description: 'Statutory recovery of $18,500 withheld security deposit from commercial lease following vacating of suite 400.',
    status: 'active',
    nextMilestone: 'Send formal 10-day statutory demand letter with escrow bank records',
    targetDate: '2026-10-31',
    isDemo: true,
  },
  {
    id: 'track-revenue-demo',
    name: 'Meridian Logistics AI Advisory Retainer',
    track: 'revenue',
    description: 'Q4 Enterprise Architecture Retainer ($24,000/quarter) covering automated routing and supply chain models.',
    status: 'active',
    nextMilestone: 'Counter-sign Master Services Agreement and issue kickoff deposit invoice',
    targetDate: '2026-10-27',
    isDemo: true,
  },
  {
    id: 'track-stability-demo',
    name: 'Executive Sleep & Cognitive Load Baseline',
    track: 'stability',
    description: 'Maintain 7h30m sleep baseline. Disconnect work communications strictly by 20:30 to eliminate cortisol spikes.',
    status: 'on_track',
    nextMilestone: 'Place phone on charger in hallway by 20:30 and complete 10m physical mobility',
    targetDate: '2026-10-25',
    isDemo: true,
  },
];

export const DEMO_ACTIONS: ActionItem[] = [
  {
    id: 'act-demo-1',
    title: 'Counter-sign Meridian Logistics SOW and issue wire instructions',
    domain: 'revenue',
    status: 'active',
    estimatedMinutes: 20,
    completionEvidence: 'Signed PDF sent to vp.eng@meridian.com with confirmation receipt in Sent folder',
    followUpTrigger: 'Review payment acknowledgement on 2026-10-28 at 10:00',
    targetDate: '2026-10-25',
    createdAt: '2026-10-24T09:00:00Z',
    isDemo: true,
  },
  {
    id: 'act-demo-2',
    title: 'Compile Move-Out Inspection photos and send 10-Day Statutory Demand to Ex-Landlord',
    domain: 'recovery',
    status: 'not_started',
    estimatedMinutes: 45,
    completionEvidence: 'Certified Mail tracking number and timestamped PDF copy archived in Evidence Vault',
    followUpTrigger: '10 business day statutory response deadline on 2026-11-08',
    targetDate: '2026-10-26',
    createdAt: '2026-10-24T10:15:00Z',
    isDemo: true,
  },
  {
    id: 'act-demo-3',
    title: 'Execute 10-minute mobility routine and dock mobile device outside bedroom by 20:30',
    domain: 'stability',
    status: 'not_started',
    estimatedMinutes: 10,
    completionEvidence: 'Oura / phone charger docked timestamp verified before 20:35',
    followUpTrigger: 'Morning check-in sleep latency reading',
    targetDate: '2026-10-25',
    createdAt: '2026-10-24T08:30:00Z',
    isDemo: true,
  },
  {
    id: 'act-demo-4',
    title: 'Deliver Phase 1 Data Pipeline Audit report to Apex Health partners',
    domain: 'revenue',
    status: 'completed',
    estimatedMinutes: 90,
    actualMinutes: 80,
    completionEvidence: 'Executive summary acknowledged by CTO Dave Miller via email',
    followUpTrigger: 'Invoice due on 2026-11-01',
    targetDate: '2026-10-23',
    createdAt: '2026-10-22T11:00:00Z',
    completedAt: '2026-10-23T15:30:00Z',
    isDemo: true,
  },
  {
    id: 'act-demo-5',
    title: 'Parked: Researching second-tier offshore LLC jurisdictions for IP holding',
    domain: 'operations',
    status: 'parked',
    estimatedMinutes: 180,
    completionEvidence: 'Summary comparison document',
    followUpTrigger: 'Parked because current domestic corporate structure is legally sufficient for immediate revenue',
    parkedReason: 'Complexity overload. Focus on closing Meridian retainer before restructuring IP.',
    createdAt: '2026-10-21T14:00:00Z',
    isDemo: true,
  },
];

export const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-demo-1',
    title: 'Lease Agreement §14.2 & Move-Out Walkthrough Checklist',
    domain: 'legal',
    classification: 'DOCUMENTED_RECORD',
    source: 'Signed PDF Lease Agreement dated 2024-01-15 & Joint Inspection Sign-off dated 2026-08-31',
    date: '2026-08-31',
    directSupport: 'Clause 14.2 mandates landlord deliver itemized deductions within 21 calendar days of surrender.',
    contradiction: 'Landlord emailed on Day 42 claiming $18,500 for carpet replacement.',
    alternativeExplanation: 'Landlord property management turnover caused internal administrative delay.',
    confidence: 98,
    relatedObjective: 'Disputed Commercial Deposit Recovery',
    relatedDecision: 'Proceed with formal legal demand rather than informal email negotiation',
    verificationStatus: 'verified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-2',
    title: 'Statutory 21-Day Deposit Deduction Window Expiration',
    domain: 'legal',
    classification: 'VERIFIED_FACT',
    source: 'Certified USPS receipt of key return on 2026-08-31; zero written notices received before 2026-09-22',
    date: '2026-09-22',
    directSupport: 'Statutory deadline expired with zero accounting received from landlord.',
    contradiction: 'None. Postal tracking and digital timestamp confirm receipt on August 31.',
    alternativeExplanation: 'None established by factual record.',
    confidence: 100,
    relatedObjective: 'Disputed Commercial Deposit Recovery',
    relatedDecision: 'Assert forfeiture of landlord claim to deposit under state statute',
    verificationStatus: 'verified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-3',
    title: 'Landlord Claim: "Tenant Caused HVAC Compressor Failure"',
    domain: 'legal',
    classification: 'CLAIM',
    source: 'Email from landlord property representative Robert K. on 2026-10-12',
    date: '2026-10-12',
    directSupport: 'Robert stated contractor diagnosed burnt coils.',
    contradiction: 'Building maintenance records show HVAC unit was installed in 2011 with a 10-year useful life.',
    alternativeExplanation: 'HVAC failure was normal wear and tear and pre-existing end-of-life hardware depreciation.',
    confidence: 25,
    relatedObjective: 'Disputed Commercial Deposit Recovery',
    relatedDecision: 'Reject deductions and refuse voluntary offset',
    verificationStatus: 'disputed',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-4',
    title: 'Meridian Logistics Statement of Work & Hourly Budget Approval',
    domain: 'business',
    classification: 'DOCUMENTED_RECORD',
    source: 'VP Engineering Email thread and agreed SOW document v2.4',
    date: '2026-10-22',
    directSupport: 'VP stated: "The scope in v2.4 is approved by executive committee. Please send countersigned SOW."',
    contradiction: 'None.',
    alternativeExplanation: 'None.',
    confidence: 95,
    relatedObjective: 'Meridian Logistics AI Advisory Retainer',
    relatedDecision: 'Execute contract immediately without further speculative amendments',
    verificationStatus: 'verified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-5',
    title: 'Assumption: "Meridian might cancel if we do not add a custom dashboard before launch"',
    domain: 'business',
    classification: 'ASSUMPTION',
    source: 'Joseph internal reflection during planning session',
    date: '2026-10-23',
    directSupport: 'None. SOW explicitly scopes pipeline architecture and API connectors, not custom frontend UI.',
    contradiction: 'Client VP explicitly requested architecture audit and said UI will be handled by internal team.',
    alternativeExplanation: 'Joseph projected desire for comprehensive excellence onto client minimum requirements.',
    confidence: 15,
    relatedObjective: 'Meridian Logistics AI Advisory Retainer',
    relatedDecision: 'Remove dashboard from current sprint; adhere strictly to agreed SOW',
    verificationStatus: 'unverified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-6',
    title: 'Direct Observation: Sarah stated "We are losing market momentum"',
    domain: 'relationship',
    classification: 'SELF_REPORT',
    source: 'Co-founder 1-on-1 debrief on 2026-10-23 at 16:30',
    date: '2026-10-23',
    directSupport: 'Verbatim phrase logged in notes immediately following meeting.',
    contradiction: 'None on whether the words were said.',
    alternativeExplanation: 'Sarah is under pressure from lead investor who requested user count milestones by Q4 end.',
    confidence: 90,
    relatedObjective: 'Tech Co-founder Scope Alignment',
    relatedDecision: 'Address release timing constructively without interpreting motive as negligence',
    verificationStatus: 'verified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
  {
    id: 'ev-demo-7',
    title: 'Interpretation: "Sarah is intentionally disregarding regulatory compliance risk"',
    domain: 'relationship',
    classification: 'HYPOTHESIS',
    source: 'Inferred interpretation during activated conflict state',
    date: '2026-10-23',
    directSupport: 'None. Sarah has consistently complied when compliance issues are framed as blocker tickets.',
    contradiction: 'Sarah agreed to SOC2 readiness review last quarter when presented with clear risk matrices.',
    alternativeExplanation: 'Sarah does not understand the technical severity of the unencrypted staging bucket.',
    confidence: 20,
    relatedObjective: 'Tech Co-founder Scope Alignment',
    relatedDecision: 'Do not send confrontational accusation; present 3-point phased release compromise',
    verificationStatus: 'unverified',
    lastReviewedDate: '2026-10-24',
    isDemo: true,
  },
];

export const DEMO_DRAFTS: DraftMessage[] = [
  {
    id: 'draft-demo-1',
    recipient: 'Sarah (Co-founder)',
    subject: 'Proposed Phase 1 Release & Security Verification Sequence',
    content: `Sarah,\n\nFollowing our discussion yesterday, I agree that getting customer feedback on the data ingestion pipeline this month is vital for our Q4 milestones.\n\nTo ensure we maintain client data integrity, here is the proposed safe sequence:\n1. Release Beta access to our 3 pilot design partners on Monday.\n2. Keep public sign-ups gated until the automated penetration scan completes on Wednesday.\n3. Review analytics together on Friday at 11:00.\n\nLet me know if this sequencing works for your product team.`,
    emotionalRating: 3,
    coolingPeriodHours: 12,
    createdAt: '2026-10-24T07:30:00Z',
    readyAfter: '2026-10-24T19:30:00Z',
    status: 'draft',
    notes: 'Saved during RESET mode. Initial impulse was to send sharp email criticizing release priorities.',
    isDemo: true,
  },
];

export const DEMO_SESSIONS: SessionEvaluation[] = [
  {
    session_id: 'sess-demo-101',
    timestamp: '2026-10-23T17:15:00Z',
    mode: 'reset',
    domain: 'relationship',
    raw_objective: 'Sarah is trying to push an unvetted release and doesn\'t care about our legal exposure.',
    true_objective: 'De-escalate emotional reactivity and establish a phased launch protocol that protects security without delaying beta partner onboarding.',
    verified_facts: [
      'Sarah verbally said "We are losing market momentum" at 16:30.',
      'Staging database currently contains unencrypted test credentials.'
    ],
    documented_records: [
      'Partnership operating agreement specifies unanimous sign-off for public customer releases.'
    ],
    self_reports: [
      'Joseph felt elevated heart rate and anger during call.'
    ],
    claims: [
      'Joseph claimed Sarah does not care about regulatory liability.'
    ],
    assumptions: [
      'Assuming Sarah knows the staging bucket is accessible.'
    ],
    hypotheses: [
      'Sarah is prioritizing investor relations over security.'
    ],
    ai_inferences: [
      'Both founders share the ultimate goal of enterprise trust, but prioritize conflicting dimensions (traction vs integrity).'
    ],
    contradictions: [
      'Sarah has previously signed off on SOC2 requirements when presented with clear mitigation.'
    ],
    alternative_explanations: [
      'Sarah was unaware of the unencrypted staging bucket issue.',
      'Sarah received urgent investor inquiry regarding customer acquisition velocity.'
    ],
    unknowns: [
      'Has Sarah spoken to the lead investor today?',
      'How many hours does the remediation script actually take?'
    ],
    emotional_intensity_before: 8,
    emotional_intensity_after: 3,
    clarity_before: 4,
    clarity_after: 9,
    decision_required: 'How to respond to Sarah\'s release ultimatum.',
    decision: 'Do not respond tonight. Draft a phased sequence proposal tomorrow morning with concrete gates.',
    recommended_option: 'Draft constructive 3-point compromise and propose 15m alignment call.',
    primary_risk: 'Escalating into personal accusations would damage co-founder trust irreversibly.',
    next_physical_action: 'Close laptop, write draft in WISE OS drafts vault, and review at 08:30 tomorrow.',
    action_owner: 'Joseph',
    target_date: '2026-10-24T08:30:00Z',
    completion_evidence: 'Draft stored in WISE OS without sending external email.',
    status: 'completed',
    follow_up_trigger: 'Review draft after 12h cooling period on 2026-10-24.',
    new_evidence_detected: true,
    repetition_detected: false,
    requires_professional_review: false,
  },
  {
    session_id: 'sess-demo-102',
    timestamp: '2026-10-24T10:00:00Z',
    mode: 'clear',
    domain: 'legal',
    raw_objective: 'The landlord is stonewalling on the $18,500 deposit and making up bogus HVAC claims.',
    true_objective: 'Enforce statutory return of deposit under Commercial Code and establish paper trail for treble damages if withheld in bad faith.',
    verified_facts: [
      'Move-out occurred August 31, 2026.',
      'No accounting or repair receipts provided within statutory 21 calendar days.',
      'Landlord acknowledged possession in writing on Sept 2.'
    ],
    documented_records: [
      'Certified mail return receipt dated 2026-08-31.'
    ],
    self_reports: [
      'Joseph confirms premises left in broom-clean condition.'
    ],
    claims: [
      'Landlord claims HVAC compressor replacement costs $18,500.'
    ],
    assumptions: [
      'Landlord will ignore informal demands.'
    ],
    hypotheses: [
      'Landlord has cash liquidity issues and is stalling.'
    ],
    ai_inferences: [
      'Landlord claim will be dismissed in judicial review due to lack of timely statutory accounting.'
    ],
    contradictions: [
      'HVAC unit is 15 years old; landlord claims tenant caused total breakdown in 2 years of occupancy.'
    ],
    alternative_explanations: [
      'Property manager was negligent in forwarding maintenance records to landlord accounting.'
    ],
    unknowns: [
      'Whether landlord attorney has been retained.'
    ],
    emotional_intensity_before: 6,
    emotional_intensity_after: 2,
    clarity_before: 5,
    clarity_after: 9,
    decision_required: 'Whether to file small claims / superior court action or send final statutory 10-day notice first.',
    decision: 'Send statutory 10-day formal demand letter with full evidentiary binder via certified mail.',
    recommended_option: '10-day statutory demand letter attaching §1950.7 citations.',
    primary_risk: 'Premature litigation without formal demand may limit recovery of statutory bad-faith penalties.',
    next_physical_action: 'Print move-out photos and assemble PDF exhibit binder.',
    action_owner: 'Joseph',
    target_date: '2026-10-26T12:00:00Z',
    completion_evidence: 'USPS Certified Mail tracking number logged.',
    status: 'active',
    follow_up_trigger: '10 business days following USPS delivery confirmation.',
    new_evidence_detected: true,
    repetition_detected: false,
    requires_professional_review: false,
  }
];

export const DEMO_WEEKLY_REVIEW: WeeklyMirrorReview = {
  id: 'review-demo-w43',
  weekLabel: 'Week 43 · Oct 19 - Oct 25, 2026',
  generatedDate: '2026-10-24T18:00:00Z',
  whatJosephSaidMattered: [
    'Finalizing Meridian Enterprise Architecture SOW ($24,000 retainer)',
    'Enforcing $18,500 commercial deposit recovery without litigation churn',
    'Protecting physical energy baseline with 20:30 digital cut-off'
  ],
  whatJosephActuallyActedOn: [
    'Reviewed and finalized Meridian SOW contract terms v2.4 (Completed)',
    'Compiled Move-Out Walkthrough checklist and statutory citation binder (Active)',
    'Avoided impulsive late-night Slack escalation with co-founder by utilizing RESET mode'
  ],
  completedActionsCount: 4,
  repeatedUnresolvedTopics: [
    'Speculative IP holding entity restructuring (3 separate voice sessions without material legal changes)'
  ],
  decisionsDelayed: [
    'Selecting candidate for part-time DevOps infrastructure contractor'
  ],
  newEvidenceDiscovered: [
    'Building maintenance logs confirm HVAC was past its statutory 10-year depreciation schedule'
  ],
  contradictionsDiscovered: [
    'Landlord claim of tenant abuse contradicted by landlord agent signed walkthrough sign-off'
  ],
  revenueMovement: '+$24,000 pending retainer contract ready for countersignature today.',
  recoveryMovement: '$18,500 claim fortified with statutory 21-day lapse evidence.',
  stabilityMovement: 'Sleep latency reduced from 65m to 22m when digital shutdown honored before 21:00.',
  highestLeverageNextMove: 'Countersign Meridian SOW and deposit invoice before Monday morning kickoff.',
  oneBehaviorToStop: 'Stop expanding offshore IP research when current domestic LLC structure is fully compliant for immediate revenue.',
  oneBehaviorToContinue: 'Continue enforcing 12-hour cooling period on emotionally charged partner communications.'
};
