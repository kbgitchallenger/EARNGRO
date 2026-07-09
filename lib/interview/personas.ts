export interface InterviewerPersona {
  id: string
  name: string
  title: string
  company: string
  style: string
  description: string
  emoji: string
  signaturePhrase: string
  color: string
  bestFor: string[]
}

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    title: 'Senior Hiring Manager',
    company: 'Ex-McKinsey, now at a unicorn',
    style: 'Warm but exacting',
    description: 'Priya believes the best answers come from the second follow-up, not the first answer. She is patient, genuinely curious, and rewards depth over polish.',
    emoji: '👩‍💼',
    signaturePhrase: 'That\'s interesting — can you walk me through the specific outcome?',
    color: '#6366f1',
    bestFor: ['behavioral', 'leadership'],
  },
  {
    id: 'rahul',
    name: 'Rahul Verma',
    title: 'Engineering Director',
    company: 'Big Tech background, now VP at a Series B',
    style: 'Direct and technical',
    description: 'Rahul has zero patience for vague answers. He wants numbers, timelines, and names. If you\'re specific, he\'ll respect it. If you\'re vague, he\'ll tell you immediately.',
    emoji: '👨‍💻',
    signaturePhrase: 'Give me the actual numbers. What moved, by how much?',
    color: '#0891b2',
    bestFor: ['functional', 'behavioral'],
  },
  {
    id: 'sneha',
    name: 'Sneha Kapoor',
    title: 'Talent Partner',
    company: 'Placed 300+ senior hires across India/SEA',
    style: 'Skeptical but fair',
    description: 'Sneha has heard every rehearsed answer. She is professional but will challenge every claim to see if you really did what you say you did. She is the hardest to impress — and the most valuable to practice with.',
    emoji: '🧑‍💼',
    signaturePhrase: 'Bold claim — take me through exactly how you achieved that.',
    color: '#0e7a5a',
    bestFor: ['behavioral', 'leadership', 'negotiation'],
  },
]

// Returns null on a miss rather than silently substituting a different
// persona than the one requested — callers must handle the null case
// explicitly (e.g. return a 400), since silently swapping personas would
// be a confusing, hard-to-notice bug for the user.
export function getPersona(id: string): InterviewerPersona | null {
  return INTERVIEWER_PERSONAS.find(p => p.id === id) ?? null
}