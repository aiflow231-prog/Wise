/**
 * ACTIONS SCREEN
 * One-action discipline, parked ideas protection, completion evidence verification.
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import {
  CheckSquare,
  Plus,
  Play,
  CheckCircle2,
  Archive,
  UserCheck,
  Shield,
  Clock,
  Filter,
  ArrowRight,
  TrendingUp,
  Zap,
  X,
} from 'lucide-react';
import { ActionItem, StrategicTrack } from '../types/wise';

export const ActionsView: React.FC = () => {
  const {
    state,
    createAction,
    updateAction,
    completeAction,
    parkAction,
    delegateAction,
    startFocusTimer,
  } = useWise();

  const [filterTrack, setFilterTrack] = useState<StrategicTrack | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'actionable' | 'completed' | 'parked'>('actionable');
  const [isCreatingAction, setIsCreatingAction] = useState(false);

  // New action form fields
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState<StrategicTrack>('revenue');
  const [newMinutes, setNewMinutes] = useState(25);
  const [newEvidence, setNewEvidence] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  // Complete action inline evidence input
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionEvidenceText, setCompletionEvidenceText] = useState('');

  const activeAction = state.actions.find((a) => a.id === state.activeActionId) ||
    state.actions.find((a) => a.status === 'active');

  const filteredActions = state.actions.filter((action) => {
    if (filterTrack !== 'all' && action.domain !== filterTrack) return false;
    if (filterStatus === 'actionable') {
      return action.status === 'active' || action.status === 'not_started' || action.status === 'blocked';
    }
    if (filterStatus === 'completed') {
      return action.status === 'completed';
    }
    if (filterStatus === 'parked') {
      return action.status === 'parked' || action.status === 'cancelled';
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createAction({
      title: newTitle.trim(),
      domain: newTrack,
      status: 'active',
      estimatedMinutes: Number(newMinutes) || 25,
      completionEvidence: newEvidence.trim() || 'Observable confirmation',
      followUpTrigger: newTrigger.trim() || 'Next check-in',
    });

    setNewTitle('');
    setNewEvidence('');
    setNewTrigger('');
    setIsCreatingAction(false);
  };

  const submitCompletion = (id: string) => {
    completeAction(id, completionEvidenceText.trim());
    setCompletingId(null);
    setCompletionEvidenceText('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 animate-fadeIn">
      {/* Header & New Action CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Executive Actions</h1>
          <p className="text-xs text-slate-400 font-mono">
            Single active action · Observable evidence required
          </p>
        </div>
        <button
          onClick={() => setIsCreatingAction(!isCreatingAction)}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Action</span>
        </button>
      </div>

      {/* New Action Form Modal / Card */}
      {isCreatingAction && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-slate-900 border border-blue-500/40 space-y-3 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400">
              Define Next Physical Action
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingAction(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Observable Action</label>
            <input
              type="text"
              placeholder="e.g. Counter-sign contract and issue wire instruction"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Strategic Track</label>
              <select
                value={newTrack}
                onChange={(e) => setNewTrack(e.target.value as StrategicTrack)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="revenue">Revenue</option>
                <option value="recovery">Recovery</option>
                <option value="stability">Stability</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Duration (Minutes)</label>
              <input
                type="number"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                min={5}
                max={240}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">
              Completion Evidence (Mandatory Observable Proof)
            </label>
            <input
              type="text"
              placeholder="e.g. Signed PDF in Sent folder, wire confirmation number..."
              value={newEvidence}
              onChange={(e) => setNewEvidence(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Follow-Up Trigger</label>
            <input
              type="text"
              placeholder="e.g. Review acknowledgement on Oct 28 at 10:00"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingAction(false)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md"
            >
              Commit Action
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5">
          {(['actionable', 'completed', 'parked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                filterStatus === tab
                  ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'actionable' ? 'Active' : tab === 'completed' ? 'Completed' : 'Parked Ideas'}
            </button>
          ))}
        </div>

        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value as any)}
          className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-mono focus:outline-none"
        >
          <option value="all">All Tracks</option>
          <option value="revenue">Revenue</option>
          <option value="recovery">Recovery</option>
          <option value="stability">Stability</option>
          <option value="operations">Operations</option>
        </select>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No actions found in this view.
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCurrentActive = action.id === activeAction?.id;
            return (
              <div
                key={action.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrentActive
                    ? 'bg-slate-900/90 border-blue-500/50 shadow-lg'
                    : action.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-800/30 text-slate-400'
                    : action.status === 'parked'
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {action.domain}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-semibold">
                          ACTIVE FOCUS
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        {action.estimatedMinutes}m
                      </span>
                    </div>
                    <h3
                      className={`text-sm sm:text-base font-semibold ${
                        action.status === 'completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {action.title}
                    </h3>
                  </div>

                  {/* Top Right Action button */}
                  {action.status !== 'completed' && (
                    <button
                      onClick={() => startFocusTimer(action.estimatedMinutes, action.id)}
                      className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0"
                      title="Start Focus Timer for this action"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Evidence Requirement / Proof */}
                {action.completionEvidence && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Verification Evidence:
                      </span>
                      <p className="text-slate-200">{action.completionEvidence}</p>
                    </div>
                  </div>
                )}

                {/* Parked Reason */}
                {action.status === 'parked' && action.parkedReason && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 mb-3">
                    <span className="font-mono text-[10px] uppercase text-amber-400 font-bold mr-1">
                      Reason Parked:
                    </span>
                    {action.parkedReason}
                  </div>
                )}

                {/* Inline Complete input form */}
                {completingId === action.id && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 mb-3 animate-fadeIn">
                    <p className="text-xs font-semibold text-emerald-200">
                      Record completion proof (observable document or receipt):
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. Sent email at 14:22, received wire approval..."
                      value={completionEvidenceText}
                      onChange={(e) => setCompletionEvidenceText(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-emerald-600/50 rounded-lg p-2 text-slate-100 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setCompletingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitCompletion(action.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                      >
                        Confirm Done
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Action Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                  <span className="text-[10px] font-mono text-slate-400">
                    Trigger: {action.followUpTrigger || 'None set'}
                  </span>

                  <div className="flex items-center gap-2">
                    {action.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => setCompletingId(action.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>

                        <button
                          onClick={() => parkAction(action.id, 'Parked by Joseph to streamline focus')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Park</span>
                        </button>
                      </>
                    )}

                    {action.status === 'parked' && (
                      <button
                        onClick={() => updateAction(action.id, { status: 'active', parkedReason: undefined })}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-medium"
                      >
                        Unpark
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
