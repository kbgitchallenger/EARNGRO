import type { Question } from '../questions'

// ── Research & Academia — Mid-level ───────────────────────────────────

export const MODULE_B_RESEARCH_MID: Question[] = [
  {
    id: 'research_setting',
    module: 'B',
    type: 'mcq',
    title: 'What is your research setting?',
    subtitle: 'Setting is the biggest comp driver in research/academic careers — industry research pays very differently from academia.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'industry_research',   label: 'Industry / corporate research lab', icon: '🏢', sublabel: 'Highest-paying setting', score: 10 },
      { value: 'university_tenure_track', label: 'University — tenure-track',     icon: '🎓', score: 6 },
      { value: 'university_non_tenure', label: 'University — non-tenure / adjunct', icon: '📚', score: 4 },
      { value: 'govt_research_inst',  label: 'Government research institute',     icon: '🏛️', score: 5 },
      { value: 'postdoc',             label: 'Postdoctoral researcher',            icon: '🔬', score: 4 },
    ],
  },
  {
    id: 'publication_record',
    module: 'B',
    type: 'mcq',
    title: 'What is your publication track record?',
    subtitle: 'Publication record (and citation impact) is the academic equivalent of "track record" in industry roles.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'strong_high_impact', label: 'Multiple papers in high-impact / top-tier venues', icon: '🏆', score: 9 },
      { value: 'steady_record',      label: 'Steady publication record, mid-tier venues',          icon: '📄', score: 6 },
      { value: 'early_publications', label: 'A few publications, early career',                    icon: '🌱', score: 4 },
      { value: 'no_publications',    label: 'No publications yet',                                 icon: '—',  score: 1 },
    ],
  },
  {
    id: 'research_funding_grants',
    module: 'B',
    type: 'multiselect',
    title: 'What grant or funding experience do you have?',
    subtitle: 'Select all that apply — grant-winning ability is a major differentiator in research careers.',
    required: true,
    columns: 2,
    branch: ['mid'],
    options: [
      { value: 'pi_major_grant',     label: 'Principal Investigator on a major grant', icon: '🚀', score: 9 },
      { value: 'co_investigator',    label: 'Co-investigator on funded research',       icon: '🤝', score: 6 },
      { value: 'industry_collab',    label: 'Industry-sponsored research collaboration', icon: '🏢', score: 7 },
      { value: 'none_funding',       label: 'No grant/funding experience yet',           icon: '—',  score: 2 },
    ],
  },
]

// ── Research & Academia — Senior ──────────────────────────────────────

export const MODULE_B_RESEARCH_SENIOR: Question[] = [
  {
    id: 'research_seniority_status',
    module: 'B',
    type: 'mcq',
    title: 'What is your senior academic/research status?',
    subtitle: 'Tenure and seniority status are the primary drivers of senior academic compensation.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'tenured_professor',   label: 'Tenured Professor',                       icon: '🚀', score: 10 },
      { value: 'principal_scientist', label: 'Principal Scientist / Research Lead (industry)', icon: '🏢', score: 9 },
      { value: 'associate_professor', label: 'Associate Professor (pre-tenure)',          icon: '🎓', score: 7 },
      { value: 'senior_researcher_no_tenure', label: 'Senior Researcher, non-tenure track', icon: '👤', score: 6 },
    ],
  },
  {
    id: 'research_lab_team_scale',
    module: 'B',
    type: 'mcq',
    title: 'What scale of lab or research team do you lead?',
    subtitle: 'Lab/team scale is a strong senior research compensation signal.',
    required: true,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'large_lab',   label: 'Lead a lab/team of 10+ researchers', icon: '🚀', score: 10 },
      { value: 'mid_lab',     label: 'Lead a lab/team of 3-10',             icon: '🏢', score: 7  },
      { value: 'small_lab',   label: 'Lead a small team under 3',           icon: '👥', score: 5  },
      { value: 'solo_research', label: 'Independent researcher, no team',   icon: '👤', score: 4  },
    ],
  },
  {
    id: 'research_external_standing',
    module: 'B',
    type: 'multiselect',
    title: 'What is your external academic/research standing?',
    subtitle: 'Select all that apply.',
    required: false,
    columns: 2,
    branch: ['senior'],
    options: [
      { value: 'high_citation_count',  label: 'High citation count / h-index in your field', icon: '📊', score: 9 },
      { value: 'keynote_speaker',       label: 'Keynote speaker at major conferences',         icon: '🎤', score: 8 },
      { value: 'editorial_board',       label: 'Editorial board / peer review leadership',     icon: '📝', score: 8 },
      { value: 'patents_research',      label: 'Hold patents from your research',              icon: '🔬', score: 8 },
      { value: 'none_standing_research', label: 'Limited external recognition',                icon: '—',  score: 3 },
    ],
  },
]