export type TranslationMode = 'zh-to-en' | 'mixed-or-en-polish';

export type ScenarioId =
  | 'daily_spoken'
  | 'teams_chat'
  | 'standard_email'
  | 'formal_email'
  | 'meeting_update'
  | 'tech_sync'
  | 'ppt_presentation'
  | 'speech_keynote'
  | 'app_ui_copy';

export type VocabularyTier = 'simple' | 'moderate' | 'advanced';

export type SpellingVariant = 'US' | 'UK';

export type ConcisenessLevel = 'concise' | 'balanced' | 'detailed';

export type ToneWarmth = 'direct' | 'warm' | 'diplomatic';

export type EmailFraming = 'auto' | 'always' | 'never';

export type IndustryMode = 'general' | 'automotive_parts';

export type AutomotiveProductLine =
  | 'general_parts'
  | 'powertrain_edrive'
  | 'battery_thermal'
  | 'chassis_braking'
  | 'body_structural'
  | 'interior_exterior'
  | 'electronics_harness';

export type AutomotiveProcessFocus =
  | 'general_mfg'
  | 'die_casting'
  | 'stamping'
  | 'injection_molding'
  | 'cnc_machining'
  | 'welding_joining'
  | 'surface_coating'
  | 'assembly_eol'
  | 'quality_apqp';

export interface AutomotiveProfile {
  industryMode: IndustryMode;
  productLine: AutomotiveProductLine;
  processFocus: AutomotiveProcessFocus;
  customProductProcess: string;
}

export interface PreferenceSettings {
  spelling: SpellingVariant;
  conciseness: ConcisenessLevel;
  toneWarmth: ToneWarmth;
  emailFraming: EmailFraming;
  preserveLineBreaks: boolean;
  customInstruction: string;
  automotiveProfile: AutomotiveProfile;
}

export interface PreferenceTemplate {
  id: string;
  name: string;
  description: string;
  settings: PreferenceSettings;
  isDefault?: boolean;
  updatedAt: number;
}

export interface GlossaryEntry {
  id: string;
  source: string;
  target: string;
  caseSensitive: boolean;
  note: string;
  enabled: boolean;
  createdAt: number;
}

export interface IntentNote {
  type: 'preserved' | 'ambiguous' | 'missing_detail';
  message: string;
  detail: string;
}

export interface KeyChoice {
  originalCue: string;
  refinedPhrase: string;
  reason: string;
}

export interface MatchedGlossaryItem {
  source: string;
  target: string;
}

export interface TranslationResult {
  polishedText: string;
  reconstructedIntent: string;
  chineseBackTranslation: string;
  intentNotes: IntentNote[];
  keyChoices: KeyChoice[];
  matchedGlossary: MatchedGlossaryItem[];
  detectedInputType: 'chinese' | 'mixed' | 'english';
  durationMs?: number;
}

export interface TranslateRequestPayload {
  sourceText: string;
  mode: TranslationMode;
  scenario: ScenarioId;
  vocabularyTier: VocabularyTier;
  preferences: PreferenceSettings;
  glossary: GlossaryEntry[];
}

export interface HistoryItem {
  id: string;
  createdAt: number;
  pinned: boolean;
  sourceText: string;
  mode: TranslationMode;
  scenario: ScenarioId;
  vocabularyTier: VocabularyTier;
  templateName: string;
  result: TranslationResult;
}

export type ActiveTab = 'workbench' | 'glossary' | 'preferences' | 'history';

export interface FloatingOrbPosition {
  x: number;
  y: number;
}
