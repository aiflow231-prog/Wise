/**
 * Navigation header and mobile bottom bar for WISE OS
 */

import React from 'react';
import { useWise, ActiveTab } from '../context/WiseContext';
import {
  Sun,
  Mic,
  CheckSquare,
  Database,
  BarChart3,
  Sliders,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  X,
} from 'lucide-react';
import { formatTimer } from '../utils/engine';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    state,
    toggleFocusTimer,
    setIsDataModalOpen,
    setActiveModeModal,
    patternAlert,
    dismissPatternAlert,
  } = useWise();

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'TODAY', icon: Sun },
    { id: 'talk', label: 'TALK', icon: Mic },
    { id: 'actions', label: 'ACTIONS', icon: CheckSquare },
    { id: 'evidence', label: 'EVIDENCE', icon: Database },
    { id: 'review', label: 'REVIEW', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('today')}
              className="flex items-center gap-2 group text-left focus:outline-none"
              aria-label="Go to Today"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm tracking-wider group-hover:border-blue-400 transition-colors">
                W
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 tracking-tight text-base font-sans">WISE OS</span>
                  {state.isDemo && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      Demo Data
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide font-mono">
                  WITNESS · INTEGRATE · SELECT · EXECUTE
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Timer Pill */}
            <button
              onClick={toggleFocusTimer}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
                state.focusTimer.isRunning
                  ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={state.focusTimer.isRunning ? 'Pause timer' : 'Start focus timer'}
            >
              {state.focusTimer.isRunning ? <Pause className="w-3 h-3 text-blue-400" /> : <Play className="w-3 h-3 text-slate-400" />}
              <span>{formatTimer(state.focusTimer.remainingSeconds)}</span>
            </button>

            {/* Quick Mode Dropdown / Button */}
            <button
              onClick={() => setActiveModeModal('clear')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Modes</span>
            </button>

            {/* Settings & Data Management */}
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
              aria-label="Settings and Data Controls"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Adaptive Pattern Alert Banner */}
      {patternAlert && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2.5 text-xs text-amber-200 animate-fadeIn">
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300 uppercase tracking-wide mr-2">
                  {patternAlert.title}:
                </span>
                <span className="text-amber-100">{patternAlert.suggestedAction}</span>
              </div>
            </div>
            <button
              onClick={dismissPatternAlert}
              className="text-amber-400 hover:text-amber-200 shrink-0 p-1"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile-First Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 sm:py-2 transition-colors pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all focus:outline-none ${
                  isActive
                    ? 'text-blue-400 bg-blue-950/40 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 text-blue-400' : ''}`} />
                <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'font-semibold text-blue-300' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
