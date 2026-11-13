import { useCallback, useEffect, useState } from 'react';
import { FloatingOrbWidget } from './components/FloatingOrbWidget';
import { GlossaryView } from './components/GlossaryView';
import { Header } from './components/Header';
import { HistoryView } from './components/HistoryView';
import { PreferencesView } from './components/PreferencesView';
import { WorkbenchView } from './components/WorkbenchView';
import {
  ActiveTab,
  FloatingOrbPosition,
  GlossaryEntry,
  HistoryItem,
  PreferenceSettings,
  PreferenceTemplate,
  ScenarioId,
  TranslationMode,
  TranslationResult,
  VocabularyTier,
} from './types/translation';
import {
  loadActivePreferences,
  loadActiveTemplateId,
  loadGlossary,
  loadHistory,
  loadOrbPosition,
  loadTemplates,
  loadWorkspaceState,
  saveActivePreferences,
  saveActiveTemplateId,
  saveGlossary,
  saveHistory,
  saveOrbPosition,
  saveTemplates,
  saveWorkspaceState,
} from './utils/storage';
import { postTranslate } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');

  // Workspace defaults persisted locally
  const initialWs = loadWorkspaceState();
  const [sourceText, setSourceText] = useState('');
  const [mode, setMode] = useState<TranslationMode>(initialWs.mode);
  const [scenario, setScenario] = useState<ScenarioId>(initialWs.scenario);
  const [vocabularyTier, setVocabularyTier] = useState<VocabularyTier>(
    initialWs.vocabularyTier
  );
  const [showDiff, setShowDiff] = useState(initialWs.showDiff);
  const [showBackTranslation, setShowBackTranslation] = useState(
    initialWs.showBackTranslation
  );

  // Preferences, templates, glossary, history
  const [templates, setTemplates] = useState<PreferenceTemplate[]>(loadTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(loadActiveTemplateId);
  const [activePreferences, setActivePreferences] = useState<PreferenceSettings>(
    loadActivePreferences
  );
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(loadGlossary);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  // Active translation request state
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Floating orb state
  const [floatingOrbVisible, setFloatingOrbVisible] = useState(false);
  const [floatingOrbExpanded, setFloatingOrbExpanded] = useState(false);
  const [orbPosition, setOrbPosition] = useState<FloatingOrbPosition>(loadOrbPosition);

  // Persist workspace settings
  useEffect(() => {
    saveWorkspaceState({
      mode,
      scenario,
      vocabularyTier,
      showDiff,
      showBackTranslation,
    });
  }, [mode, scenario, vocabularyTier, showDiff, showBackTranslation]);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    saveActiveTemplateId(activeTemplateId);
  }, [activeTemplateId]);

  useEffect(() => {
    saveActivePreferences(activePreferences);
  }, [activePreferences]);

  useEffect(() => {
    saveGlossary(glossary);
  }, [glossary]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveOrbPosition(orbPosition);
  }, [orbPosition]);

  const activeTemplateName =
    templates.find((t) => t.id === activeTemplateId)?.name ?? '自定义偏好';

  const recordHistoryItem = useCallback(
    (
      src: string,
      usedMode: TranslationMode,
      usedScenario: ScenarioId,
      usedTier: VocabularyTier,
      res: TranslationResult
    ): string => {
      const id = `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const entry: HistoryItem = {
        id,
        createdAt: Date.now(),
        pinned: false,
        sourceText: src,
        mode: usedMode,
        scenario: usedScenario,
        vocabularyTier: usedTier,
        templateName: activeTemplateName,
        result: res,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 100));
      return id;
    },
    [activeTemplateName]
  );

  const handleTranslate = useCallback(
    async (overrideTier?: VocabularyTier) => {
      const text = sourceText.trim();
      if (!text || isLoading) return;

      const tierToUse = overrideTier ?? vocabularyTier;
      setIsLoading(true);
      setError(null);

      try {
        const parsed = await postTranslate({
          sourceText: text,
          mode,
          scenario,
          vocabularyTier: tierToUse,
          preferences: activePreferences,
          glossary,
        });
        setResult(parsed);
        const newHistId = recordHistoryItem(text, mode, scenario, tierToUse, parsed);
        setCurrentHistoryId(newHistId);
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络异常，请点击重试');
      } finally {
        setIsLoading(false);
      }
    },
    [
      sourceText,
      isLoading,
      vocabularyTier,
      mode,
      scenario,
      activePreferences,
      glossary,
      recordHistoryItem,
    ]
  );

  // Global keyboard shortcuts: Alt+Space / Ctrl+K for Floating Orb, Ctrl+Shift+C to copy output
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle floating orb via Alt + Space or Ctrl/Cmd + K
      if (
        (e.altKey && e.code === 'Space') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        setFloatingOrbVisible(true);
        setFloatingOrbExpanded((prev) => (floatingOrbVisible ? !prev : true));
        return;
      }

      // Copy current output via Ctrl/Cmd + Shift + C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        if (result?.polishedText) {
          e.preventDefault();
          navigator.clipboard.writeText(result.polishedText).catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [floatingOrbVisible, result]);

  const handleToggleFloatingOrb = () => {
    if (floatingOrbVisible) {
      setFloatingOrbVisible(false);
      setFloatingOrbExpanded(false);
    } else {
      setFloatingOrbVisible(true);
      setFloatingOrbExpanded(true);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const found = templates.find((t) => t.id === templateId);
    if (!found) return;
    setActiveTemplateId(found.id);
    setActivePreferences({ ...found.settings });
  };

  const handleSaveTemplate = (updated: PreferenceTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleCreateTemplate = (
    name: string,
    description: string,
    settings: PreferenceSettings
  ) => {
    const newTpl: PreferenceTemplate = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      settings,
      updatedAt: Date.now(),
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setActiveTemplateId(newTpl.id);
    setActivePreferences({ ...settings });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== templateId);
      if (activeTemplateId === templateId && next.length > 0) {
        setActiveTemplateId(next[0].id);
        setActivePreferences({ ...next[0].settings });
      }
      return next;
    });
  };

  const handleTogglePin = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
  };

  const handleClearUnpinned = () => {
    setHistory((prev) => prev.filter((item) => item.pinned));
  };

  const handleRestoreFromHistory = (item: HistoryItem) => {
    setSourceText(item.sourceText);
    setMode(item.mode);
    setScenario(item.scenario);
    setVocabularyTier(item.vocabularyTier);
    setResult(item.result);
    setCurrentHistoryId(item.id);
    setError(null);
    setActiveTab('workbench');
  };

  const isCurrentPinned = Boolean(
    currentHistoryId && history.find((h) => h.id === currentHistoryId)?.pinned
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        floatingOrbEnabled={floatingOrbVisible}
        onToggleFloatingOrb={handleToggleFloatingOrb}
      />

      <div className="flex-1">
        {activeTab === 'workbench' && (
          <WorkbenchView
            sourceText={sourceText}
            onChangeSourceText={setSourceText}
            mode={mode}
            onChangeMode={setMode}
            scenario={scenario}
            onChangeScenario={setScenario}
            vocabularyTier={vocabularyTier}
            onChangeVocabularyTier={setVocabularyTier}
            showDiff={showDiff}
            onToggleShowDiff={setShowDiff}
            showBackTranslation={showBackTranslation}
            onToggleBackTranslation={setShowBackTranslation}
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
            activePreferences={activePreferences}
            onUpdateActivePreferences={setActivePreferences}
            glossary={glossary}
            result={result}
            isLoading={isLoading}
            error={error}
            currentHistoryId={currentHistoryId}
            isCurrentPinned={isCurrentPinned}
            onTogglePinCurrent={() => {
              if (currentHistoryId) handleTogglePin(currentHistoryId);
            }}
            onTranslate={handleTranslate}
            onOpenPreferences={() => setActiveTab('preferences')}
          />
        )}

        {activeTab === 'glossary' && (
          <GlossaryView glossary={glossary} onChangeGlossary={setGlossary} />
        )}

        {activeTab === 'preferences' && (
          <PreferencesView
            templates={templates}
            activeTemplateId={activeTemplateId}
            activePreferences={activePreferences}
            onSelectTemplate={handleSelectTemplate}
            onUpdateActivePreferences={setActivePreferences}
            onSaveTemplate={handleSaveTemplate}
            onCreateTemplate={handleCreateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onTogglePin={handleTogglePin}
            onDeleteItem={handleDeleteHistoryItem}
            onClearUnpinned={handleClearUnpinned}
            onRestoreToWorkbench={handleRestoreFromHistory}
          />
        )}
      </div>

      <FloatingOrbWidget
        visible={floatingOrbVisible}
        expanded={floatingOrbExpanded}
        onSetExpanded={setFloatingOrbExpanded}
        onCloseOrb={() => {
          setFloatingOrbVisible(false);
          setFloatingOrbExpanded(false);
        }}
        position={orbPosition}
        onChangePosition={setOrbPosition}
        mode={mode}
        onChangeMode={setMode}
        scenario={scenario}
        onChangeScenario={setScenario}
        vocabularyTier={vocabularyTier}
        onChangeVocabularyTier={setVocabularyTier}
        preferences={activePreferences}
        glossary={glossary}
        onRecordHistory={(src, m, s, t, res) => {
          recordHistoryItem(src, m, s, t, res);
        }}
      />
    </div>
  );
}
