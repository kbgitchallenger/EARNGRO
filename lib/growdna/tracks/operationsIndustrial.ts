import type { Question } from '../questions'

// ── Operations & Industrial — Mid-level ────────────────────────────

export const MODULE_B_OPS_MID: Question[] = [
  {
    id: 'ops_scale_managed',
    module: 'B',
    type: 'mcq',
    title: 'What scale of operation do you directly manage?',
    subtitle: 'Throughput and scale are the primary value drivers in operations roles.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'shift_line',       label: 'Single shift / production line', icon: '⚙️', sublabel: 'Floor-level ownership',        score: 4  },
      { value: 'single_facility',  label: 'Single plant / warehouse / site', icon: '🏭', sublabel: 'Full-site responsibility',     score: 7  },
      { value: 'multi_shift',      label: 'Multiple shifts across a site',   icon: '🔄', sublabel: 'Cross-shift coordination',     score: 6  },
      { value: 'multi_site',       label: 'Multiple sites / locations',      icon: '🗺️', sublabel: 'Regional operations scope',    score: 9  },
      { value: 'project_based',    label: 'Project-based (construction/infra)', icon: '🏗️', sublabel: 'Defined project scope',    score: 6  },
    ],
  },
  {
    id: 'process_improvement',
    module: 'B',
    type: 'multiselect',
    title: 'Which process or efficiency credentials do you hold?',
    subtitle: 'Select all that apply — these are the certifications operations recruiters specifically screen for.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'six_sigma',        label: 'Six Sigma (Green/Black Belt)',     icon: '🎯', score: 9 },
      { value: 'lean_manufacturing', label: 'Lean Manufacturing certified',   icon: '⚙️', score: 8 },
      { value: 'iso_audit',        label: 'ISO audit / QMS experience',       icon: '📋', score: 7 },
      { value: 'erp_systems',      label: 'ERP systems (SAP, Oracle) hands-on', icon: '💻', score: 8 },
      { value: 'safety_cert',      label: 'Safety/EHS certification',          icon: '🦺', score: 6 },
      { value: 'none_ops_cert',    label: 'None of the above',                 icon: '—',  score: 0 },
    ],
  },
  {
    id: 'cost_impact',
    module: 'B',
    type: 'mcq',
    title: 'Have you driven a measurable cost reduction or efficiency gain?',
    subtitle: 'Quantified operational impact is the strongest signal for mid-level ops compensation.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'major_savings',    label: 'Yes — major savings (₹50L+ or 20%+ efficiency)', icon: '🚀', score: 10 },
      { value: 'moderate_savings', label: 'Yes — moderate, measurable improvement',           icon: '📈', score: 7  },
      { value: 'maintained_ops',   label: 'Maintained stable operations, no major initiative', icon: '✅', score: 4  },
      { value: 'no_clear_impact',  label: 'No clearly quantified impact yet',                  icon: '—',  score: 2  },
    ],
  },
]

// ── Operations & Industrial — Senior ───────────────────────────────

export const MODULE_B_OPS_SENIOR: Question[] = [
  {
    id: 'ops_team_scale',
    module: 'B',
    type: 'mcq',
    title: 'What is the scale of the workforce you lead?',
    subtitle: 'Headcount and span of control map directly to senior operations comp bands.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'supervisor_small',   label: 'Supervise 10-50 workers',        icon: '👥', score: 4  },
      { value: 'plant_manager',      label: 'Plant/site head — 50-200',       icon: '🏭', score: 7  },
      { value: 'multi_plant_head',   label: 'Multi-plant head — 200-1000',    icon: '🗺️', score: 9  },
      { value: 'regional_ops_head',  label: 'Regional/national ops head — 1000+', icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'capex_budget_ownership',
    module: 'B',
    type: 'mcq',
    title: 'What level of budget or capital expenditure do you own?',
    subtitle: 'Budget ownership is the strongest predictor of senior operations compensation, similar to P&L in corporate roles.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'no_budget',       label: 'No direct budget ownership',     icon: '—',  score: 2  },
      { value: 'opex_only',       label: 'Operating budget under ₹5 Cr',    icon: '📊', score: 5  },
      { value: 'capex_5_25cr',    label: 'Capex/budget ₹5-25 Cr',           icon: '💰', score: 8  },
      { value: 'capex_25cr_plus', label: 'Capex/budget ₹25 Cr+',            icon: '🚀', score: 10 },
    ],
  },
  {
    id: 'ops_strategic_scope',
    module: 'B',
    type: 'multiselect',
    title: 'What strategic responsibilities do you hold beyond day-to-day operations?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'vendor_negotiation',  label: 'Lead vendor/supplier contract negotiation', icon: '🤝', score: 8 },
      { value: 'network_design',      label: 'Design network/facility footprint',          icon: '🗺️', score: 9 },
      { value: 'digital_transformation', label: 'Lead automation/digital transformation',  icon: '🤖', score: 9 },
      { value: 'compliance_ownership', label: 'Own regulatory/compliance relationships',    icon: '📋', score: 7 },
      { value: 'none_strategic_ops',  label: 'Purely execution-focused',                    icon: '—',  score: 3 },
    ],
  },
]