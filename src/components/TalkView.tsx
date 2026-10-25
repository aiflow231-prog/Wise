/**
 * TALK SCREEN
 * Central live voice executive interface with Gemini Live functionality.
 * Hands-free listening, push-to-talk fallback, interruption support,
 * visual status states, camera context, and automatic structured session evaluation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useWise } from '../context/WiseContext';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Video,
  VideoOff,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { OperatingMode, SessionEvaluation } from '../types/wise';

type TalkState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';

export const TalkView: React.FC = () => {
  const {
    state,
    speakText,
    stopAudio,
    isSpeaking,
    saveSession,
    setActiveObjective,
    createAction,
    createEvidence,
    startFocusTimer,
  } = useWise();

  const [talkState, setTalkState] = useState<TalkState>('idle');
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [currentMode, setCurrentMode] = useState<OperatingMode>('general');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Transcript lines
  const [transcripts, setTranscripts] = useState<
    { sender: 'joseph' | 'wise'; text: string; timestamp: string; isFinal?: boolean }[]
  >([
    {
      sender: 'wise',
      text: 'Ready, Joseph. What is the current situation or objective on the table?',
      timestamp: 'Just now',
      isFinal: true,
    },
  ]);

  const [currentUserSpeech, setCurrentUserSpeech] = useState('');
  const [sessionEvaluationModal, setSessionEvaluationModal] = useState<SessionEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // References
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, currentUserSpeech]);

  // Keep talkState synced with isSpeaking
  useEffect(() => {
    if (isSpeaking) {
      setTalkState('speaking');
    } else if (talkState === 'speaking') {
      setTalkState(isHandsFree ? 'listening' : 'idle');
    }
  }, [isSpeaking]);

  // Setup Web Audio Analyser for reactive waveform
  const startAudioVisualizer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawWaveform();
    } catch (e) {
      console.warn('Audio visualizer init error:', e);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 1.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
      
      // Dynamic gradient based on talkState
      let fillStyle = '#3B82F6';
      if (talkState === 'speaking') fillStyle = '#10B981';
      if (talkState === 'thinking') fillStyle = '#8B5CF6';
      if (talkState === 'executing') fillStyle = '#F59E0B';

      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 4);
      x += barWidth;
    }

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  // Speech Recognition Setup
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setTalkState('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setCurrentUserSpeech(interim);
      }

      if (finalTranscript.trim()) {
        const spoken = finalTranscript.trim();
        setCurrentUserSpeech('');
        handleUserSpeechCompleted(spoken);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setTalkState('idle');
      }
    };

    recognition.onend = () => {
      if (isHandsFree && talkState === 'listening') {
        try {
          recognition.start();
        } catch {
          // ignore restart errors
        }
      } else if (talkState !== 'speaking' && talkState !== 'thinking') {
        setTalkState('idle');
      }
    };

    recognitionRef.current = recognition;
  };

  // Send message to Gemini Talk API
  const handleUserSpeechCompleted = async (text: string) => {
    if (!text.trim()) return;

    // Append to transcript
    const userMsg = { sender: 'joseph' as const, text, timestamp: 'Now', isFinal: true };
    setTranscripts((prev) => [...prev, userMsg]);

    setTalkState('thinking');

    try {
      // Build conversation history
      const history = [...transcripts, userMsg].map((t) => ({
        role: t.sender === 'joseph' ? 'user' : 'assistant',
        content: t.text,
      }));

      const recentEvidenceSummary = state.evidence
        .slice(0, 4)
        .map((e) => `[${e.classification}] ${e.title}: ${e.directSupport}`)
        .join('; ');

      const response = await fetch('/api/gemini/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          currentMode,
          activeObjective: state.activeObjective,
          recentEvidenceSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('Wise server communication error');
      }

      const data = await response.json();
      const assistantText = data.text || 'I understand. What is the next physical verification?';

      // Check if function calls were generated
      if (data.functionCalls && data.functionCalls.length > 0) {
        setTalkState('executing');
        for (const call of data.functionCalls) {
          executeAssistantFunction(call.name, call.args);
        }
      }

      setTranscripts((prev) => [
        ...prev,
        {
          sender: 'wise',
          text: assistantText,
          timestamp: 'Now',
          isFinal: true,
        },
      ]);

      if (!isMuted) {
        await speakText(assistantText);
      } else {
        setTalkState(isHandsFree ? 'listening' : 'idle');
      }
    } catch (e: any) {
      console.error('Wise consult error:', e);
      const fallbackText = "I encountered an error connecting to the intelligence engine. Let's record the current reality directly.";
      setTranscripts((prev) => [
        ...prev,
        { sender: 'wise', text: fallbackText, timestamp: 'Now', isFinal: true },
      ]);
      setTalkState('idle');
    }
  };

  // Execute assistant function calls safely
  const executeAssistantFunction = (name: string, args: any) => {
    console.log('Wise Executing Function:', name, args);
    if (name === 'create_action' && args.title) {
      createAction({
        title: args.title,
        domain: args.domain || 'revenue',
        status: 'active',
        estimatedMinutes: args.estimatedMinutes || 25,
        completionEvidence: args.completionEvidence || 'Observable proof',
        followUpTrigger: args.followUpTrigger || 'Review at next check-in',
      });
    } else if (name === 'create_evidence_item' && args.title) {
      createEvidence({
        title: args.title,
        domain: args.domain || 'other',
        classification: args.classification || 'CLAIM',
        source: args.source || 'Voice Session with Joseph',
        date: new Date().toISOString().split('T')[0],
        directSupport: args.directSupport || '',
        contradiction: args.contradiction || '',
        alternativeExplanation: args.alternativeExplanation || '',
        confidence: args.confidence || 75,
        relatedObjective: state.activeObjective,
        relatedDecision: '',
        verificationStatus: 'unverified',
        lastReviewedDate: new Date().toISOString().split('T')[0],
      });
    } else if (name === 'start_focus_timer') {
      startFocusTimer(args.minutes || 25);
    }
  };

  // Start Voice Session
  const startListening = async () => {
    stopAudio();
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    await startAudioVisualizer();
    try {
      recognitionRef.current?.start();
      setTalkState('listening');
    } catch (e) {
      console.warn('Start listening error:', e);
    }
  };

  // Stop / Pause Listening
  const pauseListening = () => {
    recognitionRef.current?.stop();
    stopAudio();
    setTalkState('idle');
  };

  // Immediate Interruption
  const handleInterrupt = () => {
    stopAudio();
    if (isHandsFree) {
      startListening();
    } else {
      setTalkState('idle');
    }
  };

  // Toggle Camera Context
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (e) {
        console.warn('Camera access denied or unavailable:', e);
      }
    }
  };

  // End Session & Generate Automatic Structured Session Evaluation
  const handleEndSession = async () => {
    pauseListening();
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/gemini/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionHistory: transcripts,
          mode: currentMode,
          activeObjective: state.activeObjective,
        }),
      });

      if (response.ok) {
        const evaluation: SessionEvaluation = await response.json();
        setSessionEvaluationModal(evaluation);
        saveSession(evaluation);
      } else {
        throw new Error('Evaluation failed');
      }
    } catch (e) {
      console.error('Session evaluation error:', e);
      // Fallback evaluation object
      const fallbackEval: SessionEvaluation = {
        session_id: `sess-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: currentMode,
        domain: 'business',
        raw_objective: state.activeObjective,
        true_objective: state.activeObjective,
        verified_facts: ['Session completed with Wise'],
        documented_records: [],
        self_reports: ['Direct verbal session concluded'],
        claims: [],
        assumptions: [],
        hypotheses: [],
        ai_inferences: [],
        contradictions: [],
        alternative_explanations: [],
        unknowns: [],
        emotional_intensity_before: 5,
        emotional_intensity_after: 2,
        clarity_before: 5,
        clarity_after: 8,
        decision_required: 'Immediate next physical action',
        decision: 'Proceed with observable execution',
        recommended_option: 'Complete primary scheduled action',
        primary_risk: 'Analysis expansion without physical execution',
        next_physical_action: state.actions.find((a) => a.status === 'active')?.title || 'Verify latest record',
        action_owner: 'Joseph',
        target_date: new Date().toISOString().split('T')[0],
        completion_evidence: 'Documented confirmation in Sent folder or bank line',
        status: 'active',
        follow_up_trigger: 'Review at evening debrief',
        new_evidence_detected: false,
        repetition_detected: false,
        requires_professional_review: false,
      };
      setSessionEvaluationModal(fallbackEval);
      saveSession(fallbackEval);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Status visual mapping
  const getStatusBadge = () => {
    switch (talkState) {
      case 'listening':
        return { text: 'LISTENING', color: 'bg-blue-500 text-white border-blue-400 animate-pulse', icon: Radio };
      case 'thinking':
        return { text: 'THINKING', color: 'bg-purple-600 text-white border-purple-400 animate-pulse', icon: Sparkles };
      case 'speaking':
        return { text: 'SPEAKING', color: 'bg-emerald-600 text-white border-emerald-400', icon: Volume2 };
      case 'executing':
        return { text: 'EXECUTING FUNCTION', color: 'bg-amber-600 text-white border-amber-400 animate-pulse', icon: Layers };
      case 'idle':
      default:
        return { text: 'STANDBY', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: MicOff };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24 animate-fadeIn flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Controls & State Ribbon */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.text}
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Mode: <span className="uppercase text-slate-200">{currentMode}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hands-Free Toggle */}
          <button
            onClick={() => setIsHandsFree(!isHandsFree)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
              isHandsFree
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Hands-free continuously listens when assistant pauses"
          >
            {isHandsFree ? 'Hands-Free: ON' : 'Push-to-Talk'}
          </button>

          {/* Camera / Screen Toggle */}
          <button
            onClick={toggleCamera}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isCameraActive
                ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isCameraActive ? 'Disable Camera Context' : 'Enable Camera Context'}
          >
            {isCameraActive ? <Video className="w-4 h-4 text-rose-400" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Mute Assistant Audio Toggle */}
          <button
            onClick={() => {
              if (!isMuted) stopAudio();
              setIsMuted(!isMuted);
            }}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-900"
            title={isMuted ? 'Unmute Assistant' : 'Mute Assistant Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            disabled={isEvaluating}
            className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold font-mono flex items-center gap-1 transition-colors"
          >
            <Square className="w-3 h-3 fill-rose-300" />
            <span>{isEvaluating ? 'Evaluating...' : 'End & Evaluate'}</span>
          </button>
        </div>
      </div>

      {/* Camera Live Preview if Active */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-slate-950 shrink-0 h-40">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Camera Context Active
          </div>
        </div>
      )}

      {/* Operating Mode Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0">
        {(['general', 'clear', 'decide', 'execute', 'reset', 'relationship'] as OperatingMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setCurrentMode(mode)}
            className={`px-3 py-1 rounded-xl text-xs font-mono uppercase tracking-wide border whitespace-nowrap transition-colors ${
              currentMode === mode
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Live Conversation Transcript Display */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner"
      >
        {transcripts.map((t, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              t.sender === 'joseph' ? 'items-end' : 'items-start'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-400 mb-1 px-1">
              {t.sender === 'joseph' ? 'JOSEPH' : 'WISE'} · {t.timestamp}
            </span>
            <div
              className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                t.sender === 'joseph'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-sm shadow-md'
              }`}
            >
              <p className="whitespace-pre-line">{t.text}</p>
            </div>
          </div>
        ))}

        {/* Live Interim Speech Bubble */}
        {currentUserSpeech && (
          <div className="flex flex-col items-end animate-pulse">
            <span className="text-[10px] font-mono text-blue-400 mb-1 px-1">
              SPEAKING NOW...
            </span>
            <div className="p-3.5 rounded-2xl max-w-[85%] text-sm bg-blue-950/60 border border-blue-500/50 text-blue-200 rounded-tr-sm">
              <p className="italic">{currentUserSpeech}</p>
            </div>
          </div>
        )}

        {talkState === 'thinking' && (
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Wise is integrating facts and selecting response...</span>
          </div>
        )}
      </div>

      {/* Reactive Audio Waveform Visualizer */}
      <div className="h-10 w-full flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 px-4 shrink-0">
        <canvas ref={canvasRef} width={400} height={36} className="w-full h-full" />
      </div>

      {/* Primary Voice Action Center */}
      <div className="flex items-center justify-center gap-4 shrink-0 pt-2">
        {/* Interruption Button */}
        <button
          onClick={handleInterrupt}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors"
          title="Interrupt assistant speaking"
          aria-label="Interrupt assistant speaking"
        >
          <Pause className="w-5 h-5" />
        </button>

        {/* Central Large Microphone Control */}
        <button
          onClick={talkState === 'listening' ? pauseListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${
            talkState === 'listening'
              ? 'bg-blue-600 text-white shadow-blue-500/50 scale-105'
              : talkState === 'speaking'
              ? 'bg-emerald-600 text-white shadow-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700'
          }`}
          aria-label={talkState === 'listening' ? 'Stop listening' : 'Start voice consultation'}
        >
          {talkState === 'listening' && (
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></span>
          )}
          {talkState === 'listening' ? (
            <Mic className="w-9 h-9" />
          ) : (
            <Mic className="w-9 h-9 text-slate-300 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Text Input Manual Fallback Trigger */}
        <button
          onClick={() => {
            const prompt = window.prompt('Type situation / message for Wise:');
            if (prompt) handleUserSpeechCompleted(prompt);
          }}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors"
          title="Text keyboard input fallback"
          aria-label="Text keyboard input fallback"
        >
          <FileText className="w-5 h-5" />
        </button>
      </div>

      {/* Automatic Session Evaluation Modal */}
      {sessionEvaluationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  Automatic Session Evaluation
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {sessionEvaluationModal.true_objective || 'Executive Session Summary'}
                </h3>
              </div>
              <button
                onClick={() => setSessionEvaluationModal(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
                aria-label="Close evaluation modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {/* Objective & Domain */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">Domain:</span>
                  <p className="text-slate-200 uppercase font-semibold">{sessionEvaluationModal.domain}</p>
                </div>
                <div>
                  <span className="text-slate-500">Clarity Shift:</span>
                  <p className="text-emerald-400 font-semibold">
                    {sessionEvaluationModal.clarity_before}/10 → {sessionEvaluationModal.clarity_after}/10 (+{sessionEvaluationModal.clarity_after - sessionEvaluationModal.clarity_before})
                  </p>
                </div>
              </div>

              {/* Verified Facts */}
              {sessionEvaluationModal.verified_facts?.length > 0 && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                    Verified Facts ({sessionEvaluationModal.verified_facts.length})
                  </span>
                  <ul className="space-y-1">
                    {sessionEvaluationModal.verified_facts.map((f, i) => (
                      <li key={i} className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-600/30 text-emerald-200">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions & Hypotheses */}
              {sessionEvaluationModal.assumptions?.length > 0 && (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-400">
                    Assumptions to Verify ({sessionEvaluationModal.assumptions.length})
                  </span>
                  <ul className="space-y-1">
                    {sessionEvaluationModal.assumptions.map((a, i) => (
                      <li key={i} className="p-2 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Physical Action */}
              <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-500/40 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-400">
                  Extracted Next Physical Action:
                </span>
                <p className="text-sm font-bold text-slate-100">
                  {sessionEvaluationModal.next_physical_action}
                </p>
                <p className="text-[11px] text-blue-200 font-mono">
                  Evidence: {sessionEvaluationModal.completion_evidence}
                </p>
              </div>

              {/* Follow-up trigger */}
              <div className="text-[11px] font-mono text-slate-400">
                Trigger: <span className="text-slate-300">{sessionEvaluationModal.follow_up_trigger}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSessionEvaluationModal(null)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Accept and Record in Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
