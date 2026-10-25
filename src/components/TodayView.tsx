/**
 * TODAY SCREEN
 * Display only the information needed now.
 * Executive clarity, single-action discipline, three strategic tracks, timer, modes, check-ins.
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import {
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Archive,
  Clock,
  Edit2,
  Check,
  X,
  HeartHandshake
} from 'lucide-react';
import { formatTimer } from '../utils/engine';
import { OperatingMode } from '../types/wise';

export const TodayView: React.FC = () => {
  const {
    state,
    setActiveTab,
    setActiveModeModal,
    setIsMorningCheckinOpen,
    setIsEveningCheckinOpen,
    setIsRelationshipModalOpen,
    startFocusTimer,
    stopFocusTimer,
    toggleFocusTimer,
    completeAction,
    parkAction,
    setActiveObjective,
  } = useWise();

  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [objectiveInput, setObjectiveInput] = useState(state.activeObjective);
  const [completionEvidencePrompt, setCompletionEvidencePrompt] = useState(false);
  const [evidenceInput, setEvidenceInput] = useState('');

  // Identify recommended next physical action
  const activeAction = state.actions.find((a) => a.id === state.activeActionId) || 
    state.actions.find((a) => a.status === 'active') || 
    state.actions.find((a) => a.status === 'not_started');

  const handleSaveObjective = () => {
    if (objectiveInput.trim()) {
      setActiveObjective(objectiveInput.trim());
    }
    setIsEditingObjective(false);
  };

  const handleCompleteActiveAction = () => {
    if (!activeAction) return;
    if (!evidenceInput.trim() && !activeAction.completionEvidence) {
      setCompletionEvidencePrompt(true);
      return;
    }
    completeAction(activeAction.id, evidenceInput.trim() || activeAction.completionEvidence);
    setCompletionEvidencePrompt(false);
    setEvidenceInput('');
  };

  // Urgent risk/deadline extracted from state or demo
  const urgentRisk = {
    title: 'Statutory 10-Day Notice Service Deadline',
    description: 'Commercial deposit demand letter must be dispatched via Certified Mail by Friday to preserve statutory treble-damage claim.',
    deadline: '2026-10-31',
    severity: 'urgent' as const,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 animate-fadeIn">
      {/* Top Check-In Bar */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsMorningCheckinOpen(true)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-600/30 text-left hover:border-blue-500/60 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Morning Check-In</p>
              <p className="text-[10px] text-slate-400 font-mono">&lt; 1 min protocol</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => setIsEveningCheckinOpen(true)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-600/30 text-left hover:border-purple-500/60 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Evening Debrief</p>
              <p className="text-[10px] text-slate-400 font-mono">Verify & learn</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Current Highest-Value Objective */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Highest-Value Objective
            </span>
          </div>
          {!isEditingObjective && (
            <button
              onClick={() => {
                setObjectiveInput(state.activeObjective);
                setIsEditingObjective(true);
              }}
              className="text-slate-400 hover:text-slate-200 p-1 text-xs"
              aria-label="Edit Objective"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isEditingObjective ? (
          <div className="space-y-2">
            <textarea
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              className="w-full text-sm bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingObjective(false)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveObjective}
                className="px-3 py-1 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight leading-snug">
            {state.activeObjective}
          </p>
        )}
      </div>

      {/* One Recommended Next Physical Action & Focus Timer */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-blue-500/40 shadow-2xl relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-400">
              One Next Physical Action
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-300">
            {activeAction?.domain.toUpperCase() || 'CORE'}
          </span>
        </div>

        {activeAction ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">
              {activeAction.title}
            </h3>

            {/* Verifiable evidence required */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completion Evidence:</span>
              </div>
              <p className="text-slate-200 font-medium pl-5">
                {activeAction.completionEvidence || 'Observable document or receipt required.'}
              </p>
            </div>

            {/* Interactive Focus Timer */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-2xl font-mono font-bold text-slate-100 tracking-wider">
                    {formatTimer(state.focusTimer.remainingSeconds)}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {state.focusTimer.isRunning ? 'Active Focus Session' : 'Ready for single action'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFocusTimer}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    state.focusTimer.isRunning
                      ? 'bg-amber-600/30 border border-amber-500/50 text-amber-300 hover:bg-amber-600/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  }`}
                >
                  {state.focusTimer.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Start Focus
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Evidence prompt modal inline */}
            {completionEvidencePrompt && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-2 animate-fadeIn">
                <p className="text-xs font-semibold text-emerald-200">
                  What observable evidence confirms this action was completed?
                </p>
                <input
                  type="text"
                  placeholder="e.g. Sent PDF receipt, signed document, verified bank line..."
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-emerald-600/50 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setCompletionEvidencePrompt(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteActiveAction}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                  >
                    Confirm & Complete
                  </button>
                </div>
              </div>
            )}

            {/* Action Control Buttons */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => setCompletionEvidencePrompt(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verify & Complete</span>
              </button>

              <button
                onClick={() => parkAction(activeAction.id, 'Deliberately parked to prevent complexity overload')}
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Park without deleting"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                <span>Park</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              No active single action selected.
            </p>
            <button
              onClick={() => setActiveTab('actions')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
            >
              Select Next Physical Action
            </button>
          </div>
        )}
      </div>

      {/* Urgent Deadline or Risk (Red only for urgent risks) */}
      <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-600/40 text-rose-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Urgent Risk & Deadline
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-900/50 border border-rose-600/40 text-rose-200">
                Due {urgentRisk.deadline}
              </span>
            </div>
            <p className="text-sm font-semibold text-rose-100">{urgentRisk.title}</p>
            <p className="text-xs text-rose-300/90 leading-relaxed">{urgentRisk.description}</p>
          </div>
        </div>
      </div>

      {/* Three Strategic Tracks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Three Strategic Tracks
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Evidence-tracked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {state.tracks.map((track) => {
            let icon = Shield;
            let accentColor = 'blue';
            if (track.track === 'recovery') {
              icon = Shield;
              accentColor = 'emerald';
            } else if (track.track === 'revenue') {
              icon = TrendingUp;
              accentColor = 'blue';
            } else if (track.track === 'stability') {
              icon = Zap;
              accentColor = 'purple';
            }
            const Icon = icon;

            return (
              <div
                key={track.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      {track.track}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        track.status === 'active' || track.status === 'on_track'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    ></span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100 line-clamp-2 mb-2">
                    {track.name}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] text-slate-400 font-mono line-clamp-2">
                    Next: {track.nextMilestone}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Operating Modes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Primary Operating Modes
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">WISE Protocols</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* CLEAR */}
          <button
            onClick={() => setActiveModeModal('clear')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-blue-500/30 hover:border-blue-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-400 tracking-wide font-mono">MODE 1: CLEAR</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mb-1">
              Overwhelmed, frustrated, or complex
            </p>
            <p className="text-[10px] text-slate-400">
              Extract facts from assumptions & define safe action.
            </p>
          </button>

          {/* DECIDE */}
          <button
            onClick={() => setActiveModeModal('decide')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-400 tracking-wide font-mono">MODE 2: DECIDE</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mb-1">
              Legal, financial, or strategic decisions
            </p>
            <p className="text-[10px] text-slate-400">
              Weigh risk, reversibility, evidence, and exit routes.
            </p>
          </button>

          {/* EXECUTE */}
          <button
            onClick={() => setActiveModeModal('execute')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 tracking-wide font-mono">MODE 3: EXECUTE</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mb-1">
              Decision clear but delayed
            </p>
            <p className="text-[10px] text-slate-400">
              Reduce to 1 observable action & park the rest.
            </p>
          </button>

          {/* RESET */}
          <button
            onClick={() => setActiveModeModal('reset')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400 tracking-wide font-mono">MODE 4: RESET</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mb-1">
              High emotional activation or conflict
            </p>
            <p className="text-[10px] text-slate-400">
              0-10 rating, cooling period & draft messages.
            </p>
          </button>
        </div>

        {/* Optional Relationship Reality Check Banner */}
        <button
          onClick={() => setIsRelationshipModalOpen(true)}
          className="w-full p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Relationship Reality Check</p>
              <p className="text-[10px] text-slate-400 font-mono">
                Separate what was said from inferred intent & establish respectful boundary
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Voice CTA to TALK screen */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/60 border border-blue-500/30 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-bold text-blue-400 uppercase">Hands-Free Executive Voice</p>
          <p className="text-sm font-semibold text-slate-100">Consult with Wise now</p>
        </div>
        <button
          onClick={() => setActiveTab('talk')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
        >
          Open Voice Room
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
