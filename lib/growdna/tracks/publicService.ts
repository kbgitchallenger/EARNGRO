import type { Question } from '../questions'

// ── Public Service — Mid-level ──────────────────────────────────────

export const MODULE_B_PUBLIC_MID: Question[] = [
  {
    id: 'service_category',
    module: 'B',
    type: 'mcq',
    title: 'Which category best describes your role?',
    subtitle: 'Pay scales and growth paths differ significantly across government/public roles.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'civil_service_cadre', label: 'Civil services (IAS/IPS/IFS/state cadre)', icon: '🏛️', sublabel: 'Structured pay-grade progression', score: 7 },
      { value: 'psu_executive',       label: 'PSU executive / officer cadre',             icon: '🏢', sublabel: 'Corporate-adjacent PSU pay',        score: 6 },
      { value: 'education_faculty',   label: 'Government school/college faculty',         icon: '🎓', sublabel: 'Standardised pay scale',            score: 4 },
      { value: 'defence_officer',     label: 'Defence services officer',                  icon: '🛡️', sublabel: 'Structured rank-based pay',         score: 6 },
      { value: 'ngo_program',         label: 'NGO / development sector program role',      icon: '💚', sublabel: 'Grant/donor-funded pay bands',      score: 4 },
    ],
  },
  {
    id: 'grade_pay_level',
    module: 'B',
    type: 'mcq',
    title: 'What is your current grade/pay level relative to entry?',
    subtitle: 'Pay-grade progression is the structured equivalent of "promotion velocity" in public service careers.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'entry_grade',      label: 'Entry-level grade',                  icon: '🌱', score: 3  },
      { value: 'one_promotion',    label: 'One promotion/grade above entry',    icon: '📈', score: 6  },
      { value: 'two_plus_promotion', label: 'Two or more promotions above entry', icon: '🚀', score: 9 },
      { value: 'fast_track_exam',  label: 'Fast-tracked via competitive exam/merit', icon: '🏆', score: 9 },
    ],
  },
  {
    id: 'specialized_posting',
    module: 'B',
    type: 'multiselect',
    title: 'Have you held any specialized or high-responsibility postings?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'policy_drafting',  label: 'Policy drafting / legislative work', icon: '📋', score: 8 },
      { value: 'project_lead_govt', label: 'Led a major government project/scheme', icon: '🎯', score: 8 },
      { value: 'international_posting', label: 'International deputation/posting', icon: '🌍', score: 9 },
      { value: 'none_specialized',  label: 'Standard postings',                  icon: '—',  score: 3 },
    ],
  },
]

// ── Public Service — Senior ──────────────────────────────────────────

export const MODULE_B_PUBLIC_SENIOR: Question[] = [
  {
    id: 'senior_admin_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is the administrative scope of your current posting?',
    subtitle: 'Scope of jurisdiction or institutional authority is the senior-level equivalent of org scale.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'district_unit',   label: 'District / single-unit authority', icon: '🏢', score: 6  },
      { value: 'state_department', label: 'State department head',           icon: '🏛️', score: 8  },
      { value: 'national_secretariat', label: 'National secretariat / ministry-level', icon: '🚀', score: 10 },
      { value: 'psu_cxo',          label: 'CXO-equivalent at major PSU',      icon: '🏭', score: 9  },
    ],
  },
  {
    id: 'policy_influence',
    module: 'B',
    type: 'mcq',
    title: 'What level of policy or institutional influence do you hold?',
    subtitle: 'Policy influence is the public-service equivalent of strategic scope in corporate senior roles.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'implements_policy', label: 'Implement policy set by others', icon: '✅', score: 5  },
      { value: 'shapes_policy',     label: 'Shape policy within my department', icon: '📊', score: 8 },
      { value: 'national_policy',   label: 'Influence national-level policy',  icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'public_visibility',
    module: 'B',
    type: 'multiselect',
    title: 'What is your public and institutional visibility?',
    subtitle: 'Select all that apply — relevant for post-retirement advisory and board opportunities.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'media_spokesperson', label: 'Media spokesperson for department/scheme', icon: '📰', score: 7 },
      { value: 'committee_member',   label: 'Member of national/state committees',        icon: '🏛️', score: 8 },
      { value: 'international_rep',  label: 'Represented India at international forums',  icon: '🌍', score: 9 },
      { value: 'none_public',        label: 'Low external visibility',                    icon: '—',  score: 3 },
    ],
  },
]