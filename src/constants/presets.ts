import {
  AutomotiveProcessFocus,
  AutomotiveProductLine,
  AutomotiveProfile,
  GlossaryEntry,
  PreferenceSettings,
  PreferenceTemplate,
  ScenarioId,
  TranslationMode,
  VocabularyTier,
} from '../types/translation';

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  englishLabel: string;
  description: string;
  guidance: string;
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'daily_spoken',
    label: '日常口语',
    shortLabel: '日常口语',
    englishLabel: 'Daily Spoken',
    description: '自然流畅的口语对话，避免生硬书面腔',
    guidance:
      'Conversational, natural spoken English suitable for 1:1 chats, shop-floor catch-ups, or voice calls. Use natural contractions and warm everyday phrasing without sounding overly formal.',
  },
  {
    id: 'teams_chat',
    label: 'Teams / 即时聊天',
    shortLabel: 'Teams 聊天',
    englishLabel: 'Teams / Slack Chat',
    description: '简短清晰、重点前置，适合同事高频协同',
    guidance:
      'Crisp, scannable instant-messaging style for Microsoft Teams or Slack. Keep sentences concise, friendly, and action-oriented without unnecessary email salutations or sign-offs.',
  },
  {
    id: 'standard_email',
    label: '常规邮件回复',
    shortLabel: '常规邮件',
    englishLabel: 'Standard Email',
    description: '礼貌得体、结构清楚，适合日常跨团队邮件',
    guidance:
      'Polite, clear everyday business email tone. Well-structured paragraphs, respectful requests, and practical clarity suitable for colleagues, suppliers, and routine OEM/Tier-1 follow-ups.',
  },
  {
    id: 'formal_email',
    label: '正式邮件回复',
    shortLabel: '正式邮件',
    englishLabel: 'Formal Executive Email',
    description: '严谨庄重、措辞考究，适合对外客户与高层汇报',
    guidance:
      'Formal, polished executive correspondence suitable for senior leadership, external OEM customers, quality escalations, or official notices. Avoid casual slang and maintain composed diplomacy.',
  },
  {
    id: 'meeting_update',
    label: '会议纪要与汇报',
    shortLabel: '会议汇报',
    englishLabel: 'Meeting & Status Update',
    description: '条理分明、突出结论与行动项，便于异步同步',
    guidance:
      'Structured status update or meeting summary format. Organize fragmented thoughts into clean logic, highlight decisions or blockers clearly without inventing missing owners or dates.',
  },
  {
    id: 'tech_sync',
    label: '技术协作沟通',
    shortLabel: '技术沟通',
    englishLabel: 'Technical Collaboration',
    description: '保留技术名词准确度，清晰说明排查进展与需求',
    guidance:
      'Accurate engineering and manufacturing collaboration register. Preserve technical identifiers, part numbers, GD&T/process terms, and exact constraints with zero ambiguity.',
  },
  {
    id: 'ppt_presentation',
    label: 'PPT 汇报',
    shortLabel: 'PPT 汇报',
    englishLabel: 'Slide Deck & PPT Report',
    description: '精炼上屏要点、平行句式与标题动宾结构，适配幻灯片排版',
    guidance:
      'Concise, high-impact presentation slide copy (PowerPoint / Keynote). Favor parallel bullet phrasing, crisp noun or action-verb lead-ins, scannable slide headlines, and minimal filler words so text fits cleanly on slides without inventing unstated metrics or conclusions.',
  },
  {
    id: 'speech_keynote',
    label: '演讲表达',
    shortLabel: '演讲',
    englishLabel: 'Speech & Keynote Delivery',
    description: '兼顾口语节奏感与听众视角，自然流畅、朗朗上口',
    guidance:
      'Natural, engaging spoken delivery tailored for speeches, town halls, or executive/customer presentations. Use rhythmic cadence, clear spoken transitions, and accessible phrasing that sounds effortless when read aloud, while staying strictly faithful to the speaker’s original facts.',
  },
  {
    id: 'app_ui_copy',
    label: 'APP 开发文案',
    shortLabel: 'APP 开发文案',
    englishLabel: 'APP UI Copy & Microcopy',
    description: '特指 APP 界面按钮、弹窗提示、引导语与状态文本的地道润色',
    guidance:
      'Concise, idiomatic software & mobile/web APP UI text (button labels, navigation titles, empty states, confirmation dialogs, error alerts, tooltips, onboarding copy). Prioritize brevity, action-oriented consistency, and standard UX microcopy conventions; preserve any code variables or placeholders (e.g., {name}, %s, {{count}}) verbatim.',
  },
];

export interface VocabularyTierDefinition {
  id: VocabularyTier;
  label: string;
  shortLabel: string;
  englishLabel: string;
  description: string;
  guidance: string;
}

export const VOCABULARY_TIERS: VocabularyTierDefinition[] = [
  {
    id: 'simple',
    label: '简单用词',
    shortLabel: '简单',
    englishLabel: 'Simple & Clear',
    description: '高频基础词汇，短句直白，零理解门槛',
    guidance:
      'Use common, high-frequency everyday English words (CEFR A2-B1 level). Prefer short, direct sentences and clear verbs (e.g., "check", "send", "help", "fix") while preserving exact required technical nouns.',
  },
  {
    id: 'moderate',
    label: '中等商务',
    shortLabel: '中等',
    englishLabel: 'Standard Business',
    description: '地道标准职场词汇，专业自然且不晦涩',
    guidance:
      'Use standard professional workplace vocabulary (CEFR B2-C1 level). Natural idioms and clear business phrasing (e.g., "follow up", "align on", "share an update", "look into").',
  },
  {
    id: 'advanced',
    label: '高等精炼',
    shortLabel: '高等',
    englishLabel: 'Executive & Refined',
    description: '高阶精准词汇与凝练句式，凸显专业深度',
    guidance:
      'Use sophisticated, nuanced executive vocabulary and crisp syntactic variety (CEFR C1-C2 level), such as "expedite", "mitigate", "reconcile", "corroborate", while staying natural and never pompous.',
  },
];

export interface AutomotiveOption<T extends string> {
  id: T;
  label: string;
  englishLabel: string;
  guidance: string;
}

export const AUTOMOTIVE_PRODUCT_LINES: AutomotiveOption<AutomotiveProductLine>[] = [
  {
    id: 'general_parts',
    label: '通用汽车零部件',
    englishLabel: 'General Automotive Components',
    guidance:
      'Use standard Tier-1/Tier-2 automotive parts terminology (BOM, part number/PN, engineering change/ECN, tooling, sub-assembly, OEM requirement).',
  },
  {
    id: 'powertrain_edrive',
    label: '动力总成与电驱系统',
    englishLabel: 'Powertrain & E-Drive Systems',
    guidance:
      'Prefer domain-accurate powertrain/e-drive terms: motor housing, stator/rotor, reducer/gearbox, inverter housing, shaft/gear teeth, NVH, torque, oil seal, end cover.',
  },
  {
    id: 'battery_thermal',
    label: '动力电池包与热管理',
    englishLabel: 'Battery Pack & Thermal Management',
    guidance:
      'Prefer battery & thermal management terms: battery tray/enclosure, liquid cooling plate, busbar, thermal interface material (TIM), chiller, manifold, valve body, IP67/leak-tightness.',
  },
  {
    id: 'chassis_braking',
    label: '底盘、转向与制动件',
    englishLabel: 'Chassis, Steering & Braking',
    guidance:
      'Prefer chassis/braking terms: subframe, control arm, steering knuckle, brake caliper, rotor/disc, bushing, ball joint, fatigue durability, salt spray resistance.',
  },
  {
    id: 'body_structural',
    label: '车身结构与一体化压铸件',
    englishLabel: 'Body-in-White & Structural Castings',
    guidance:
      'Prefer BIW/structural terms: crash beam, shock tower, front/rear floor mega-casting, A/B-pillar reinforcement, dimensional stability, CMM inspection, datum points.',
  },
  {
    id: 'interior_exterior',
    label: '汽车内外饰件',
    englishLabel: 'Interior & Exterior Trim',
    guidance:
      'Prefer interior/exterior trim terms: instrument panel (IP), door trim panel, bumper fascia, grille, surface grain/texture, gloss level, color match (Delta-E), clip/snap-fit.',
  },
  {
    id: 'electronics_harness',
    label: '汽车电子、传感器与线束',
    englishLabel: 'Automotive Electronics & Harness',
    guidance:
      'Prefer automotive electronics/harness terms: ECU housing, PCBA, connector/terminal, wiring harness, potting/conformal coating, pin retention, EMC/EMI, EOL electrical test.',
  },
];

export const AUTOMOTIVE_PROCESSES: AutomotiveOption<AutomotiveProcessFocus>[] = [
  {
    id: 'general_mfg',
    label: '全流程制造与通用工艺',
    englishLabel: 'General Manufacturing & Operations',
    guidance:
      'Use standard automotive plant vocabulary: cycle time, takt time, changeover, OEE, bottleneck, scrap rate, rework, WIP, line-side stock, preventive maintenance (PM).',
  },
  {
    id: 'die_casting',
    label: '压铸与铸造工艺',
    englishLabel: 'High-Pressure Die Casting (HPDC) & Foundry',
    guidance:
      'Use authentic die-casting terms: HPDC, molten alloy, shot sleeve, plunger tip, die temperature, gate/runner/overflow, vacuum valve, flash, porosity, shrinkage, cold shut, soldering, trim die, X-ray inspection.',
  },
  {
    id: 'stamping',
    label: '冲压与钣金成型',
    englishLabel: 'Stamping & Sheet Metal Forming',
    guidance:
      'Use authentic stamping terms: progressive die, transfer die, blanking, deep drawing, springback, burr, wrinkle, split/crack, coil feeding, press tonnage, die clearance.',
  },
  {
    id: 'injection_molding',
    label: '注塑与高分子成型',
    englishLabel: 'Plastic Injection Molding',
    guidance:
      'Use authentic injection molding terms: cavity/core, hot runner, gate vestige, short shot, flash, sink mark, warpage, weld line, splay/silver streak, clamp force, resin drying, mold flow.',
  },
  {
    id: 'cnc_machining',
    label: 'CNC 精密机加工',
    englishLabel: 'CNC Precision Machining',
    guidance:
      'Use authentic CNC machining terms: fixture/jig, datum A/B/C, GD&T, flatness, perpendicularity, concentricity, runout, thread gauge (GO/NO-GO), tool wear, tool offset, spindle load, coolant, chip removal.',
  },
  {
    id: 'welding_joining',
    label: '焊接与机械连接工艺',
    englishLabel: 'Welding & Joining (Laser/Spot/MIG/SPR)',
    guidance:
      'Use authentic welding/joining terms: resistance spot welding (RSW), laser welding, MIG/TIG, friction stir welding (FSW), SPR/FDS, weld penetration, spatter, undercut, burn-through, nugget diameter, peel/destructive test.',
  },
  {
    id: 'surface_coating',
    label: '表面处理、电泳与喷涂',
    englishLabel: 'Surface Treatment, E-Coat & Coating',
    guidance:
      'Use authentic surface treatment terms: anodizing, passivation, e-coat (ED coating), powder coating, pretreatment, film thickness, adhesion (cross-hatch test), orange peel, pinholes, masking.',
  },
  {
    id: 'assembly_eol',
    label: '总装与下线检测 (EOL)',
    englishLabel: 'Final Assembly & EOL Testing',
    guidance:
      'Use authentic assembly/EOL terms: torque-to-angle, press-fit, Poka-Yoke (error-proofing), vision inspection, air-tightness/helium leak test, EOL test bench, traceability barcode/QR, golden sample.',
  },
  {
    id: 'quality_apqp',
    label: '质量体系 (IATF / PPAP / 8D)',
    englishLabel: 'Automotive Quality & Launch (IATF 16949 / APQP / PPAP / 8D)',
    guidance:
      'Use authentic automotive quality & launch terms: APQP, PPAP (Level 3), PSW, PFMEA, Control Plan, MSA, Cpk/Ppk, 8D report, containment action (ICA), root cause analysis (RCA), permanent corrective action (PCA), OTS, PTR, SOP, ramp-up, deviation/concession.',
  },
];

export const DEFAULT_AUTOMOTIVE_PROFILE: AutomotiveProfile = {
  industryMode: 'automotive_parts',
  productLine: 'general_parts',
  processFocus: 'general_mfg',
  customProductProcess: '',
};

export const DEFAULT_PREFERENCES: PreferenceSettings = {
  spelling: 'US',
  conciseness: 'balanced',
  toneWarmth: 'warm',
  emailFraming: 'auto',
  preserveLineBreaks: true,
  customInstruction: '',
  automotiveProfile: { ...DEFAULT_AUTOMOTIVE_PROFILE },
};

export const DEFAULT_TEMPLATES: PreferenceTemplate[] = [
  {
    id: 'tpl_auto_mfg_balanced',
    name: '汽车制造 · 工艺与质量通用',
    description: '汽车零部件制造业 · 美式拼写 · 精准表达工艺与质量协同',
    settings: { ...DEFAULT_PREFERENCES },
    isDefault: true,
    updatedAt: 1730000000000,
  },
  {
    id: 'tpl_auto_quality_8d',
    name: 'OEM 客户质量沟通 (PPAP / 8D)',
    description: '质量体系与量产交付 · 严谨外交语气 · 自动规范邮件格式',
    settings: {
      spelling: 'US',
      conciseness: 'detailed',
      toneWarmth: 'diplomatic',
      emailFraming: 'always',
      preserveLineBreaks: true,
      customInstruction:
        'Use standard IATF 16949 / OEM supplier quality terminology; keep accountability clear without over-promising unconfirmed dates.',
      automotiveProfile: {
        industryMode: 'automotive_parts',
        productLine: 'general_parts',
        processFocus: 'quality_apqp',
        customProductProcess: '',
      },
    },
    updatedAt: 1730000000000,
  },
  {
    id: 'tpl_teams_fast',
    name: 'Teams 产线与工程速通',
    description: '精简直给 · 直接客观 · 不加邮件称呼落款',
    settings: {
      spelling: 'US',
      conciseness: 'concise',
      toneWarmth: 'direct',
      emailFraming: 'never',
      preserveLineBreaks: true,
      customInstruction:
        'Keep it crisp and scannable for instant messaging; lead with the part/process issue, status, or ask.',
      automotiveProfile: { ...DEFAULT_AUTOMOTIVE_PROFILE },
    },
    updatedAt: 1730000000000,
  },
  {
    id: 'tpl_general_office',
    name: '通用办公交流（非行业限定）',
    description: '日常跨部门行政与通用办公 · 均衡自然',
    settings: {
      spelling: 'US',
      conciseness: 'balanced',
      toneWarmth: 'warm',
      emailFraming: 'auto',
      preserveLineBreaks: true,
      customInstruction: '',
      automotiveProfile: {
        industryMode: 'general',
        productLine: 'general_parts',
        processFocus: 'general_mfg',
        customProductProcess: '',
      },
    },
    updatedAt: 1730000000000,
  },
];

export interface AutomotiveGlossaryPack {
  id: string;
  name: string;
  description: string;
  entries: Omit<GlossaryEntry, 'id' | 'createdAt' | 'enabled'>[];
}

export const AUTOMOTIVE_GLOSSARY_PACKS: AutomotiveGlossaryPack[] = [
  {
    id: 'pack_diecast_cnc',
    name: '压铸与 CNC 机加工工艺包',
    description: '适用于铝合金压铸壳体、精密机加、基准与气密检验',
    entries: [
      { source: '毛刺/飞边', target: 'burr / flash', caseSensitive: false, note: '压铸或机加工边缘余料' },
      { source: '气孔/缩孔', target: 'porosity / shrinkage cavity', caseSensitive: false, note: '压铸内部铸造缺陷' },
      { source: '冷隔', target: 'cold shut', caseSensitive: false, note: '压铸金属液融合不良缺陷' },
      { source: '脱模剂', target: 'die release agent', caseSensitive: false, note: '压铸喷涂耗材' },
      { source: '基准面', target: 'datum surface', caseSensitive: false, note: 'GD&T 机加工定位基准' },
      { source: '跳动/同轴度', target: 'runout / concentricity', caseSensitive: false, note: '形位公差检测项' },
      { source: '夹具/检具', target: 'fixture / checking gauge', caseSensitive: false, note: '机加装夹与现场检测工具' },
      { source: '通止规', target: 'GO/NO-GO gauge', caseSensitive: false, note: '螺纹或孔径现场量具' },
    ],
  },
  {
    id: 'pack_stamping_molding_weld',
    name: '冲压、注塑与焊接工艺包',
    description: '适用于模具成型、钣金件、塑料内外饰及车身连接工艺',
    entries: [
      { source: '模具', target: 'tooling / die / mold', caseSensitive: false, note: '冲压多用 die，注塑常用 mold，统称 tooling' },
      { source: '回弹', target: 'springback', caseSensitive: false, note: '冲压件卸载后弹性恢复变形' },
      { source: '缩水/凹痕', target: 'sink mark', caseSensitive: false, note: '注塑厚壁处表面凹陷' },
      { source: '熔接痕', target: 'weld line / knit line', caseSensitive: false, note: '注塑熔体合流痕迹' },
      { source: '虚焊/假焊', target: 'cold weld / incomplete fusion', caseSensitive: false, note: '焊接熔合不充分' },
      { source: '焊穿', target: 'burn-through', caseSensitive: false, note: '焊接热输入过大穿孔' },
      { source: '熔深', target: 'weld penetration', caseSensitive: false, note: '激光焊/弧焊剖面检验指标' },
      { source: '防错', target: 'Poka-Yoke', caseSensitive: true, note: '产线防呆防错装置' },
    ],
  },
  {
    id: 'pack_quality_ppap',
    name: '汽车质量与量产交付 (IATF / PPAP / 8D)',
    description: '适用于客户审核、量产爬坡、异常处理及工程变更沟通',
    entries: [
      { source: '围堵措施', target: 'containment action', caseSensitive: false, note: '8D 第3步临时遏制措施' },
      { source: '根本原因', target: 'root cause', caseSensitive: false, note: '8D 第4步问题根因' },
      { source: '长期纠正措施', target: 'permanent corrective action (PCA)', caseSensitive: false, note: '8D 第5-6步永久措施' },
      { source: '让步接收', target: 'deviation / concession', caseSensitive: false, note: '超差件客户特采放行' },
      { source: '批产爬坡', target: 'ramp-up', caseSensitive: false, note: 'SOP 后产能爬升阶段' },
      { source: '试生产', target: 'pilot run / PTR', caseSensitive: false, note: '量产前小批量试制' },
      { source: '报废率', target: 'scrap rate', caseSensitive: false, note: '产线质量损失核心指标' },
      { source: '生产节拍', target: 'cycle time', caseSensitive: false, note: '单件制造周期时间' },
    ],
  },
  {
    id: 'pack_ev_chassis_parts',
    name: '电驱、电池包与底盘零件包',
    description: '适用于新能源三电结构件、热管理及底盘制动产品',
    entries: [
      { source: '电机壳体', target: 'motor housing', caseSensitive: false, note: '电驱动总成外壳' },
      { source: '液冷板', target: 'liquid cooling plate', caseSensitive: false, note: '动力电池热管理核心件' },
      { source: '电池托盘', target: 'battery tray', caseSensitive: false, note: '电池包下箱体结构件' },
      { source: '副车架', target: 'subframe', caseSensitive: false, note: '底盘承载结构总成' },
      { source: '转向节', target: 'steering knuckle', caseSensitive: false, note: '底盘转向关键安全件' },
      { source: '气密性测试', target: 'air-tightness / leak test', caseSensitive: false, note: '壳体与流道密封测试' },
      { source: '下线测试', target: 'EOL (End-of-Line) test', caseSensitive: false, note: '总成装配末端全检' },
    ],
  },
];

export const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'gls_1',
    source: '对齐',
    target: 'align on',
    caseSensitive: false,
    note: '职场高频协作表达，避免直译成 align with 造成生硬感',
    enabled: true,
    createdAt: 1730000000000,
  },
  {
    id: 'gls_2',
    source: '拉通',
    target: 'sync up',
    caseSensitive: false,
    note: '用于跨团队沟通同步进展',
    enabled: true,
    createdAt: 1730000000000,
  },
  {
    id: 'gls_3',
    source: '围堵措施',
    target: 'containment action',
    caseSensitive: false,
    note: '汽车行业质量异常处理 / 8D 报告标准术语',
    enabled: true,
    createdAt: 1730000000000,
  },
  {
    id: 'gls_4',
    source: '节拍',
    target: 'cycle time',
    caseSensitive: false,
    note: '制造工位或设备单件加工周期',
    enabled: true,
    createdAt: 1730000000000,
  },
];

export interface SamplePromptItem {
  id: string;
  label: string;
  mode: TranslationMode;
  scenario: ScenarioId;
  vocabularyTier: VocabularyTier;
  text: string;
}

export const SAMPLE_PROMPTS: SamplePromptItem[] = [
  {
    id: 'sample_auto_quality',
    label: '汽车质量 8D 围堵沟通',
    mode: 'zh-to-en',
    scenario: 'standard_email',
    vocabularyTier: 'moderate',
    text: '客户反馈昨天那批电驱壳体 CNC 加工后基准面有毛刺，气密测试过了但外观不行，先通知现场全检围堵一下，周五前给他们发个 8D 初步报告',
  },
  {
    id: 'sample_mixed_mfg',
    label: '中英混杂压铸试产同步',
    mode: 'mixed-or-en-polish',
    scenario: 'teams_chat',
    vocabularyTier: 'moderate',
    text: 'Hi David，2号压铸机那个电池托盘试模刚才有轻微 porosity，engineering team 这周在调真空和模温，大概周五前给新的试产样件，btw 先别发运这批料',
  },
  {
    id: 'sample_en_rough',
    label: '纯英口语草稿润色',
    mode: 'mixed-or-en-polish',
    scenario: 'formal_email',
    vocabularyTier: 'advanced',
    text: 'Sorry late reply, we check the PPAP doc already, some Cpk number looks weird in station 3, maybe we talk tomorrow morning 10am to double confirm? Let me know if ok.',
  },
];
