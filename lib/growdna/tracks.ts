export type CareerTrack =
  | 'corporate_white_collar'
  | 'operations_industrial'
  | 'public_service'
  | 'healthcare'
  | 'creative_freelance'
  | 'sales_field'
  | 'marketing_brand'
  | 'finance_accounting'
  | 'hr_people'
  | 'design_creative'
  | 'consulting_strategy'

export interface TrackInfo {
  id: CareerTrack
  label: string
  description: string
}

export const CAREER_TRACKS: Record<CareerTrack, TrackInfo> = {
  corporate_white_collar: {
    id: 'corporate_white_collar',
    label: 'Corporate & Professional',
    description: 'Tech, consulting, finance, product, corporate functions',
  },
  operations_industrial: {
    id: 'operations_industrial',
    label: 'Operations & Industrial',
    description: 'Manufacturing, logistics, construction, retail operations',
  },
  public_service: {
    id: 'public_service',
    label: 'Public Service',
    description: 'Government, PSU, defence, public education',
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Doctors, nurses, allied health professionals',
  },
  creative_freelance: {
    id: 'creative_freelance',
    label: 'Creative & Freelance',
    description: 'Design, writing, content, marketing, independent work',
  },
  sales_field: {
    id: 'sales_field',
    label: 'Sales & Field',
    description: 'Field sales, business development, account management',
  },
  marketing_brand: {
    id: 'marketing_brand',
    label: 'Marketing & Brand',
    description: 'Performance, product, brand, and analytics marketing',
  },
  finance_accounting: {
    id: 'finance_accounting',
    label: 'Finance & Accounting',
    description: 'FP&A, investment banking, audit, treasury, controllership',
  },
  hr_people: {
    id: 'hr_people',
    label: 'HR & People',
    description: 'HRBP, talent acquisition, comp & benefits, L&D',
  },
  design_creative: {
    id: 'design_creative',
    label: 'Design & Creative',
    description: 'Product/UX, visual/brand, design research, design systems',
  },
  consulting_strategy: {
    id: 'consulting_strategy',
    label: 'Consulting & Strategy',
    description: 'Strategy, Big 4 advisory, boutique, implementation consulting',
  },

}

// ════════════════════════════════════════════════════════════════
// PRIMARY ROUTING — Role determines the track.
// Role defines competency. This is deterministic for any functional
// role that means the same thing regardless of which industry it
// sits in (an engineer is an engineer at a bank or at a startup).
// ════════════════════════════════════════════════════════════════
export const ROLE_TO_TRACK: Record<string, CareerTrack> = {
  engineering:         'corporate_white_collar',
  data_science:        'corporate_white_collar',
  data_engineering:    'corporate_white_collar',
  devops_cloud:        'corporate_white_collar',
  product:             'corporate_white_collar',
  marketing:         'marketing_brand',
  design:            'design_creative',
  finance:           'finance_accounting',
  hr:                'hr_people',
  consulting_role:   'consulting_strategy',
  content:             'corporate_white_collar',
  sales:               'sales_field',
  operations:          'operations_industrial',
  legal_role:          'corporate_white_collar',
  research:            'corporate_white_collar',
  founder_role:        'corporate_white_collar',
  general_mgmt:        'corporate_white_collar',
  healthcare_clinical: 'healthcare',
  nursing_allied:      'healthcare',
  teaching_education:  'public_service',
  civil_services:      'public_service',
  other_role:          'corporate_white_collar',
}

// ════════════════════════════════════════════════════════════════
// SECONDARY MODIFIER — Industry only disambiguates roles that are
// genuinely ambiguous on their own. It NEVER overrides a role with
// clear functional meaning (engineering, sales, operations, etc.).
// ════════════════════════════════════════════════════════════════
const AMBIGUOUS_ROLES = new Set(['other_role', 'general_mgmt', 'research'])

const INDUSTRY_TRACK_OVERRIDE: Record<string, CareerTrack> = {
  healthcare: 'healthcare',
  govt_psu:   'public_service',
  education:  'public_service',
  nonprofit:  'public_service',
  defence:    'public_service',
}

export function getTrackForRoleAndIndustry(role: string, industry?: string): CareerTrack {
  const baseTrack = ROLE_TO_TRACK[role] ?? 'corporate_white_collar'

  if (AMBIGUOUS_ROLES.has(role) && industry) {
    const override = INDUSTRY_TRACK_OVERRIDE[industry]
    if (override) return override
  }

  return baseTrack
}