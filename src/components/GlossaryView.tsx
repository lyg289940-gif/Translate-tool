import React, { useMemo, useState } from 'react';
import { Download, Factory, Plus, Search, Trash2, Upload } from 'lucide-react';
import { AUTOMOTIVE_GLOSSARY_PACKS, AutomotiveGlossaryPack } from '../constants/presets';
import { GlossaryEntry } from '../types/translation';

interface GlossaryViewProps {
  glossary: GlossaryEntry[];
  onChangeGlossary: (entries: GlossaryEntry[]) => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  glossary,
  onChangeGlossary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newCaseSensitive, setNewCaseSensitive] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return glossary;
    return glossary.filter(
      (entry) =>
        entry.source.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        entry.note.toLowerCase().includes(q)
    );
  }, [glossary, searchQuery]);

  const enabledCount = useMemo(
    () => glossary.filter((g) => g.enabled).length,
    [glossary]
  );

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const src = newSource.trim();
    const tgt = newTarget.trim();

    if (!src || !tgt) {
      setFormError('请填写原文词汇和指定的英文译法。');
      return;
    }

    const entry: GlossaryEntry = {
      id: `gls_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      source: src,
      target: tgt,
      note: newNote.trim(),
      caseSensitive: newCaseSensitive,
      enabled: true,
      createdAt: Date.now(),
    };

    onChangeGlossary([entry, ...glossary]);
    setNewSource('');
    setNewTarget('');
    setNewNote('');
    setNewCaseSensitive(false);
    setFormError(null);
  };

  const handleImportAutomotivePack = (pack: AutomotiveGlossaryPack) => {
    const existingSources = new Set(
      glossary.map((g) => g.source.trim().toLowerCase())
    );
    const now = Date.now();
    const toAdd: GlossaryEntry[] = pack.entries
      .filter((item) => !existingSources.has(item.source.trim().toLowerCase()))
      .map((item, idx) => ({
        id: `gls_pack_${now}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
        source: item.source,
        target: item.target,
        caseSensitive: item.caseSensitive,
        note: item.note,
        enabled: true,
        createdAt: now,
      }));

    if (toAdd.length === 0) {
      setImportFeedback(`「${pack.name}」中的词条已全部存在于您的词汇表中。`);
      return;
    }

    onChangeGlossary([...toAdd, ...glossary]);
    setImportFeedback(
      `已导入「${pack.name}」共 ${toAdd.length} 条汽车制造专业术语（自动跳过重复词条）。`
    );
  };

  const handleToggleEnabled = (id: string) => {
    onChangeGlossary(
      glossary.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    onChangeGlossary(glossary.filter((item) => item.id !== id));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(glossary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lexadesk-glossary-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) {
          setImportFeedback('导入失败：JSON 格式必须为词汇条目数组。');
          return;
        }
        const valid: GlossaryEntry[] = parsed
          .filter(
            (item) =>
              item &&
              typeof item.source === 'string' &&
              typeof item.target === 'string' &&
              item.source.trim() &&
              item.target.trim()
          )
          .map((item, idx) => ({
            id: typeof item.id === 'string' ? item.id : `gls_imp_${Date.now()}_${idx}`,
            source: item.source.trim(),
            target: item.target.trim(),
            note: typeof item.note === 'string' ? item.note.trim() : '',
            caseSensitive: Boolean(item.caseSensitive),
            enabled: item.enabled !== false,
            createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
          }));

        if (valid.length === 0) {
          setImportFeedback('未在文件中发现有效词汇条目。');
          return;
        }
        onChangeGlossary([...valid, ...glossary]);
        setImportFeedback(`已成功导入 ${valid.length} 条专属词汇。`);
      } catch {
        setImportFeedback('导入失败：无法解析 JSON 文件。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">专属词汇表</h1>
          <p className="text-sm text-[#475569] mt-1">
            锁定公司专有零部件名称、工艺缺陷术语或客户简称，翻译与润色时将严格遵循此处设定。
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#64748B] tabular-nums">
          <span>共 {glossary.length} 条</span>
          <span aria-hidden="true">·</span>
          <span>已启用 {enabledCount} 条</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-[#475569] hover:text-[#0F172A] font-medium whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>导出 JSON</span>
          </button>
          <label className="inline-flex items-center gap-1.5 text-[#475569] hover:text-[#0F172A] font-medium cursor-pointer whitespace-nowrap shrink-0">
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>导入</span>
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {importFeedback && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-[#1E40AF]">
          <span>{importFeedback}</span>
          <button
            type="button"
            onClick={() => setImportFeedback(null)}
            className="font-medium underline ml-4 shrink-0"
          >
            关闭
          </button>
        </div>
      )}

      {/* Automotive Parts Manufacturing Terminology Packs */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
          <div className="text-sm font-semibold text-[#0F172A]">
            汽车零部件制造业 · 按产品与工艺一键导入常用词汇包
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AUTOMOTIVE_GLOSSARY_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex flex-col justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#0F172A]">
                  {pack.name}
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {pack.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748B] tabular-nums">
                  {pack.entries.length} 条术语
                </span>
                <button
                  type="button"
                  onClick={() => handleImportAutomotivePack(pack)}
                  className="px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:text-white bg-white hover:bg-[#2563EB] border border-[#BFDBFE] rounded-md transition-colors whitespace-nowrap"
                >
                  导入词汇包
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add new glossary entry */}
      <form
        onSubmit={handleAddEntry}
        className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4"
      >
        <div className="text-sm font-semibold text-[#0F172A]">新增术语映射</div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              原文词汇 / 概念
            </label>
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="例如：拉通、周报、Q3预算"
              className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              指定英文译法
            </label>
            <input
              type="text"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="例如：sync up / weekly status report"
              className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              备注（可选）
            </label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="适用场景或禁用说明"
              className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>添加词汇</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-[#475569] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newCaseSensitive}
              onChange={(e) => setNewCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>严格区分英文大小写（适用于品牌缩写、项目代号等）</span>
          </label>
          {formError && <span className="text-xs text-[#BE123C]">{formError}</span>}
        </div>
      </form>

      {/* Search and Glossary Data Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索原文、英文译法或备注..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
            />
          </div>
          <span className="text-xs text-[#64748B] tabular-nums">
            显示 {filteredEntries.length} / {glossary.length} 条
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-2">
            <p className="text-sm font-medium text-[#0F172A]">
              {glossary.length === 0 ? '尚未添加专属词汇' : '未找到匹配的词汇条目'}
            </p>
            <p className="text-xs text-[#64748B]">
              {glossary.length === 0
                ? '您可以在上方表单添加常用部门术语或固定项目英文名，保存后即时生效。'
                : '请尝试更换搜索关键词或清空搜索框。'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#475569]">
                  <th className="py-2.5 px-5 w-20">启用</th>
                  <th className="py-2.5 px-4">原文词汇</th>
                  <th className="py-2.5 px-4">指定英文译法</th>
                  <th className="py-2.5 px-4">规则说明</th>
                  <th className="py-2.5 px-5 text-right w-20">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${
                      !entry.enabled ? 'opacity-55' : ''
                    }`}
                  >
                    <td className="py-2.5 px-5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={entry.enabled}
                        onClick={() => handleToggleEnabled(entry.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          entry.enabled ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            entry.enabled ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#0F172A]">
                      {entry.source}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[13px] text-[#1D4ED8]">
                      {entry.target}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-[#64748B]">
                      <span>{entry.note || '—'}</span>
                      {entry.caseSensitive && (
                        <>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-[#475569]">区分大小写</span>
                        </>
                      )}
                    </td>
                    <td className="py-2.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-[#64748B] hover:text-[#BE123C] rounded-md transition-colors"
                        title="删除词汇"
                        aria-label={`删除 ${entry.source}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
