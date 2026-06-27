import type { Question } from '../questions'

// ── Legal & Compliance — Mid-level ────────────────────────────────────

export const MODULE_B_LEGAL_MID: Question[] = [
  {
    id: 'legal_practice_setting',
    module: 'B',
    type: 'mcq',
    title: 'What is your practice setting?',
    subtitle: 'Law firm vs in-house is the single biggest comp driver in legal careers.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'top_tier_law_firm', label: 'Top-tier law firm',              icon: '🏆', sublabel: 'Highest billables/comp',  score: 10 },
      { value: 'mid_tier_law_firm', label: 'Mid-tier law firm',              icon: '⚖️', score: 7  },
      { value: 'inhouse_corporate', label: 'In-house counsel — large corporate', icon: '🏢', score: 8 },
      { value: 'inhouse_startup',   label: 'In-house counsel — startup/smaller company', icon: '🌱', score: 6 },
      { value: 'independent_practice_legal', label: 'Independent practice',  icon: '👤', score: 5 },
    ],
  },
  {
    id: 'pqe_years',
    module: 'B',
    type: 'mcq',
    title: 'What is your PQE (post-qualification experience)?',
    subtitle: 'PQE years are the legal profession\'s standard seniority metric — more precise than generic years of experience.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'pqe_2_4',  label: '2-4 years PQE',  icon: '📈', score: 5 },
      { value: 'pqe_5_7',  label: '5-7 years PQE',  icon: '⚡', score: 7 },
      { value: 'pqe_8_plus', label: '8+ years PQE', icon: '🎯', score: 9 },
    ],
  },
  {
    id: 'legal_deal_litigation_experience',
    module: 'B',
    type: 'multiselect',
    title: 'What deal or litigation experience do you have?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'large_ma_deals',       label: 'Large M&A / PE transactions',           icon: '🚀', score: 9 },
      { value: 'major_litigation',     label: 'Significant litigation/dispute matters', icon: '⚖️', score: 8 },
      { value: 'regulatory_specialist', label: 'Regulatory / compliance specialisation', icon: '📋', score: 8 },
      { value: 'contract_negotiation_legal', label: 'Lead complex contract negotiations', icon: '🤝', score: 7 },
      { value: 'none_specialized_legal', label: 'General practice, no major deals/cases yet', icon: '—', score: 3 },
    ],
  },
]

// ── Legal & Compliance — Senior ───────────────────────────────────────

export const MODULE_B_LEGAL_SENIOR: Question[] = [
  {
    id: 'legal_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior legal leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior legal compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'gc_equivalent',     label: 'General Counsel / Head of Legal', icon: '🚀', score: 10 },
      { value: 'partner_law_firm',  label: 'Partner at a law firm',           icon: '🏆', score: 10 },
      { value: 'deputy_gc',         label: 'Deputy GC / Associate Director',  icon: '🏢', score: 8  },
      { value: 'senior_counsel',    label: 'Senior Counsel, no broader leadership', icon: '👤', score: 6 },
    ],
  },
  {
    id: 'legal_org_scale_senior',
    module: 'B',
    type: 'mcq',
    title: 'What scale of legal function do you lead or are exposed to?',
    subtitle: 'Scale led is a strong senior legal compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_legal_team',  label: 'Lead a legal team of 10+',          icon: '🚀', score: 10 },
      { value: 'mid_legal_team',    label: 'Lead a legal team of 3-10',          icon: '🏢', score: 7  },
      { value: 'mega_deals_legal',  label: 'Lead on deals/matters worth ₹500 Cr+', icon: '💼', score: 9 },
      { value: 'small_legal_team',  label: 'Small team or solo senior practitioner', icon: '👤', score: 5 },
    ],
  },
  {
    id: 'legal_external_standing',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external professional standing?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'legal_rankings',       label: 'Ranked in legal directories (Chambers, Legal500)', icon: '🏆', score: 9 },
      { value: 'speaker_legal',         label: 'Speaker at legal/industry conferences',  icon: '🎤', score: 7 },
      { value: 'published_legal',       label: 'Published legal articles/commentary',     icon: '📝', score: 7 },
      { value: 'board_advisory_legal',  label: 'Board / advisory positions',              icon: '🤝', score: 8 },
      { value: 'none_standing_legal',   label: 'Limited external recognition',            icon: '—',  score: 3 },
    ],
  },
]