import type { Question } from '../questions'

// ── Founder & Entrepreneur — Mid-level (treated as "early-stage founder") ──

export const MODULE_B_FOUNDER_MID: Question[] = [
  {
    id: 'funding_stage',
    module: 'B',
    type: 'mcq',
    title: 'What stage is your venture at?',
    subtitle: 'Funding/revenue stage is the primary driver of founder compensation and equity value — there\'s no "employer brand" equivalent here.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'pre_revenue',       label: 'Pre-revenue / pre-launch',           icon: '🌱', score: 3  },
      { value: 'early_revenue',     label: 'Early revenue, pre-Series A',         icon: '📈', score: 5  },
      { value: 'series_a_b',        label: 'Series A/B funded',                   icon: '🚀', score: 8  },
      { value: 'series_c_plus',     label: 'Series C+ or profitable & scaling',   icon: '🏆', score: 10 },
      { value: 'bootstrapped_profitable', label: 'Bootstrapped and profitable',   icon: '💰', score: 8  },
    ],
  },
  {
    id: 'founder_revenue_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is your current annual revenue (ARR/turnover)?',
    subtitle: 'Revenue scale is the founder-equivalent of "current salary" — it determines the realistic next milestone.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'pre_arr',        label: 'Pre-revenue',                  icon: '—',  score: 2  },
      { value: 'under_1cr',      label: 'Under ₹1 Cr ARR/turnover',      icon: '🪙', score: 4  },
      { value: '1_10cr',         label: '₹1-10 Cr ARR/turnover',          icon: '📊', score: 7  },
      { value: '10cr_plus',      label: '₹10 Cr+ ARR/turnover',           icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'founder_runway_team',
    module: 'B',
    type: 'mcq',
    title: 'What is your runway and team situation?',
    subtitle: 'Runway and team stability affect realistic near-term financial outcomes.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'healthy_runway',   label: '12+ months runway, stable core team', icon: '✅', score: 8 },
      { value: 'moderate_runway',  label: '6-12 months runway',                  icon: '⏳', score: 5 },
      { value: 'tight_runway',     label: 'Under 6 months runway',               icon: '⚠️', score: 2 },
      { value: 'solo_founder',     label: 'Solo founder, self-funded, no fundraising pressure', icon: '👤', score: 6 },
    ],
  },
]

// ── Founder & Entrepreneur — Senior (scaled-stage founder) ────────────

export const MODULE_B_FOUNDER_SENIOR: Question[] = [
  {
    id: 'founder_scale_achieved',
    module: 'B',
    type: 'mcq',
    title: 'What scale has your venture reached?',
    subtitle: 'Scale achieved is the strongest signal for a senior founder\'s market position and equity value.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_scale_founder', label: '₹50 Cr+ revenue or 200+ employees', icon: '🚀', score: 10 },
      { value: 'mid_scale_founder',   label: '₹10-50 Cr revenue or 50-200 employees', icon: '🏢', score: 8 },
      { value: 'successful_exit',     label: 'Successfully exited a previous venture', icon: '🏆', score: 9 },
      { value: 'smaller_scale_founder', label: 'Under ₹10 Cr revenue, under 50 employees', icon: '📊', score: 5 },
    ],
  },
  {
    id: 'founder_fundraising_track_record',
    module: 'B',
    type: 'mcq',
    title: 'What is your fundraising track record?',
    subtitle: 'Fundraising track record is a strong signal of investor confidence and market credibility.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'multi_round_tier1', label: 'Raised multiple rounds from tier-1 investors', icon: '🚀', score: 10 },
      { value: 'single_round_solid', label: 'Raised one solid round',                       icon: '✅', score: 7 },
      { value: 'bootstrapped_senior', label: 'Never raised — fully bootstrapped',            icon: '💰', score: 6 },
      { value: 'struggled_raise',    label: 'Struggled to raise / down round',               icon: '⚠️', score: 3 },
    ],
  },
  {
    id: 'founder_external_credibility',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external market credibility?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'media_coverage_founder',  label: 'Significant media coverage',        icon: '📰', score: 8 },
      { value: 'industry_recognition_founder', label: 'Industry awards/recognition',  icon: '🏆', score: 7 },
      { value: 'advisor_other_startups',  label: 'Advise/mentor other founders',      icon: '🤝', score: 7 },
      { value: 'speaker_founder',          label: 'Speaker at startup/industry events', icon: '🎤', score: 7 },
      { value: 'none_credibility_founder', label: 'Low external visibility',           icon: '—',  score: 3 },
    ],
  },
]