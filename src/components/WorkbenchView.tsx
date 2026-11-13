import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Copy,
  Eraser,
  Factory,
  Info,
  Loader2,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import {
  AUTOMOTIVE_PROCESSES,
  AUTOMOTIVE_PRODUCT_LINES,
  DEFAULT_AUTOMOTIVE_PROFILE,
  SAMPLE_PROMPTS,
  SCENARIOS,
  VOCABULARY_TIERS,
} from '../constants/presets';
import {
  AutomotiveProcessFocus,
  AutomotiveProductLine,
  GlossaryEntry,
  PreferenceSettings,
  PreferenceTemplate,
  ScenarioId,
  TranslationMode,
  TranslationResult,
  VocabularyTier,
} from '../types/translation';
import { detectLanguageComposition } from '../utils/diff';
import { DiffRenderer } from './DiffRenderer';

interface WorkbenchViewProps {
  sourceText: string;
  onChangeSourceText: (text: string) => void;
  mode: TranslationMode;
  onChangeMode: (mode: TranslationMode) => void;
  scenario: ScenarioId;
  onChangeScenario: (scenario: ScenarioId) => void;
  vocabularyTier: VocabularyTier;
  onChangeVocabularyTier: (tier: VocabularyTier) => void;
  showDiff: boolean;
  onToggleShowDiff: (show: boolean) => void;
  showBackTranslation: boolean;
  onToggleBackTranslation: (show: boolean) => void;
  templates: PreferenceTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (id: string) => void;
  activePreferences: PreferenceSettings;
  onUpdateActivePreferences: (prefs: PreferenceSettings) => void;
  glossary: GlossaryEntry[];
  result: TranslationResult | null;
  isLoading: boolean;
  error: string | null;
  currentHistoryId: string | null;
  isCurrentPinned: boolean;
  onTogglePinCurrent: () => void;
  onTranslate: (overrideTier?: VocabularyTier) => void;
  onOpenPreferences: () => void;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  sourceText,
  onChangeSourceText,
  mode,
  onChangeMode,
  scenario,
  onChangeScenario,
  vocabularyTier,
  onChangeVocabularyTier,
  showDiff,
  onToggleShowDiff,
  showBackTranslation,
  onToggleBackTranslation,
  templates,
  activeTemplateId,
  onSelectTemplate,
  activePreferences,
  onUpdateActivePreferences,
  glossary,
  result,
  isLoading,
  error,
  currentHistoryId,
  isCurrentPinned,
  onTogglePinCurrent,
  onTranslate,
  onOpenPreferences,
}) => {
  const [copied, setCopied] = useState(false);

  const activeGlossaryCount = useMemo(
    () => glossary.filter((g) => g.enabled).length,
    [glossary]
  );

  const detectedComposition = useMemo(() => {
    if (sourceText.trim().length < 8) return null;
    return detectLanguageComposition(sourceText);
  }, [sourceText]);

  const showModeNudge = useMemo(() => {
    if (!detectedComposition) return null;
    if (mode === 'zh-to-en' && detectedComposition !== 'chinese') {
      return {
        targetMode: 'mixed-or-en-polish' as TranslationMode,
        message:
          detectedComposition === 'english'
            ? '检测到输入主要为英文草稿，建议切换为「中英混杂 · 纯英润色」以启用逐词对比高亮。'
            : '检测到中英文混杂内容，建议切换为「中英混杂 · 纯英润色」模式。',
        actionLabel: '切换为混杂/纯英润色',
      };
    }
    if (mode === 'mixed-or-en-polish' && detectedComposition === 'chinese') {
      return {
        targetMode: 'zh-to-en' as TranslationMode,
        message: '检测到输入为纯中文，切换为「中 → 英翻译润色」模式可获得更准确的语序梳理。',
        actionLabel: '切换为中译英模式',
      };
    }
    return null;
  }, [detectedComposition, mode]);

  const activeScenario = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[2];
  const activeTier =
    VOCABULARY_TIERS.find((t) => t.id === vocabularyTier) ?? VOCABULARY_TIERS[1];

  const handleCopyResult = async () => {
    if (!result?.polishedText) return;
    try {
      await navigator.clipboard.writeText(result.polishedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && sourceText.trim()) {
        onTranslate();
      }
    }
  };

  const handleApplySample = (sampleId: string) => {
    const sample = SAMPLE_PROMPTS.find((s) => s.id === sampleId);
    if (!sample) return;
    onChangeMode(sample.mode);
    onChangeScenario(sample.scenario);
    onChangeVocabularyTier(sample.vocabularyTier);
    onChangeSourceText(sample.text);
  };

  const renderIntentNoteIcon = (type: 'preserved' | 'ambiguous' | 'missing_detail') => {
    if (type === 'preserved') {
      return <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />;
    }
    if (type === 'ambiguous') {
      return <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />;
    }
    return <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />;
  };

  const renderIntentNoteLabel = (type: 'preserved' | 'ambiguous' | 'missing_detail') => {
    if (type === 'preserved') return '边界已忠实保留';
    if (type === 'ambiguous') return '模糊表述提示';
    return '待补充细节提醒';
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Control Toolbar */}
      <section
        aria-label="翻译与润色参数设定"
        className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Primary Mode Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
            <button
              type="button"
              onClick={() => onChangeMode('zh-to-en')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'zh-to-en'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              中 → 英翻译润色
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('mixed-or-en-polish')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'mixed-or-en-polish'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              中英混杂 · 纯英润色
            </button>
          </div>

          {/* Vocabulary Tier + Template Quick Switch */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#475569] whitespace-nowrap">
                用词档位
              </span>
              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
                {VOCABULARY_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => onChangeVocabularyTier(tier.id)}
                    title={tier.description}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      vocabularyTier === tier.id
                        ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {tier.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="template-select"
                className="text-xs font-medium text-[#475569] whitespace-nowrap"
              >
                偏好模板
              </label>
              <select
                id="template-select"
                value={activeTemplateId}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenPreferences}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                title="自定义翻译偏好与模板"
                aria-label="打开偏好设置"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Scenario Selector Row */}
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#475569] whitespace-nowrap shrink-0 mr-1">
              沟通场景
            </span>
            {SCENARIOS.map((item) => {
              const isSelected = scenario === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeScenario(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1D4ED8]'
                      : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#64748B] shrink-0">{activeScenario.description}</p>
        </div>

        {/* Automotive Parts Product & Process Precision Selector */}
        {(() => {
          const autoProfile =
            activePreferences.automotiveProfile ?? DEFAULT_AUTOMOTIVE_PROFILE;
          return (
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#475569] shrink-0">
                <Factory className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>行业定位</span>
              </div>

              <select
                aria-label="行业领域模式"
                value={autoProfile.industryMode}
                onChange={(e) =>
                  onUpdateActivePreferences({
                    ...activePreferences,
                    automotiveProfile: {
                      ...autoProfile,
                      industryMode:
                        e.target.value === 'general' ? 'general' : 'automotive_parts',
                    },
                  })
                }
                className="px-2.5 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="automotive_parts">汽车零部件制造业</option>
                <option value="general">通用办公交流</option>
              </select>

              {autoProfile.industryMode === 'automotive_parts' && (
                <>
                  <select
                    aria-label="产品或零部件方向"
                    value={autoProfile.productLine}
                    onChange={(e) =>
                      onUpdateActivePreferences({
                        ...activePreferences,
                        automotiveProfile: {
                          ...autoProfile,
                          productLine: e.target.value as AutomotiveProductLine,
                        },
                      })
                    }
                    className="px-2.5 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {AUTOMOTIVE_PRODUCT_LINES.map((p) => (
                      <option key={p.id} value={p.id}>
                        产品：{p.label}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="工艺或业务环节"
                    value={autoProfile.processFocus}
                    onChange={(e) =>
                      onUpdateActivePreferences({
                        ...activePreferences,
                        automotiveProfile: {
                          ...autoProfile,
                          processFocus: e.target.value as AutomotiveProcessFocus,
                        },
                      })
                    }
                    className="px-2.5 py-1.5 text-xs font-medium text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {AUTOMOTIVE_PROCESSES.map((p) => (
                      <option key={p.id} value={p.id}>
                        工艺：{p.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={autoProfile.customProductProcess}
                    onChange={(e) =>
                      onUpdateActivePreferences({
                        ...activePreferences,
                        automotiveProfile: {
                          ...autoProfile,
                          customProductProcess: e.target.value,
                        },
                      })
                    }
                    placeholder="精确定位具体零件或工位（如：电驱壳体 CNC 精加）"
                    className="flex-1 min-w-[200px] px-2.5 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                  />
                </>
              )}
            </div>
          );
        })()}
      </section>

      {/* Dual-Column Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Pane: Source Draft Input */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col min-h-[480px] min-w-0">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">原文草稿</h2>
              <span className="text-xs text-[#64748B] tabular-nums">
                {sourceText.length} 字符
              </span>
            </div>

            <div className="flex items-center gap-2">
              {sourceText.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChangeSourceText('')}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#64748B] hover:text-[#0F172A] rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>清空</span>
                </button>
              )}
            </div>
          </div>

          {/* Language Nudge Banner */}
          {showModeNudge && (
            <div className="mx-5 mt-4 px-3.5 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-[#1E40AF]">
              <span>{showModeNudge.message}</span>
              <button
                type="button"
                onClick={() => onChangeMode(showModeNudge.targetMode)}
                className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap shrink-0"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showModeNudge.actionLabel}</span>
              </button>
            </div>
          )}

          <div className="flex-1 p-5 flex flex-col">
            <textarea
              value={sourceText}
              onChange={(e) => onChangeSourceText(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                mode === 'zh-to-en'
                  ? '直接输入口语化、语序零散或没来得及整理的中文草稿。\n系统会先理解您的真实意图并理顺逻辑，再按所选场景与用词档位翻译成地道英文；原文没有的信息绝不凭空捏造。'
                  : '粘贴中英文混杂消息（如「这个 API latency 有点高，周五前给个 ETA」）或需要润色的英文草稿。\n系统将统一语境、修正语法与措辞，并在右侧高亮对比每一处改动。'
              }
              className="w-full flex-1 min-h-[260px] text-[15px] leading-[1.7] text-[#0F172A] placeholder:text-[#94A3B8] bg-transparent focus:outline-none resize-none custom-scrollbar"
            />

            {/* Quick Sample Strip */}
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#64748B] whitespace-nowrap">快速示例：</span>
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleApplySample(sample.id)}
                  className="px-2.5 py-1 text-xs text-[#475569] hover:text-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Left Pane Footer */}
          <div className="px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-xl flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-1.5">
              <span>已启用 {activeGlossaryCount} 条专属词汇</span>
              <span aria-hidden="true">·</span>
              <span>{activePreferences.spelling === 'UK' ? '英式拼写' : '美式拼写'}</span>
              <span aria-hidden="true">·</span>
              <span>
                {(activePreferences.automotiveProfile?.industryMode ?? 'automotive_parts') ===
                'automotive_parts'
                  ? `${
                      AUTOMOTIVE_PRODUCT_LINES.find(
                        (p) =>
                          p.id ===
                          (activePreferences.automotiveProfile?.productLine ?? 'general_parts')
                      )?.label ?? '汽车零部件'
                    } / ${
                      AUTOMOTIVE_PROCESSES.find(
                        (p) =>
                          p.id ===
                          (activePreferences.automotiveProfile?.processFocus ?? 'general_mfg')
                      )?.label ?? '通用工艺'
                    }`
                  : '通用办公'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeTier.label}</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="hidden sm:inline text-xs font-mono text-[#94A3B8]">
                Ctrl/⌘ + Enter
              </span>
              <button
                type="button"
                disabled={isLoading || !sourceText.trim()}
                onClick={() => onTranslate()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>正在梳理与转换...</span>
                  </>
                ) : (
                  <span>{mode === 'zh-to-en' ? '整理并翻译' : '润色并整理'}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Polished Output, Diff & Intent Verification */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl flex flex-col min-h-[480px] min-w-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">润色与译文结果</h2>
              {result?.durationMs && (
                <span className="text-xs text-[#64748B] font-mono tabular-nums">
                  {(result.durationMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 p-0.5 bg-[#F1F5F9] rounded-lg">
                  <button
                    type="button"
                    onClick={() => onToggleShowDiff(false)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      !showDiff
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    纯净译文
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleShowDiff(true)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      showDiff
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    对比高亮
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleBackTranslation(!showBackTranslation)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                    showBackTranslation
                      ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                      : 'bg-white border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  回译核对
                </button>

                {currentHistoryId && (
                  <button
                    type="button"
                    onClick={onTogglePinCurrent}
                    className={`p-1.5 rounded-md border transition-colors ${
                      isCurrentPinned
                        ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                    title={isCurrentPinned ? '取消收藏' : '收藏此条表达'}
                    aria-label="收藏"
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={isCurrentPinned ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  title="快捷键 Ctrl/⌘ + Shift + C"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                      <span className="text-[#15803D]">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#475569]" aria-hidden="true" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Pane Content Area */}
          <div className="flex-1 p-5 flex flex-col min-w-0">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="space-y-2.5">
                  <div className="h-4 bg-[#E2E8F0] rounded w-11/12" />
                  <div className="h-4 bg-[#E2E8F0] rounded w-full" />
                  <div className="h-4 bg-[#E2E8F0] rounded w-4/5" />
                </div>
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                  <div className="h-3 bg-[#F1F5F9] rounded w-1/3" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-5/6" />
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 space-y-3">
                <AlertTriangle className="w-8 h-8 text-[#BE123C]" aria-hidden="true" />
                <div className="space-y-1 max-w-md">
                  <p className="text-sm font-semibold text-[#0F172A]">转换未能完成</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTranslate()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>重新尝试</span>
                </button>
              </div>
            ) : !result ? (
              <div className="flex-1 flex flex-col justify-center py-6 space-y-5">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    输出区已就绪
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed max-w-lg">
                    在左侧输入未整理的口语草稿或中英混杂内容后，此处将同步呈现：
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-[#475569]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="text-[#0F172A]">符合场景与用词档位的成品英文：</strong>
                      可直接复制发送至 Teams、Slack 或邮件。
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="text-[#0F172A]">润色修改对比高亮：</strong>
                      清晰标记逐词优化或关键措辞替换依据。
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="text-[#0F172A]">零捏造意图核验：</strong>
                      展示梳理后的真实意图，并对原文缺省细节给出忠实保留提示。
                    </span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Main Output or Diff */}
                {showDiff ? (
                  <DiffRenderer
                    mode={mode}
                    sourceText={sourceText}
                    polishedText={result.polishedText}
                    keyChoices={result.keyChoices}
                  />
                ) : (
                  <div className="text-[15px] leading-[1.75] text-[#0F172A] whitespace-pre-wrap break-words select-text">
                    {result.polishedText}
                  </div>
                )}

                {/* Back-translation verification */}
                {showBackTranslation && result.chineseBackTranslation && (
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-1.5">
                    <div className="text-xs font-semibold text-[#475569]">
                      中文回译核对（确认英文语气与细微含义）
                    </div>
                    <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                      {result.chineseBackTranslation}
                    </p>
                  </div>
                )}

                {/* Intent Reconstruction & Anti-Fabrication Guardrails */}
                <div className="pt-4 border-t border-[#E2E8F0] space-y-3 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-semibold text-[#0F172A]">
                      意图梳理核验
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 break-words">
                      {result.reconstructedIntent}
                    </p>
                  </div>

                  {result.intentNotes && result.intentNotes.length > 0 && (
                    <div className="space-y-2 min-w-0">
                      {result.intentNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 px-3.5 py-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs min-w-0"
                        >
                          {renderIntentNoteIcon(note.type)}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="font-semibold text-[#92400E] break-words">
                              {renderIntentNoteLabel(note.type)} · {note.message}
                            </div>
                            <p className="text-[#B45309] leading-relaxed break-words">
                              {note.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Glossary */}
                  {result.matchedGlossary && result.matchedGlossary.length > 0 && (
                    <div className="text-xs text-[#475569] flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 min-w-0">
                      <span className="font-semibold text-[#0F172A]">
                        已应用专属词汇：
                      </span>
                      {result.matchedGlossary.map((g, idx) => (
                        <span key={idx} className="font-mono text-[#1D4ED8] break-all">
                          {g.source} → {g.target}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Key Choices List */}
                  {result.keyChoices && result.keyChoices.length > 0 && (
                    <div className="pt-2 space-y-2 min-w-0">
                      <div className="text-xs font-semibold text-[#0F172A]">
                        用词与润色解析
                      </div>
                      <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] overflow-hidden">
                        {result.keyChoices.map((choice, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-2.5 text-xs flex flex-col gap-1 min-w-0"
                          >
                            <div className="font-medium text-[#0F172A] break-words">
                              <span className="text-[#64748B]">「{choice.originalCue}」</span>
                              <span className="mx-1.5 text-[#94A3B8]">→</span>
                              <span className="font-mono text-[#1D4ED8] break-words">
                                {choice.refinedPhrase}
                              </span>
                            </div>
                            <p className="text-[#475569] leading-relaxed break-words">
                              {choice.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Pane Footer: Quick Re-run across Vocabulary Tiers */}
          {result && (
            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-xl flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#64748B]">快速对比其他用词档位：</span>
              <div className="flex items-center gap-2">
                {VOCABULARY_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    disabled={isLoading || tier.id === vocabularyTier}
                    onClick={() => {
                      onChangeVocabularyTier(tier.id);
                      onTranslate(tier.id);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                      tier.id === vocabularyTier
                        ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                        : 'bg-white border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
