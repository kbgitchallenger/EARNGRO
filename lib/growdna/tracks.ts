export type CareerTrack =
  | 'corporate_white_collar'
  | 'operations_industrial'
  | 'public_service'
  | 'healthcare'
  | 'creative_freelance'
  | 'sales_field'

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
}

// ════════════════════════════════════════════════════════════════
// PRIMARY ROUTING — Role determines the track.
// Role defines competency. This is deterministic for any functional
// role that means the same thing regardless of which industry it
// sits in (an engineer is an engineer at a bank or at a startup).
// ════════════════════════════════════════════════════════════════
export const ROLE_TO_TRACK: Record<string, CareerTrack> = {
  engineering:       'corporate_white_collar',
  data_science:      'corporate_white_collar',
  data_engineering:  'corporate_white_collar',
  devops_cloud:      'corporate_white_collar',
  product:           'corporate_white_collar',
  design:            'corporate_white_collar', // refined when creative_freelance track is built
  marketing:         'corporate_white_collar',
  content:           'corporate_white_collar', // refined when creative_freelance track is built
  sales:             'sales_field',
  finance:           'corporate_white_collar',
  hr:                'corporate_white_collar',
  operations:        'operations_industrial',
  consulting_role:   'corporate_white_collar',
  legal_role:        'corporate_white_collar',
  research:          'corporate_white_collar', // can be overridden by industry below
  founder_role:      'corporate_white_collar',
  general_mgmt:      'corporate_white_collar', // can be overridden by industry below
  other_role:        'corporate_white_collar', // can be overridden by industry below
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