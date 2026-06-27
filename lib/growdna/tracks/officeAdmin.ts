import type { Question } from '../questions'

// ── Administration & Office Management — Mid-level ────────────────────

export const MODULE_B_ADMIN_MID: Question[] = [
  {
    id: 'admin_support_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is the scope of your administrative role?',
    subtitle: 'Who and what you support is the primary driver of compensation in admin/office roles.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'ea_senior_exec',     label: 'Executive Assistant to senior leadership / promoter', icon: '👔', sublabel: 'Highest-paying admin role', score: 9 },
      { value: 'office_manager_full', label: 'Office Manager — full office/facility',              icon: '🏢', score: 7 },
      { value: 'team_dept_admin',    label: 'Admin support for a specific team/department',        icon: '👥', score: 5 },
      { value: 'admin_generalist',   label: 'Admin generalist supporting multiple functions',       icon: '📋', score: 5 },
      { value: 'front_office_reception', label: 'Front office / reception-focused',                 icon: '🗂️', score: 3 },
    ],
  },
  {
    id: 'admin_systems_ownership',
    module: 'B',
    type: 'multiselect',
    title: 'Which processes or systems do you own end-to-end?',
    subtitle: 'Select all that apply — owning a process end-to-end is valued well above purely reactive task support.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'calendar_travel_mgmt',  label: 'Calendar & travel management for senior leaders', icon: '📅', score: 7 },
      { value: 'vendor_facility_mgmt',  label: 'Vendor / facility management',                     icon: '🏢', score: 8 },
      { value: 'budget_expense_admin',  label: 'Budget & expense administration',                  icon: '💰', score: 8 },
      { value: 'hr_onboarding_coord',   label: 'HR / onboarding coordination',                      icon: '🤝', score: 7 },
      { value: 'none_systems_admin',    label: 'Mostly reactive, task-by-task support',             icon: '—',  score: 2 },
    ],
  },
  {
    id: 'admin_stakeholder_complexity',
    module: 'B',
    type: 'multiselect',
    title: 'What is the complexity and sensitivity of your work?',
    subtitle: 'Select all that apply.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'supports_csuite',        label: 'Regularly support C-suite or board-level executives', icon: '🎯', score: 9 },
      { value: 'handles_confidential',   label: 'Regularly handle confidential/sensitive information',  icon: '🔒', score: 8 },
      { value: 'cross_dept_coordination', label: 'Coordinate across multiple departments/locations',     icon: '🔄', score: 7 },
      { value: 'manages_support_staff',  label: 'Manage a small team of support staff',                  icon: '👥', score: 7 },
      { value: 'none_complexity_admin',  label: 'Single-stakeholder, straightforward scope',              icon: '—',  score: 3 },
    ],
  },
]

// ── Administration & Office Management — Senior ───────────────────────

export const MODULE_B_ADMIN_SENIOR: Question[] = [
  {
    id: 'admin_leadership_scope',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior administration leadership scope?',
    subtitle: 'Leadership scope is the primary driver of senior admin/office compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'chief_of_staff',       label: 'Chief of Staff / Head of Administration', icon: '🚀', score: 10 },
      { value: 'senior_ea_ceo',         label: 'Senior EA to CEO / Promoter / Founder',    icon: '👔', score: 8  },
      { value: 'facilities_ops_head',   label: 'Facilities / Office Operations Head — multi-location', icon: '🏢', score: 8 },
      { value: 'senior_admin_no_lead',  label: 'Senior admin professional, no broader leadership', icon: '👤', score: 5 },
    ],
  },
  {
    id: 'admin_org_scale_supported',
    module: 'B',
    type: 'mcq',
    title: 'What scale of organisation does your function support?',
    subtitle: 'Organisation scale supported is a strong senior admin compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_org_admin',  label: 'Support 500+ employee organisation',  icon: '🚀', score: 9 },
      { value: 'mid_org_admin',    label: 'Support 100-500 employee organisation', icon: '🏢', score: 7 },
      { value: 'small_org_admin',  label: 'Support under 100 employees',           icon: '👥', score: 4 },
    ],
  },
  {
    id: 'admin_strategic_involvement',
    module: 'B',
    type: 'multiselect',
    title: 'What strategic responsibilities do you hold beyond daily administration?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'strategic_planning_support', label: 'Involved in strategic planning / decision support for leadership', icon: '🎯', score: 9 },
      { value: 'significant_budget_admin',   label: 'Own a significant vendor/facility budget',                         icon: '💰', score: 8 },
      { value: 'office_expansion_projects',  label: 'Lead office expansion / relocation projects',                       icon: '🏗️', score: 8 },
      { value: 'none_strategic_admin',       label: 'Primarily operational, not strategic',                              icon: '—',  score: 3 },
    ],
  },
]