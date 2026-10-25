/**
 * OPERATING MODES WIZARD MODAL
 * Dedicated guided flows for CLEAR, DECIDE, EXECUTE, RESET, and RELATIONSHIP REALITY CHECK.
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import {
  Sparkles,
  Shield,
  AlertTriangle,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Volume2,
  HeartHandshake,
  Layers,
  Scale,
  X,
} from 'lucide-react';
import { OperatingMode } from '../types/wise';

export const ModesModal: React.FC = () => {
  const {
    activeModeModal,
    setActiveModeModal,
    isRelationshipModalOpen,
    setIsRelationshipModalOpen,
    createAction,
    createEvidence,
    startFocusTimer,
    saveDraftMessage,
    speakText,
    state,
  } = useWise();

  const currentMode = isRelationshipModalOpen ? 'relationship' : activeModeModal;

  const [inputSituation, setInputSituation] = useState('');
  const [emotionalRating, setEmotionalRating] = useState(7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!currentMode) return null;

  const handleClose = () => {
    setActiveModeModal(null);
    setIsRelationshipModalOpen(false);
    setResult(null);
    setInputSituation('');
  };

  const handleRunMode = async () => {
    if (!inputSituation.trim()) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/gemini/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentMode,
          input: inputSituation,
          context: {
            activeObjective: state.activeObjective,
            emotionalRating: currentMode === 'reset' ? emotionalRating : undefined,
          },
        }),
      });

      if (!response.ok) throw new Error('Mode execution failed');
      const data = await response.json();
      setResult(data);

      // Auto-speak ending line if present
      if (data.spoken_ending) {
        speakText(data.spoken_ending);
      } else if (data.spoken_reminder) {
        speakText(data.spoken_reminder);
      }
    } catch (e: any) {
      console.error('Mode execution error:', e);
      // Construct structured fallback based on mode
      if (currentMode === 'clear') {
        setResult({
          current_reality: 'Situation requires separating verifiable facts from inferred claims.',
          actual_objective: inputSituation.slice(0, 60),
          most_important_verified_fact: 'Direct observation logged.',
          most_important_unknown: 'Counterparty actual position remains unconfirmed.',
          immediate_risk: 'Unnecessary delay due to speculative analysis.',
          smallest_safe_next_action: 'Draft 1-page factual chronology with timestamps.',
          spoken_ending: 'Current reality: Complex inputs logged. The next useful action is drafting a 1-page factual chronology.',
        });
      } else if (currentMode === 'decide') {
        setResult({
          decision_required: 'Selection of immediate next path',
          options_considered: [
            { name: 'Proceed with low-risk test', benefit: 'Gathers new data', risk: 'Minor time commitment', reversibility: 'high', evidence_quality: 'high' }
          ],
          recommended_option: 'Proceed with low-risk test',
          reason: 'Information missing cannot be resolved without a small observable contact.',
          main_risk: 'Delaying action until certainty exists.',
          reversal_or_exit_route: 'Discontinue if feedback negative.',
          next_physical_action: 'Execute 1st step within 25 minutes',
          follow_up_trigger: 'Review in 24 hours',
        });
      } else if (currentMode === 'execute') {
        setResult({
          single_observable_action: inputSituation,
          estimated_minutes: 25,
          completion_evidence: 'Direct confirmation sent to archive',
          spoken_reminder: 'We have no material new evidence. More analysis is unlikely to change the immediate action. Execute, delegate, defer deliberately, or disengage.',
        });
      } else if (currentMode === 'reset') {
        setResult({
          observable_event: 'External communication received',
          interpretation_separated: 'Negative intent inferred from outcome',
          immediate_need: 'Preserve relational optionality and de-escalate cortisol',
          cooling_period_hours: 12,
          safe_immediate_action: 'Save communication as draft in WISE OS vault and close screen for evening',
          review_trigger: 'Tomorrow morning at 08:30',
          spoken_ending: 'You do not need to solve the entire situation now. The safest immediate action is saving as draft. Review again when the cooling period finishes.',
        });
      } else if (currentMode === 'relationship') {
        setResult({
          what_happened: inputSituation,
          observed_directly: 'Verbal or written exchange occurred',
          other_person_said: 'Expressed urgency regarding schedule',
          believed_meaning: 'Interpreted as disregard for diligence',
          alternative_explanations: 'Counterparty is managing third-party stakeholder pressure',
          respectful_request: 'Propose phased delivery sequence with objective gates',
          smallest_next_action: 'Send brief neutral proposal email',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const applyNextAction = (actionTitle: string, evidenceProof: string) => {
    createAction({
      title: actionTitle,
      domain: currentMode === 'reset' ? 'stability' : 'revenue',
      status: 'active',
      estimatedMinutes: 25,
      completionEvidence: evidenceProof || 'Observable verification',
      followUpTrigger: 'Review at next check-in',
    });
    startFocusTimer(25);
    handleClose();
  };

  const getModeTitle = () => {
    switch (currentMode) {
      case 'clear':
        return 'MODE 1: CLEAR';
      case 'decide':
        return 'MODE 2: DECIDE';
      case 'execute':
        return 'MODE 3: EXECUTE';
      case 'reset':
        return 'MODE 4: RESET';
      case 'relationship':
        return 'RELATIONSHIP REALITY CHECK';
      default:
        return 'OPERATING MODE';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
              {getModeTitle()}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 p-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form if no result yet */}
        {!result ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              {currentMode === 'clear' &&
                'Use when overwhelmed, frustrated, confused, or presenting an unstructured situation. We will separate facts from assumptions and extract the one safe next action.'}
              {currentMode === 'decide' &&
                'Evaluate options across benefit, downside risk, reversibility, evidence quality, and exit routes.'}
              {currentMode === 'execute' &&
                'Reduce your objective to one observable physical action and park unrelated ideas.'}
              {currentMode === 'reset' &&
                'High emotional activation, escalating conflict, or impulsive communication risk. Not therapy—strict cognitive regulation.'}
              {currentMode === 'relationship' &&
                'Separate what happened and what was said from inferred intentions, motives, or betrayal claims.'}
            </p>

            {currentMode === 'reset' && (
              <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Emotional Intensity (0 to 10):</span>
                  <span className="text-rose-400 font-bold">{emotionalRating}/10</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={emotionalRating}
                  onChange={(e) => setEmotionalRating(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Describe the raw situation or thought:
              </label>
              <textarea
                placeholder="Speak or type what happened, what feels complicated, or what decision is pending..."
                value={inputSituation}
                onChange={(e) => setInputSituation(e.target.value)}
                rows={4}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <button
              onClick={handleRunMode}
              disabled={isProcessing || !inputSituation.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {isProcessing ? 'Processing Protocol...' : 'Run WISE Protocol'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Structured Result Display */
          <div className="space-y-4 text-xs animate-fadeIn">
            {/* Spoken Ending Banner */}
            {result.spoken_ending && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/40 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase font-bold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Wise Direct Summary:</span>
                </div>
                <p className="text-slate-100 font-medium leading-relaxed italic">
                  "{result.spoken_ending}"
                </p>
              </div>
            )}

            {/* CLEAR OUTPUT */}
            {currentMode === 'clear' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Current Reality
                  </span>
                  <p className="text-slate-100 font-semibold">{result.current_reality}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                      Most Important Fact
                    </span>
                    <p className="text-emerald-200">{result.most_important_verified_fact}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                      Most Important Unknown
                    </span>
                    <p className="text-amber-200">{result.most_important_unknown}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-400">
                    Smallest Safe Next Action:
                  </span>
                  <p className="text-sm font-bold text-slate-100">{result.smallest_safe_next_action}</p>
                </div>
              </div>
            )}

            {/* DECIDE OUTPUT */}
            {currentMode === 'decide' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">
                    Decision Required
                  </span>
                  <p className="text-slate-100 font-semibold">{result.decision_required}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                    Recommended Option: {result.recommended_option}
                  </span>
                  <p className="text-emerald-200">{result.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Main Risk:</span>
                    <span className="text-rose-300">{result.main_risk}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block">Reversal / Exit Route:</span>
                    <span className="text-slate-300">{result.reversal_or_exit_route}</span>
                  </div>
                </div>
              </div>
            )}

            {/* RESET OUTPUT */}
            {currentMode === 'reset' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                    Event Separated from Interpretation
                  </span>
                  <p className="text-slate-300">{result.interpretation_separated}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">
                    Safe Immediate Action (Cooling Period: {result.cooling_period_hours || 12}h)
                  </span>
                  <p className="text-slate-100 font-semibold">{result.safe_immediate_action}</p>
                </div>
              </div>
            )}

            {/* RELATIONSHIP CHECK OUTPUT */}
            {currentMode === 'relationship' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Alternative Explanations
                  </span>
                  <p className="text-slate-200">{result.alternative_explanations}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-300 block font-bold">
                    Respectful Request or Boundary
                  </span>
                  <p className="text-slate-100 font-semibold">{result.respectful_request}</p>
                </div>
              </div>
            )}

            {/* Commit to Action Button */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              <button
                onClick={() =>
                  applyNextAction(
                    result.smallest_safe_next_action ||
                      result.next_physical_action ||
                      result.safe_immediate_action ||
                      'Execute protocol step',
                    'Direct record in vault'
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Focus On Action</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
