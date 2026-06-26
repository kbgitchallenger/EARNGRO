import type { Question } from '../questions'

// ── Sales & Field — Mid-level ──────────────────────────────────────

export const MODULE_B_SALES_MID: Question[] = [
  {
    id: 'quota_attainment',
    module: 'B',
    type: 'mcq',
    title: 'How consistently do you hit your sales targets?',
    subtitle: 'Quota attainment is the single strongest predictor of sales compensation.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'exceed_consistently', label: 'Consistently exceed (110%+)', icon: '🚀', sublabel: 'Top quartile performer',     score: 10 },
      { value: 'hit_consistently',    label: 'Consistently hit (95-110%)',  icon: '✅', sublabel: 'Reliable performer',          score: 7  },
      { value: 'hit_sometimes',       label: 'Hit target some quarters',    icon: '📊', sublabel: 'Variable performance',        score: 5  },
      { value: 'below_target',        label: 'Usually below target',        icon: '⚠️', sublabel: 'Below-quota — gap risk',      score: 2  },
      { value: 'no_quota',            label: 'No formal quota structure',    icon: '—',  sublabel: 'Relationship/account-based', score: 5  },
    ],
  },
  {
    id: 'deal_complexity',
    module: 'B',
    type: 'mcq',
    title: 'What is the typical size and complexity of deals you close?',
    subtitle: 'Deal size and sales cycle length directly determine your market value tier.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'enterprise_deals',  label: 'Enterprise deals (₹50L+, multi-stakeholder)', icon: '🏢', score: 10 },
      { value: 'midmarket_deals',   label: 'Mid-market deals (₹5-50L)',                    icon: '💼', score: 7  },
      { value: 'smb_deals',         label: 'SMB / small-ticket deals (under ₹5L)',         icon: '🏪', score: 5  },
      { value: 'high_volume',       label: 'High-volume transactional sales',              icon: '🔄', score: 4  },
      { value: 'channel_partner',   label: 'Channel / partner-driven sales',               icon: '🤝', score: 6  },
    ],
  },
  {
    id: 'client_portfolio',
    module: 'B',
    type: 'multiselect',
    title: 'What does your client relationship base look like?',
    subtitle: 'Select all that apply — portable relationships are a real asset.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'named_accounts',      label: 'Own a named enterprise account list', icon: '📋', score: 9 },
      { value: 'repeat_clients',      label: 'Strong repeat/referral client base',  icon: '🔁', score: 8 },
      { value: 'new_logo_hunter',     label: 'Primarily new-logo / hunting role',   icon: '🎯', score: 7 },
      { value: 'cross_sell_upsell',   label: 'Cross-sell / upsell into existing base', icon: '📈', score: 7 },
      { value: 'no_portable_book',    label: 'No portable client relationships',     icon: '—',  score: 2 },
    ],
  },
]

// ── Sales & Field — Senior ──────────────────────────────────────────

export const MODULE_B_SALES_SENIOR: Question[] = [
  {
    id: 'revenue_ownership',
    module: 'B',
    type: 'mcq',
    title: 'What revenue number are you directly accountable for?',
    subtitle: 'Revenue ownership scale is the primary driver of senior sales compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'individual_number', label: 'My own number only',              icon: '👤', score: 4  },
      { value: 'team_under_5cr',    label: 'Team target under ₹5 Cr',         icon: '👥', score: 6  },
      { value: 'team_5_25cr',       label: 'Team target ₹5-25 Cr',            icon: '🏢', score: 8  },
      { value: 'team_25cr_plus',    label: 'Team target ₹25 Cr+',             icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'sales_team_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of the sales team you lead?',
    subtitle: 'Org scope at senior sales levels maps directly to comp band.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'individual_contributor', label: 'Individual contributor — no team', icon: '👤', score: 3  },
      { value: 'team_lead_small',        label: 'Lead 2-8 reps',                     icon: '👥', score: 6  },
      { value: 'regional_manager',       label: 'Regional manager — 9-25 reps',      icon: '🏭', score: 8  },
      { value: 'national_head',          label: 'National/zonal sales head — 25+',   icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'channel_strategy_role',
    module: 'B',
    type: 'multiselect',
    title: 'What strategic responsibilities do you hold beyond direct selling?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'pricing_strategy',     label: 'Own pricing/discounting strategy', icon: '💰', score: 9 },
      { value: 'channel_partnerships', label: 'Build channel/partner network',    icon: '🤝', score: 8 },
      { value: 'sales_process_design', label: 'Design sales process/playbooks',   icon: '📋', score: 8 },
      { value: 'key_account_negotiator', label: 'Lead negotiations on largest accounts', icon: '🎯', score: 9 },
      { value: 'none_strategic',       label: 'Purely execution-focused',         icon: '—',  score: 3 },
    ],
  },
]