import React, { useState } from 'react';
import { Check, Copy, Factory, Keyboard, Plus, Save, Trash2 } from 'lucide-react';
import {
  AUTOMOTIVE_PROCESSES,
  AUTOMOTIVE_PRODUCT_LINES,
  DEFAULT_AUTOMOTIVE_PROFILE,
} from '../constants/presets';
import {
  AutomotiveProcessFocus,
  AutomotiveProductLine,
  PreferenceSettings,
  PreferenceTemplate,
} from '../types/translation';

interface PreferencesViewProps {
  templates: PreferenceTemplate[];
  activeTemplateId: string;
  activePreferences: PreferenceSettings;
  onSelectTemplate: (templateId: string) => void;
  onUpdateActivePreferences: (prefs: PreferenceSettings) => void;
  onSaveTemplate: (template: PreferenceTemplate) => void;
  onCreateTemplate: (name: string, description: string, settings: PreferenceSettings) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  templates,
  activeTemplateId,
  activePreferences,
  onSelectTemplate,
  onUpdateActivePreferences,
  onSaveTemplate,
  onCreateTemplate,
  onDeleteTemplate,
}) => {
  const activeTemplate = templates.find((t) => t.id === activeTemplateId) ?? templates[0];
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const autoProfile = activePreferences.automotiveProfile ?? DEFAULT_AUTOMOTIVE_PROFILE;

  const isModifiedFromTemplate =
    JSON.stringify(activeTemplate?.settings) !== JSON.stringify(activePreferences);

  const handleSaveCurrentToTemplate = () => {
    if (!activeTemplate) return;
    onSaveTemplate({
      ...activeTemplate,
      settings: { ...activePreferences },
      updatedAt: Date.now(),
    });
    setSavedNotice(`已将当前参数更新至「${activeTemplate.name}」`);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTemplateName.trim();
    if (!name) return;
    onCreateTemplate(
      name,
      newTemplateDesc.trim() || '自定义办公翻译偏好模板',
      { ...activePreferences }
    );
    setNewTemplateName('');
    setNewTemplateDesc('');
    setShowCreateForm(false);
    setSavedNotice(`已创建并启用新模板「${name}」`);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const handleDuplicateActive = () => {
    if (!activeTemplate) return;
    const copyName = `${activeTemplate.name} 副本`;
    onCreateTemplate(copyName, activeTemplate.description, { ...activePreferences });
    setSavedNotice(`已另存为「${copyName}」`);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">自定义翻译偏好与模板</h1>
          <p className="text-sm text-[#475569] mt-1">
            配置汽车零部件产品/工艺专业用词偏好、英文拼写习惯、语气温度及补充指令，可保存为多套模板随时切换。
          </p>
        </div>

        {savedNotice && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-3 py-1.5 rounded-lg">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Saved Templates List */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F172A]">已保存模板</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>新建模板</span>
            </button>
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleCreateNew}
              className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2.5"
            >
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="模板名称，如：压铸车间工艺沟通"
                className="w-full px-2.5 py-1.5 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                required
              />
              <input
                type="text"
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                placeholder="简短说明（可选）"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-2.5 py-1 text-xs text-[#64748B] hover:text-[#0F172A]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md"
                >
                  保存当前配置为模板
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#E2E8F0]">
            {templates.map((tpl) => {
              const isSelected = tpl.id === activeTemplateId;
              return (
                <div
                  key={tpl.id}
                  className={`py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3 ${
                    isSelected ? '' : 'opacity-85'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl.id)}
                    className="text-left flex-1 group focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'text-[#2563EB]'
                            : 'text-[#0F172A] group-hover:text-[#2563EB]'
                        }`}
                      >
                        {tpl.name}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-medium text-[#2563EB]">
                          使用中
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>

                  {templates.length > 1 && !tpl.isDefault && (
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1 text-[#94A3B8] hover:text-[#BE123C] rounded"
                      title="删除模板"
                      aria-label={`删除模板 ${tpl.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Preference Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Automotive Parts Manufacturing Domain Focus Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold text-[#0F172A]">
                    行业与产品工艺词汇偏好
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    针对汽车零部件制造业定位到具体产品线与生产工艺，优先选用符合 OEM / Tier-1 习惯的专业词汇。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateActivePreferences({
                      ...activePreferences,
                      automotiveProfile: {
                        ...autoProfile,
                        industryMode: 'automotive_parts',
                      },
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    autoProfile.industryMode === 'automotive_parts'
                      ? 'bg-white text-[#2563EB] shadow-sm font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  汽车零部件制造业
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateActivePreferences({
                      ...activePreferences,
                      automotiveProfile: {
                        ...autoProfile,
                        industryMode: 'general',
                      },
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    autoProfile.industryMode === 'general'
                      ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  通用办公
                </button>
              </div>
            </div>

            {autoProfile.industryMode === 'automotive_parts' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="pref-product-line"
                      className="block text-xs font-semibold text-[#0F172A]"
                    >
                      产品 / 零部件方向
                    </label>
                    <select
                      id="pref-product-line"
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
                      className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                    >
                      {AUTOMOTIVE_PRODUCT_LINES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}（{item.englishLabel}）
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pref-process-focus"
                      className="block text-xs font-semibold text-[#0F172A]"
                    >
                      制造工艺 / 业务环节
                    </label>
                    <select
                      id="pref-process-focus"
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
                      className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                    >
                      {AUTOMOTIVE_PROCESSES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}（{item.englishLabel}）
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="pref-custom-part"
                    className="block text-xs font-semibold text-[#0F172A]"
                  >
                    精确定位具体产品或工艺工位（可选）
                  </label>
                  <input
                    id="pref-custom-part"
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
                    placeholder="例如：800V 碳化硅逆变器铝压铸壳体 · CNC 五轴精加工与氦检工位"
                    className="w-full px-3.5 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                  />
                  <p className="text-xs text-[#64748B]">
                    填写后，AI 会优先围绕该具体零件与工位上下文润色措辞，但绝不会在译文中擅自捏造原文未提及的尺寸或参数。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  当前生效参数 · {activeTemplate?.name}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  所有修改会即时自动保存至本地，立即作用于后续翻译与悬浮球。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDuplicateActive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>另存新模板</span>
                </button>
                {isModifiedFromTemplate && (
                  <button
                    type="button"
                    onClick={handleSaveCurrentToTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>覆盖保存到此模板</span>
                  </button>
                )}
              </div>
            </div>

            {/* Spelling Variant */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div>
                <div className="text-sm font-medium text-[#0F172A]">英文拼写规范</div>
                <p className="text-xs text-[#64748B] mt-0.5">控制单词拼写与惯用表达</p>
              </div>
              <div className="sm:col-span-2 flex gap-2 p-1 bg-[#F1F5F9] rounded-lg">
                {[
                  { id: 'US' as const, label: '美式英语 (US · organize)' },
                  { id: 'UK' as const, label: '英式英语 (UK · organise)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateActivePreferences({ ...activePreferences, spelling: opt.id })
                    }
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activePreferences.spelling === opt.id
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conciseness */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-4 border-t border-[#E2E8F0]">
              <div>
                <div className="text-sm font-medium text-[#0F172A]">篇幅与精简度</div>
                <p className="text-xs text-[#64748B] mt-0.5">决定输出句式的紧凑程度</p>
              </div>
              <div className="sm:col-span-2 flex gap-2 p-1 bg-[#F1F5F9] rounded-lg">
                {[
                  { id: 'concise' as const, label: '精简直给' },
                  { id: 'balanced' as const, label: '均衡自然' },
                  { id: 'detailed' as const, label: '过渡完整' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateActivePreferences({ ...activePreferences, conciseness: opt.id })
                    }
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activePreferences.conciseness === opt.id
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Warmth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-4 border-t border-[#E2E8F0]">
              <div>
                <div className="text-sm font-medium text-[#0F172A]">沟通语气温度</div>
                <p className="text-xs text-[#64748B] mt-0.5">影响请求、催办或拒绝对方时的措辞</p>
              </div>
              <div className="sm:col-span-2 flex gap-2 p-1 bg-[#F1F5F9] rounded-lg">
                {[
                  { id: 'direct' as const, label: '客观直接' },
                  { id: 'warm' as const, label: '友善合作' },
                  { id: 'diplomatic' as const, label: '委婉外交' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateActivePreferences({ ...activePreferences, toneWarmth: opt.id })
                    }
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activePreferences.toneWarmth === opt.id
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Framing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-4 border-t border-[#E2E8F0]">
              <div>
                <div className="text-sm font-medium text-[#0F172A]">邮件问候与落款</div>
                <p className="text-xs text-[#64748B] mt-0.5">控制是否自动包裹邮件开头与结尾</p>
              </div>
              <div className="sm:col-span-2 flex gap-2 p-1 bg-[#F1F5F9] rounded-lg">
                {[
                  { id: 'auto' as const, label: '按场景自动判断' },
                  { id: 'always' as const, label: '始终补全礼貌首尾' },
                  { id: 'never' as const, label: '仅输出正文' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateActivePreferences({ ...activePreferences, emailFraming: opt.id })
                    }
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activePreferences.emailFraming === opt.id
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preserve Line Breaks */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <div>
                <div className="text-sm font-medium text-[#0F172A]">保留分段与条理结构</div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  开启后尽量保留您输入时的换行段落或列表结构，便于阅读。
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={activePreferences.preserveLineBreaks}
                onClick={() =>
                  onUpdateActivePreferences({
                    ...activePreferences,
                    preserveLineBreaks: !activePreferences.preserveLineBreaks,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  activePreferences.preserveLineBreaks ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    activePreferences.preserveLineBreaks ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Custom Instruction */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <label className="block text-sm font-medium text-[#0F172A]">
                自定义补充偏好指令（高优先级）
              </label>
              <p className="text-xs text-[#64748B]">
                例如：多使用主动语态、避免使用过多感叹号、数字统一采用阿拉伯数字、邮件结尾统一写 Best regards 等。
              </p>
              <textarea
                rows={3}
                value={activePreferences.customInstruction}
                onChange={(e) =>
                  onUpdateActivePreferences({
                    ...activePreferences,
                    customInstruction: e.target.value,
                  })
                }
                placeholder="输入您的个性化翻译/润色偏好要求..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white resize-y"
              />
            </div>
          </div>

          {/* Shortcut Reference Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <Keyboard className="w-4 h-4 text-[#475569]" aria-hidden="true" />
              <span>快捷键速查</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <span className="text-[#475569]">执行翻译与润色</span>
                <kbd className="font-mono font-medium text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded">
                  Ctrl / ⌘ + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <span className="text-[#475569]">一键复制当前译文</span>
                <kbd className="font-mono font-medium text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded">
                  Ctrl / ⌘ + Shift + C
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <span className="text-[#475569]">开启 / 展开悬浮球速译</span>
                <kbd className="font-mono font-medium text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded">
                  Alt + Space / Ctrl+K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <span className="text-[#475569]">收起悬浮球展开窗</span>
                <kbd className="font-mono font-medium text-[#0F172A] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
