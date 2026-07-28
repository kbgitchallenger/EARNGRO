// lib/growdna/skillQuestions.ts
//
// New universal Competencies section, per the Skills Intelligence
// Platform brief — ONE shared set of questions for every user, regardless
// of career track, instead of duplicating skill questions per track.
// Meant to be appended to MODULE_C in questions.ts, not to replace
// anything already there.

import type { Question } from './questions'

// NOTE: this file assumes Question has been extended with two more fields
// beyond skillSearchCategory/ratingRequired — see the questions.ts diff
// provided separately: `searchTarget?: 'competency' | 'certification'`.
// Needed because certifications live in a genuinely separate table
// (certifications_taxonomy), not as a category value within
// competency_taxonomy — using skillSearchCategory for this would have
// searched the wrong table entirely.

export const SKILL_QUESTIONS: Question[] = [
  {
    id: 'primary_competencies',
    module: 'C',
    type: 'skill_rating',
    title: 'What are your primary competencies?',
    subtitle: 'Select 3–4 skills, tools, or areas you use regularly, and rate your proficiency in each.',
    min: 3,
    max: 4,
    ratingRequired: true,
    required: true,
    searchTarget: 'competency',
  },
  {
    id: 'secondary_competencies',
    module: 'C',
    type: 'skill_rating',
    title: 'Any secondary competencies worth mentioning?',
    subtitle: 'Select 2–3 more — rating is optional here.',
    min: 0,
    max: 3,
    ratingRequired: false,
    required: false,
    searchTarget: 'competency',
  },
  {
    id: 'certifications_search',
    module: 'C',
    type: 'skill_rating',
    title: 'Do you hold any relevant certifications?',
    subtitle: 'Search and select any that apply — this is optional.',
    min: 0,
    max: 6,
    ratingRequired: false,
    required: false,
    searchTarget: 'certification',
  },
]