export type QuestionType = 'mcq' | 'multiselect' | 'tapscale' | 'salary'
export type SeniorityLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'leadership'

export interface Option {
  value: string
  label: string
  sublabel?: string
  icon?: string
  score?: number
  group?: string
}

export interface Question {
  id: string
  module: 'A' | 'B' | 'C'
  type: QuestionType
  title: string
  subtitle?: string
  options?: Option[]
  scaleLabels?: string[]
  scaleCount?: number
  scaleInsight?: string[]
  min?: number
  max?: number
  required: boolean
  branch?: SeniorityLevel[]
  columns?: 2 | 3 | 4        // grid columns hint
  grouped?: boolean           // show group headers
}

// ── MODULE A ──────────────────────────────────────────────────────

export const MODULE_A: Question[] = [
  {
    id: 'industry',
    module: 'A',
    type: 'mcq',
    title: 'Which industry do you work in?',
    subtitle: 'The single biggest factor in your market rate — same role can pay 2× across industries.',
    required: true,
    columns: 4,
    grouped: true,
    options: [
      // TECHNOLOGY
      { value: 'tech_product',   label: 'Tech Product / SaaS',     icon: '🚀', group: 'Technology',         score: 10 },
      { value: 'tech_services',  label: 'IT Services / Outsourcing',icon: '💻', group: 'Technology',         score: 7  },
      { value: 'startup_vc',     label: 'Startup / VC-backed',      icon: '⚡', group: 'Technology',         score: 9  },
      { value: 'ecommerce',      label: 'E-commerce / D2C',         icon: '🛒', group: 'Technology',         score: 8  },
      { value: 'media_content',  label: 'Media / Content / OTT',    icon: '🎬', group: 'Technology',         score: 6  },
      // BUSINESS SERVICES
      { value: 'banking',        label: 'BFSI',                     icon: '🏦', group: 'Business Services',  score: 8  },
      { value: 'consulting',     label: 'Consulting / Strategy',    icon: '📊', group: 'Business Services',  score: 8  },
      { value: 'real_estate',    label: 'Real Estate / PropTech',   icon: '🏢', group: 'Business Services',  score: 6  },
      { value: 'legal',          label: 'Legal / Compliance',       icon: '⚖️', group: 'Business Services',  score: 6  },
      { value: 'hr_staffing',    label: 'HR / Staffing / RPO',      icon: '🤝', group: 'Business Services',  score: 5  },
      // CORE ECONOMY
      { value: 'manufacturing',  label: 'Manufacturing / Auto',     icon: '🏭', group: 'Core Economy',       score: 5  },
      { value: 'fmcg',           label: 'FMCG / Retail',            icon: '🛍️', group: 'Core Economy',       score: 6  },
      { value: 'healthcare',     label: 'Healthcare / Pharma',      icon: '🏥', group: 'Core Economy',       score: 6  },
      { value: 'logistics',      label: 'Logistics / Supply Chain', icon: '🚚', group: 'Core Economy',       score: 5  },
      { value: 'construction',   label: 'Construction / Infra',     icon: '🏗️', group: 'Core Economy',       score: 5  },
      // PUBLIC & OTHER
      { value: 'govt_psu',       label: 'Government / PSU',         icon: '🏛️', group: 'Public & Other',     score: 3  },
      { value: 'education',      label: 'Education / EdTech',       icon: '🎓', group: 'Public & Other',     score: 4  },
      { value: 'nonprofit',      label: 'Non-profit / NGO',         icon: '💚', group: 'Public & Other',     score: 3  },
      { value: 'defence',        label: 'Defence / Forces',         icon: '🛡️', group: 'Public & Other',     score: 4  },
      { value: 'other',          label: 'Other',                    icon: '🔷', group: 'Public & Other',     score: 5  },
    ],
  },
  {
    id: 'seniority',
    module: 'A',
    type: 'mcq',
    title: 'What best describes your career stage?',
    subtitle: 'This routes you to the right questions. Be honest — it affects accuracy.',
    required: true,
    columns: 3,
    options: [
      { value: 'fresher',    label: 'Fresher',           icon: '🌱', sublabel: '0–1 years',       score: 0 },
      { value: 'junior',     label: 'Early Career',      icon: '📈', sublabel: '1–3 years',       score: 1 },
      { value: 'mid',        label: 'Mid-level',         icon: '⚡', sublabel: '3–8 years',       score: 2 },
      { value: 'senior',     label: 'Senior / Lead',     icon: '🎯', sublabel: '8–15 years',      score: 3 },
      { value: 'leadership', label: 'Leadership / CXO',  icon: '🏆', sublabel: '15+ yrs / C-suite', score: 4 },
    ],
  },
  {
    id: 'role',
    module: 'A',
    type: 'mcq',
    title: 'What is your primary role function?',
    subtitle: 'Pick the closest match. Affects skill benchmarks and gap calculation.',
    required: true,
    columns: 3,
    options: [
      { value: 'engineering',       label: 'Software Engineering',    icon: '💻', score: 9  },
      { value: 'data_science',      label: 'Data Science / AI / ML',  icon: '🤖', score: 10 },
      { value: 'data_engineering',  label: 'Data Engineering',        icon: '📊', score: 9  },
      { value: 'devops_cloud',      label: 'DevOps / Cloud / Infra',  icon: '☁️', score: 9  },
      { value: 'product',           label: 'Product Management',      icon: '🗺️', score: 9  },
      { value: 'design',            label: 'Design / UX / UI',        icon: '🎨', score: 7  },
      { value: 'marketing',         label: 'Marketing / Growth',      icon: '📣', score: 6  },
      { value: 'content',           label: 'Content / Copy / SEO',    icon: '✍️', score: 5  },
      { value: 'sales',             label: 'Sales / BD',              icon: '💼', score: 7  },
      { value: 'finance',           label: 'Finance / Accounts',      icon: '💰', score: 7  },
      { value: 'hr',                label: 'HR / Talent / People',    icon: '🤝', score: 5  },
      { value: 'operations',        label: 'Operations / SCM',        icon: '⚙️', score: 5  },
      { value: 'consulting_role',   label: 'Consulting / Strategy',   icon: '🎯', score: 8  },
      { value: 'legal_role',        label: 'Legal / Compliance',      icon: '⚖️', score: 7  },
      { value: 'research',          label: 'Research / Academia',     icon: '🔬', score: 6  },
      { value: 'founder_role',      label: 'Founder / Entrepreneur',  icon: '🚀', score: 9  },
      { value: 'general_mgmt',      label: 'General Management',      icon: '🏢', score: 9  },
      { value: 'other_role',        label: 'Other function',          icon: '🔷', score: 5  },
    ],
  },
  {
    id: 'city',
    module: 'A',
    type: 'mcq',
    title: 'Where are you based?',
    subtitle: 'Location adds or removes up to 35% from your market rate.',
    required: true,
    columns: 3,
    options: [
      { value: 'bengaluru',   label: 'Bengaluru',         icon: '🏙️', sublabel: 'India\'s top tech market', score: 10 },
      { value: 'mumbai',      label: 'Mumbai',            icon: '🌊', sublabel: 'Finance & media hub',       score: 9  },
      { value: 'delhi_ncr',   label: 'Delhi NCR',         icon: '🏛️', sublabel: 'Corp & consulting hub',    score: 8  },
      { value: 'hyderabad',   label: 'Hyderabad',         icon: '💎', sublabel: 'Fast-growing tech market',  score: 8  },
      { value: 'pune',        label: 'Pune',              icon: '🎓', sublabel: 'Engineering hub',           score: 7  },
      { value: 'chennai',     label: 'Chennai',           icon: '🌴', sublabel: 'Strong IT services',        score: 7  },
      { value: 'kolkata',     label: 'Kolkata',           icon: '🎨', sublabel: 'Moderate market',           score: 5  },
      { value: 'ahmedabad',   label: 'Ahmedabad',         icon: '🏗️', sublabel: 'Growing BFSI market',      score: 6  },
      { value: 'tier2_india', label: 'Tier 2 city',       icon: '🏘️', sublabel: '20–35% below metro',       score: 4  },
      { value: 'singapore',   label: 'Singapore',         icon: '🦁', sublabel: 'SEA premium market',        score: 10 },
      { value: 'sea_other',   label: 'Other SEA',         icon: '🌏', sublabel: 'Malaysia / PH / ID / TH',   score: 7  },
      { value: 'remote',      label: 'Remote / Global',   icon: '🌐', sublabel: 'Remote-first company',      score: 8  },
    ],
  },
  {
    id: 'current_ctc',
    module: 'A',
    type: 'salary',
    title: 'What is your current annual CTC?',
    subtitle: 'Include base salary only — no variable or ESOPs. This is the gap calculation baseline.',
    required: true,
    min: 0,
    max: 100000000,
  },
]

// ── MODULE B — Fresher / Junior ───────────────────────────────────

export const MODULE_B_FRESHER: Question[] = [
  {
    id: 'education_tier',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your institution?',
    subtitle: 'College brand affects your first 3 years of market value significantly.',
    required: true,
    columns: 2,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'iit_iim',        label: 'IIT / IIM / BITS',             icon: '🥇', sublabel: 'Premium brand',             score: 10 },
      { value: 'nit_top',        label: 'NIT / Top state college',       icon: '🥈', sublabel: 'Solid mid-tier brand',       score: 7  },
      { value: 'private_good',   label: 'Reputed private college',       icon: '🎓', sublabel: 'Decent placement record',    score: 5  },
      { value: 'private_avg',    label: 'Average private college',       icon: '📚', sublabel: 'Skills > brand here',        score: 3  },
      { value: 'online_degree',  label: 'Online / Distance degree',      icon: '💻', sublabel: 'Portfolio is your brand',    score: 2  },
    ],
  },
  {
    id: 'internship_quality',
    module: 'B',
    type: 'multiselect',
    title: 'What work experience do you have?',
    subtitle: 'Select all that apply. Each one adds real market value.',
    required: true,
    columns: 2,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'mnc_internship',   label: 'Internship at MNC',         icon: '🏢', score: 10 },
      { value: 'startup_intern',   label: 'Startup internship',        icon: '🚀', score: 8  },
      { value: 'freelance_paid',   label: 'Paid freelance work',       icon: '💰', score: 7  },
      { value: 'research_pub',     label: 'Research / publication',    icon: '📄', score: 6  },
      { value: 'open_source',      label: 'Open source contributions', icon: '⚙️', score: 6  },
      { value: 'hackathon',        label: 'Hackathon winner',          icon: '🏆', score: 5  },
      { value: 'personal_project', label: 'Live personal projects',    icon: '🛠️', score: 4  },
      { value: 'none',             label: 'None yet',                  icon: '—',  score: 0  },
    ],
  },
  {
    id: 'certifications_fresher',
    module: 'B',
    type: 'multiselect',
    title: 'Which certifications do you hold?',
    subtitle: '2+ relevant certs add 8–15% to fresher market value.',
    required: false,
    columns: 2,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'cloud_cert',    label: 'Cloud cert (AWS/GCP/Azure)', icon: '☁️', score: 9 },
      { value: 'google_cert',   label: 'Google / Meta professional', icon: '📊', score: 7 },
      { value: 'code_cert',     label: 'Programming certification',  icon: '💻', score: 6 },
      { value: 'domain_cert',   label: 'Domain cert (CFA, PMP…)',    icon: '🎓', score: 8 },
      { value: 'coursera',      label: 'Coursera / LinkedIn cert',   icon: '📚', score: 3 },
      { value: 'none_cert',     label: 'None yet',                   icon: '—',  score: 0 },
    ],
  },
]

// ── MODULE B — Mid-level ──────────────────────────────────────────

export const MODULE_B_MID: Question[] = [
  {
    id: 'employer_trajectory',
    module: 'B',
    type: 'mcq',
    title: 'How would you describe your employer journey?',
    subtitle: 'Employer brand is the #1 salary multiplier at your career level.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'faang_unicorn',  label: 'FAANG / Unicorn',              icon: '🦄', sublabel: 'Highest brand premium',       score: 10 },
      { value: 'large_mnc',     label: 'Large Global MNC',             icon: '🌐', sublabel: 'Strong, steady comp',          score: 8  },
      { value: 'large_indian',  label: 'Large Indian listed co',       icon: '🏭', sublabel: 'Good brand, moderate ceiling', score: 6  },
      { value: 'mid_company',   label: 'Mid-size company',             icon: '🏢', sublabel: 'Depends on niche',             score: 5  },
      { value: 'small_startup', label: 'Early-stage startup',          icon: '🌱', sublabel: 'Equity upside, lower base',    score: 4  },
      { value: 'declining',     label: 'Company in difficulty',        icon: '📉', sublabel: 'Affects perceived value',      score: 2  },
    ],
  },
  {
    id: 'promotion_velocity',
    module: 'B',
    type: 'mcq',
    title: 'How has your career progressed?',
    subtitle: 'Promotion speed vs peers predicts market value better than your current title.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'fast_track', label: 'Faster than peers',       icon: '🚀', sublabel: 'Promoted < every 18 months', score: 10 },
      { value: 'on_track',   label: 'On track with peers',     icon: '✅', sublabel: 'Every 2–3 years',            score: 7  },
      { value: 'switched',   label: 'Grew via job switches',   icon: '🔄', sublabel: 'Job-hopper premium',         score: 8  },
      { value: 'slow',       label: 'Slower than peers',       icon: '⏳', sublabel: '3–5 years per level',        score: 4  },
      { value: 'stuck',      label: 'Same role 4+ years',      icon: '🔒', sublabel: 'Tenure trap — gap risk',     score: 1  },
    ],
  },
  {
    id: 'premium_skills',
    module: 'B',
    type: 'multiselect',
    title: 'Which premium skills do you have?',
    subtitle: '2+ premium skills puts you in the top 20% of earners for your role.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'ai_ml',          label: 'AI / ML / LLMs',              icon: '🤖', score: 10 },
      { value: 'cloud_arch',     label: 'Cloud architecture',          icon: '☁️', score: 9  },
      { value: 'data_eng',       label: 'Data engineering at scale',   icon: '📊', score: 9  },
      { value: 'product_growth', label: 'Product-led growth',          icon: '📈', score: 8  },
      { value: 'enterprise_sales', label: 'Enterprise sales',          icon: '💼', score: 9  },
      { value: 'fin_modelling',  label: 'Financial modelling',         icon: '📋', score: 8  },
      { value: 'devops',         label: 'DevOps / Platform eng',       icon: '⚙️', score: 8  },
      { value: 'strategy',       label: 'Strategy / consulting',       icon: '🎯', score: 8  },
      { value: 'no_premium',     label: 'None of the above',           icon: '—',  score: 0  },
    ],
  },
]

// ── MODULE B — Senior ─────────────────────────────────────────────

export const MODULE_B_SENIOR: Question[] = [
  {
    id: 'team_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of your direct responsibility?',
    subtitle: 'Org scope is the primary compensation driver at senior levels.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'individual',   label: 'Individual contributor',    icon: '👤', sublabel: 'No direct reports',      score: 3  },
      { value: 'team_small',   label: 'Team lead 2–5 people',      icon: '👥', sublabel: 'First-line manager',     score: 5  },
      { value: 'team_mid',     label: 'Manager 6–15 people',       icon: '🏢', sublabel: 'Mid-level manager',      score: 7  },
      { value: 'team_large',   label: 'Senior Manager 16–50',      icon: '🏭', sublabel: 'Senior manager band',    score: 9  },
      { value: 'team_xlarge',  label: 'Director / VP 50+ people',  icon: '🚀', sublabel: 'Director / VP band',     score: 10 },
    ],
  },
  {
    id: 'pl_exposure',
    module: 'B',
    type: 'mcq',
    title: 'Do you own a P&L or revenue number?',
    subtitle: 'P&L ownership is the single strongest predictor of CXO-level compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'none_pl',      label: 'No P&L responsibility',    icon: '—',  score: 2  },
      { value: 'indirect',     label: 'Indirect influence',       icon: '📊', sublabel: 'I influence revenue/cost', score: 5  },
      { value: 'direct_small', label: 'Direct P&L < ₹10 Cr',     icon: '💰', score: 7  },
      { value: 'direct_large', label: 'Direct P&L > ₹10 Cr',     icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'external_visibility',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external market presence?',
    subtitle: 'Thought leaders earn 35–60% more than equally skilled but invisible peers.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'speaker',        label: 'Conference speaker',           icon: '🎤', score: 9 },
      { value: 'author',         label: 'Author / blogger',            icon: '✍️', score: 8 },
      { value: 'linkedin_active',label: 'LinkedIn creator 10K+',       icon: '💼', score: 7 },
      { value: 'advisory',       label: 'Advisory / board roles',      icon: '🤝', score: 9 },
      { value: 'media',          label: 'Media mentions',              icon: '📰', score: 8 },
      { value: 'patents',        label: 'Patents / key contributions',  icon: '🔬', score: 7 },
      { value: 'no_visibility',  label: 'Low public profile',          icon: '🔒', score: 1 },
    ],
  },
]

// ── MODULE B — Leadership ─────────────────────────────────────────

export const MODULE_B_LEADERSHIP: Question[] = [
  {
    id: 'org_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is your organisational influence?',
    subtitle: 'Scale owned directly maps to your compensation ceiling.',
    required: true,
    columns: 2,
    branch: ['leadership'],
    options: [
      { value: 'bu_head',    label: 'Business unit head',           icon: '🏢', sublabel: '50–200 people / ₹50–200Cr',  score: 7  },
      { value: 'cxo_mid',    label: 'CXO at mid-size company',      icon: '🚀', sublabel: '200–1000 people',             score: 8  },
      { value: 'cxo_large',  label: 'CXO at large company',         icon: '🏭', sublabel: '1000+ people',               score: 10 },
      { value: 'founder',    label: 'Founder / Co-founder',         icon: '⚡', sublabel: 'Equity-driven comp',         score: 9  },
      { value: 'board',      label: 'Board / Independent Director',  icon: '🎯', score: 10 },
    ],
  },
  {
    id: 'board_exposure',
    module: 'B',
    type: 'mcq',
    title: 'What is your board and investor exposure?',
    required: true,
    columns: 2,
    branch: ['leadership'],
    options: [
      { value: 'none_board',      label: 'No board interaction',     icon: '—',  score: 2  },
      { value: 'presents_board',  label: 'I present to the board',   icon: '📊', score: 6  },
      { value: 'board_observer',  label: 'Board observer',           icon: '👁️', score: 8  },
      { value: 'board_member',    label: 'Board member',             icon: '🏆', score: 10 },
    ],
  },
  {
    id: 'market_reputation',
    module: 'B',
    type: 'mcq',
    title: 'How would senior recruiters describe your market reputation?',
    required: true,
    columns: 2,
    branch: ['leadership'],
    options: [
      { value: 'unknown',      label: 'Not widely known externally', icon: '🔍', score: 2  },
      { value: 'known_sector', label: 'Known in my sector',          icon: '📢', score: 5  },
      { value: 'sought_after', label: 'Regularly headhunted',        icon: '🎯', score: 8  },
      { value: 'top_of_mind',  label: 'Top-of-mind for major roles', icon: '⭐', score: 10 },
    ],
  },
]

// ── MODULE C — Psychometric (everyone) ───────────────────────────

export const MODULE_C: Question[] = [
  {
    id: 'negotiation_history',
    module: 'C',
    type: 'mcq',
    title: 'When did you last negotiate your salary?',
    subtitle: 'Non-negotiators earn 12–18% less than identical peers. This is your single biggest controllable gap driver.',
    required: true,
    columns: 2,
    options: [
      { value: 'never',      label: 'Never',                    icon: '😶', sublabel: 'I accept what I\'m offered',    score: 0  },
      { value: 'joining_only',label: 'Only at joining',         icon: '🤝', sublabel: 'Leaving money on the table',    score: 3  },
      { value: 'few_years',  label: '2–3 years ago',            icon: '⏳', sublabel: 'Gap widening since then',       score: 5  },
      { value: 'last_year',  label: 'In the last year',         icon: '📅', sublabel: 'Good habit forming',            score: 7  },
      { value: 'recently',   label: 'Last 6 months',            icon: '✅', sublabel: 'Active market participant',     score: 9  },
      { value: 'regularly',  label: 'Every review cycle',       icon: '🚀', sublabel: 'Top 5% behaviour',              score: 10 },
    ],
  },
  {
    id: 'growth_investment',
    module: 'C',
    type: 'tapscale',
    title: 'How much have you invested in your own development this year?',
    subtitle: 'Courses, coaching, books, events, mentors — anything paid out of your own pocket.',
    required: true,
    scaleCount: 6,
    scaleLabels: ['₹0', '< ₹2K', '₹2–10K', '₹10–25K', '₹25–50K', '₹50K+'],
    scaleInsight: [
      'No investment — low career intentionality signal',
      'Token investment — minimal market signal',
      'Moderate — you\'re trying. Top 50%.',
      'Strong — top 30% of professionals',
      'Serious investor — top 10% career velocity',
      'Elite self-investor — 2.3× career velocity vs peers',
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────

export function getModuleBQuestions(seniority: string): Question[] {
  switch (seniority) {
    case 'fresher':
    case 'junior':    return MODULE_B_FRESHER
    case 'mid':       return MODULE_B_MID
    case 'senior':    return MODULE_B_SENIOR
    case 'leadership':return MODULE_B_LEADERSHIP
    default:          return MODULE_B_MID
  }
}

export function getAllQuestions(seniority: string): Question[] {
  return [...MODULE_A, ...getModuleBQuestions(seniority), ...MODULE_C]
}

export interface DimensionScores {
  market_alignment: number
  skill_premium: number
  visibility: number
  mobility: number
  negotiation: number
  hrs: number
}

export function calculateScores(answers: Record<string, string | string[] | number>): DimensionScores {
  const getScore = (qid: string, val: string): number => {
    const all = [...MODULE_A, ...MODULE_B_FRESHER, ...MODULE_B_MID, ...MODULE_B_SENIOR, ...MODULE_B_LEADERSHIP, ...MODULE_C]
    return all.find(q => q.id === qid)?.options?.find(o => o.value === val)?.score ?? 5
  }

  const industryScore = getScore('industry', answers.industry as string)
  const cityScore     = getScore('city', answers.city as string)
  const market_alignment = Math.round(((industryScore + cityScore) / 20) * 100)

  const skillArrays = [answers.premium_skills, answers.certifications_fresher, answers.internship_quality].filter(Boolean)
  const totalSkillItems = (skillArrays.flat() as string[]).filter(v => v !== 'none' && v !== 'none_cert' && v !== 'no_premium').length
  const skill_premium = Math.min(100, 20 + totalSkillItems * 14)

  const visItems = Array.isArray(answers.external_visibility)
    ? (answers.external_visibility as string[]).filter(v => v !== 'no_visibility').length : 0
  const visibility = Math.min(100, 20 + visItems * 18)

  const mobilityMap: Record<string, number> = { fast_track: 95, on_track: 70, switched: 80, slow: 40, stuck: 15, fresher: 60, junior: 60 }
  const mobility = mobilityMap[answers.promotion_velocity as string] ?? mobilityMap[answers.seniority as string] ?? 50

  const negMap: Record<string, number> = { never: 5, joining_only: 25, few_years: 45, last_year: 65, recently: 82, regularly: 98 }
  const negotiation = negMap[answers.negotiation_history as string] ?? 30

  const hrs = Math.min(1000, Math.round(
    market_alignment * 0.20 + skill_premium * 0.25 +
    visibility * 0.15 + mobility * 0.20 + negotiation * 0.20
  ) * 10)

  return { market_alignment, skill_premium, visibility, mobility, negotiation, hrs }
}