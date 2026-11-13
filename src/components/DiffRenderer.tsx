import React, { useMemo, useState } from 'react';
import { computeWordDiff, summarizeDiff } from '../utils/diff';
import { KeyChoice, TranslationMode } from '../types/translation';

interface DiffRendererProps {
  mode: TranslationMode;
  sourceText: string;
  polishedText: string;
  keyChoices: KeyChoice[];
}

export const DiffRenderer: React.FC<DiffRendererProps> = ({
  mode,
  sourceText,
  polishedText,
  keyChoices,
}) => {
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

  const hasSubstantialEnglishSource = useMemo(() => {
    const latinCount = (sourceText.match(/[A-Za-z]/g) ?? []).length;
    return mode === 'mixed-or-en-polish' && latinCount >= 12;
  }, [mode, sourceText]);

  const diffTokens = useMemo(() => {
    if (!hasSubstantialEnglishSource) return [];
    return computeWordDiff(sourceText, polishedText);
  }, [hasSubstantialEnglishSource, sourceText, polishedText]);

  const diffStats = useMemo(() => summarizeDiff(diffTokens), [diffTokens]);

  // Highlight key refined phrases inside Chinese->English output
  const annotatedSegments = useMemo(() => {
    if (hasSubstantialEnglishSource || keyChoices.length === 0) {
      return null;
    }

    type Segment = { text: string; choiceIdx: number | null };
    let segments: Segment[] = [{ text: polishedText, choiceIdx: null }];

    keyChoices.forEach((choice, idx) => {
      const phrase = choice.refinedPhrase?.trim();
      if (!phrase || phrase.length < 3) return;

      const nextSegments: Segment[] = [];
      for (const seg of segments) {
        if (seg.choiceIdx !== null) {
          nextSegments.push(seg);
          continue;
        }
        const lowerText = seg.text.toLowerCase();
        const lowerPhrase = phrase.toLowerCase();
        const pos = lowerText.indexOf(lowerPhrase);
        if (pos === -1) {
          nextSegments.push(seg);
        } else {
          if (pos > 0) {
            nextSegments.push({ text: seg.text.slice(0, pos), choiceIdx: null });
          }
          nextSegments.push({
            text: seg.text.slice(pos, pos + phrase.length),
            choiceIdx: idx,
          });
          if (pos + phrase.length < seg.text.length) {
            nextSegments.push({
              text: seg.text.slice(pos + phrase.length),
              choiceIdx: null,
            });
          }
        }
      }
      segments = nextSegments;
    });

    return segments;
  }, [hasSubstantialEnglishSource, keyChoices, polishedText]);

  if (hasSubstantialEnglishSource) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
          <span>逐词润色对比（对比原文与润色稿差异）</span>
          <div className="flex items-center gap-3 tabular-nums">
            <span className="text-[#15803D] font-medium">
              新增优化 {diffStats.addedCount} 词
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#BE123C] font-medium">
              删改原词 {diffStats.removedCount} 词
            </span>
          </div>
        </div>

        <div className="text-[15px] leading-[1.75] text-[#0F172A] whitespace-pre-wrap break-words bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
          {diffTokens.map((token, index) => {
            if (token.type === 'added') {
              return (
                <ins
                  key={index}
                  className="no-underline bg-[#DCFCE7] text-[#14532D] px-1 py-0.5 rounded-sm font-medium"
                >
                  {token.text}
                </ins>
              );
            }
            if (token.type === 'removed') {
              return (
                <del
                  key={index}
                  className="bg-[#FFE4E6] text-[#9F1239] line-through px-1 py-0.5 rounded-sm opacity-85"
                >
                  {token.text}
                </del>
              );
            }
            return <React.Fragment key={index}>{token.text}</React.Fragment>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>关键润色表达高亮（点击高亮词组查看对应原意与选词理由）</span>
      </div>

      <div className="text-[15px] leading-[1.75] text-[#0F172A] whitespace-pre-wrap break-words bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
        {annotatedSegments
          ? annotatedSegments.map((seg, idx) => {
              if (seg.choiceIdx === null) {
                return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
              }
              const isSelected = selectedChoiceIndex === seg.choiceIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedChoiceIndex(isSelected ? null : seg.choiceIdx)
                  }
                  className={`inline text-left px-1 py-0.5 rounded-sm border-b-2 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB] font-medium'
                      : 'bg-[#EFF6FF] text-[#1E3A8A] border-[#93C5FD] hover:bg-[#DBEAFE]'
                  }`}
                >
                  {seg.text}
                </button>
              );
            })
          : polishedText}
      </div>

      {selectedChoiceIndex !== null && keyChoices[selectedChoiceIndex] && (
        <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-[#1E3A8A] space-y-1 min-w-0">
          <div className="font-semibold break-words">
            对应原文线索：「{keyChoices[selectedChoiceIndex].originalCue}」 →{' '}
            {keyChoices[selectedChoiceIndex].refinedPhrase}
          </div>
          <p className="text-[#1E40AF] leading-relaxed break-words">
            {keyChoices[selectedChoiceIndex].reason}
          </p>
        </div>
      )}
    </div>
  );
};
