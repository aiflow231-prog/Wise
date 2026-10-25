/**
 * CHECK-IN PROTOCOL MODALS
 * Morning Check-In (< 1 min, 3 questions) & Evening Debrief (4 questions)
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import { Sun, Moon, ArrowRight, CheckCircle2, Shield, Clock, X } from 'lucide-react';

export const CheckinModals: React.FC = () => {
  const {
    isMorningCheckinOpen,
    setIsMorningCheckinOpen,
    isEveningCheckinOpen,
    setIsEveningCheckinOpen,
    saveMorningCheckin,
    saveEveningCheckin,
    startFocusTimer,
  } = useWise();

  // Morning Form
  const [outcome, setOutcome] = useState('');
  const [risk, setRisk] = useState('');
  const [firstAction, setFirstAction] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reviewTime, setReviewTime] = useState('18:00');

  // Evening Form
  const [happened, setHappened] = useState('');
  const [completed, setCompleted] = useState('');
  const [changed, setChanged] = useState('');
  const [dropOrContinue, setDropOrContinue] = useState('');

  const submitMorning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim() || !firstAction.trim()) return;

    saveMorningCheckin({
      date: new Date().toISOString().split('T')[0],
      dailyObjective: outcome.trim(),
      mainRisk: risk.trim() || 'Distraction by administrative busywork',
      firstAction: firstAction.trim(),
      completionEvidence: evidence.trim() || 'Observable confirmation',
      plannedReviewTime: reviewTime,
    });

    startFocusTimer(25);
    setIsMorningCheckinOpen(false);
  };

  const submitEvening = (e: React.FormEvent) => {
    e.preventDefault();
    saveEveningCheckin({
      date: new Date().toISOString().split('T')[0],
      whatActuallyHappened: happened.trim() || 'Core execution block completed',
      whatWasCompleted: completed.trim() || 'Primary action verified',
      whatChanged: changed.trim() || 'None',
      continueCorrectDelegateDrop: dropOrContinue.trim() || 'Maintain focus protocol',
    });

    setIsEveningCheckinOpen(false);
  };

  return (
    <>
      {/* Morning Check-In Modal */}
      {isMorningCheckinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Morning Check-In</h2>
                  <p className="text-[10px] text-slate-400 font-mono">&lt; 1 minute executive alignment</p>
                </div>
              </div>
              <button
                onClick={() => setIsMorningCheckinOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitMorning} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  1. What outcome matters most today?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Countersign Meridian agreement and send certified deposit letter"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  2. What could prevent it?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Analysis rabbit-hole, unscheduled reactive calls"
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  3. What is the first physical action?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open contract PDF and apply digital signature"
                  value={firstAction}
                  onChange={(e) => setFirstAction(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Completion Evidence
                  </label>
                  <input
                    type="text"
                    placeholder="Sent email confirmation"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Review Time
                  </label>
                  <input
                    type="time"
                    value={reviewTime}
                    onChange={(e) => setReviewTime(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
                >
                  <span>Lock Objective & Start 25m Timer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evening Debrief Modal */}
      {isEveningCheckinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Evening Debrief</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Verify facts & extract empirical learning</p>
                </div>
              </div>
              <button
                onClick={() => setIsEveningCheckinOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitEvening} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  1. What actually happened?
                </label>
                <textarea
                  placeholder="Observable events only..."
                  value={happened}
                  onChange={(e) => setHappened(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  2. What was completed (with evidence)?
                </label>
                <input
                  type="text"
                  placeholder="e.g. SOW signed and sent, receipt logged"
                  value={completed}
                  onChange={(e) => setCompleted(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  3. What changed?
                </label>
                <input
                  type="text"
                  placeholder="New factual evidence or constraints"
                  value={changed}
                  onChange={(e) => setChanged(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  4. What should be continued, corrected, delegated, or dropped?
                </label>
                <input
                  type="text"
                  placeholder="One concrete system adjustment"
                  value={dropOrContinue}
                  onChange={(e) => setDropOrContinue(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  <span>Complete Debrief & Close Evening</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
