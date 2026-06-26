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

// Maps each MODULE_A industry value to its career track.
// This is the single source of truth for routing — update here only.
export const INDUSTRY_TO_TRACK: Record<string, CareerTrack> = {
  // Technology group → corporate
  tech_product:   'corporate_white_collar',
  tech_services:  'corporate_white_collar',
  startup_vc:     'corporate_white_collar',
  ecommerce:      'corporate_white_collar',
  media_content:  'creative_freelance',

  // Business Services group → mostly corporate, legal stays corporate
  banking:        'corporate_white_collar',
  consulting:     'corporate_white_collar',
  real_estate:    'sales_field',
  legal:          'corporate_white_collar',
  hr_staffing:    'corporate_white_collar',

  // Core Economy group → operations
  manufacturing:  'operations_industrial',
  fmcg:           'operations_industrial',
  healthcare:     'healthcare',
  logistics:      'operations_industrial',
  construction:   'operations_industrial',

  // Public & Other group
  govt_psu:       'public_service',
  education:      'public_service',
  nonprofit:      'public_service',
  defence:        'public_service',
  other:          'corporate_white_collar', // safe default
}

export function getTrackForIndustry(industry: string): CareerTrack {
  return INDUSTRY_TO_TRACK[industry] ?? 'corporate_white_collar'
}