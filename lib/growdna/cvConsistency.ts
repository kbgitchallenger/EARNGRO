// Lightweight, regex-based consistency checks between CV facts and
// GrowDNA self-reported answers. No AI call — pure pattern matching,
// zero token cost. Designed to nudge, never to block.

export interface CVFacts {
  totalYears: number | null
  maxTeamSize: number | null
  hasPLLanguage: boolean
}

const TEAM_SIZE_PATTERN = /\b(?:led|managed|supervised|mentored|headed|oversaw)\s+(?:a\s+team\s+of\s+)?(\d+)\+?\s*(?:analysts|engineers|people|members|developers|associates|reports|staff)/gi

const PL_PATTERN = /\b(p&l|profit\s*&?\s*loss|revenue\s+ownership|owned\s+(?:a\s+)?budget|business\s+unit\s+p&l)\b/i

export function extractCVFacts(parsedData: {
  total_experience_years?: number
  experience?: { bullets?: string[] }[]
} | null): CVFacts {
  if (!parsedData) {
    return { totalYears: null, maxTeamSize: null, hasPLLanguage: false }
  }

  const allBulletsText = (parsedData.experience ?? [])
    .flatMap(e => e.bullets ?? [])
    .join(' ')

  let maxTeamSize: number | null = null
  let match
  while ((match = TEAM_SIZE_PATTERN.exec(allBulletsText)) !== null) {
    const n = parseInt(match[1], 10)
    if (!isNaN(n) && (maxTeamSize === null || n > maxTeamSize)) {
      maxTeamSize = n
    }
  }

  return {
    totalYears: parsedData.total_experience_years ?? null,
    maxTeamSize,
    hasPLLanguage: PL_PATTERN.test(allBulletsText),
  }
}

// Maps a GrowDNA option value to the team-size range it implies
const TEAM_SCALE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  individual:  { min: 0,  max: 0,   label: 'Individual contributor' },
  team_small:  { min: 2,  max: 5,   label: 'Team lead — 2 to 5 people' },
  team_mid:    { min: 6,  max: 15,  label: 'Manager — 6 to 15 people' },
  team_large:  { min: 16, max: 50,  label: 'Senior manager — 16 to 50 people' },
  team_xlarge: { min: 51, max: 9999, label: 'Director / VP — 50+ people' },
}

export interface ConsistencyWarning {
  message: string
}

export function checkTeamScaleConsistency(
  selectedValue: string,
  facts: CVFacts
): ConsistencyWarning | null {
  if (facts.maxTeamSize === null) return null

  const range = TEAM_SCALE_RANGES[selectedValue]
  if (!range) return null

  // Only warn if the CV-derived number is clearly below the selected range
  if (facts.maxTeamSize < range.min) {
    return {
      message: `Your resume mentions managing ${facts.maxTeamSize} people — did you mean a smaller team size than "${range.label}"?`,
    }
  }
  return null
}

export function checkSeniorityConsistency(
  selectedValue: string,
  facts: CVFacts
): ConsistencyWarning | null {
  if (facts.totalYears === null) return null

  const SENIORITY_RANGES: Record<string, { min: number; max: number; label: string }> = {
    fresher:    { min: 0, max: 1.5, label: 'Fresher / New graduate' },
    junior:     { min: 0, max: 3.5, label: 'Early career' },
    mid:        { min: 2, max: 9,   label: 'Mid-level professional' },
    senior:     { min: 6, max: 16,  label: 'Senior / Lead' },
    leadership: { min: 12, max: 99, label: 'Leadership / CXO' },
  }

  const range = SENIORITY_RANGES[selectedValue]
  if (!range) return null

  if (facts.totalYears < range.min - 1) {
    return {
      message: `Your resume shows ${facts.totalYears} years of experience — "${range.label}" usually fits people with more experience. Want to double-check?`,
    }
  }
  return null
}

export function checkPLConsistency(
  selectedValue: string,
  facts: CVFacts
): ConsistencyWarning | null {
  if (selectedValue === 'direct_large' || selectedValue === 'direct_small') {
    if (!facts.hasPLLanguage) {
      return {
        message: `We didn't find P&L or revenue-ownership language in your resume. If this is accurate, no action needed — otherwise consider "Indirect" instead.`,
      }
    }
  }
  return null
}