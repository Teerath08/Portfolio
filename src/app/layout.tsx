import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "react-easy-crop/react-easy-crop.css";
import "./globals.css";

import { personalInfo, seo, site } from "@/data";
import { bootScript } from "@/lib/theme";

/**
 * Two families, loaded through `next/font` so they are self-hosted, subset to
 * Latin, and served with a preload hint. They are exposed as CSS variables
 * rather than as Tailwind `font-*` utilities directly, because the variable is
 * what lets a theme swap or a font fallback happen in one place.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seo.title,
    template: `%s · ${site.name}`,
  },
  description: seo.description,
  keywords: seo.keywords,
  applicationName: `${site.name} — Portfolio`,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "profile",
    locale: site.locale,
    url: site.url,
    siteName: `${site.name} — Portfolio`,
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${personalInfo.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05080b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7f9" },
  ],
};

/**
 * Structured data.
 *
 * One `Person` node describing the actual facts, and one `WebSite` node. Kept
 * to what is verifiable — no `award`, no `alumniOf` beyond the current degree.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      givenName: personalInfo.firstName,
      familyName: personalInfo.lastName,
      url: site.url,
      image: `${site.url}/opengraph-image`,
      email: `mailto:${personalInfo.email}`,
      jobTitle: personalInfo.role,
      description: personalInfo.about[0],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      sameAs: [personalInfo.github, personalInfo.linkedin],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: personalInfo.college,
      },
      knowsAbout: [
        "Embedded systems",
        "Microcontrollers",
        "8085",
        "8086",
        "Assembly language programming",
        "Sensor interfacing",
        "Robotics",
        "Digital electronics",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: `${site.name} — Portfolio`,
      description: seo.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-theme="dark"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        {/*
          Applies the stored theme before the first paint. Inline and blocking on
          purpose: a deferred script is the same as a flash of the wrong colours.
        */}
        <script
          id="theme-boot"
          // eslint-disable-next-line react/no-danger -- static, self-authored string
          dangerouslySetInnerHTML={{ __html: bootScript() }}
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className={`${sans.className} font-sans`}>
        {/* Keyboard users land here first; the skip link is invisible until focused. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {children}

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- serialised structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
