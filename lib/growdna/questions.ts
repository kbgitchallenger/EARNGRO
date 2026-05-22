// All question definitions for GrowDNA assessment
// Free tier: Module A (Q1-Q5) + Module B (Q6-Q8 branched) + Module C (Q9-Q10)
// Total: 10 questions

export type QuestionType = 'mcq' | 'multiselect' | 'tapscale' | 'salary'
export type SeniorityLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'leadership'

export interface Option {
  value: string
  label: string
  sublabel?: string
  score?: number
}

export interface Question {
  id: string
  module: 'A' | 'B' | 'C'
  type: QuestionType
  title: string
  subtitle?: string
  options?: Option[]
  scaleLabels?: string[]        // For tapscale: labels for each segment
  scaleCount?: number           // Number of segments
  scaleInsight?: string[]       // Insight shown per segment
  min?: number                  // For salary
  max?: number
  required: boolean
  branch?: SeniorityLevel[]     // If set, only show for these levels
}

// ── MODULE A — Hard Facts (everyone) ──────────────────────────────

export const MODULE_A: Question[] = [
  {
    id: 'industry',
    module: 'A',
    type: 'mcq',
    title: 'Which industry do you work in?',
    subtitle: 'This is the single biggest factor in your market rate.',
    required: true,
    options: [
      { value: 'tech_product', label: 'Technology — Product / SaaS', sublabel: 'Highest paying segment', score: 10 },
      { value: 'tech_services', label: 'Technology — IT Services / Outsourcing', sublabel: 'Strong but below product', score: 7 },
      { value: 'banking', label: 'Banking, Financial Services & Insurance', sublabel: 'High ceiling for right roles', score: 8 },
      { value: 'consulting', label: 'Management / Strategy Consulting', sublabel: 'Premium for top firms', score: 8 },
      { value: 'ecommerce', label: 'E-commerce & Consumer Internet', sublabel: 'Startup premium applies', score: 7 },
      { value: 'healthcare', label: 'Healthcare & Pharmaceuticals', sublabel: 'Steady, moderate ceiling', score: 6 },
      { value: 'manufacturing', label: 'Manufacturing & Engineering', sublabel: 'Depends heavily on company', score: 5 },
      { value: 'media', label: 'Media, Content & Advertising', sublabel: 'Wide variance by company', score: 5 },
      { value: 'education', label: 'Education & EdTech', sublabel: 'Lower traditional, EdTech better', score: 4 },
      { value: 'govt_psu', label: 'Government / PSU', sublabel: 'Stability over market rate', score: 3 },
      { value: 'other', label: 'Other industry', sublabel: '', score: 5 },
    ],
  },
  {
    id: 'seniority',
    module: 'A',
    type: 'mcq',
    title: 'What best describes your career stage?',
    subtitle: 'Be honest — this routes your assessment to the right questions.',
    required: true,
    options: [
      { value: 'fresher', label: '🌱 Fresher / New graduate', sublabel: '0–1 years of experience', score: 0 },
      { value: 'junior', label: '📈 Early career', sublabel: '1–3 years of experience', score: 1 },
      { value: 'mid', label: '⚡ Mid-level professional', sublabel: '3–8 years of experience', score: 2 },
      { value: 'senior', label: '🎯 Senior / Lead', sublabel: '8–15 years of experience', score: 3 },
      { value: 'leadership', label: '🏆 Leadership / CXO', sublabel: '15+ years or C-suite', score: 4 },
    ],
  },
  {
    id: 'role',
    module: 'A',
    type: 'mcq',
    title: 'What is your primary role function?',
    subtitle: 'Pick the closest match — this affects skill benchmarks.',
    required: true,
    options: [
      { value: 'engineering', label: 'Software / Data Engineering', score: 9 },
      { value: 'data_science', label: 'Data Science / ML / AI', score: 10 },
      { value: 'product', label: 'Product Management', score: 9 },
      { value: 'design', label: 'Design / UX / UI', score: 7 },
      { value: 'marketing', label: 'Marketing / Growth / Brand', score: 6 },
      { value: 'sales', label: 'Sales / Business Development', score: 7 },
      { value: 'finance', label: 'Finance / Accounts / CFO track', score: 7 },
      { value: 'hr', label: 'HR / People / Talent', score: 5 },
      { value: 'operations', label: 'Operations / Supply Chain', score: 5 },
      { value: 'consulting_role', label: 'Consulting / Strategy / Advisory', score: 8 },
      { value: 'leadership_role', label: 'General Management / P&L owner', score: 9 },
      { value: 'other_role', label: 'Other function', score: 5 },
    ],
  },
  {
    id: 'city',
    module: 'A',
    type: 'mcq',
    title: 'Where are you based?',
    subtitle: 'Location adds or removes up to 35% from your market rate.',
    required: true,
    options: [
      { value: 'bengaluru', label: 'Bengaluru', sublabel: 'India\'s highest paying tech market', score: 10 },
      { value: 'mumbai', label: 'Mumbai', sublabel: 'Finance & media hub', score: 9 },
      { value: 'delhi_ncr', label: 'Delhi NCR', sublabel: 'Strong consulting & corp market', score: 8 },
      { value: 'hyderabad', label: 'Hyderabad', sublabel: 'Fast-growing tech market', score: 8 },
      { value: 'pune', label: 'Pune', sublabel: 'Engineering & auto hub', score: 7 },
      { value: 'chennai', label: 'Chennai', sublabel: 'Strong IT services market', score: 7 },
      { value: 'kolkata', label: 'Kolkata', sublabel: 'Moderate market', score: 5 },
      { value: 'tier2_india', label: 'Tier 2 city, India', sublabel: '20–35% below metro benchmarks', score: 4 },
      { value: 'singapore', label: 'Singapore', sublabel: 'SEA premium market', score: 10 },
      { value: 'sea_other', label: 'Other SEA country', sublabel: 'Malaysia / Philippines / Indonesia', score: 7 },
    ],
  },
  {
    id: 'current_ctc',
    module: 'A',
    type: 'salary',
    title: 'What is your current annual CTC?',
    subtitle: 'Include base salary only. Be accurate — this is the gap calculation baseline.',
    required: true,
    min: 0,
    max: 10000000,
  },
]

// ── MODULE B — Human Capital (branched by seniority) ──────────────

export const MODULE_B_FRESHER: Question[] = [
  {
    id: 'education_tier',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your institution?',
    subtitle: 'Your college brand affects your first 3 years of market value significantly.',
    required: true,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'iit_iim_bits', label: 'IIT / IIM / BITS / NIT Top 5', sublabel: 'Premium brand — strong employer pull', score: 10 },
      { value: 'nit_other', label: 'NIT / State top engineering college', sublabel: 'Solid mid-tier brand', score: 7 },
      { value: 'private_good', label: 'Reputed private college', sublabel: 'Decent placement record', score: 5 },
      { value: 'private_average', label: 'Average private college', sublabel: 'Skills matter more than brand here', score: 3 },
      { value: 'distance_online', label: 'Distance / Online degree', sublabel: 'Skills & portfolio are your brand', score: 2 },
    ],
  },
  {
    id: 'internship_quality',
    module: 'B',
    type: 'multiselect',
    title: 'What kind of work experience do you have?',
    subtitle: 'Select all that apply. Each one adds to your market value.',
    required: true,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'mnc_internship', label: '🏢 Internship at MNC / listed company', score: 10 },
      { value: 'startup_internship', label: '🚀 Internship at funded startup', score: 8 },
      { value: 'freelance_paid', label: '💰 Freelance with paying clients', score: 7 },
      { value: 'research_pub', label: '📄 Research paper / publication', score: 6 },
      { value: 'open_source', label: '⚙️ Open source contributions', score: 6 },
      { value: 'hackathon_winner', label: '🏆 Hackathon winner / competition', score: 5 },
      { value: 'personal_projects', label: '🛠️ Personal projects (deployed / live)', score: 4 },
      { value: 'none', label: '— None of the above', score: 0 },
    ],
  },
  {
    id: 'certifications_fresher',
    module: 'B',
    type: 'multiselect',
    title: 'Which of these do you have?',
    subtitle: 'Certifications signal commitment and add 8–15% to fresher market value.',
    required: false,
    branch: ['fresher', 'junior'],
    options: [
      { value: 'cloud_cert', label: '☁️ Cloud certification (AWS/GCP/Azure)', score: 9 },
      { value: 'google_cert', label: '📊 Google / Meta professional certificate', score: 7 },
      { value: 'programming_cert', label: '💻 Programming / framework certification', score: 6 },
      { value: 'domain_cert', label: '🎓 Domain-specific certification (CFA, PMP etc)', score: 8 },
      { value: 'linkedin_learning', label: '📚 LinkedIn Learning / Coursera completion', score: 3 },
      { value: 'none_cert', label: '— None yet', score: 0 },
    ],
  },
]

export const MODULE_B_MID: Question[] = [
  {
    id: 'employer_trajectory',
    module: 'B',
    type: 'mcq',
    title: 'How would you describe your employer journey?',
    subtitle: 'Employer brand is the #1 salary multiplier at your level.',
    required: true,
    branch: ['mid'],
    options: [
      { value: 'faang_unicorn', label: '🦄 FAANG / Unicorn / Top-tier startup', sublabel: 'Highest brand premium', score: 10 },
      { value: 'large_mnc', label: '🌐 Large MNC / Global company', sublabel: 'Strong brand, steady comp', score: 8 },
      { value: 'large_indian', label: '🏭 Large Indian conglomerate / listed co', sublabel: 'Good brand, moderate ceiling', score: 6 },
      { value: 'mid_company', label: '🏢 Mid-size company (500–5000)', sublabel: 'Brand depends on niche', score: 5 },
      { value: 'small_startup', label: '🌱 Small company / early startup', sublabel: 'Equity upside, lower base', score: 4 },
      { value: 'declining', label: '📉 Company facing challenges / layoffs', sublabel: 'Affects perceived market value', score: 2 },
    ],
  },
  {
    id: 'promotion_velocity',
    module: 'B',
    type: 'mcq',
    title: 'How has your career progressed?',
    subtitle: 'Promotion speed vs peers is the strongest predictor of market value trajectory.',
    required: true,
    branch: ['mid'],
    options: [
      { value: 'fast_track', label: '🚀 Promoted faster than peers (< 18 months per level)', sublabel: 'Top 10% trajectory', score: 10 },
      { value: 'on_track', label: '✅ On track with peers (every 2–3 years)', sublabel: 'Healthy progression', score: 7 },
      { value: 'slow', label: '⏳ Slower than peers (3–5 years per level)', sublabel: 'Gap risk building', score: 4 },
      { value: 'stuck', label: '🔒 Same role/title for 4+ years', sublabel: 'Tenure trap — significant gap risk', score: 1 },
      { value: 'switched', label: '🔄 Grew through company switches', sublabel: 'Job-hopper premium — valid strategy', score: 8 },
    ],
  },
  {
    id: 'premium_skills',
    module: 'B',
    type: 'multiselect',
    title: 'Which premium skills do you have?',
    subtitle: '2+ premium skills puts you in the top 20% of earners for your role.',
    required: true,
    branch: ['mid'],
    options: [
      { value: 'ai_ml', label: '🤖 AI / Machine Learning / LLMs', score: 10 },
      { value: 'cloud_arch', label: '☁️ Cloud architecture (AWS/GCP/Azure)', score: 9 },
      { value: 'data_eng', label: '📊 Data engineering / Analytics at scale', score: 9 },
      { value: 'product_growth', label: '📈 Product-led growth / PLG', score: 8 },
      { value: 'enterprise_sales', label: '💼 Enterprise sales / large deal closing', score: 9 },
      { value: 'financial_model', label: '📋 Financial modelling / valuation', score: 8 },
      { value: 'devops_platform', label: '⚙️ DevOps / Platform engineering', score: 8 },
      { value: 'strategy_consulting_skill', label: '🎯 Strategy / management consulting', score: 8 },
      { value: 'no_premium', label: '— None of the above', score: 0 },
    ],
  },
]

export const MODULE_B_SENIOR: Question[] = [
  {
    id: 'team_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of your direct responsibility?',
    subtitle: 'Org scope is the primary comp driver at senior levels.',
    required: true,
    branch: ['senior'],
    options: [
      { value: 'individual', label: '👤 Individual contributor (no direct reports)', score: 3 },
      { value: 'team_small', label: '👥 Team lead — 2 to 5 people', score: 5 },
      { value: 'team_mid', label: '👥 Manager — 6 to 15 people', score: 7 },
      { value: 'team_large', label: '🏢 Senior manager — 16 to 50 people', score: 9 },
      { value: 'team_xlarge', label: '🏭 Director / VP — 50+ people', score: 10 },
    ],
  },
  {
    id: 'pl_exposure',
    module: 'B',
    type: 'mcq',
    title: 'Do you own a P&L or revenue number?',
    subtitle: 'P&L ownership is the single strongest predictor of CXO-level compensation.',
    required: true,
    branch: ['senior'],
    options: [
      { value: 'none_pl', label: '— No P&L responsibility', score: 2 },
      { value: 'indirect', label: '📊 Indirect — I influence revenue/cost decisions', score: 5 },
      { value: 'direct_small', label: '💰 Direct — I own a P&L under ₹10 Cr', score: 7 },
      { value: 'direct_large', label: '🚀 Direct — I own a P&L above ₹10 Cr', score: 10 },
    ],
  },
  {
    id: 'external_visibility',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external market presence?',
    subtitle: 'Thought leaders earn 35–60% more than equally skilled but invisible peers.',
    required: false,
    branch: ['senior'],
    options: [
      { value: 'speaker', label: '🎤 Speaker at industry conferences', score: 9 },
      { value: 'author', label: '✍️ Published author / blogger (meaningful following)', score: 8 },
      { value: 'linkedin_active', label: '💼 Active LinkedIn creator (10K+ followers)', score: 7 },
      { value: 'advisory', label: '🤝 Advisory / board roles', score: 9 },
      { value: 'media', label: '📰 Media mentions / industry recognition', score: 8 },
      { value: 'patents', label: '🔬 Patents / notable technical contributions', score: 7 },
      { value: 'no_visibility', label: '— I keep a low public profile', score: 1 },
    ],
  },
]

export const MODULE_B_LEADERSHIP: Question[] = [
  {
    id: 'org_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is your organisational influence?',
    subtitle: 'Scale owned directly maps to comp ceiling.',
    required: true,
    branch: ['leadership'],
    options: [
      { value: 'bu_head', label: '🏢 Business unit head (50–200 people / ₹50–200 Cr revenue)', score: 7 },
      { value: 'cxo_mid', label: '🚀 CXO at mid-size company (200–1000 people)', score: 8 },
      { value: 'cxo_large', label: '🏭 CXO at large company (1000+ people)', score: 10 },
      { value: 'founder', label: '⚡ Founder / Co-founder', score: 9 },
      { value: 'board', label: '🎯 Board member / Independent director', score: 10 },
    ],
  },
  {
    id: 'board_exposure',
    module: 'B',
    type: 'mcq',
    title: 'What is your board and investor exposure?',
    required: true,
    branch: ['leadership'],
    options: [
      { value: 'none_board', label: '— No board-level interaction', score: 2 },
      { value: 'presents_board', label: '📊 I present to the board regularly', score: 6 },
      { value: 'board_observer', label: '👁️ Board observer', score: 8 },
      { value: 'board_member', label: '🏆 Board member', score: 10 },
    ],
  },
  {
    id: 'market_reputation',
    module: 'B',
    type: 'mcq',
    title: 'How would recruiters describe your market reputation?',
    required: true,
    branch: ['leadership'],
    options: [
      { value: 'unknown', label: '🔍 Not widely known outside my company', score: 2 },
      { value: 'known_sector', label: '📢 Known within my sector / function', score: 5 },
      { value: 'sought_after', label: '🎯 Regularly headhunted by top firms', score: 8 },
      { value: 'top_of_mind', label: '⭐ Top-of-mind for major roles in my domain', score: 10 },
    ],
  },
]

// ── MODULE C — Psychometric Layer (everyone) ──────────────────────

export const MODULE_C: Question[] = [
  {
    id: 'negotiation_history',
    module: 'C',
    type: 'mcq',
    title: 'When did you last negotiate your salary?',
    subtitle: 'Non-negotiators earn 12–18% less than identical peers. This is your single biggest controllable gap.',
    required: true,
    options: [
      { value: 'never', label: '😶 Never — I accept what I\'m offered', sublabel: 'Most common answer. Biggest gap driver.', score: 0 },
      { value: 'joining_only', label: '🤝 Only at joining', sublabel: 'Better than nothing, but leaving money on table', score: 3 },
      { value: 'few_years_ago', label: '⏳ 2–3 years ago', sublabel: 'Gap widening since then', score: 5 },
      { value: 'last_year', label: '📅 In the last year', sublabel: 'Good habit forming', score: 7 },
      { value: 'recently', label: '✅ In the last 6 months', sublabel: 'Active market participant', score: 9 },
      { value: 'regularly', label: '🚀 I negotiate every review cycle', sublabel: 'Top 5% behaviour', score: 10 },
    ],
  },
  {
    id: 'growth_investment',
    module: 'C',
    type: 'tapscale',
    title: 'How much have you invested in your own development this year?',
    subtitle: 'Courses, coaching, books, events, mentors — anything you paid for personally.',
    required: true,
    scaleCount: 6,
    scaleLabels: ['₹0', '< ₹2K', '₹2–10K', '₹10–25K', '₹25–50K', '₹50K+'],
    scaleInsight: [
      'No investment signals low career intentionality',
      'Token investment — minimal market signal',
      'Moderate — you\'re trying',
      'Strong — top 30% of professionals',
      'Serious — top 10% self-investor',
      'Elite — 2.3x career velocity vs peers',
    ],
  },
]

// ── HELPER: Get Module B questions for seniority ──────────────────

export function getModuleBQuestions(seniority: string): Question[] {
  switch (seniority) {
    case 'fresher':
    case 'junior':
      return MODULE_B_FRESHER
    case 'mid':
      return MODULE_B_MID
    case 'senior':
      return MODULE_B_SENIOR
    case 'leadership':
      return MODULE_B_LEADERSHIP
    default:
      return MODULE_B_MID
  }
}

export function getAllQuestions(seniority: string): Question[] {
  return [...MODULE_A, ...getModuleBQuestions(seniority), ...MODULE_C]
}

// ── Score calculator ──────────────────────────────────────────────

export interface DimensionScores {
  market_alignment: number    // 0-100
  skill_premium: number       // 0-100
  visibility: number          // 0-100
  mobility: number            // 0-100
  negotiation: number         // 0-100
  hrs: number                 // 0-1000 composite
}

export function calculateScores(answers: Record<string, string | string[] | number>): DimensionScores {
  // Market Alignment: industry + city + role fit
  const industryScore = getOptionScore('industry', answers.industry as string) ?? 5
  const cityScore = getOptionScore('city', answers.city as string) ?? 5
  const market_alignment = Math.round(((industryScore + cityScore) / 20) * 100)

  // Skill Premium: certifications, premium skills, education
  const skillInputs = [
    answers.premium_skills,
    answers.certifications_fresher,
    answers.internship_quality,
  ].filter(Boolean)
  const skill_premium = skillInputs.length > 0 ? Math.min(100, skillInputs.flat().length * 15) : 40

  // Visibility: external presence, employer brand
  const visibilityRaw = Array.isArray(answers.external_visibility)
    ? answers.external_visibility.filter(v => v !== 'no_visibility').length
    : 0
  const visibility = Math.min(100, 20 + visibilityRaw * 18)

  // Mobility: promotion velocity, employer trajectory
  const mobilityMap: Record<string, number> = {
    fast_track: 95, on_track: 70, switched: 80, slow: 40, stuck: 15,
    fresher: 60, junior: 60,
  }
  const mobility = mobilityMap[answers.promotion_velocity as string]
    ?? mobilityMap[answers.seniority as string]
    ?? 50

  // Negotiation score
  const negMap: Record<string, number> = {
    never: 5, joining_only: 25, few_years_ago: 45,
    last_year: 65, recently: 82, regularly: 98,
  }
  const negotiation = negMap[answers.negotiation_history as string] ?? 30

  // HRS composite (weighted)
  const hrs = Math.round(
    market_alignment * 0.20 +
    skill_premium * 0.25 +
    visibility * 0.15 +
    mobility * 0.20 +
    negotiation * 0.20
  ) * 10

  return { market_alignment, skill_premium, visibility, mobility, negotiation, hrs: Math.min(1000, hrs) }
}

function getOptionScore(questionId: string, value: string): number | undefined {
  const allQuestions = [
    ...MODULE_A, ...MODULE_B_FRESHER, ...MODULE_B_MID,
    ...MODULE_B_SENIOR, ...MODULE_B_LEADERSHIP, ...MODULE_C,
  ]
  const q = allQuestions.find(q => q.id === questionId)
  return q?.options?.find(o => o.value === value)?.score
}