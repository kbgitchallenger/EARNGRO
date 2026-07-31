import Link from 'next/link'

interface FeatureSpotlightProps {
  eyebrow: string
  eyebrowColor?: string
  headline: React.ReactNode
  description: string
  ctaLabel: string
  ctaHref: string
  imageSide: 'left' | 'right'
  visual: React.ReactNode
  cityExample?: string
}

export default function FeatureSpotlight({
  eyebrow,
  eyebrowColor = 'var(--teal-d)',
  headline,
  description,
  ctaLabel,
  ctaHref,
  imageSide,
  visual,
  cityExample,
}: FeatureSpotlightProps) {
  return (
    // FIX: 72px vertical padding meant five back-to-back feature sections
    // ran together with very little visual separation — bumped to 104px,
    // more in line with "clean, generous white space" than a dense stack.
    <section className="feature-spotlight" style={{ padding: '104px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <div className={`fs-grid fs-image-${imageSide}`}>
        <div className="fs-text">
          <div style={{ display: 'inline-flex', fontSize: 11, fontWeight: 700, color: eyebrowColor, background: `${eyebrowColor}14`, border: `1px solid ${eyebrowColor}30`, padding: '5px 12px', borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
            {eyebrow}
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 600, lineHeight: 1.15, color: 'var(--ink)', marginBottom: 16 }}>
            {headline}
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.75, marginBottom: cityExample ? 8 : 26, fontWeight: 300 }}>
            {description}
          </p>
          {cityExample && (
            <p style={{ fontSize: 13, color: 'var(--teal-d)', marginBottom: 26 }}>
              Live example: benchmarked against verified peers in {cityExample}.
            </p>
          )}
          <Link href={ctaHref} className="fs-cta">
            {ctaLabel} →
          </Link>
        </div>
        <div className="fs-visual">{visual}</div>
      </div>

      <style>{`
        .fs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        .fs-image-left .fs-text { order: 2; }
        .fs-image-left .fs-visual { order: 1; }
        .fs-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--teal); color: #fff; font-size: 14px; font-weight: 600;
          padding: 12px 26px; border-radius: 99px; text-decoration: none;
          box-shadow: var(--shadow-teal); transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .fs-cta:hover { transform: translateY(-2px); box-shadow: var(--shadow-teal-lg); }
        @media (max-width: 860px) {
          .fs-grid { grid-template-columns: 1fr; gap: 36px; }
          .fs-image-left .fs-text, .fs-image-left .fs-visual { order: unset; }
        }
        @media (max-width: 600px) {
          .feature-spotlight { padding: 72px 20px !important; }
        }
      `}</style>
    </section>
  )
}