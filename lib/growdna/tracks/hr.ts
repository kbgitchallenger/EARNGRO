import type { Question } from '../questions'

// ── HR & People — Mid-level ───────────────────────────────────────────

export const MODULE_B_HR_MID: Question[] = [
  {
    id: 'hr_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your HR specialization?',
    subtitle: 'Specialization within HR is one of the strongest compensation differentiators.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'comp_benefits',      label: 'Compensation & Benefits',       icon: '💰', sublabel: 'Typically highest-paying HR specialisation', score: 9 },
      { value: 'hrbp',                label: 'HR Business Partner (HRBP)',    icon: '🤝', score: 8 },
      { value: 'talent_acquisition',  label: 'Talent Acquisition / Recruiting', icon: '🎯', score: 7 },
      { value: 'learning_development', label: 'Learning & Development',       icon: '🎓', score: 6 },
      { value: 'hr_operations',       label: 'HR Operations / HRIS',          icon: '⚙️', score: 6 },
      { value: 'generalist_hr',       label: 'HR Generalist',                 icon: '🤝', score: 5 },
    ],
  },
  {
    id: 'hr_org_scope',
    module: 'B',
    type: 'mcq',
    title: 'What scope of the organisation do you support?',
    subtitle: 'Scope of organisational coverage is a key compensation driver in HR roles.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'enterprise_scope_hr', label: 'Support entire organisation (500+ employees)', icon: '🏢', score: 9 },
      { value: 'large_bu_hr',         label: 'Support a large business unit (100-500)',       icon: '🏭', score: 7 },
      { value: 'small_bu_hr',         label: 'Support a small team/function (under 100)',     icon: '👥', score: 5 },
      { value: 'project_based_hr',    label: 'Project-based HR initiatives',                  icon: '📋', score: 5 },
    ],
  },
  {
    id: 'hr_strategic_initiatives',
    module: 'B',
    type: 'multiselect',
    title: 'Which strategic HR initiatives have you led?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'org_design',           label: 'Led organisational design / restructuring', icon: '🏗️', score: 9 },
      { value: 'comp_benchmarking',    label: 'Built compensation benchmarking / structures', icon: '📊', score: 8 },
      { value: 'culture_engagement',   label: 'Drove major culture/engagement initiatives', icon: '💚', score: 7 },
      { value: 'hr_tech_implementation', label: 'Led HR tech / systems implementation',     icon: '💻', score: 7 },
      { value: 'none_strategic_hr',    label: 'Primarily operational/administrative',        icon: '—',  score: 3 },
    ],
  },
]

// ── HR & People — Senior ─────────────────────────────────────────────

export const MODULE_B_HR_SENIOR: Question[] = [
  {
    id: 'hr_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior HR leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior HR compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'chro_equivalent', label: 'CHRO / Head of HR for the organisation', icon: '🚀', score: 10 },
      { value: 'vp_hr',           label: 'VP / Director of HR for a large BU/region', icon: '🏢', score: 8  },
      { value: 'coe_head',        label: 'Head of a Centre of Excellence (TA, C&B, L&D)', icon: '🎯', score: 7 },
      { value: 'senior_hrbp',     label: 'Senior HRBP, no broader function leadership', icon: '👤', score: 5 },
    ],
  },
  {
    id: 'hr_org_scale_led',
    module: 'B',
    type: 'mcq',
    title: 'What scale of organisation do you lead HR for?',
    subtitle: 'Organisation scale led is the strongest senior HR compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_org_hr', label: '5,000+ employees',        icon: '🚀', score: 10 },
      { value: 'mid_org_hr',   label: '1,000-5,000 employees',   icon: '🏢', score: 7  },
      { value: 'smaller_org_hr', label: 'Under 1,000 employees', icon: '🏭', score: 5 },
    ],
  },
  {
    id: 'hr_strategic_senior',
    module: 'B',
    type: 'multiselect',
    title: 'What strategic and external work have you led?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'm_a_integration',         label: 'Led M&A people integration',         icon: '🔄', score: 9 },
      { value: 'board_hr_reporting',      label: 'Report to board on people matters',  icon: '📊', score: 8 },
      { value: 'industry_hr_recognition', label: 'Industry recognition (HR awards, speaking)', icon: '🏆', score: 7 },
      { value: 'none_strategic_hr_senior', label: 'Primarily internal-facing role',     icon: '—',  score: 3 },
    ],
  },
]