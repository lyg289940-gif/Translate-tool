import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Languages,
  Loader2,
  Minimize2,
  X,
} from 'lucide-react';
import { SCENARIOS, VOCABULARY_TIERS } from '../constants/presets';
import {
  FloatingOrbPosition,
  GlossaryEntry,
  PreferenceSettings,
  ScenarioId,
  TranslationMode,
  TranslationResult,
  VocabularyTier,
} from '../types/translation';

interface FloatingOrbWidgetProps {
  visible: boolean;
  expanded: boolean;
  onSetExpanded: (expanded: boolean) => void;
  onCloseOrb: () => void;
  position: FloatingOrbPosition;
  onChangePosition: (pos: FloatingOrbPosition) => void;
  mode: TranslationMode;
  onChangeMode: (mode: TranslationMode) => void;
  scenario: ScenarioId;
  onChangeScenario: (scenario: ScenarioId) => void;
  vocabularyTier: VocabularyTier;
  onChangeVocabularyTier: (tier: VocabularyTier) => void;
  preferences: PreferenceSettings;
  glossary: GlossaryEntry[];
  onRecordHistory: (
    sourceText: string,
    mode: TranslationMode,
    scenario: ScenarioId,
    tier: VocabularyTier,
    result: TranslationResult
  ) => void;
}

interface DocumentPictureInPictureApi {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
}

export const FloatingOrbWidget: React.FC<FloatingOrbWidgetProps> = ({
  visible,
  expanded,
  onSetExpanded,
  onCloseOrb,
  position,
  onChangePosition,
  mode,
  onChangeMode,
  scenario,
  onChangeScenario,
  vocabularyTier,
  onChangeVocabularyTier,
  preferences,
  glossary,
  onRecordHistory,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [quickResult, setQuickResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pipNotice, setPipNotice] = useState<string | null>(null);

  const draggingRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const resolvedPos = {
    x:
      position.x >= 0
        ? Math.min(Math.max(16, position.x), Math.max(16, window.innerWidth - 68))
        : Math.max(16, window.innerWidth - 76),
    y:
      position.y >= 0
        ? Math.min(Math.max(76, position.y), Math.max(76, window.innerHeight - 76))
        : Math.max(88, window.innerHeight - 110),
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) {
        onSetExpanded(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [expanded, onSetExpanded]);

  if (!visible) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: resolvedPos.x,
      origY: resolvedPos.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current.active) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      draggingRef.current.moved = true;
    }
    const nextX = Math.min(
      Math.max(12, draggingRef.current.origX + dx),
      window.innerWidth - 64
    );
    const nextY = Math.min(
      Math.max(72, draggingRef.current.origY + dy),
      window.innerHeight - 64
    );
    onChangePosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    if (!draggingRef.current.active) return;
    const wasMoved = draggingRef.current.moved;
    draggingRef.current.active = false;

    if (wasMoved) {
      // Snap cleanly to nearest horizontal edge
      const snapLeft = resolvedPos.x + 26 < window.innerWidth / 2;
      const snappedX = snapLeft ? 20 : Math.max(20, window.innerWidth - 72);
      onChangePosition({ x: snappedX, y: resolvedPos.y });
    } else {
      onSetExpanded(!expanded);
    }
  };

  const handleQuickTranslate = async () => {
    const text = quickInput.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: text,
          mode,
          scenario,
          vocabularyTier,
          preferences,
          glossary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '翻译服务暂时不可用');
      }
      const parsed = data as TranslationResult;
      setQuickResult(parsed);
      onRecordHistory(text, mode, scenario, vocabularyTier, parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!quickResult?.polishedText) return;
    try {
      await navigator.clipboard.writeText(quickResult.polishedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleOpenDesktopPiP = async () => {
    const pipApi = (window as unknown as { documentPictureInPicture?: DocumentPictureInPictureApi })
      .documentPictureInPicture;
    if (!pipApi) {
      setPipNotice('当前浏览器或内嵌预览环境暂不支持独立桌面 PiP 窗口，请直接使用页面悬浮球。');
      setTimeout(() => setPipNotice(null), 4000);
      return;
    }

    try {
      const pipWin = await pipApi.requestWindow({ width: 420, height: 500 });
      pipWin.document.title = 'LexaDesk 速译小窗';
      const style = pipWin.document.createElement('style');
      style.textContent = `
        * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { margin: 0; padding: 14px; background: #F8FAFC; color: #0F172A; display: flex; flex-direction: column; gap: 10px; height: 100vh; }
        .row { display: flex; gap: 6px; align-items: center; }
        select, button { font-size: 12px; padding: 6px 8px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff; color: #0F172A; }
        button.primary { background: #2563EB; color: #fff; border-color: #2563EB; font-weight: 600; cursor: pointer; }
        textarea { width: 100%; flex: 1; min-height: 110px; padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px; resize: none; }
        .out { flex: 1; min-height: 110px; padding: 10px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px; line-height: 1.55; overflow-y: auto; white-space: pre-wrap; }
      `;
      pipWin.document.head.appendChild(style);

      const container = pipWin.document.body;
      container.innerHTML = `
        <div class="row" style="justify-content: space-between;">
          <strong style="font-size: 13px;">LexaDesk 桌面速译小窗</strong>
          <select id="pip-mode">
            <option value="zh-to-en" ${mode === 'zh-to-en' ? 'selected' : ''}>中 → 英翻译</option>
            <option value="mixed-or-en-polish" ${mode === 'mixed-or-en-polish' ? 'selected' : ''}>中英混杂 / 纯英润色</option>
          </select>
        </div>
        <div class="row">
          <select id="pip-scenario" style="flex:1;">
            ${SCENARIOS.map(
              (s) =>
                `<option value="${s.id}" ${s.id === scenario ? 'selected' : ''}>${s.label}</option>`
            ).join('')}
          </select>
          <select id="pip-tier">
            ${VOCABULARY_TIERS.map(
              (t) =>
                `<option value="${t.id}" ${t.id === vocabularyTier ? 'selected' : ''}>用词：${t.shortLabel}</option>`
            ).join('')}
          </select>
        </div>
        <textarea id="pip-input" placeholder="输入零散中文或中英混杂草稿 (Ctrl/⌘ + Enter)..."></textarea>
        <div class="row" style="justify-content: flex-end;">
          <button id="pip-copy" style="cursor:pointer;">复制译文</button>
          <button id="pip-run" class="primary">立即转换</button>
        </div>
        <div id="pip-output" class="out">译文将显示在这里...</div>
      `;

      const runBtn = pipWin.document.getElementById('pip-run') as HTMLButtonElement;
      const copyBtn = pipWin.document.getElementById('pip-copy') as HTMLButtonElement;
      const inputEl = pipWin.document.getElementById('pip-input') as HTMLTextAreaElement;
      const outputEl = pipWin.document.getElementById('pip-output') as HTMLDivElement;
      const modeEl = pipWin.document.getElementById('pip-mode') as HTMLSelectElement;
      const scenarioEl = pipWin.document.getElementById('pip-scenario') as HTMLSelectElement;
      const tierEl = pipWin.document.getElementById('pip-tier') as HTMLSelectElement;

      const executePip = async () => {
        const text = inputEl.value.trim();
        if (!text) return;
        runBtn.disabled = true;
        runBtn.textContent = '转换中...';
        outputEl.textContent = '正在梳理语义与润色...';
        try {
          const resp = await fetch(`${window.location.origin}/api/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceText: text,
              mode: modeEl.value,
              scenario: scenarioEl.value,
              vocabularyTier: tierEl.value,
              preferences,
              glossary,
            }),
          });
          const data = await resp.json();
          if (!resp.ok) throw new Error(data.error || '转换失败');
          outputEl.textContent = data.polishedText;
        } catch (err) {
          outputEl.textContent = err instanceof Error ? err.message : '转换失败';
        } finally {
          runBtn.disabled = false;
          runBtn.textContent = '立即转换';
        }
      };

      runBtn.addEventListener('click', executePip);
      inputEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          executePip();
        }
      });
      copyBtn.addEventListener('click', async () => {
        const outText = outputEl.textContent ?? '';
        if (!outText) return;
        await pipWin.navigator.clipboard.writeText(outText);
        copyBtn.textContent = '已复制';
        setTimeout(() => {
          copyBtn.textContent = '复制译文';
        }, 1500);
      });
    } catch {
      setPipNotice('无法打开桌面独立小窗，请检查浏览器弹窗权限或继续使用页面悬浮球。');
      setTimeout(() => setPipNotice(null), 4000);
    }
  };

  // Compute smart panel anchoring relative to orb position
  const openOnLeft = resolvedPos.x > window.innerWidth / 2;
  const openAbove = resolvedPos.y > window.innerHeight / 2;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    left: openOnLeft
      ? Math.max(12, resolvedPos.x - 396)
      : Math.min(window.innerWidth - 396, resolvedPos.x + 62),
    top: openAbove
      ? Math.max(76, resolvedPos.y - 380)
      : Math.min(window.innerHeight - 440, resolvedPos.y),
  };

  return (
    <>
      {/* Draggable Floating Orb */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'fixed',
          left: resolvedPos.x,
          top: resolvedPos.y,
          zIndex: 51,
          touchAction: 'none',
        }}
        aria-label="拖拽或点击展开 LexaDesk 悬浮球"
        title="点击展开/收起速译浮窗 · 可自由拖拽贴边（快捷键 Alt + Space）"
        className="w-12 h-12 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg border border-[#1D4ED8] flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
      >
        <Languages className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Expanded Quick-Translate Popover */}
      {expanded && (
        <div
          style={panelStyle}
          role="dialog"
          aria-label="LexaDesk 悬浮速译面板"
          className="w-[384px] max-w-[calc(100vw-24px)] bg-white border border-[#CBD5E1] rounded-xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0F172A]">
              悬浮速译窗
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenDesktopPiP}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#475569] hover:text-[#2563EB] bg-white border border-[#E2E8F0] rounded-md transition-colors whitespace-nowrap"
                title="尝试弹出独立置顶浏览器小窗（适用于跨应用对照）"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                <span>置顶小窗</span>
              </button>
              <button
                type="button"
                onClick={() => onSetExpanded(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded"
                title="收起面板 (Esc)"
                aria-label="收起悬浮窗"
              >
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onCloseOrb}
                className="p-1 text-[#64748B] hover:text-[#BE123C] rounded"
                title="关闭悬浮球模式"
                aria-label="关闭悬浮球"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {pipNotice && (
            <div className="px-4 py-2 bg-[#FFFBEB] border-b border-[#FDE68A] text-[11px] text-[#92400E]">
              {pipNotice}
            </div>
          )}

          <div className="p-3.5 space-y-3">
            {/* Compact Mode, Scenario & Tier Selectors */}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={mode}
                onChange={(e) => onChangeMode(e.target.value as TranslationMode)}
                aria-label="转换模式"
                className="px-2 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="zh-to-en">中 → 英翻译</option>
                <option value="mixed-or-en-polish">混杂/纯英润色</option>
              </select>

              <select
                value={scenario}
                onChange={(e) => onChangeScenario(e.target.value as ScenarioId)}
                aria-label="沟通场景"
                className="px-2 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortLabel}
                  </option>
                ))}
              </select>

              <select
                value={vocabularyTier}
                onChange={(e) =>
                  onChangeVocabularyTier(e.target.value as VocabularyTier)
                }
                aria-label="用词档位"
                className="px-2 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {VOCABULARY_TIERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    用词：{t.shortLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Input */}
            <textarea
              rows={4}
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickTranslate();
                }
              }}
              placeholder="输入零散中文或混杂英文，按 Ctrl/⌘ + Enter 即刻翻译..."
              className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white resize-none"
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#94A3B8]">
                Ctrl/⌘ + Enter 转换 · Esc 收起
              </span>
              <button
                type="button"
                disabled={isLoading || !quickInput.trim()}
                onClick={handleQuickTranslate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] rounded-lg transition-colors whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>转换中</span>
                  </>
                ) : (
                  <span>立即转换</span>
                )}
              </button>
            </div>

            {error && (
              <div className="px-3 py-2 bg-[#FFE4E6] border border-[#FECDD3] rounded-lg text-xs text-[#9F1239]">
                {error}
              </div>
            )}

            {quickResult && (
              <div className="pt-2.5 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#475569]">
                    转换结果
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                        <span className="text-[#15803D]">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto custom-scrollbar p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                  {quickResult.polishedText}
                </div>

                {quickResult.intentNotes.length > 0 && (
                  <p className="text-[11px] text-[#B45309] leading-snug">
                    核验提示：{quickResult.intentNotes[0].message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
