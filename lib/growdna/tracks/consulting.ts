import type { Question } from '../questions'

// ── Consulting & Strategy — Mid-level ──────────────────────────────────

export const MODULE_B_CONSULTING_MID: Question[] = [
  {
    id: 'consulting_context',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your consulting context?',
    subtitle: 'Firm tier is one of the strongest compensation drivers in consulting.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'mbb_strategy',        label: 'Strategy consulting at a top-tier firm',    icon: '🏆', sublabel: 'MBB-equivalent — highest premium', score: 10 },
      { value: 'big4_advisory',       label: 'Big 4 / large advisory firm',                icon: '🏢', score: 7  },
      { value: 'boutique_specialist', label: 'Boutique / specialist consulting firm',      icon: '🎯', score: 7  },
      { value: 'implementation_it',   label: 'Implementation / IT consulting',             icon: '💻', score: 6  },
      { value: 'independent_consultant', label: 'Independent / freelance consultant',      icon: '👤', score: 6  },
    ],
  },
  {
    id: 'consulting_client_level',
    module: 'B',
    type: 'mcq',
    title: 'What scale of projects and client seniority do you typically work with?',
    subtitle: 'Client seniority and project scale are key signals for consulting compensation.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'c_suite_clients',    label: 'Work directly with C-suite/board on major initiatives', icon: '🚀', score: 10 },
      { value: 'senior_mgmt_clients', label: 'Work with senior management on functional projects',     icon: '🏢', score: 7  },
      { value: 'mid_mgmt_clients',    label: 'Work with mid-management on operational projects',       icon: '📊', score: 5  },
      { value: 'junior_support',      label: 'Primarily analytical/support role on projects',           icon: '📋', score: 3  },
    ],
  },
  {
    id: 'consulting_expertise_breadth',
    module: 'B',
    type: 'multiselect',
    title: 'What is the breadth of your consulting expertise?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'multiple_industries',     label: 'Worked across multiple industries',            icon: '🌍', score: 8 },
      { value: 'led_workstreams',         label: 'Led full workstreams independently',           icon: '🎯', score: 8 },
      { value: 'new_business_dev',        label: 'Contributed to new business development/proposals', icon: '💼', score: 7 },
      { value: 'specialized_methodology', label: 'Deep expertise in a specific methodology/framework', icon: '🛠️', score: 7 },
      { value: 'none_breadth_consulting', label: 'Primarily execution on defined scope',          icon: '—',  score: 3 },
    ],
  },
]

// ── Consulting & Strategy — Senior ─────────────────────────────────────

export const MODULE_B_CONSULTING_SENIOR: Question[] = [
  {
    id: 'consulting_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior consulting leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior consulting compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'partner_principal',         label: 'Partner / Principal at your firm',           icon: '🚀', score: 10 },
      { value: 'engagement_director',       label: 'Engagement / Project Director leading large teams', icon: '🏢', score: 8 },
      { value: 'senior_manager_consulting', label: 'Senior Manager, leads small project teams',  icon: '🎯', score: 6 },
      { value: 'senior_ic_consulting',      label: 'Senior IC / expert advisor, no team leadership', icon: '👤', score: 6 },
    ],
  },
  {
    id: 'consulting_book_of_business',
    module: 'B',
    type: 'mcq',
    title: 'What revenue or client relationships do you own?',
    subtitle: 'Owned client revenue ("book of business") is the strongest senior consulting compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_book',    label: 'Own client relationships generating ₹10 Cr+ annually', icon: '🚀', score: 10 },
      { value: 'mid_book',      label: '₹2-10 Cr in owned client revenue',                       icon: '💼', score: 7  },
      { value: 'emerging_book', label: 'Building client relationships, under ₹2 Cr',              icon: '📊', score: 5  },
      { value: 'no_book',       label: 'No direct revenue ownership',                             icon: '—',  score: 3  },
    ],
  },
  {
    id: 'consulting_thought_leadership',
    module: 'B',
    type: 'multiselect',
    title: 'What is your thought leadership and external presence?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'published_thought_leadership', label: 'Published reports / thought leadership', icon: '📝', score: 8 },
      { value: 'speaker_consulting',           label: 'Speaker at industry events',              icon: '🎤', score: 8 },
      { value: 'board_advisory_consulting',    label: 'Hold board / advisory positions',         icon: '🤝', score: 9 },
      { value: 'proprietary_methodology',      label: 'Developed proprietary frameworks/IP',      icon: '🛠️', score: 9 },
      { value: 'none_thought_leadership',      label: 'Limited external visibility',             icon: '—',  score: 3 },
    ],
  },
]