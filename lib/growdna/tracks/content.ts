import type { Question } from '../questions'

// ── Content & Independent Creative — Mid-level ─────────────────────────

export const MODULE_B_CONTENT_MID: Question[] = [
  {
    id: 'content_specialization',
    module: 'B',
    type: 'mcq',
    title: 'Which best describes your content specialization?',
    subtitle: 'Specialization within content drives compensation more than years of experience.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'seo_content_strategy', label: 'SEO / Content Strategy',      icon: '📊', sublabel: 'Measurable, growing premium', score: 8 },
      { value: 'technical_writing',    label: 'Technical / Long-form Writing', icon: '✍️', score: 7 },
      { value: 'video_content',        label: 'Video / Multimedia Content',   icon: '🎬', score: 7 },
      { value: 'social_community',     label: 'Social Media / Community',     icon: '💬', score: 5 },
      { value: 'copywriting_brand',    label: 'Copywriting / Brand Voice',     icon: '🎨', score: 6 },
    ],
  },
  {
    id: 'content_work_model',
    module: 'B',
    type: 'mcq',
    title: 'What is your work model?',
    subtitle: 'Employment vs independent work changes how compensation and stability should be read.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'fulltime_employed_content', label: 'Full-time employed at a company', icon: '🏢', score: 6 },
      { value: 'freelance_multiple_clients', label: 'Freelance with multiple regular clients', icon: '💼', sublabel: 'Diversified income', score: 7 },
      { value: 'freelance_single_client',    label: 'Freelance, primarily one client',  icon: '👤', score: 4 },
      { value: 'own_platform_content',       label: 'Build and monetise own platform/audience', icon: '🚀', sublabel: 'Newsletter, channel, etc.', score: 8 },
    ],
  },
  {
    id: 'content_audience_proof',
    module: 'B',
    type: 'multiselect',
    title: 'What measurable proof of impact or reach do you have?',
    subtitle: 'Select all that apply — quantified reach is the strongest signal in content work.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'large_owned_audience', label: 'Own a sizable audience/following (10K+)', icon: '📈', score: 9 },
      { value: 'measurable_traffic_seo', label: 'Drove measurable organic traffic/SEO growth', icon: '📊', score: 8 },
      { value: 'viral_campaigns',       label: 'Created content that achieved significant reach/virality', icon: '🚀', score: 7 },
      { value: 'consistent_output',      label: 'Consistent, reliable output — no major reach metrics', icon: '✅', score: 4 },
      { value: 'none_proof_content',     label: 'Early career, building portfolio',         icon: '—',  score: 2 },
    ],
  },
]

// ── Content & Independent Creative — Senior ─────────────────────────────

export const MODULE_B_CONTENT_SENIOR: Question[] = [
  {
    id: 'content_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior content leadership scope?',
    subtitle: 'Leadership scope or platform scale is the primary driver of senior content compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'head_of_content',     label: 'Head of Content for an organisation', icon: '🚀', score: 9  },
      { value: 'editorial_director',  label: 'Editorial Director / Lead',           icon: '🏢', score: 8  },
      { value: 'established_independent', label: 'Established independent creator/consultant', icon: '👤', sublabel: 'Strong personal brand', score: 9 },
      { value: 'senior_ic_content',   label: 'Senior IC, no team leadership',        icon: '🎯', score: 5 },
    ],
  },
  {
    id: 'content_business_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of your content business or team?',
    subtitle: 'Scale — whether a team you lead or a platform/business you\'ve built — is a strong senior compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_content_team',  label: 'Lead a content team of 10+',           icon: '🚀', score: 10 },
      { value: 'mid_content_team',    label: 'Lead a content team of 3-10',           icon: '🏢', score: 7  },
      { value: 'large_independent_business', label: 'Independent business/platform generating ₹50L+ annually', icon: '💰', score: 9 },
      { value: 'smaller_scale_content', label: 'Small team or modest independent income', icon: '👤', score: 4 },
    ],
  },
  {
    id: 'content_external_standing',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external standing and recognition?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'industry_awards_content', label: 'Won content/media industry awards', icon: '🏆', score: 8 },
      { value: 'speaker_content',          label: 'Speaker at industry events',        icon: '🎤', score: 7 },
      { value: 'press_features_content',   label: 'Featured in major press/media',      icon: '📰', score: 7 },
      { value: 'brand_partnerships',       label: 'Strategic brand partnerships/sponsorships', icon: '🤝', score: 7 },
      { value: 'none_standing_content',    label: 'Limited external recognition',       icon: '—',  score: 3 },
    ],
  },
]