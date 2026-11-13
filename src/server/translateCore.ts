import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  AUTOMOTIVE_PROCESSES,
  AUTOMOTIVE_PRODUCT_LINES,
  DEFAULT_AUTOMOTIVE_PROFILE,
  SCENARIOS,
  VOCABULARY_TIERS,
} from '../constants/presets';
import type {
  GlossaryEntry,
  PreferenceSettings,
  ScenarioId,
  TranslateRequestPayload,
  TranslationMode,
  TranslationResult,
  VocabularyTier,
} from '../types/translation';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(params: {
  mode: TranslationMode;
  scenario: ScenarioId;
  vocabularyTier: VocabularyTier;
  preferences: PreferenceSettings;
  activeGlossary: GlossaryEntry[];
}): string {
  const scenarioObj = SCENARIOS.find((s) => s.id === params.scenario) ?? SCENARIOS[2];
  const tierObj =
    VOCABULARY_TIERS.find((t) => t.id === params.vocabularyTier) ?? VOCABULARY_TIERS[1];

  const autoProfile = params.preferences.automotiveProfile ?? DEFAULT_AUTOMOTIVE_PROFILE;
  const productLineObj =
    AUTOMOTIVE_PRODUCT_LINES.find((p) => p.id === autoProfile.productLine) ??
    AUTOMOTIVE_PRODUCT_LINES[0];
  const processObj =
    AUTOMOTIVE_PROCESSES.find((p) => p.id === autoProfile.processFocus) ??
    AUTOMOTIVE_PROCESSES[0];

  const domainBlock =
    autoProfile.industryMode === 'automotive_parts'
      ? `\nAUTOMOTIVE PARTS MANUFACTURING DOMAIN FOCUS (Active):
- Industry Context: Automotive OEM / Tier-1 / Tier-2 Parts Manufacturing.
- Target Product Line (${productLineObj.label} / ${productLineObj.englishLabel}): ${productLineObj.guidance}
- Target Process Focus (${processObj.label} / ${processObj.englishLabel}): ${processObj.guidance}${
          autoProfile.customProductProcess?.trim()
            ? `\n- Specific Part / Process Anchor: "${autoProfile.customProductProcess.trim()}" — align technical nouns, measurement/process phrasing, and shop-floor context specifically to this component or process without inventing unstated specs.`
            : ''
        }`
      : '';

  const spellingRule =
    params.preferences.spelling === 'UK'
      ? 'Use British English spelling and conventions (e.g., organise, colour, programme, enquiry).'
      : 'Use American English spelling and conventions (e.g., organize, color, program, inquiry).';

  const concisenessRule =
    params.preferences.conciseness === 'concise'
      ? 'Be extra concise and direct; eliminate filler phrases while retaining every factual detail.'
      : params.preferences.conciseness === 'detailed'
        ? 'Provide thorough, well-bridged phrasing with smooth transitions, without inventing new facts.'
        : 'Balance clarity and natural flow—neither abrupt nor wordy.';

  const warmthRule =
    params.preferences.toneWarmth === 'direct'
      ? 'Keep tone crisp, objective, and matter-of-fact.'
      : params.preferences.toneWarmth === 'diplomatic'
        ? 'Use tactful, diplomatic, and highly courteous workplace phrasing.'
        : 'Use warm, cooperative, and approachable professional phrasing.';

  const framingRule =
    params.preferences.emailFraming === 'always'
      ? 'Include appropriate email greeting and sign-off framing ONLY using generic/placeholder-free phrasing or exact names present in the source (if no recipient name is given, use a clean general greeting like "Hi," or "Dear Team," only if clearly an email; never invent a person name).'
      : params.preferences.emailFraming === 'never'
        ? 'Output ONLY the message body text—do NOT wrap with email greetings or sign-offs unless explicitly written in the source.'
        : 'Follow the selected scenario convention: omit email headers/sign-offs for spoken, Teams/Slack chat, PPT presentation slides, speeches, or APP UI copy; include light natural framing only when appropriate for email scenarios and never invent names.';

  const lineBreakRule = params.preferences.preserveLineBreaks
    ? 'Preserve intentional paragraph breaks or bullet structure when helpful for readability.'
    : 'Merge fragmented short lines into cohesive paragraphs where appropriate.';

  const glossaryBlock =
    params.activeGlossary.length > 0
      ? params.activeGlossary
          .map(
            (g) =>
              `- "${g.source}" => MUST translate/render as "${g.target}"${g.caseSensitive ? ' (exact casing)' : ''}${g.note ? ` [Note: ${g.note}]` : ''}`
          )
          .join('\n')
      : 'None provided.';

  const modeTask =
    params.mode === 'zh-to-en'
      ? `PRIMARY TASK: Chinese -> English Intent Reorganization, Translation & Polishing.
The user's Chinese input may be fragmented, spoken, out-of-order, omit subjects, or jump between clauses.
Step 1: Reconstruct the user's true intended meaning into coherent Chinese in "reconstructedIntent" WITHOUT adding any unstated facts.
Step 2: Translate and polish that exact meaning into natural English matching the scenario, vocabulary tier, and preferences in "polishedText".`
      : `PRIMARY TASK: Chinese-English Mixed or Rough English Polishing & Translation.
The user's input may mix Chinese phrases with English buzzwords, or be rough/ungrammatical/disjointed English.
Step 1: Understand the exact intended meaning across both languages and summarize the coherent intent in Chinese in "reconstructedIntent".
Step 2: Produce a completely unified, natural, grammatically sound English text in "polishedText" matching the scenario, vocabulary tier, and preferences. Retain accurate English terms from the source unless better adapted to the vocabulary tier or glossary.`;

  return `You are LexaDesk, a senior bilingual workplace communications specialist and translator.

${modeTask}

STRICT NON-FABRICATION & FAITHFULNESS POLICY (CRITICAL):
1. Respect the user's original intent 100%. NEVER fabricate, assume, or hallucinate any facts not explicitly present in the user's source text—including dates, times, numbers, percentages, names, job titles, action owners, reasons, apologies, or promises.
2. If the source text uses vague references (e.g., "下周", "那个文件", "明天看情况", "some numbers"), keep them appropriately non-specific in English (e.g., "next week", "the document", "see how things look tomorrow", "some figures") rather than inventing specifics.
3. Whenever the source text has ambiguous pronouns, missing subjects/dates, or fragments where you carefully avoided guessing, log a brief, helpful note in "intentNotes" explaining how you preserved the boundary (in Simplified Chinese so the user can quickly verify).
4. Do NOT leave untranslated Chinese characters inside "polishedText".

SCENARIO REGISTER (${scenarioObj.label} / ${scenarioObj.englishLabel}):
${scenarioObj.guidance}

VOCABULARY TIER (${tierObj.label} / ${tierObj.englishLabel}):
${tierObj.guidance}
${domainBlock}

USER PREFERENCES:
- Spelling: ${spellingRule}
- Length & Density: ${concisenessRule}
- Tone Warmth: ${warmthRule}
- Framing: ${framingRule}
- Line Breaks: ${lineBreakRule}
${params.preferences.customInstruction.trim() ? `- Custom User Rule (High Priority): ${params.preferences.customInstruction.trim()}` : ''}

CUSTOM GLOSSARY (Strictly enforce when matched conceptually or literally):
${glossaryBlock}

OUTPUT REQUIREMENTS:
- "polishedText": The final, ready-to-send English output.
- "reconstructedIntent": A crisp, coherent Simplified Chinese restatement of what the user meant (confirming you understood fragmented wording accurately).
- "chineseBackTranslation": A natural Simplified Chinese back-translation of "polishedText" so the user can double-check tone and nuance.
- "intentNotes": 0 to 4 concise notes in Simplified Chinese confirming non-fabrication boundaries, ambiguous spots preserved faithfully, or missing details the user might want to fill in before sending. If the input is completely clear, return an empty array or 1 brief confirmation note.
- "keyChoices": 2 to 5 concrete phrasing/lexical highlights explaining how fragmented cues or rough words were elevated to match the chosen scenario and vocabulary tier (explanations in Simplified Chinese).
- "matchedGlossary": List of glossary entries that were actually triggered and applied.
- "detectedInputType": Classify the source input as "chinese", "mixed", or "english".`;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    polishedText: {
      type: Type.STRING,
      description: 'Final polished and translated English text ready for workplace use.',
    },
    reconstructedIntent: {
      type: Type.STRING,
      description:
        'Coherent Simplified Chinese summary of the user intent reconstructed from fragmented input.',
    },
    chineseBackTranslation: {
      type: Type.STRING,
      description:
        'Accurate Simplified Chinese back-translation of polishedText for nuance verification.',
    },
    detectedInputType: {
      type: Type.STRING,
      description: 'One of: chinese, mixed, english.',
    },
    intentNotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: 'One of: preserved, ambiguous, missing_detail.',
          },
          message: {
            type: Type.STRING,
            description: 'Short Chinese headline of the intent check or non-fabrication safeguard.',
          },
          detail: {
            type: Type.STRING,
            description: 'Brief Chinese explanation of what was kept faithful without guessing.',
          },
        },
        required: ['type', 'message', 'detail'],
      },
    },
    keyChoices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalCue: {
            type: Type.STRING,
            description: 'Fragment or phrase from the source text.',
          },
          refinedPhrase: {
            type: Type.STRING,
            description: 'Corresponding English phrase used in polishedText.',
          },
          reason: {
            type: Type.STRING,
            description:
              'Short Chinese note on why this phrasing fits the scenario/vocabulary tier.',
          },
        },
        required: ['originalCue', 'refinedPhrase', 'reason'],
      },
    },
    matchedGlossary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
        },
        required: ['source', 'target'],
      },
    },
  },
  required: [
    'polishedText',
    'reconstructedIntent',
    'chineseBackTranslation',
    'detectedInputType',
    'intentNotes',
    'keyChoices',
    'matchedGlossary',
  ],
};

export interface HandlerResponse {
  status: number;
  body: TranslationResult | { error: string; detail?: string };
}

export async function handleTranslatePayload(
  rawBody: unknown
): Promise<HandlerResponse> {
  const startedAt = Date.now();
  try {
    const body = (rawBody ?? {}) as Partial<TranslateRequestPayload>;
    const sourceText =
      typeof body.sourceText === 'string' ? body.sourceText.trim() : '';

    if (!sourceText) {
      return { status: 400, body: { error: '请输入需要翻译或润色的内容。' } };
    }

    if (sourceText.length > 8000) {
      return {
        status: 400,
        body: {
          error: '单次输入文本请控制在 8000 字符以内，以保证精准度与响应速度。',
        },
      };
    }

    const mode: TranslationMode =
      body.mode === 'mixed-or-en-polish' ? 'mixed-or-en-polish' : 'zh-to-en';
    const scenario: ScenarioId = body.scenario ?? 'standard_email';
    const vocabularyTier: VocabularyTier = body.vocabularyTier ?? 'moderate';
    const preferences: PreferenceSettings = {
      spelling: body.preferences?.spelling === 'UK' ? 'UK' : 'US',
      conciseness: body.preferences?.conciseness ?? 'balanced',
      toneWarmth: body.preferences?.toneWarmth ?? 'warm',
      emailFraming: body.preferences?.emailFraming ?? 'auto',
      preserveLineBreaks: body.preferences?.preserveLineBreaks ?? true,
      customInstruction: body.preferences?.customInstruction ?? '',
      automotiveProfile: {
        industryMode:
          body.preferences?.automotiveProfile?.industryMode === 'general'
            ? 'general'
            : 'automotive_parts',
        productLine:
          body.preferences?.automotiveProfile?.productLine ??
          DEFAULT_AUTOMOTIVE_PROFILE.productLine,
        processFocus:
          body.preferences?.automotiveProfile?.processFocus ??
          DEFAULT_AUTOMOTIVE_PROFILE.processFocus,
        customProductProcess:
          body.preferences?.automotiveProfile?.customProductProcess ?? '',
      },
    };

    const activeGlossary = Array.isArray(body.glossary)
      ? body.glossary.filter(
          (g) => g && g.enabled && g.source?.trim() && g.target?.trim()
        )
      : [];

    const ai = getGeminiClient();
    const systemInstruction = buildSystemInstruction({
      mode,
      scenario,
      vocabularyTier,
      preferences,
      activeGlossary,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Source text to process:\n"""\n${sourceText}\n"""`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return {
        status: 502,
        body: { error: '模型返回为空，请稍后重试。' },
      };
    }

    const parsed = JSON.parse(rawText) as TranslationResult;
    parsed.durationMs = Date.now() - startedAt;

    return { status: 200, body: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Translation API error:', message);

    if (message === 'GEMINI_API_KEY_MISSING') {
      return {
        status: 500,
        body: {
          error:
            '未检测到 GEMINI_API_KEY 环境变量。本地/AI Studio 请在 Secrets 中配置，Netlify 部署请在 Site configuration > Environment variables 中添加 GEMINI_API_KEY 后重新部署。',
        },
      };
    }

    if (
      message.includes('API_KEY_INVALID') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('403')
    ) {
      return {
        status: 403,
        body: {
          error: 'API 密钥无效或权限不足，请检查您的 GEMINI_API_KEY 配置。',
        },
      };
    }

    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      return {
        status: 429,
        body: { error: '请求频率暂时达到上限，请稍候数秒后重试。' },
      };
    }

    return {
      status: 500,
      body: {
        error: '翻译润色服务暂时不可用，请点击重试。',
        detail: message,
      },
    };
  }
}
