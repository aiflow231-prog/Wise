/**
 * EVIDENCE SCREEN
 * Strict classification vault: Verified Fact, Documented Record, Self-Report,
 * Third-Party Report, Claim, Assumption, Hypothesis, AI Inference, Disputed, Unknown.
 * Enforces intellectual honesty and preserves verification audit trails.
 */

import React, { useState } from 'react';
import { useWise } from '../context/WiseContext';
import {
  Database,
  Plus,
  Shield,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Layers,
  Scale,
  X,
} from 'lucide-react';
import {
  EvidenceClassification,
  EvidenceDomain,
  EvidenceItem,
} from '../types/wise';
import { getClassificationColor } from '../utils/engine';

export const EvidenceView: React.FC = () => {
  const { state, createEvidence, updateEvidence, deleteEvidence } = useWise();

  const [selectedClassification, setSelectedClassification] = useState<EvidenceClassification | 'ALL'>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<EvidenceDomain | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingEvidence, setIsCreatingEvidence] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New evidence form state
  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState<EvidenceClassification>('CLAIM');
  const [newDomain, setNewDomain] = useState<EvidenceDomain>('business');
  const [newSource, setNewSource] = useState('');
  const [newSupport, setNewSupport] = useState('');
  const [newContradiction, setNewContradiction] = useState('');
  const [newAltExplanation, setNewAltExplanation] = useState('');
  const [newConfidence, setNewConfidence] = useState(70);
  const [newRelatedObjective, setNewRelatedObjective] = useState('');
  const [newRelatedDecision, setNewRelatedDecision] = useState('');

  const classifications: EvidenceClassification[] = [
    'VERIFIED_FACT',
    'DOCUMENTED_RECORD',
    'SELF_REPORT',
    'THIRD_PARTY_REPORT',
    'CLAIM',
    'ASSUMPTION',
    'HYPOTHESIS',
    'AI_INFERENCE',
    'DISPUTED',
    'UNKNOWN',
  ];

  const domains: EvidenceDomain[] = [
    'legal',
    'financial',
    'business',
    'technical',
    'personal',
    'relationship',
    'stability',
    'other',
  ];

  const filteredEvidence = state.evidence.filter((item) => {
    if (selectedClassification !== 'ALL' && item.classification !== selectedClassification) return false;
    if (selectedDomain !== 'ALL' && item.domain !== selectedDomain) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.directSupport.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSource.trim()) return;

    createEvidence({
      title: newTitle.trim(),
      domain: newDomain,
      classification: newClassification,
      source: newSource.trim(),
      date: new Date().toISOString().split('T')[0],
      directSupport: newSupport.trim(),
      contradiction: newContradiction.trim(),
      alternativeExplanation: newAltExplanation.trim(),
      confidence: Number(newConfidence),
      relatedObjective: newRelatedObjective.trim() || state.activeObjective,
      relatedDecision: newRelatedDecision.trim(),
      verificationStatus: newClassification === 'VERIFIED_FACT' ? 'verified' : 'unverified',
      lastReviewedDate: new Date().toISOString().split('T')[0],
    });

    setNewTitle('');
    setNewSource('');
    setNewSupport('');
    setNewContradiction('');
    setNewAltExplanation('');
    setIsCreatingEvidence(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Evidence Vault</h1>
          <p className="text-xs text-slate-400 font-mono">
            Empirical ground truth · Never promote inference to fact by repetition
          </p>
        </div>
        <button
          onClick={() => setIsCreatingEvidence(!isCreatingEvidence)}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Evidence</span>
        </button>
      </div>

      {/* Constitutional Warning Banner */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 font-mono">
        <Scale className="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          Classification Discipline: Evidence over narratives. Do not confuse self-report or claim with verified fact.
        </span>
      </div>

      {/* New Evidence Form */}
      {isCreatingEvidence && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-slate-900 border border-blue-500/40 space-y-3 shadow-2xl animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400">
              Classify & Record Evidence
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingEvidence(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Title / Statement</label>
            <input
              type="text"
              placeholder="e.g. Commercial Lease §14.2 21-Day Deposit Window"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-sm bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Classification</label>
              <select
                value={newClassification}
                onChange={(e) => setNewClassification(e.target.value as EvidenceClassification)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {classifications.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Domain</label>
              <select
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value as EvidenceDomain)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Source / Document Reference</label>
            <input
              type="text"
              placeholder="e.g. Certified USPS tracking #9400..., signed lease agreement page 14"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase">Direct Factual Support</label>
            <textarea
              placeholder="What direct observations or documentation prove this?"
              value={newSupport}
              onChange={(e) => setNewSupport(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Contradiction (If any)</label>
              <input
                type="text"
                placeholder="What evidence conflicts with this?"
                value={newContradiction}
                onChange={(e) => setNewContradiction(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Alternative Explanation</label>
              <input
                type="text"
                placeholder="Strongest counter-interpretation"
                value={newAltExplanation}
                onChange={(e) => setNewAltExplanation(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Confidence Rating</span>
              <span className="text-blue-400 font-bold">{newConfidence}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={newConfidence}
              onChange={(e) => setNewConfidence(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingEvidence(false)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs bg-blue-600 text-white font-semibold hover:bg-blue-500 shadow-md"
            >
              Save Evidence
            </button>
          </div>
        </form>
      )}

      {/* Search & Domain Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search verified facts, documents, claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value as any)}
          className="text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono focus:outline-none"
        >
          <option value="ALL">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Classification Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => setSelectedClassification('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border whitespace-nowrap transition-colors ${
            selectedClassification === 'ALL'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          ALL ({state.evidence.length})
        </button>
        {classifications.map((c) => {
          const count = state.evidence.filter((e) => e.classification === c).length;
          const styles = getClassificationColor(c);
          const isSelected = selectedClassification === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedClassification(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border whitespace-nowrap transition-colors ${
                isSelected
                  ? `${styles.bg} ${styles.text} ${styles.border} font-bold ring-1 ring-blue-500/50`
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {styles.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No evidence matches the active filters.
          </div>
        ) : (
          filteredEvidence.map((item) => {
            const styles = getClassificationColor(item.classification);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border}`}
                      >
                        {styles.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.domain.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Confidence: {item.confidence}%
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Source line */}
                <p className="text-xs text-slate-400 font-mono">
                  Source: <span className="text-slate-300">{item.source}</span>
                </p>

                {/* Direct support */}
                {item.directSupport && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Direct Support:
                    </span>
                    <p className="leading-relaxed">{item.directSupport}</p>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs animate-fadeIn">
                    {item.contradiction && (
                      <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-600/30 text-rose-300">
                        <span className="text-[10px] font-mono uppercase font-bold text-rose-400 block mb-0.5">
                          Contradiction:
                        </span>
                        <p>{item.contradiction}</p>
                      </div>
                    )}

                    {item.alternativeExplanation && (
                      <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-600/30 text-purple-300">
                        <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block mb-0.5">
                          Alternative Explanation:
                        </span>
                        <p>{item.alternativeExplanation}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                      <div>Related Objective: {item.relatedObjective || 'None'}</div>
                      <div>Last Reviewed: {item.lastReviewedDate}</div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => deleteEvidence(item.id)}
                        className="px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded text-xs font-mono"
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
