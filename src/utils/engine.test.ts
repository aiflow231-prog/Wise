/**
 * Fast-Feedback Unit Tests for WISE OS Core Logic
 * Tested with Node's built-in test runner via tsx: npx --yes tsx --test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProgress,
  detectPatterns,
  formatTimer,
  generateWeeklyMirrorReview,
  getClassificationColor,
} from './engine';
import {
  DEMO_ACTIONS,
  DEMO_EVIDENCE,
  DEMO_SESSIONS,
  DEMO_TRACKS,
  DEMO_WEEKLY_REVIEW,
} from '../data/demoData';
import { ActionItem, SessionEvaluation } from '../types/wise';

test('formatTimer formats seconds accurately', () => {
  assert.equal(formatTimer(0), '00:00');
  assert.equal(formatTimer(59), '00:59');
  assert.equal(formatTimer(60), '01:00');
  assert.equal(formatTimer(1500), '25:00');
  assert.equal(formatTimer(3599), '59:59');
});

test('getClassificationColor provides semantic styles and distinct labels', () => {
  const fact = getClassificationColor('VERIFIED_FACT');
  assert.equal(fact.label, 'Verified Fact');
  assert.match(fact.text, /emerald/);

  const claim = getClassificationColor('CLAIM');
  assert.equal(claim.label, 'Claim');
  assert.match(claim.text, /amber/);

  const disputed = getClassificationColor('DISPUTED');
  assert.equal(disputed.label, 'Disputed');
  assert.match(disputed.text, /rose/);
});

test('calculateProgress computes observable metrics without hallucinated numbers', () => {
  const testActions: ActionItem[] = [
    {
      id: 'a1',
      title: 'Action 1',
      domain: 'revenue',
      status: 'completed',
      estimatedMinutes: 30,
      completionEvidence: 'Signed contract PDF sent via email with receipt',
      followUpTrigger: 'Next week',
      createdAt: '2026-10-01',
    },
    {
      id: 'a2',
      title: 'Action 2',
      domain: 'recovery',
      status: 'completed',
      estimatedMinutes: 20,
      completionEvidence: 'Bank statement line item verified',
      followUpTrigger: 'Tomorrow',
      createdAt: '2026-10-02',
    },
    {
      id: 'a3',
      title: 'Action 3',
      domain: 'stability',
      status: 'active',
      estimatedMinutes: 15,
      completionEvidence: 'Pending check',
      followUpTrigger: 'Tonight',
      createdAt: '2026-10-03',
    },
    {
      id: 'a4',
      title: 'Action 4',
      domain: 'operations',
      status: 'parked',
      estimatedMinutes: 60,
      completionEvidence: 'None yet',
      followUpTrigger: 'Deferred until Q1',
      createdAt: '2026-10-04',
    },
  ];

  const progress = calculateProgress(testActions, DEMO_EVIDENCE, DEMO_SESSIONS);

  assert.equal(progress.completedActionsCount, 2);
  assert.equal(progress.deliberatelyCancelledOrParkedCount, 1);
  assert.equal(progress.openLoopCount, 1);
  // Total actionable is 3 (excluding parked a4): 2 completed / 3 actionable = 67%
  assert.equal(progress.executionRate, 67);
  // Both completed actions have verifiable evidence > 10 chars: 100%
  assert.equal(progress.completionEvidenceRate, 100);
});

test('detectPatterns catches Emotional Communication Risk and suggests draft pause', () => {
  const alert = detectPatterns(
    'I want to tell them how dare they betray us and screw me over like a liar',
    DEMO_ACTIONS,
    DEMO_SESSIONS
  );
  assert.ok(alert);
  assert.equal(alert?.type, 'EMOTIONAL_COMMUNICATION_RISK');
  assert.match(alert?.suggestedAction || '', /RESET mode/);
});

test('detectPatterns catches Unsupported Certainty when claims lack evidence', () => {
  const alert = detectPatterns(
    'It is 100% certain that they sabotaged our deployment because they clearly hate us',
    DEMO_ACTIONS,
    DEMO_SESSIONS
  );
  assert.ok(alert);
  assert.equal(alert?.type, 'UNSUPPORTED_CERTAINTY');
  assert.match(alert?.suggestedAction || '', /interpretation rather than a verified fact/);
});

test('detectPatterns catches Complexity Overload when topic switching occurs', () => {
  const alert = detectPatterns(
    'We need to finalize the contract and also we need to rearchitect the entire database and on top of all that review payroll',
    DEMO_ACTIONS,
    DEMO_SESSIONS
  );
  assert.ok(alert);
  assert.equal(alert?.type, 'COMPLEXITY_OVERLOAD');
  assert.match(alert?.suggestedAction || '', /too many competing active objectives/);
});

test('generateWeeklyMirrorReview synthesizes structured review from current state', () => {
  const review = generateWeeklyMirrorReview(DEMO_ACTIONS, DEMO_EVIDENCE, DEMO_SESSIONS, DEMO_TRACKS);
  assert.ok(review.id.startsWith('review-'));
  assert.ok(review.whatJosephSaidMattered.length > 0);
  assert.ok(review.whatJosephActuallyActedOn.length > 0);
  assert.ok(review.oneBehaviorToStop.length > 0);
  assert.ok(review.oneBehaviorToContinue.length > 0);
});

test('demo dataset is fully isolated and flagged with isDemo: true', () => {
  for (const track of DEMO_TRACKS) {
    assert.equal(track.isDemo, true, `Track ${track.id} must be flagged as demo`);
  }
  for (const action of DEMO_ACTIONS) {
    assert.equal(action.isDemo, true, `Action ${action.id} must be flagged as demo`);
  }
  for (const item of DEMO_EVIDENCE) {
    assert.equal(item.isDemo, true, `Evidence ${item.id} must be flagged as demo`);
  }
  assert.ok(DEMO_WEEKLY_REVIEW.highestLeverageNextMove.length > 0);
});
