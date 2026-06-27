import type { Question } from '../questions'

// ── Finance & Accounting — Mid-level ─────────────────────────────────

export const MODULE_B_FINANCE_MID: Question[] = [
  {
    id: 'finance_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your finance specialization?',
    subtitle: 'Specialization within finance drives compensation more than years of experience alone.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'ib_corp_finance', label: 'Investment Banking / Corporate Finance', icon: '💼', sublabel: 'Highest-paying specialisation', score: 10 },
      { value: 'fpa',             label: 'FP&A (Financial Planning & Analysis)',    icon: '📊', score: 9  },
      { value: 'treasury',        label: 'Treasury / Risk Management',             icon: '🏦', score: 8  },
      { value: 'audit',           label: 'Audit (Internal / External)',            icon: '🔍', score: 6  },
      { value: 'controllership',  label: 'Controllership / Accounting',            icon: '📋', score: 6  },
      { value: 'taxation',        label: 'Taxation',                                icon: '📑', score: 6  },
    ],
  },
  {
    id: 'finance_deal_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of financial decisions or deals you\'re involved in?',
    subtitle: 'Deal/decision scale is the strongest signal for mid-level finance compensation.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'large_deals_fin', label: '₹100 Cr+ deals/decisions',                 icon: '🚀', score: 10 },
      { value: 'mid_deals_fin',   label: '₹10-100 Cr range',                         icon: '💼', score: 7  },
      { value: 'budget_ownership_fin', label: 'Own a departmental budget',           icon: '📊', score: 6  },
      { value: 'routine_ops_fin', label: 'Routine financial operations, no major deal exposure', icon: '—', score: 3 },
    ],
  },
  {
    id: 'finance_certifications',
    module: 'B',
    type: 'multiselect',
    title: 'Which finance credentials do you hold?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'ca_qualified',     label: 'CA (Chartered Accountant)',           icon: '🎓', score: 9 },
      { value: 'cfa',              label: 'CFA',                                  icon: '🎓', score: 9 },
      { value: 'mba_finance',      label: 'MBA with Finance specialisation',      icon: '🎓', score: 7 },
      { value: 'frm',              label: 'FRM (Financial Risk Manager)',         icon: '🎓', score: 8 },
      { value: 'none_finance_cert', label: 'No formal finance certification',     icon: '—',  score: 2 },
    ],
  },
]

// ── Finance & Accounting — Senior ────────────────────────────────────

export const MODULE_B_FINANCE_SENIOR: Question[] = [
  {
    id: 'finance_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior finance leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior finance compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'cfo_equivalent',   label: 'CFO / Finance Head for the organisation', icon: '🚀', score: 10 },
      { value: 'vp_finance',       label: 'VP / Director of Finance for a BU',       icon: '🏢', score: 8  },
      { value: 'specialized_head_fin', label: 'Head of a specialized function (Treasury, M&A, Tax)', icon: '🎯', score: 7 },
      { value: 'senior_ic_finance', label: 'Senior IC, no direct team leadership',   icon: '👤', score: 5 },
    ],
  },
  {
    id: 'finance_capital_scale',
    module: 'B',
    type: 'mcq',
    title: 'What scale of capital or deals have you led?',
    subtitle: 'Capital/deal scale at senior levels is the strongest compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'mega_deals',       label: 'Led deals / capital raises ₹500 Cr+', icon: '🚀', score: 10 },
      { value: 'large_deals_sr',   label: '₹50-500 Cr range',                     icon: '💼', score: 8  },
      { value: 'mid_deals_sr',     label: '₹10-50 Cr range',                      icon: '📊', score: 6  },
      { value: 'no_major_deals',   label: 'No major deal leadership',             icon: '—',  score: 3  },
    ],
  },
  {
    id: 'finance_board_exposure',
    module: 'B',
    type: 'multiselect',
    title: 'What is your board and investor exposure?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'board_reporting_fin', label: 'Regularly present to board / investors', icon: '📊', score: 8 },
      { value: 'ipo_ma_experience',   label: 'IPO / M&A transaction experience',       icon: '🚀', score: 9 },
      { value: 'rating_agency',       label: 'Manage rating agency / lender relationships', icon: '🏦', score: 7 },
      { value: 'none_board_fin',      label: 'No board-level exposure',                icon: '—',  score: 3 },
    ],
  },
]