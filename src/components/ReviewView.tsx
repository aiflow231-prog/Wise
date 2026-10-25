/**
 * REVIEW SCREEN
 * Weekly Mirror Review (neutral, empirical, non-judgmental)
 * Observable Progress Analytics & Interactive Visual Systems
 * (Evidence Maps, Decision Trees, Timelines, Pipelines, Relationship Event Maps).
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight,
  GitBranch,
  Map,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Scale
} from 'lucide-react';
import { generateWeeklyMirrorReview } from '../utils/engine';

type VisualFormat = 'mirror' | 'evidence_map' | 'decision_tree' | 'timeline' | 'revenue_pipeline';

export const ReviewView: React.FC = () => {
  const { state, metrics } = useWise();

  const [activeFormat, setActiveFormat] = useState<VisualFormat>('mirror');
  const [currentReview, setCurrentReview] = useState(() => {
    return state.weeklyReviews[0] || generateWeeklyMirrorReview(state.actions, state.evidence, state.sessions, state.tracks);
  });

  const handleRegenerate = () => {
    const updated = generateWeeklyMirrorReview(state.actions, state.evidence, state.sessions, state.tracks);
    setCurrentReview(updated);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Executive Review & Learning</h1>
          <p className="text-xs text-slate-400 font-mono">
            Weekly Mirror · Observable Behavior · Zero Flattery or Shame
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-mono flex items-center gap-1.5"
          title="Synthesize latest state into review"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Visual Format Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => setActiveFormat('mirror')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
            activeFormat === 'mirror'
              ? 'bg-purple-600 text-white border-purple-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Weekly Mirror
        </button>
        <button
          onClick={() => setActiveFormat('evidence_map')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
            activeFormat === 'evidence_map'
              ? 'bg-blue-600 text-white border-blue-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Evidence Map
        </button>
        <button
          onClick={() => setActiveFormat('decision_tree')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
            activeFormat === 'decision_tree'
              ? 'bg-blue-600 text-white border-blue-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Decision Tree
        </button>
        <button
          onClick={() => setActiveFormat('timeline')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
            activeFormat === 'timeline'
              ? 'bg-blue-600 text-white border-blue-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveFormat('revenue_pipeline')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
            activeFormat === 'revenue_pipeline'
              ? 'bg-blue-600 text-white border-blue-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          Pipelines
        </button>
      </div>

      {/* Observable Progress KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Execution Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-400">{metrics.executionRate}%</p>
          <span className="text-[10px] text-slate-500">{metrics.completedActionsCount} completed</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Evidence Rate</span>
          <p className="text-xl font-bold font-mono text-blue-400">{metrics.completionEvidenceRate}%</p>
          <span className="text-[10px] text-slate-500">Documented proof</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Fact / Claim Ratio</span>
          <p className="text-xl font-bold font-mono text-purple-400">{metrics.documentedVsAssumedRatio}x</p>
          <span className="text-[10px] text-slate-500">Facts vs speculatives</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Open Loops</span>
          <p className="text-xl font-bold font-mono text-amber-400">{metrics.openLoopCount}</p>
          <span className="text-[10px] text-slate-500">Active / pending</span>
        </div>
      </div>

      {/* 1. WEEKLY MIRROR REVIEW VIEW */}
      {activeFormat === 'mirror' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Highest Leverage Next Move Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/40 space-y-1.5 shadow-xl">
            <span className="text-[10px] font-mono uppercase font-bold text-blue-400 tracking-wider">
              Highest-Leverage Next Move
            </span>
            <p className="text-base font-bold text-slate-100">
              {currentReview.highestLeverageNextMove}
            </p>
          </div>

          {/* Stated Priorities vs Actual Execution Contrast */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-300">
                Stated Intent vs Actual Physical Action
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  What Joseph Said Mattered
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {currentReview.whatJosephSaidMattered.map((item, i) => (
                    <li key={i} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                  What Joseph Actually Acted On
                </span>
                <ul className="space-y-1 text-emerald-200 list-disc list-inside">
                  {currentReview.whatJosephActuallyActedOn.map((item, i) => (
                    <li key={i} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Movement Across 3 Tracks */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase text-slate-400">
              Strategic Track Movement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Revenue</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">{currentReview.revenueMovement}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Recovery</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">{currentReview.recoveryMovement}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[10px] uppercase font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Stability</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">{currentReview.stabilityMovement}</p>
              </div>
            </div>
          </div>

          {/* Repeated Loops & Contradictions Discovered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                Repeated Unresolved Topics
              </span>
              <ul className="space-y-1 text-amber-200 list-disc list-inside">
                {currentReview.repeatedUnresolvedTopics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-600/30 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400 block">
                Contradictions Discovered
              </span>
              <ul className="space-y-1 text-rose-200 list-disc list-inside">
                {currentReview.contradictionsDiscovered.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Behavioral Course Corrections (Neutral, direct) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400">
                One System or Behavior to Stop:
              </span>
              <p className="text-slate-200 leading-snug">{currentReview.oneBehaviorToStop}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                One System or Behavior to Continue:
              </span>
              <p className="text-slate-200 leading-snug">{currentReview.oneBehaviorToContinue}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE EVIDENCE MAP */}
      {activeFormat === 'evidence_map' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" />
              Evidence Map & Causality Graph
            </span>
            <span className="text-[10px] font-mono text-slate-400">Verified Facts vs Hypotheses</span>
          </div>

          <div className="space-y-3">
            {state.evidence.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {ev.classification}
                    </span>
                    <span className="text-slate-200 font-semibold">{ev.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ev.source}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 font-bold">{ev.confidence}%</span>
                  <p className="text-[10px] text-slate-500 font-mono">confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DECISION TREE VISUALIZER */}
      {activeFormat === 'decision_tree' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-purple-400 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              Decision Tree & Exit Routes
            </span>
            <span className="text-[10px] font-mono text-slate-400">Evaluated Options</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Decision Node */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40">
              <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">
                Decision Required
              </span>
              <p className="text-sm font-semibold text-slate-100">
                Deposit Recovery: Small Claims Lawsuit vs 10-Day Statutory Demand
              </p>
            </div>

            {/* Branch 1 */}
            <div className="pl-4 border-l-2 border-emerald-500 space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-400 font-mono">Option A (Selected): 10-Day Statutory Demand</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    High Reversibility
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Preserves right to statutory bad-faith penalties without triggering immediate legal court costs.
                </p>
              </div>
            </div>

            {/* Branch 2 */}
            <div className="pl-4 border-l-2 border-slate-700 space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-400 font-mono">Option B: Immediate Court Filing</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300">
                    Low Reversibility
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Higher friction, court calendar backlog, prevents quick amicable escrow return.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STRATEGIC TIMELINE */}
      {activeFormat === 'timeline' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Chronological Evidence & Action Milestones
            </span>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-slate-800 text-xs">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[21px] top-1"></div>
              <span className="text-[10px] font-mono text-slate-400">Oct 24, 2026</span>
              <p className="font-semibold text-slate-100">Meridian SOW v2.4 Finalized by Executive Committee</p>
            </div>

            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1"></div>
              <span className="text-[10px] font-mono text-slate-400">Oct 23, 2026</span>
              <p className="font-semibold text-slate-100">RESET Mode used on Co-founder Scope conflict (Draft saved)</p>
            </div>

            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -left-[21px] top-1"></div>
              <span className="text-[10px] font-mono text-slate-400">Sept 22, 2026</span>
              <p className="font-semibold text-slate-100">Statutory 21-Day Deposit Deduction Period Lapsed</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. REVENUE PIPELINE */}
      {activeFormat === 'revenue_pipeline' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Revenue Pipeline & Contract Stages
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-100">Meridian Logistics Architecture Retainer</span>
                <p className="text-[11px] text-blue-300 font-mono">Stage: Counter-signature & Wire ($24,000 / qtr)</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Ready</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between opacity-80">
              <div>
                <span className="font-semibold text-slate-300">Apex Health Phase 2 Data Contract</span>
                <p className="text-[11px] text-slate-400 font-mono">Stage: Proposal Drafting ($15,000)</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Nov 15</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
