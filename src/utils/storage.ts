import {
  DEFAULT_AUTOMOTIVE_PROFILE,
  DEFAULT_GLOSSARY,
  DEFAULT_PREFERENCES,
  DEFAULT_TEMPLATES,
} from '../constants/presets';
import {
  FloatingOrbPosition,
  GlossaryEntry,
  HistoryItem,
  PreferenceSettings,
  PreferenceTemplate,
  ScenarioId,
  TranslationMode,
  VocabularyTier,
} from '../types/translation';

const KEYS = {
  TEMPLATES: 'lexadesk_templates_v1',
  ACTIVE_TEMPLATE_ID: 'lexadesk_active_template_id_v1',
  ACTIVE_PREFS: 'lexadesk_active_prefs_v1',
  GLOSSARY: 'lexadesk_glossary_v1',
  HISTORY: 'lexadesk_history_v1',
  WORKSPACE_STATE: 'lexadesk_workspace_state_v1',
  ORB_POSITION: 'lexadesk_orb_position_v1',
} as const;

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function normalizePreferences(
  raw?: Partial<PreferenceSettings> | null
): PreferenceSettings {
  return {
    ...DEFAULT_PREFERENCES,
    ...(raw ?? {}),
    automotiveProfile: {
      ...DEFAULT_AUTOMOTIVE_PROFILE,
      ...(raw?.automotiveProfile ?? {}),
    },
  };
}

export interface WorkspaceDefaults {
  mode: TranslationMode;
  scenario: ScenarioId;
  vocabularyTier: VocabularyTier;
  showDiff: boolean;
  showBackTranslation: boolean;
}

const DEFAULT_WORKSPACE_STATE: WorkspaceDefaults = {
  mode: 'zh-to-en',
  scenario: 'standard_email',
  vocabularyTier: 'moderate',
  showDiff: true,
  showBackTranslation: false,
};

export function loadTemplates(): PreferenceTemplate[] {
  const stored = safeRead<PreferenceTemplate[] | null>(KEYS.TEMPLATES, null);
  if (!stored || stored.length === 0) return DEFAULT_TEMPLATES;
  return stored.map((tpl) => ({
    ...tpl,
    settings: normalizePreferences(tpl.settings),
  }));
}

export function saveTemplates(templates: PreferenceTemplate[]): void {
  safeWrite(KEYS.TEMPLATES, templates);
}

export function loadActiveTemplateId(): string {
  return safeRead<string>(KEYS.ACTIVE_TEMPLATE_ID, DEFAULT_TEMPLATES[0].id);
}

export function saveActiveTemplateId(id: string): void {
  safeWrite(KEYS.ACTIVE_TEMPLATE_ID, id);
}

export function loadActivePreferences(): PreferenceSettings {
  const stored = safeRead<Partial<PreferenceSettings> | null>(KEYS.ACTIVE_PREFS, null);
  return normalizePreferences(stored);
}

export function saveActivePreferences(prefs: PreferenceSettings): void {
  safeWrite(KEYS.ACTIVE_PREFS, prefs);
}

export function loadGlossary(): GlossaryEntry[] {
  const stored = safeRead<GlossaryEntry[] | null>(KEYS.GLOSSARY, null);
  if (!stored) return DEFAULT_GLOSSARY;
  return stored;
}

export function saveGlossary(entries: GlossaryEntry[]): void {
  safeWrite(KEYS.GLOSSARY, entries);
}

export function loadHistory(): HistoryItem[] {
  return safeRead<HistoryItem[]>(KEYS.HISTORY, []);
}

export function saveHistory(items: HistoryItem[]): void {
  safeWrite(KEYS.HISTORY, items.slice(0, 100));
}

export function loadWorkspaceState(): WorkspaceDefaults {
  return safeRead<WorkspaceDefaults>(KEYS.WORKSPACE_STATE, DEFAULT_WORKSPACE_STATE);
}

export function saveWorkspaceState(state: WorkspaceDefaults): void {
  safeWrite(KEYS.WORKSPACE_STATE, state);
}

export function loadOrbPosition(): FloatingOrbPosition {
  return safeRead<FloatingOrbPosition>(KEYS.ORB_POSITION, { x: -1, y: -1 });
}

export function saveOrbPosition(pos: FloatingOrbPosition): void {
  safeWrite(KEYS.ORB_POSITION, pos);
}
