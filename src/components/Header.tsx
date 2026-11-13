import React from 'react';
import { Sparkles } from 'lucide-react';
import { ActiveTab } from '../types/translation';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  floatingOrbEnabled: boolean;
  onToggleFloatingOrb: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'workbench', label: '工作台' },
  { id: 'glossary', label: '专属词汇表' },
  { id: 'preferences', label: '偏好模板' },
  { id: 'history', label: '历史记录' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  floatingOrbEnabled,
  onToggleFloatingOrb,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('workbench')}
          className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md px-1"
        >
          LexaDesk 办公智译
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav
          aria-label="主导航"
          className="flex items-center gap-6 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-sm ${
                  isActive
                    ? 'text-[#2563EB]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleFloatingOrb}
            aria-pressed={floatingOrbEnabled}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB] ${
              floatingOrbEnabled
                ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] hover:bg-[#DBEAFE]'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
            }`}
            title="快捷键 Alt + Space 或 Ctrl/⌘ + K 切换悬浮球"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{floatingOrbEnabled ? '关闭悬浮球' : '悬浮球模式'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
