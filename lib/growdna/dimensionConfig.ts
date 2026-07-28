// lib/growdna/dimensionConfig.ts
//
// Single source of truth for the 5 earning dimensions — previously
// defined separately (with slightly different colors/labels) in
// GapPage.tsx, GrowDNAAssessment.tsx, and GrowPathView.tsx. Extracting
// this here means those three (and any future page) can share one
// definition instead of three independently-maintained, slowly-drifting
// copies.
//
// NOTE: only GapPage.tsx has been updated to use this so far — the other
// two files' local versions are left untouched for now, as a deliberate,
// separate follow-up rather than an unrequested change to files not in
// scope for this fix.

export type DimensionKey = 'market_alignment' | 'skill_premium' | 'visibility' | 'mobility' | 'negotiation'

export interface DimensionScores {
  market_alignment: number
  skill_premium: number
  visibility: number
  mobility: number
  negotiation: number
}

export const DIMENSION_KEYS: DimensionKey[] = [
  'market_alignment', 'skill_premium', 'visibility', 'mobility', 'negotiation'
]

export const DIMENSION_DISPLAY: Record<DimensionKey, { label: string; color: string; tip: string }> = {
  market_alignment: { label: 'Market Alignment', color: '#e8922a', tip: 'How well your industry + city + role match high-paying market segments' },
  skill_premium:    { label: 'Skill Premium',    color: '#0e7a5a', tip: 'Premium skills, certifications, and credentials that command above-market pay' },
  visibility:       { label: 'Visibility',       color: '#6366f1', tip: 'External presence — thought leadership, LinkedIn, speaking, publications' },
  mobility:         { label: 'Career Mobility',  color: '#0891b2', tip: 'Promotion velocity and trajectory vs peers in your field' },
  negotiation:      { label: 'Negotiation',      color: '#dc2626', tip: 'Frequency and effectiveness of salary negotiation behaviour' },
}