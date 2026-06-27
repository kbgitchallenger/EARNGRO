import type { Question } from '../questions'

// ── Design & Creative — Mid-level ─────────────────────────────────────

export const MODULE_B_DESIGN_MID: Question[] = [
  {
    id: 'design_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your design specialization?',
    subtitle: 'Specialization is a major driver of design compensation right now.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'product_ux',     label: 'Product / UX Design',              icon: '🎯', sublabel: 'Highest-demand specialisation', score: 9 },
      { value: 'design_systems', label: 'Design Systems / Design Ops',       icon: '🛠️', score: 8 },
      { value: 'design_research', label: 'Design Research / UX Research',   icon: '🔬', score: 8 },
      { value: 'motion_3d',      label: 'Motion / 3D / Specialized visual',  icon: '🎬', score: 7 },
      { value: 'visual_brand',   label: 'Visual / Brand Design',             icon: '🎨', score: 6 },
    ],
  },
  {
    id: 'design_portfolio_evidence',
    module: 'B',
    type: 'mcq',
    title: 'Do you have a strong, evidenced portfolio of shipped work?',
    subtitle: 'Quantified portfolio impact is the single strongest signal recruiters screen for.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'strong_portfolio_metrics', label: 'Yes — portfolio with measured impact (conversion, engagement, etc.)', icon: '📈', score: 9 },
      { value: 'strong_portfolio_no_metrics', label: 'Yes — strong portfolio, impact not quantified', icon: '🎨', score: 6 },
      { value: 'decent_portfolio',         label: 'Decent portfolio, limited scale of work',           icon: '📋', score: 4 },
      { value: 'early_career_design',      label: 'Still building portfolio',                          icon: '🌱', score: 2 },
    ],
  },
  {
    id: 'design_scope_tooling',
    module: 'B',
    type: 'multiselect',
    title: 'What is the scope and tooling of your design work?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'end_to_end_ownership', label: 'Own design end-to-end (research to shipping)', icon: '🔄', score: 8 },
      { value: 'cross_platform',       label: 'Design across multiple platforms (web, mobile, etc.)', icon: '📱', score: 7 },
      { value: 'design_systems_built', label: 'Built / maintained a design system',          icon: '🛠️', score: 8 },
      { value: 'ai_design_tools',      label: 'Use AI-powered design tools fluently',         icon: '🤖', score: 6 },
      { value: 'none_scope_design',    label: 'Single-platform, narrow scope',                icon: '—',  score: 3 },
    ],
  },
]

// ── Design & Creative — Senior ─────────────────────────────────────────

export const MODULE_B_DESIGN_SENIOR: Question[] = [
  {
    id: 'design_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior design leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior design compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'head_of_design',    label: 'Head of Design / VP Design for organisation', icon: '🚀', score: 10 },
      { value: 'design_director',   label: 'Design Director for a product line/BU',       icon: '🏢', score: 8  },
      { value: 'principal_design',  label: 'Principal / Staff Designer (IC track)',        icon: '🎯', sublabel: 'No direct reports', score: 7 },
      { value: 'senior_design_lead', label: 'Senior design lead, small team',               icon: '👤', score: 6 },
    ],
  },
  {
    id: 'design_org_scale',
    module: 'B',
    type: 'mcq',
    title: 'What scale of product or design organisation do you influence?',
    subtitle: 'Team scale is a strong senior design compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_design_org', label: 'Lead a design team of 15+',  icon: '🚀', score: 10 },
      { value: 'mid_design_org',   label: 'Lead a design team of 5-15', icon: '🏢', score: 7  },
      { value: 'small_design_team', label: 'Lead a team under 5',       icon: '👥', score: 5  },
      { value: 'no_team_design',   label: 'No direct design team leadership', icon: '👤', score: 4 },
    ],
  },
  {
    id: 'design_external_recognition',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external recognition?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'design_awards',         label: 'Won design awards (Awwwards, D&AD, etc.)', icon: '🏆', score: 8 },
      { value: 'speaker_design',         label: 'Speaker at design conferences',            icon: '🎤', score: 8 },
      { value: 'published_design_work',  label: 'Published design case studies / writing',  icon: '📝', score: 7 },
      { value: 'none_recognition_design', label: 'Limited external recognition',            icon: '—',  score: 3 },
    ],
  },
]