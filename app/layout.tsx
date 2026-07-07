import type { Metadata, Viewport } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const BASE_URL = 'https://earngro.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E7A5A',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'EarnGro — Discover Your Earning Gap & Close It',
    template: '%s — EarnGro',
  },

  description: 'EarnGro is an AI-powered Career Wealth Intelligence Platform for India and Southeast Asia. Discover your exact earning gap in rupees, get your career archetype, and follow a personalised month-by-month GrowPath to close it.',

  keywords: [
    'earning gap calculator India',
    'salary gap calculator',
    'career growth platform India',
    'AI career intelligence',
    'salary benchmark India',
    'career assessment India',
    'GrowDNA',
    'salary negotiation India',
    'career wealth platform',
    'how much should I earn India',
    'salary benchmark Southeast Asia',
    'ATS resume checker India',
    'AI interview practice India',
    'career platform Singapore',
    'career platform Philippines',
    'career platform Indonesia',
  ],

  authors: [{ name: 'EarnGro', url: BASE_URL }],
  creator: 'EarnGro',
  publisher: 'EarnGro',

  // ── Open Graph ──────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['en_SG', 'en_PH', 'en_ID', 'en_MY'],
    url: BASE_URL,
    siteName: 'EarnGro',
    title: 'EarnGro — Discover Your Earning Gap & Close It',
    description: 'AI-powered Career Wealth Intelligence Platform for India and Southeast Asia. Find your exact earning gap in rupees and get a month-by-month roadmap to close it.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EarnGro — AI Career Wealth Intelligence Platform',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@earngro',
    creator: '@earngro',
    title: 'EarnGro — Discover Your Earning Gap & Close It',
    description: 'AI-powered Career Wealth Intelligence Platform for India and Southeast Asia.',
    images: ['/og-image.png'],
  },

  // ── Canonical + Alternates ───────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en-IN': BASE_URL,
      'en-SG': `${BASE_URL}/sg`,
      'x-default': BASE_URL,
    },
  },

  // ── Robots ──────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Icons ───────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },

  // ── Manifest ────────────────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Verification (add your codes when ready) ─────────────────────
  verification: {
    google: 'REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE',
    // yandex: '',
    // bing: '',
  },

  // ── App ─────────────────────────────────────────────────────────
  applicationName: 'EarnGro',
  category: 'Career',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Geo meta tags for India + SEA targeting */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="DC.language" content="en" />

        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'EarnGro',
              url: 'https://earngro.app',
              logo: 'https://earngro.app/icon-512.png',
              description: 'AI-powered Career Wealth Intelligence Platform for India and Southeast Asia.',
              foundingDate: '2026',
              areaServed: ['IN', 'SG', 'PH', 'ID', 'MY', 'TH', 'VN'],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                availableLanguage: 'English',
              },
            }),
          }}
        />

        {/* Structured data — WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'EarnGro',
              url: 'https://earngro.app',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
                description: 'Free career intelligence — discover your earning gap',
              },
              featureList: [
                'Earning Gap Calculator',
                'GrowDNA Career Assessment',
                'AI Interview Practice',
                'CV ATS Analyzer',
                'GrowPath Career Roadmap',
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}