import type { Question } from '../questions'

// ── Marketing & Brand — Mid-level ────────────────────────────────────

export const MODULE_B_MARKETING_MID: Question[] = [
  {
    id: 'marketing_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your marketing specialization?',
    subtitle: 'Specialization is the biggest comp driver in marketing right now — far more than seniority alone.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'performance_growth',  label: 'Performance / Growth Marketing',  icon: '📈', sublabel: 'Direct revenue attribution — highest premium', score: 10 },
      { value: 'product_marketing',   label: 'Product Marketing',              icon: '🎯', sublabel: 'Cross-functional, GTM-critical',                score: 9  },
      { value: 'marketing_analytics', label: 'Marketing Analytics / MarTech',   icon: '📊', sublabel: 'Data-driven, growing premium',                  score: 9  },
      { value: 'brand_marketing',     label: 'Brand Marketing',                icon: '🎨', sublabel: 'Valued, harder to quantify',                     score: 6  },
      { value: 'content_social',      label: 'Content / Social / Community',   icon: '✍️', sublabel: 'Moderate, highly variable by company',          score: 5  },
      { value: 'other_marketing',     label: 'Other marketing function',       icon: '🔷', score: 5  },
    ],
  },
  {
    id: 'marketing_budget_scale',
    module: 'B',
    type: 'mcq',
    title: 'What budget or revenue impact are you directly accountable for?',
    subtitle: 'Budget and revenue ownership is the marketing equivalent of quota or P&L.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'large_budget',     label: 'Manage ₹1 Cr+ in annual marketing spend', icon: '💰', score: 9 },
      { value: 'mid_budget',       label: 'Manage ₹10L-1Cr in spend',                icon: '📊', score: 6 },
      { value: 'pipeline_influence', label: 'Directly influence pipeline/revenue',    icon: '🎯', sublabel: 'Not a spend owner', score: 7 },
      { value: 'small_budget',     label: 'Manage under ₹10L in spend',               icon: '🪙', score: 4 },
      { value: 'no_budget',        label: 'No direct budget ownership',               icon: '—',  score: 2 },
    ],
  },
  {
    id: 'campaign_scale_complexity',
    module: 'B',
    type: 'multiselect',
    title: 'What is the scale and complexity of campaigns you\'ve run?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'multi_market',      label: 'Multi-market / multi-geo campaigns',          icon: '🌍', score: 9 },
      { value: 'full_funnel',       label: 'Own full-funnel strategy (paid+organic+lifecycle)', icon: '🔄', score: 8 },
      { value: 'attribution_mmm',   label: 'Built attribution / MMM models',              icon: '📐', score: 9 },
      { value: 'product_launch',    label: 'Led major product launch campaigns',          icon: '🚀', score: 8 },
      { value: 'none_scale_mktg',   label: 'Primarily single-channel / local campaigns',   icon: '—',  score: 3 },
    ],
  },
]

// ── Marketing & Brand — Senior ───────────────────────────────────────

export const MODULE_B_MARKETING_SENIOR: Question[] = [
  {
    id: 'marketing_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior marketing leadership scope?',
    subtitle: 'Leadership scope is the strongest predictor of senior marketing compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'cmo_equivalent', label: 'CMO / Head of Marketing for the organisation', icon: '🚀', score: 10 },
      { value: 'category_head',  label: 'Category / BU marketing head',                icon: '🏢', score: 8  },
      { value: 'channel_head',   label: 'Head of a specific channel/function',          icon: '🎯', sublabel: 'e.g. performance, brand',  score: 7 },
      { value: 'senior_ic_mktg', label: 'Senior individual contributor, no team leadership', icon: '👤', score: 5 },
    ],
  },
  {
    id: 'marketing_pl_scale',
    module: 'B',
    type: 'mcq',
    title: 'What revenue or budget scale do you own?',
    subtitle: 'P&L/budget scale at senior marketing levels mirrors P&L ownership in general management.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_pl_mktg', label: 'Own marketing P&L of ₹10 Cr+',         icon: '💰', score: 10 },
      { value: 'mid_pl_mktg',   label: 'Own marketing budget ₹2-10 Cr',        icon: '📊', score: 7  },
      { value: 'influence_only_mktg', label: 'Influence revenue, don\'t own budget directly', icon: '🎯', score: 5 },
      { value: 'small_scale_mktg', label: 'Budget under ₹2 Cr',                icon: '🪙', score: 3 },
    ],
  },
  {
    id: 'marketing_external_recognition',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external recognition and influence?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'industry_awards_mktg',    label: 'Won industry marketing awards',          icon: '🏆', score: 8 },
      { value: 'speaker_mktg',             label: 'Speaker at marketing conferences',        icon: '🎤', score: 8 },
      { value: 'published_case_study',     label: 'Published case studies / thought leadership', icon: '📝', score: 7 },
      { value: 'agency_relationships',     label: 'Manage key agency/partner relationships strategically', icon: '🤝', score: 6 },
      { value: 'none_recognition_mktg',    label: 'Limited external recognition',            icon: '—',  score: 3 },
    ],
  },
]