// Maps Calculator display strings → GrowDNA answer value strings
// Calculator uses human-readable labels; GrowDNA uses short value keys

export interface CalcPrefill {
  industry?: string
  seniority?: string
  role?: string
  city?: string
  current_ctc?: number
}

const STORAGE_KEY = 'earngro_calc_prefill'

// ── Experience band → seniority ──────────────────────────────────
const EXPERIENCE_TO_SENIORITY: Record<string, string> = {
  '0–1 years (fresher)': 'fresher',
  '2–3 years':           'junior',
  '4–6 years':           'mid',
  '7–10 years':          'senior',
  '11–15 years':         'senior',
  '16+ years':           'leadership',
}

// ── Calculator role → GrowDNA role value ─────────────────────────
const ROLE_MAP: Record<string, string> = {
  'Software / Data Engineer':          'engineering',
  'Engineering Manager / Tech Lead':   'engineering',
  'Data Scientist / ML Engineer':      'data_science',
  'Product Manager':                   'product',
  'Business / Data Analyst':           'data_engineering',
  'UX / UI Designer':                  'design',
  'Sales / Business Development':      'sales',
  'Marketing Manager':                 'marketing',
  'HR / Talent Acquisition':           'hr',
  'Finance / Accounts Manager':        'finance',
  'Operations Manager':                'operations',
  'Management Consultant':             'consulting_role',
  'Content / Copywriter':              'content',
  'Other professional role':           'other_role',
}

// ── Calculator city → GrowDNA city value ─────────────────────────
const CITY_MAP: Record<string, string> = {
  'Bengaluru, India':              'bengaluru',
  'Mumbai, India':                 'mumbai',
  'Delhi NCR, India':              'delhi_ncr',
  'Hyderabad, India':              'hyderabad',
  'Pune, India':                   'pune',
  'Chennai, India':                'chennai',
  'Kolkata, India':                'kolkata',
  'Ahmedabad, India':              'ahmedabad',
  'Tier 2 city, India':            'tier2_india',
  'Singapore':                     'singapore',
  'Kuala Lumpur, Malaysia':        'sea_other',
  'Manila, Philippines':           'sea_other',
  'Jakarta, Indonesia':            'sea_other',
  'Bangkok, Thailand':             'sea_other',
  'Ho Chi Minh City, Vietnam':     'sea_other',
}

// ── Calculator industry → GrowDNA industry value ─────────────────
const INDUSTRY_MAP: Record<string, string> = {
  'Technology / Software':          'tech_product',
  'Banking & Finance':              'banking',
  'Marketing & Advertising':        'media_content',
  'Healthcare & Pharma':            'healthcare',
  'Education & EdTech':             'education',
  'Manufacturing & Engineering':    'manufacturing',
  'Management Consulting':          'consulting',
  'E-commerce & Retail':            'ecommerce',
  'Media & Content':                'media_content',
  'Real Estate':                    'real_estate',
  'Logistics & Supply Chain':       'logistics',
  'Government / PSU':               'govt_psu',
  'Other':                          'other',
}

// ── Write prefill data from Calculator answers ────────────────────
export function saveCalcPrefill(calcAnswers: {
  industry: string
  experience: string
  role: string
  city: string
  salary: string
}): void {
  if (typeof window === 'undefined') return

  const prefill: CalcPrefill = {
    industry:    INDUSTRY_MAP[calcAnswers.industry],
    seniority:   EXPERIENCE_TO_SENIORITY[calcAnswers.experience],
    role:        ROLE_MAP[calcAnswers.role],
    city:        CITY_MAP[calcAnswers.city],
    current_ctc: parseFloat(calcAnswers.salary) || undefined,
  }

  // Only save fields that mapped successfully
  const clean = Object.fromEntries(
    Object.entries(prefill).filter(([, v]) => v !== undefined)
  ) as CalcPrefill

  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
}

// ── Read and immediately clear prefill data ───────────────────────
export function consumeCalcPrefill(): CalcPrefill | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const data = JSON.parse(raw) as CalcPrefill
    localStorage.removeItem(STORAGE_KEY) // one-time use
    return data
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

// ── Check if prefill exists (without consuming it) ────────────────
export function hasPrefill(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(STORAGE_KEY)
}