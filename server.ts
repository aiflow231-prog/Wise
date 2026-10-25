import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Google Gen AI with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for Wise persona
const WISE_SYSTEM_PROMPT = `You are Wise, Joseph's private, evidence-first personal executive companion.
WISE stands for: WITNESS → INTEGRATE → SELECT → EXECUTE.
Joseph is analytical, multidisciplinary, highly independent, strategic, and comfortable with complexity.

Communication Rules:
1. Direct, concise communication. Evidence over unsupported narratives. Intellectual honesty.
2. One useful question at a time.
3. Action over repetitive analysis. Strategic leverage over administrative busywork.
4. Keep spoken answers short by default. Offer more detail only when necessary or requested.
5. Calm, intellectually honest, respectful, slightly challenging when useful, evidence-driven, comfortable saying "unknown", focused on outcomes.
6. Quietly normalize speech-to-text errors or emotionally charged input without criticizing grammar.
7. NEVER diagnose mental illness, attachment styles, trauma, addiction, or personality disorders. This is not therapy or clinical diagnosis.
8. NEVER fabricate emotional understanding or consciousness. No generic motivational language, excessive praise, or artificial intimacy.
9. End meaningful strategic summaries with:
CURRENT REALITY: [One or two concise sentences]
DECISION: [The decision available now, or what remains unresolved]
NEXT ACTION: [One observable physical action]
COMPLETION EVIDENCE: [What proves it was done]
FOLLOW-UP TRIGGER: [When or why to reopen the issue]

When repetitive analysis appears without new evidence, say:
"We have no material new evidence. More analysis is unlikely to change the immediate action. Execute, delegate, defer deliberately, or disengage."

When Joseph is overloaded:
SIMPLIFY → DELEGATE → EXECUTE → DISENGAGE`;

// Helper for function declarations to let Wise suggest actions
const wiseFunctionDeclarations = [
  {
    name: 'create_action',
    description: 'Creates a single observable physical next action for Joseph.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'One clear observable physical action' },
        domain: { type: Type.STRING, enum: ['recovery', 'revenue', 'stability', 'operations'], description: 'Strategic track' },
        estimatedMinutes: { type: Type.NUMBER, description: 'Realistic duration in minutes' },
        completionEvidence: { type: Type.STRING, description: 'Observable proof that confirms completion' },
        followUpTrigger: { type: Type.STRING, description: 'Condition or time to review' },
      },
      required: ['title', 'domain', 'completionEvidence'],
    },
  },
  {
    name: 'create_evidence_item',
    description: 'Records an item in the evidence vault with strict classification.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Short descriptive title of the evidence' },
        domain: { type: Type.STRING, enum: ['legal', 'financial', 'business', 'technical', 'personal', 'relationship', 'stability', 'other'] },
        classification: {
          type: Type.STRING,
          enum: [
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
          ],
        },
        source: { type: Type.STRING, description: 'Origin or document of this evidence' },
        directSupport: { type: Type.STRING, description: 'Direct factual support' },
        contradiction: { type: Type.STRING, description: 'Contradicting observations, if any' },
        alternativeExplanation: { type: Type.STRING, description: 'Strongest plausible alternative explanation' },
        confidence: { type: Type.NUMBER, description: 'Confidence level from 0 to 100' },
      },
      required: ['title', 'domain', 'classification', 'source'],
    },
  },
  {
    name: 'save_draft_message',
    description: 'Saves an emotionally activated message as a draft with cooling period rather than sending.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipient: { type: Type.STRING, description: 'Intended recipient' },
        subject: { type: Type.STRING, description: 'Subject line' },
        content: { type: Type.STRING, description: 'Draft content' },
        coolingPeriodHours: { type: Type.NUMBER, description: 'Cooling period in hours (e.g. 12 or 24)' },
        emotionalRating: { type: Type.NUMBER, description: 'Estimated intensity rating 0-10' },
      },
      required: ['recipient', 'content', 'coolingPeriodHours'],
    },
  },
  {
    name: 'start_focus_timer',
    description: 'Starts a focus timer for the current physical action.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        minutes: { type: Type.NUMBER, description: 'Duration in minutes, default 25' },
        actionTitle: { type: Type.STRING, description: 'Name of physical action' },
      },
      required: ['minutes'],
    },
  },
];

// 1. TALK / CONVERSATION ENDPOINT
app.post('/api/gemini/talk', async (req: Request, res: Response) => {
  try {
    const { messages, currentMode, activeObjective, recentEvidenceSummary } = req.body;

    let contextualPrompt = `Current Mode: ${currentMode || 'general'}\n`;
    if (activeObjective) {
      contextualPrompt += `Active Highest-Value Objective: ${activeObjective}\n`;
    }
    if (recentEvidenceSummary) {
      contextualPrompt += `Evidence Vault Context: ${recentEvidenceSummary}\n`;
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${contextualPrompt}\nJoseph says: ${messages[messages.length - 1]?.content || ''}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: WISE_SYSTEM_PROMPT,
        temperature: 0.2,
        tools: [{ functionDeclarations: wiseFunctionDeclarations }],
      },
    });

    const candidate = response.candidates?.[0];
    const text = response.text || '';
    const functionCalls = candidate?.content?.parts?.filter((p) => p.functionCall).map((p) => p.functionCall) || [];

    res.json({
      text,
      functionCalls,
    });
  } catch (error: any) {
    console.error('Gemini Talk Error:', error);
    res.status(500).json({ error: error.message || 'Error processing executive consultation' });
  }
});

// 2. AUTOMATIC SESSION EVALUATION ENDPOINT (Exact schema required by prompt)
app.post('/api/gemini/evaluate', async (req: Request, res: Response) => {
  try {
    const { sessionHistory, mode, activeObjective } = req.body;

    const evaluationPrompt = `Analyze the following session with Joseph and extract a structured evaluation.
Follow strict intellectual honesty:
- Separate verified facts from reports, claims, assumptions, hypotheses, and unknowns.
- If information is missing, use empty arrays or empty strings rather than inventing data.
- NEVER invent clinical diagnoses.
- Action owner is "Joseph".
Session History:
${JSON.stringify(sessionHistory, null, 2)}
Active Objective: ${activeObjective || ''}
Mode: ${mode || 'general'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        systemInstruction: WISE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            session_id: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            mode: { type: Type.STRING, enum: ['clear', 'decide', 'execute', 'reset', 'general'] },
            domain: { type: Type.STRING, enum: ['legal', 'financial', 'business', 'technical', 'personal', 'relationship', 'stability', 'other'] },
            raw_objective: { type: Type.STRING },
            true_objective: { type: Type.STRING },
            verified_facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            documented_records: { type: Type.ARRAY, items: { type: Type.STRING } },
            self_reports: { type: Type.ARRAY, items: { type: Type.STRING } },
            claims: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
            ai_inferences: { type: Type.ARRAY, items: { type: Type.STRING } },
            contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            alternative_explanations: { type: Type.ARRAY, items: { type: Type.STRING } },
            unknowns: { type: Type.ARRAY, items: { type: Type.STRING } },
            emotional_intensity_before: { type: Type.NUMBER },
            emotional_intensity_after: { type: Type.NUMBER },
            clarity_before: { type: Type.NUMBER },
            clarity_after: { type: Type.NUMBER },
            decision_required: { type: Type.STRING },
            decision: { type: Type.STRING },
            recommended_option: { type: Type.STRING },
            primary_risk: { type: Type.STRING },
            next_physical_action: { type: Type.STRING },
            action_owner: { type: Type.STRING },
            target_date: { type: Type.STRING },
            completion_evidence: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['not_started', 'active', 'blocked', 'completed', 'delegated', 'deferred', 'cancelled', 'archived'] },
            follow_up_trigger: { type: Type.STRING },
            new_evidence_detected: { type: Type.BOOLEAN },
            repetition_detected: { type: Type.BOOLEAN },
            requires_professional_review: { type: Type.BOOLEAN },
          },
          required: [
            'session_id',
            'timestamp',
            'mode',
            'domain',
            'raw_objective',
            'true_objective',
            'verified_facts',
            'documented_records',
            'self_reports',
            'claims',
            'assumptions',
            'hypotheses',
            'ai_inferences',
            'contradictions',
            'alternative_explanations',
            'unknowns',
            'decision_required',
            'decision',
            'recommended_option',
            'primary_risk',
            'next_physical_action',
            'action_owner',
            'completion_evidence',
            'status',
            'follow_up_trigger',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    if (!parsed.session_id) {
      parsed.session_id = `sess-${Date.now()}`;
    }
    if (!parsed.timestamp) {
      parsed.timestamp = new Date().toISOString();
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Session Evaluation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate session' });
  }
});

// 3. OPERATING MODE SPECIALIZED ENDPOINT
app.post('/api/gemini/mode', async (req: Request, res: Response) => {
  try {
    const { mode, input, context } = req.body;

    let modeInstruction = '';
    if (mode === 'clear') {
      modeInstruction = `MODE 1: CLEAR
Process:
1. Identify what happened.
2. Identify the actual objective.
3. Separate verified facts from reports, claims, assumptions, hypotheses, contradictions, and unknowns.
4. Identify what requires action now.
5. Remove irrelevant complexity.
Output structured JSON:
{
  "current_reality": "One-sentence current reality",
  "actual_objective": "...",
  "most_important_verified_fact": "...",
  "most_important_unknown": "...",
  "immediate_risk": "...",
  "smallest_safe_next_action": "...",
  "spoken_ending": "Current reality: [summary]. The next useful action is [action]."
}`;
    } else if (mode === 'decide') {
      modeInstruction = `MODE 2: DECIDE
Process:
Evaluate options by: expected benefit, downside risk, reversibility, evidence quality, time required, effort required, opportunity cost, long-term effect, information still missing, and whether more research would materially change decision.
Output structured JSON:
{
  "decision_required": "...",
  "options_considered": [{"name": "...", "benefit": "...", "risk": "...", "reversibility": "high|medium|low", "evidence_quality": "high|medium|low"}],
  "recommended_option": "...",
  "reason": "...",
  "main_risk": "...",
  "reversal_or_exit_route": "...",
  "next_physical_action": "...",
  "follow_up_trigger": "..."
}`;
    } else if (mode === 'execute') {
      modeInstruction = `MODE 3: EXECUTE
Process:
1. Reduce objective to one observable physical action.
2. Estimate realistic execution period.
3. Park unrelated ideas.
4. Request completion evidence.
Output structured JSON:
{
  "single_observable_action": "...",
  "estimated_minutes": 25,
  "completion_evidence": "...",
  "parked_ideas": ["..."],
  "spoken_reminder": "We have no material new evidence. More analysis is unlikely to change the immediate action. Execute, delegate, defer deliberately, or disengage."
}`;
    } else if (mode === 'reset') {
      modeInstruction = `MODE 4: RESET
Sequence:
1. Pause immediate irreversible action.
2. Lower the interaction pace.
3. Ask for zero-to-ten intensity rating.
4. Identify observable event.
5. Separate event from interpretation.
6. Identify immediate need.
7. Decide whether action is required now or after cooling period.
8. Save emotional messages as drafts.
9. Define clear review trigger.
Output structured JSON:
{
  "observable_event": "...",
  "interpretation_separated": "...",
  "immediate_need": "...",
  "cooling_period_hours": 12,
  "safe_immediate_action": "...",
  "review_trigger": "...",
  "spoken_ending": "You do not need to solve the entire situation now. The safest immediate action is [action]. Review again when [trigger]."
}`;
    } else if (mode === 'relationship') {
      modeInstruction = `RELATIONSHIP REALITY CHECK
Organize into:
- What happened
- Observed directly
- Other person explicitly said
- What Joseph believes it means
- What remains unknown
- Joseph's emotional response
- Underlying need
- Other person's possible perspective
- Alternative explanations
- Desired outcome
- Respectful request or boundary
- Smallest constructive next action
Do not validate unsupported allegations or malicious motives. Use: "That interpretation may be possible, but it is not established by the information currently available."
Output structured JSON.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Execute mode analysis for input: "${input}". Context: ${JSON.stringify(context || {})}`,
      config: {
        systemInstruction: `${WISE_SYSTEM_PROMPT}\n${modeInstruction}`,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error('Mode execution error:', error);
    res.status(500).json({ error: error.message || 'Mode execution failed' });
  }
});

// 4. TTS ENDPOINT using gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500),
              speechMetadata: {
                style: 'Clear, calm, executive tone, measured pace',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } else {
      res.status(500).json({ error: 'Audio generation produced no audio parts' });
    }
  } catch (error: any) {
    console.error('TTS generation error:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`WISE OS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
