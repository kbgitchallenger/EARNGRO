// Faithful, minimal recreation of the real AI Interview session screen —
// real scale, on-brand only, no sidebar chrome.
//
// Accepts optional real-data props so the locked-preview usage (Interview
// page, non-Accelerate users) can show a persona/focus genuinely matched
// to THIS user's weakest GrowDNA dimension and real role, instead of a
// fixed generic example — same personalization pattern as GrowPathMockup.
// All props default to the original example values, so the landing-page
// usage (`<InterviewMockup />` with no props) renders byte-identical to
// before.

// Mirrors the real personas in lib/interview/personas.ts (name, emoji,
// color, signature phrase) — not reinvented here, just the subset needed
// to render this preview without importing the full persona catalog.
const PERSONA_BY_DIMENSION: Record<string, { name: string; title: string; emoji: string; color: string; phrase: string }> = {
  negotiation: {
    name: 'Sneha Kapoor', title: 'Talent Partner', emoji: '🧑‍💼', color: '#0e7a5a',
    phrase: 'Bold claim — take me through exactly how you achieved that.',
  },
  skill_premium: {
    name: 'Rahul Verma', title: 'Engineering Director', emoji: '👨‍💻', color: '#0891b2',
    phrase: 'Give me the actual numbers. What moved, by how much?',
  },
  market_alignment: {
    name: 'Rahul Verma', title: 'Engineering Director', emoji: '👨‍💻', color: '#0891b2',
    phrase: 'Give me the actual numbers. What moved, by how much?',
  },
  visibility: {
    name: 'Priya Sharma', title: 'Senior Hiring Manager', emoji: '👩‍💼', color: '#6366f1',
    phrase: 'That\'s interesting — can you walk me through the specific outcome?',
  },
  mobility: {
    name: 'Priya Sharma', title: 'Senior Hiring Manager', emoji: '👩‍💼', color: '#6366f1',
    phrase: 'That\'s interesting — can you walk me through the specific outcome?',
  },
}

interface InterviewMockupProps {
  role?: string
  weakestDimension?: string
}

export default function InterviewMockup({
  role,
  weakestDimension = 'visibility',
}: InterviewMockupProps = {}) {
  const persona = PERSONA_BY_DIMENSION[weakestDimension] ?? PERSONA_BY_DIMENSION.visibility
  const roleLabel = role || 'Behavioral'

  return (
    <div className="iv-card">
      <div>
        {/* Session header — persona now matched to this user's real
            weakest dimension, role shown when known */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{persona.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{persona.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{persona.title}{role ? ` · ${roleLabel}` : ' · Behavioral'}</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Question 3 of 5</span>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 18 }}>
          {[1, 1, 0, -1, -1].map((state, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                background: state === 1 ? 'var(--teal)' : state === 0 ? 'var(--teal-l)' : 'var(--paper-2)',
                border: `2px solid ${state === 1 ? 'var(--teal)' : state === 0 ? 'var(--teal)' : 'var(--border)'}`,
                color: state === 1 ? '#fff' : state === 0 ? 'var(--teal-d)' : 'var(--muted)',
              }}>
                {state === 1 ? '✓' : i + 1}
              </div>
              {i < 4 && <div style={{ flex: 1, height: 2, background: state === 1 ? 'var(--teal)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Question + answer — persona's real signature phrase used as the
            follow-up, so the persona swap is visible, not just cosmetic */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, flexShrink: 0 }} />
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: '14px 14px 14px 4px', padding: '10px 13px', fontSize: 12.5, color: 'var(--ink)', maxWidth: '80%', lineHeight: 1.5 }}>
            Tell me about a time you turned around a low-performing project.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ background: persona.color, borderRadius: '14px 14px 4px 14px', padding: '10px 13px', fontSize: 12.5, color: '#fff', maxWidth: '80%', lineHeight: 1.5 }}>
            I audited the workflow, found the handoff bottleneck, and restructured the team around it.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${persona.color}20`, border: `1.5px solid ${persona.color}`, flexShrink: 0 }} />
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: '14px 14px 14px 4px', padding: '10px 13px', fontSize: 11.5, color: 'var(--ink)', maxWidth: '80%', lineHeight: 1.5, fontStyle: 'italic' }}>
            "{persona.phrase}"
          </div>
        </div>

        {/* Live feedback */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['Structure', 72, 'var(--teal)'], ['Specificity', 48, 'var(--amber)'], ['Confidence', 65, 'var(--teal)']].map(([label, val, color], i) => (
            <div key={i} style={{ flex: '1 1 28%', background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}>
              <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: color as string }}>{val}/100</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session overview — real content, matching the actual product's
          session summary panel */}
      <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border-l)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Session overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Total questions', '5'], ['Attempted', '2'], ['Time elapsed', '04:12'], ['Avg. score', '61']].map(([label, val], i) => (
            <div key={i}>
              <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .iv-card {
          background: var(--paper);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 22px;
          box-shadow: var(--sh-md);
          height: 560px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .iv-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--sh-lg), 0 20px 40px -12px rgba(14,122,90,0.18);
          border-color: var(--teal-mid);
        }
      `}</style>
    </div>
  )
}