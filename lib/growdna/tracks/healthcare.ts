import type { Question } from '../questions'

// ── Healthcare — Mid-level ──────────────────────────────────────────

export const MODULE_B_HEALTHCARE_MID: Question[] = [
  {
    id: 'clinical_practice_setting',
    module: 'B',
    type: 'mcq',
    title: 'What is your primary practice setting?',
    subtitle: 'Practice setting is the single biggest factor in healthcare compensation.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'corporate_hospital', label: 'Corporate hospital chain (Apollo, Fortis, Max)', icon: '🏥', sublabel: 'Highest-paying setting', score: 10 },
      { value: 'govt_hospital',      label: 'Government hospital',                             icon: '🏛️', sublabel: 'Stable, below-market pay', score: 4  },
      { value: 'nursing_home',       label: 'Nursing home / smaller private setup',             icon: '🏠', sublabel: 'Variable by location',     score: 6  },
      { value: 'own_practice',       label: 'Own clinic / independent practice',                icon: '⚕️', sublabel: 'Income tied to patient volume', score: 7 },
      { value: 'telehealth',         label: 'Telehealth / digital health platform',              icon: '💻', sublabel: 'Growing, competitive segment', score: 7 },
    ],
  },
  {
    id: 'specialization_tier',
    module: 'B',
    type: 'mcq',
    title: 'How would you describe your specialization?',
    subtitle: 'Specialization scarcity directly drives earning potential in healthcare.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'super_specialist', label: 'Super-specialist (cardiology, oncology, neuro)', icon: '🧠', sublabel: 'Highest-demand specialisation', score: 10 },
      { value: 'specialist',       label: 'Specialist (specific department/field)',          icon: '🩺', sublabel: 'Strong, focused demand',        score: 8  },
      { value: 'general_practice', label: 'General practice / family medicine',              icon: '⚕️', sublabel: 'Broad, steady demand',          score: 5  },
      { value: 'allied_specialist', label: 'Allied health specialist (physio, nutrition, etc.)', icon: '🏃', sublabel: 'Growing demand segment',     score: 6  },
    ],
  },
  {
    id: 'patient_outcome_evidence',
    module: 'B',
    type: 'mcq',
    title: 'Do you have documented patient outcomes or case volume data?',
    subtitle: 'Quantified clinical outcomes are increasingly screened for at corporate hospital chains.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'strong_outcomes', label: 'Yes — strong documented outcomes/success rates', icon: '📈', score: 9 },
      { value: 'high_volume',     label: 'High patient/procedure volume, not formally tracked', icon: '📊', score: 6 },
      { value: 'standard_practice', label: 'Standard practice, no specific differentiation', icon: '✅', score: 4 },
      { value: 'early_career',    label: 'Still building case experience',                   icon: '🌱', score: 3 },
    ],
  },
]

// ── Healthcare — Senior ──────────────────────────────────────────────

export const MODULE_B_HEALTHCARE_SENIOR: Question[] = [
  {
    id: 'department_leadership',
    module: 'B',
    type: 'mcq',
    title: 'What is your leadership scope within your institution?',
    subtitle: 'Departmental and institutional scope is the primary driver of senior healthcare compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'senior_consultant', label: 'Senior consultant — no formal department role', icon: '🩺', score: 5  },
      { value: 'department_head',   label: 'Head of department',                            icon: '🏥', score: 8  },
      { value: 'medical_director',  label: 'Medical director / Chief Medical Officer',       icon: '🚀', score: 10 },
      { value: 'multi_facility',    label: 'Clinical leadership across multiple facilities',  icon: '🗺️', score: 10 },
    ],
  },
  {
    id: 'academic_research_profile',
    module: 'B',
    type: 'multiselect',
    title: 'What is your academic and research profile?',
    subtitle: 'Select all that apply — these meaningfully affect senior healthcare market positioning.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'published_research', label: 'Published research / clinical papers',  icon: '📄', score: 9 },
      { value: 'teaching_faculty',   label: 'Teaching faculty at medical college',   icon: '🎓', score: 7 },
      { value: 'conference_speaker', label: 'Speaker at medical conferences',         icon: '🎤', score: 8 },
      { value: 'international_cert', label: 'International certification/fellowship', icon: '🌍', score: 9 },
      { value: 'none_academic',      label: 'Purely clinical practice',               icon: '—',  score: 3 },
    ],
  },
  {
    id: 'private_practice_revenue',
    module: 'B',
    type: 'mcq',
    title: 'Do you have independent revenue streams beyond your primary role?',
    subtitle: 'Private consultations, advisory roles, or a personal practice materially change total earning potential.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'significant_independent', label: 'Yes — significant independent practice/consulting income', icon: '💰', score: 9 },
      { value: 'some_independent',         label: 'Yes — modest additional income',                            icon: '📊', score: 6 },
      { value: 'none_independent',         label: 'No — single institutional income only',                     icon: '—',  score: 3 },
    ],
  },
]