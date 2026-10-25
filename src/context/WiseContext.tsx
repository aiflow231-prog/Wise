/**
 * WISE OS Global Context & State Store
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  ActionItem,
  AdaptivePatternAlert,
  AppState,
  DraftMessage,
  EveningCheckinData,
  EvidenceItem,
  MorningCheckinData,
  OperatingMode,
  SessionEvaluation,
  StrategicTrackItem,
  WeeklyMirrorReview
} from '../types/wise';
import {
  DEMO_ACTIONS,
  DEMO_DRAFTS,
  DEMO_EVIDENCE,
  DEMO_SESSIONS,
  DEMO_TRACKS,
  DEMO_WEEKLY_REVIEW,
} from '../data/demoData';
import {
  calculateProgress,
  clearStoredState,
  detectPatterns,
  generateWeeklyMirrorReview,
  loadStoredState,
  ProgressMetrics,
  saveStoredState,
} from '../utils/engine';

export type ActiveTab = 'today' | 'talk' | 'actions' | 'evidence' | 'review';

interface WiseContextType {
  state: AppState;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeModeModal: OperatingMode | null;
  setActiveModeModal: (mode: OperatingMode | null) => void;
  isMorningCheckinOpen: boolean;
  setIsMorningCheckinOpen: (open: boolean) => void;
  isEveningCheckinOpen: boolean;
  setIsEveningCheckinOpen: (open: boolean) => void;
  isDataModalOpen: boolean;
  setIsDataModalOpen: (open: boolean) => void;
  isRelationshipModalOpen: boolean;
  setIsRelationshipModalOpen: (open: boolean) => void;
  patternAlert: AdaptivePatternAlert | null;
  dismissPatternAlert: () => void;
  metrics: ProgressMetrics;
  
  // High-level Actions
  setActiveObjective: (obj: string) => void;
  createAction: (action: Omit<ActionItem, 'id' | 'createdAt'>) => string;
  updateAction: (id: string, updates: Partial<ActionItem>) => void;
  completeAction: (id: string, completionEvidence: string) => void;
  parkAction: (id: string, reason: string) => void;
  delegateAction: (id: string, delegatedTo: string) => void;
  createEvidence: (item: Omit<EvidenceItem, 'id'>) => string;
  updateEvidence: (id: string, updates: Partial<EvidenceItem>) => void;
  deleteEvidence: (id: string) => void;
  saveSession: (session: SessionEvaluation) => void;
  saveDraftMessage: (draft: Omit<DraftMessage, 'id' | 'createdAt' | 'readyAfter' | 'status'>) => string;
  updateDraftMessage: (id: string, updates: Partial<DraftMessage>) => void;
  
  // Timer
  startFocusTimer: (minutes?: number, actionId?: string) => void;
  stopFocusTimer: () => void;
  toggleFocusTimer: () => void;
  
  // Check-ins
  saveMorningCheckin: (checkin: Omit<MorningCheckinData, 'id' | 'createdAt'>) => void;
  saveEveningCheckin: (checkin: Omit<EveningCheckinData, 'id' | 'createdAt'>) => void;
  
  // Demo & Data management
  toggleDemoData: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  
  // Audio Playback
  speakText: (text: string) => Promise<void>;
  stopAudio: () => void;
  isSpeaking: boolean;
}

const DEFAULT_STATE: AppState = {
  isDemo: true,
  activeObjective: 'Finalize Meridian Logistics Retainer Agreement & Recover Disputed Commercial Deposit',
  activeActionId: 'act-demo-1',
  actions: DEMO_ACTIONS,
  evidence: DEMO_EVIDENCE,
  tracks: DEMO_TRACKS,
  sessions: DEMO_SESSIONS,
  draftMessages: DEMO_DRAFTS,
  morningCheckins: [],
  eveningCheckins: [],
  weeklyReviews: [DEMO_WEEKLY_REVIEW],
  focusTimer: {
    isRunning: false,
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    actionId: 'act-demo-1',
  },
};

const WiseContext = createContext<WiseContextType | null>(null);

export const WiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadStoredState(DEFAULT_STATE));
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [activeModeModal, setActiveModeModal] = useState<OperatingMode | null>(null);
  const [isMorningCheckinOpen, setIsMorningCheckinOpen] = useState(false);
  const [isEveningCheckinOpen, setIsEveningCheckinOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [patternAlert, setPatternAlert] = useState<AdaptivePatternAlert | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Focus Timer interval ticker
  useEffect(() => {
    let interval: any = null;
    if (state.focusTimer.isRunning) {
      interval = setInterval(() => {
        setState((prev) => {
          if (prev.focusTimer.remainingSeconds <= 1) {
            // Timer completed!
            return {
              ...prev,
              focusTimer: {
                ...prev.focusTimer,
                isRunning: false,
                remainingSeconds: 0,
              },
            };
          }
          return {
            ...prev,
            focusTimer: {
              ...prev.focusTimer,
              remainingSeconds: prev.focusTimer.remainingSeconds - 1,
            },
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.focusTimer.isRunning]);

  // Derived metrics
  const metrics = useMemo(() => {
    return calculateProgress(state.actions, state.evidence, state.sessions);
  }, [state.actions, state.evidence, state.sessions]);

  // Check for patterns on active actions
  useEffect(() => {
    const alert = detectPatterns('', state.actions, state.sessions);
    if (alert && alert.type === 'COMPLEXITY_OVERLOAD') {
      setPatternAlert(alert);
    }
  }, [state.actions.length]);

  const dismissPatternAlert = () => setPatternAlert(null);

  const setActiveObjective = (obj: string) => {
    setState((prev) => ({ ...prev, activeObjective: obj }));
  };

  const createAction = (actionData: Omit<ActionItem, 'id' | 'createdAt'>): string => {
    const newId = `act-${Date.now()}`;
    const newAction: ActionItem = {
      ...actionData,
      id: newId,
      createdAt: new Date().toISOString(),
      isDemo: state.isDemo,
    };
    setState((prev) => ({
      ...prev,
      actions: [newAction, ...prev.actions],
      activeActionId: prev.activeActionId || newId,
    }));
    return newId;
  };

  const updateAction = (id: string, updates: Partial<ActionItem>) => {
    setState((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const completeAction = (id: string, completionEvidence: string) => {
    setState((prev) => {
      const updatedActions = prev.actions.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            completionEvidence: completionEvidence || a.completionEvidence,
          };
        }
        return a;
      });

      // Find next active action if needed
      let nextActiveId = prev.activeActionId === id ? null : prev.activeActionId;
      if (!nextActiveId) {
        const nextPending = updatedActions.find((a) => a.status === 'not_started' || a.status === 'active');
        nextActiveId = nextPending ? nextPending.id : null;
      }

      return {
        ...prev,
        actions: updatedActions,
        activeActionId: nextActiveId,
        focusTimer: {
          ...prev.focusTimer,
          isRunning: false,
        },
      };
    });
  };

  const parkAction = (id: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'parked' as const,
              parkedReason: reason || 'Parked to reduce complexity',
            }
          : a
      ),
      activeActionId: prev.activeActionId === id ? null : prev.activeActionId,
    }));
  };

  const delegateAction = (id: string, delegatedTo: string) => {
    setState((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'delegated' as const,
              delegatedTo,
            }
          : a
      ),
    }));
  };

  const createEvidence = (itemData: Omit<EvidenceItem, 'id'>): string => {
    const newId = `ev-${Date.now()}`;
    const newItem: EvidenceItem = {
      ...itemData,
      id: newId,
      lastReviewedDate: new Date().toISOString().split('T')[0],
      isDemo: state.isDemo,
    };
    setState((prev) => ({
      ...prev,
      evidence: [newItem, ...prev.evidence],
    }));
    return newId;
  };

  const updateEvidence = (id: string, updates: Partial<EvidenceItem>) => {
    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              lastReviewedDate: new Date().toISOString().split('T')[0],
            }
          : e
      ),
    }));
  };

  const deleteEvidence = (id: string) => {
    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== id),
    }));
  };

  const saveSession = (session: SessionEvaluation) => {
    setState((prev) => {
      // Auto-create next action if session specifies one
      let newActions = [...prev.actions];
      let newActiveActionId = prev.activeActionId;

      if (session.next_physical_action && session.next_physical_action.trim().length > 3) {
        const existing = newActions.find((a) => a.title.toLowerCase() === session.next_physical_action.toLowerCase());
        if (!existing) {
          const actId = `act-${Date.now()}`;
          const newAct: ActionItem = {
            id: actId,
            title: session.next_physical_action,
            domain: (session.domain === 'legal' ? 'recovery' : session.domain === 'business' || session.domain === 'financial' ? 'revenue' : 'stability'),
            status: 'active',
            estimatedMinutes: 25,
            completionEvidence: session.completion_evidence || 'Observable confirmation',
            followUpTrigger: session.follow_up_trigger || 'Review at next check-in',
            createdAt: new Date().toISOString(),
            isDemo: prev.isDemo,
          };
          newActions = [newAct, ...newActions];
          newActiveActionId = actId;
        }
      }

      // Automatically store newly classified facts/evidence from session
      let newEvidence = [...prev.evidence];
      if (session.verified_facts && session.verified_facts.length > 0) {
        session.verified_facts.forEach((fact, idx) => {
          if (!newEvidence.some((e) => e.title.includes(fact.slice(0, 30)))) {
            newEvidence.push({
              id: `ev-fact-${Date.now()}-${idx}`,
              title: fact,
              domain: session.domain || 'other',
              classification: 'VERIFIED_FACT',
              source: `WISE Session ${session.session_id}`,
              date: new Date().toISOString().split('T')[0],
              directSupport: 'Identified during executive evaluation',
              contradiction: '',
              alternativeExplanation: '',
              confidence: 95,
              relatedObjective: session.true_objective || session.raw_objective,
              relatedDecision: session.decision || '',
              verificationStatus: 'verified',
              lastReviewedDate: new Date().toISOString().split('T')[0],
              isDemo: prev.isDemo,
            });
          }
        });
      }

      return {
        ...prev,
        sessions: [session, ...prev.sessions],
        actions: newActions,
        activeActionId: newActiveActionId,
        evidence: newEvidence,
      };
    });
  };

  const saveDraftMessage = (draftData: Omit<DraftMessage, 'id' | 'createdAt' | 'readyAfter' | 'status'>): string => {
    const newId = `draft-${Date.now()}`;
    const now = new Date();
    const readyAfter = new Date(now.getTime() + draftData.coolingPeriodHours * 3600 * 1000).toISOString();
    const newDraft: DraftMessage = {
      ...draftData,
      id: newId,
      createdAt: now.toISOString(),
      readyAfter,
      status: 'draft',
      isDemo: state.isDemo,
    };
    setState((prev) => ({
      ...prev,
      draftMessages: [newDraft, ...prev.draftMessages],
    }));
    return newId;
  };

  const updateDraftMessage = (id: string, updates: Partial<DraftMessage>) => {
    setState((prev) => ({
      ...prev,
      draftMessages: prev.draftMessages.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  const startFocusTimer = (minutes: number = 25, actionId?: string) => {
    const totalSecs = minutes * 60;
    setState((prev) => ({
      ...prev,
      focusTimer: {
        isRunning: true,
        remainingSeconds: totalSecs,
        totalSeconds: totalSecs,
        actionId: actionId || prev.activeActionId,
      },
    }));
  };

  const stopFocusTimer = () => {
    setState((prev) => ({
      ...prev,
      focusTimer: {
        ...prev.focusTimer,
        isRunning: false,
      },
    }));
  };

  const toggleFocusTimer = () => {
    setState((prev) => ({
      ...prev,
      focusTimer: {
        ...prev.focusTimer,
        isRunning: !prev.focusTimer.isRunning,
      },
    }));
  };

  const saveMorningCheckin = (data: Omit<MorningCheckinData, 'id' | 'createdAt'>) => {
    const checkin: MorningCheckinData = {
      ...data,
      id: `morning-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // Also auto-update highest-value objective & create recommended action
    setState((prev) => {
      const actId = `act-${Date.now()}`;
      const newAction: ActionItem = {
        id: actId,
        title: data.firstAction,
        domain: 'revenue',
        status: 'active',
        estimatedMinutes: 25,
        completionEvidence: data.completionEvidence,
        followUpTrigger: data.plannedReviewTime || 'Evening review',
        createdAt: new Date().toISOString(),
        isDemo: prev.isDemo,
      };

      return {
        ...prev,
        morningCheckins: [checkin, ...prev.morningCheckins],
        activeObjective: data.dailyObjective || prev.activeObjective,
        activeActionId: actId,
        actions: [newAction, ...prev.actions],
      };
    });
  };

  const saveEveningCheckin = (data: Omit<EveningCheckinData, 'id' | 'createdAt'>) => {
    const checkin: EveningCheckinData = {
      ...data,
      id: `evening-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      eveningCheckins: [checkin, ...prev.eveningCheckins],
    }));
  };

  const toggleDemoData = () => {
    setState((prev) => {
      const nextIsDemo = !prev.isDemo;
      if (nextIsDemo) {
        return DEFAULT_STATE;
      } else {
        // Switch to clean user slate
        return {
          isDemo: false,
          activeObjective: 'Define primary strategic outcome',
          activeActionId: null,
          actions: [],
          evidence: [],
          tracks: [
            {
              id: 'track-recovery-real',
              name: 'Recovery & Compliance',
              track: 'recovery',
              description: 'Statutory claims, dispute settlement, and asset recovery.',
              status: 'active',
              nextMilestone: 'Define recovery goal',
              targetDate: new Date().toISOString().split('T')[0],
            },
            {
              id: 'track-revenue-real',
              name: 'Revenue & Commercial Execution',
              track: 'revenue',
              description: 'Commercial agreements, billables, client retainers.',
              status: 'active',
              nextMilestone: 'Define revenue goal',
              targetDate: new Date().toISOString().split('T')[0],
            },
            {
              id: 'track-stability-real',
              name: 'Executive Stability & Physical Baseline',
              track: 'stability',
              description: 'Sleep hygiene, cognitive reserve, schedule boundaries.',
              status: 'active',
              nextMilestone: 'Establish baseline cut-off',
              targetDate: new Date().toISOString().split('T')[0],
            },
          ],
          sessions: [],
          draftMessages: [],
          morningCheckins: [],
          eveningCheckins: [],
          weeklyReviews: [],
          focusTimer: {
            isRunning: false,
            remainingSeconds: 25 * 60,
            totalSeconds: 25 * 60,
            actionId: null,
          },
        };
      }
    });
  };

  const resetAllData = () => {
    clearStoredState();
    setState(DEFAULT_STATE);
  };

  const exportDataJSON = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        setState({ ...DEFAULT_STATE, ...parsed });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Text-To-Speech with server Gemini TTS fallback to Web Speech API
  const speakText = async (text: string) => {
    if (!text || typeof window === 'undefined') return;
    stopAudio();

    setIsSpeaking(true);
    try {
      // First try Gemini Flash-Lite TTS endpoint
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            fallbackSpeechSynthesis(text);
          };
          await audio.play();
          return;
        }
      }
      // If server TTS not available or fails, use browser SpeechSynthesis
      fallbackSpeechSynthesis(text);
    } catch (e) {
      console.warn('TTS request error, using browser speech fallback:', e);
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <WiseContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        activeModeModal,
        setActiveModeModal,
        isMorningCheckinOpen,
        setIsMorningCheckinOpen,
        isEveningCheckinOpen,
        setIsEveningCheckinOpen,
        isDataModalOpen,
        setIsDataModalOpen,
        isRelationshipModalOpen,
        setIsRelationshipModalOpen,
        patternAlert,
        dismissPatternAlert,
        metrics,
        setActiveObjective,
        createAction,
        updateAction,
        completeAction,
        parkAction,
        delegateAction,
        createEvidence,
        updateEvidence,
        deleteEvidence,
        saveSession,
        saveDraftMessage,
        updateDraftMessage,
        startFocusTimer,
        stopFocusTimer,
        toggleFocusTimer,
        saveMorningCheckin,
        saveEveningCheckin,
        toggleDemoData,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        speakText,
        stopAudio,
        isSpeaking,
      }}
    >
      {children}
    </WiseContext.Provider>
  );
};

export const useWise = (): WiseContextType => {
  const context = useContext(WiseContext);
  if (!context) {
    throw new Error('useWise must be used within a WiseProvider');
  }
  return context;
};
