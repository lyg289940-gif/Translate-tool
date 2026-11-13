import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Copy, Search, Star, Trash2 } from 'lucide-react';
import { SCENARIOS, VOCABULARY_TIERS } from '../constants/presets';
import { HistoryItem } from '../types/translation';

interface HistoryViewProps {
  history: HistoryItem[];
  onTogglePin: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearUnpinned: () => void;
  onRestoreToWorkbench: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onTogglePin,
  onDeleteItem,
  onClearUnpinned,
  onRestoreToWorkbench,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter((item) => {
      if (filterMode === 'pinned' && !item.pinned) return false;
      if (!q) return true;
      return (
        item.sourceText.toLowerCase().includes(q) ||
        item.result.polishedText.toLowerCase().includes(q) ||
        item.result.reconstructedIntent.toLowerCase().includes(q)
      );
    });
  }, [history, searchQuery, filterMode]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">翻译与润色历史</h1>
          <p className="text-sm text-[#475569] mt-1">
            所有记录仅保存在当前浏览器的本地存储中，可随时检索、收藏或载入工作台继续微调。
          </p>
        </div>

        {history.some((h) => !h.pinned) && (
          <button
            type="button"
            onClick={onClearUnpinned}
            className="text-xs font-medium text-[#64748B] hover:text-[#BE123C] transition-colors whitespace-nowrap shrink-0"
          >
            清空未收藏记录
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3">
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            全部记录 ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('pinned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterMode === 'pinned'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            已收藏 ({history.filter((h) => h.pinned).length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="检索历史原文或译文..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl py-16 px-6 text-center space-y-2">
          <p className="text-sm font-medium text-[#0F172A]">
            {history.length === 0 ? '暂无翻译记录' : '没有符合条件的记录'}
          </p>
          <p className="text-xs text-[#64748B]">
            {history.length === 0
              ? '在工作台或悬浮球中完成一次翻译润色后，记录会自动保存在这里。'
              : '请尝试更换筛选条件或搜索关键词。'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const scenarioLabel =
              SCENARIOS.find((s) => s.id === item.scenario)?.shortLabel ?? item.scenario;
            const tierLabel =
              VOCABULARY_TIERS.find((t) => t.id === item.vocabularyTier)?.shortLabel ??
              item.vocabularyTier;
            const modeLabel =
              item.mode === 'zh-to-en' ? '中 → 英翻译润色' : '中英混杂 · 纯英润色';

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Unboxed typographic metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] tabular-nums">
                    <span>{formatTime(item.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[#0F172A]">{modeLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{scenarioLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>用词：{tierLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>模板：{item.templateName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onTogglePin(item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.pinned
                          ? 'text-[#D97706] bg-[#FEF3C7]'
                          : 'text-[#94A3B8] hover:text-[#475569] hover:bg-[#F1F5F9]'
                      }`}
                      title={item.pinned ? '取消收藏' : '收藏常用表达'}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={item.pinned ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.result.polishedText)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#475569] hover:text-[#0F172A] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-md transition-colors whitespace-nowrap"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                          <span className="text-[#15803D]">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>复制译文</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRestoreToWorkbench(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-md transition-colors whitespace-nowrap"
                    >
                      <span>载入工作台</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#BE123C] rounded-md transition-colors"
                      title="删除此记录"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[#64748B]">原始草稿</div>
                    <p className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed">
                      {item.sourceText}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[#64748B]">润色译文</div>
                    <p className="text-sm text-[#0F172A] font-medium whitespace-pre-wrap leading-relaxed">
                      {item.result.polishedText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
