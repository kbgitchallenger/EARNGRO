import type { Question } from '../questions'

// ── Technology & Product — Mid-level ───────────────────────────────────

export const MODULE_B_TECH_MID: Question[] = [
  {
    id: 'tech_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your technical specialization?',
    subtitle: 'Specialization is the biggest comp driver in tech right now — more than years of experience alone.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'ai_ml_engineer',      label: 'AI / ML / LLM Engineering',          icon: '🤖', sublabel: 'Highest-demand specialisation', score: 10 },
      { value: 'backend_systems',     label: 'Backend / Distributed Systems',      icon: '⚙️', score: 8  },
      { value: 'data_platform',       label: 'Data Engineering / Data Platform',   icon: '📊', score: 9  },
      { value: 'cloud_devops',        label: 'Cloud / DevOps / SRE',                icon: '☁️', score: 8  },
      { value: 'frontend_fullstack',  label: 'Frontend / Full-stack',                icon: '💻', score: 6  },
      { value: 'product_mgmt_tech',   label: 'Product Management',                  icon: '🗺️', score: 8  },
    ],
  },
  {
    id: 'tech_scale_ownership',
    module: 'B',
    type: 'mcq',
    title: 'What scale of system or product do you own?',
    subtitle: 'Scale owned is the strongest mid-level signal — far more telling than job title alone.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'high_scale',        label: 'High-scale system (millions of users / TB+ data)', icon: '🚀', score: 10 },
      { value: 'mid_scale',         label: 'Mid-scale (hundreds of thousands of users)',          icon: '📈', score: 7  },
      { value: 'internal_tools',    label: 'Internal tools / smaller user base',                  icon: '🛠️', score: 5  },
      { value: 'early_stage_tech',  label: 'Early-stage product, still finding scale',             icon: '🌱', score: 4  },
    ],
  },
  {
    id: 'tech_impact_evidence',
    module: 'B',
    type: 'multiselect',
    title: 'What measurable technical impact have you driven?',
    subtitle: 'Select all that apply — quantified technical impact is the strongest signal recruiters screen for.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'performance_improvement', label: 'Major performance/cost optimisation (latency, infra cost)', icon: '⚡', score: 9 },
      { value: 'shipped_ml_production',   label: 'Shipped ML models to production',                              icon: '🤖', score: 9 },
      { value: 'led_migration',           label: 'Led a major migration/re-architecture',                        icon: '🔄', score: 8 },
      { value: 'open_source_contrib',     label: 'Significant open-source contributions',                       icon: '⭐', score: 7 },
      { value: 'none_impact_tech',        label: 'Steady contributor, no major standout initiative yet',         icon: '—',  score: 3 },
    ],
  },
]

// ── Technology & Product — Senior ───────────────────────────────────────

export const MODULE_B_TECH_SENIOR: Question[] = [
  {
    id: 'tech_leadership_track',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior technical leadership track?',
    subtitle: 'Tech and engineering leadership splits into two distinct tracks at senior levels — management and individual-contributor.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'engineering_manager', label: 'Engineering Manager / Director', icon: '👥', score: 9  },
      { value: 'staff_principal',     label: 'Staff / Principal Engineer (IC track)', icon: '🎯', sublabel: 'No direct reports', score: 9 },
      { value: 'head_of_product',     label: 'Head of Product / VP Product',  icon: '🚀', score: 9  },
      { value: 'cto_equivalent',      label: 'CTO / VP Engineering',           icon: '🏆', score: 10 },
      { value: 'senior_ic_no_track',  label: 'Senior IC, not yet on a formal leadership track', icon: '👤', score: 6 },
    ],
  },
  {
    id: 'tech_org_system_scale',
    module: 'B',
    type: 'mcq',
    title: 'What scale of engineering org or system architecture do you own?',
    subtitle: 'Scale of org or architecture owned is the strongest senior tech compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_eng_org',     label: 'Own architecture/org for 50+ engineers', icon: '🚀', score: 10 },
      { value: 'mid_eng_org',       label: '15-50 engineers',                          icon: '🏢', score: 8  },
      { value: 'small_eng_org',     label: 'Under 15 engineers',                       icon: '👥', score: 6  },
      { value: 'cross_org_architecture', label: 'Cross-org architecture/platform influence, no direct team', icon: '🎯', score: 8 },
    ],
  },
  {
    id: 'tech_external_standing',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external technical standing?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'conference_speaker_tech', label: 'Speaker at major tech conferences',  icon: '🎤', score: 8 },
      { value: 'published_tech',           label: 'Published technical papers/articles', icon: '📝', score: 7 },
      { value: 'open_source_maintainer',   label: 'Maintainer of a notable open-source project', icon: '⭐', score: 9 },
      { value: 'patents_tech',             label: 'Hold technical patents',              icon: '🔬', score: 8 },
      { value: 'none_standing_tech',       label: 'Limited external visibility',         icon: '—',  score: 3 },
    ],
  },
]