import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { mono, grotesk } from "@/lib/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.charleswclark.com'),
  title: "Charles W. Clark | Multidisciplinary Designer & Art Director",
  description:
    "Portfolio of Charles W. Clark — multidisciplinary designer and art director at DemandScience, specializing in branding, digital design, and creative strategy across SaaS, gaming, and lifestyle industries.",
  openGraph: {
    title: "Charles W. Clark | Multidisciplinary Designer & Art Director",
    description:
      "Portfolio of Charles W. Clark — multidisciplinary designer and art director at DemandScience, specializing in branding, digital design, and creative strategy across SaaS, gaming, and lifestyle industries.",
    type: "website",
    url: "https://www.charleswclark.com",
    siteName: "Charles W. Clark",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@charleswclarkII",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${mono.variable} ${grotesk.variable} min-h-full flex flex-col`} style={{ overflowX: 'hidden' }}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Charles W. Clark',
              alternateName: 'Charlie Clark',
              jobTitle: 'Senior Designer & Art Director',
              description: 'Multidisciplinary designer and art director with 20+ years of experience spanning print, web, interactive, entertainment, B2B SaaS, and experimental AI. Currently at DemandScience implementing AI into design workflows.',
              worksFor: { '@type': 'Organization', name: 'DemandScience' },
              url: 'https://www.charleswclark.com',
              email: 'charlieclark@gmail.com',
              sameAs: ['https://www.linkedin.com/in/charleswclarkii/'],
              knowsAbout: [
                'Graphic Design', 'Art Direction', 'Brand Identity',
                'Digital Product Design', 'B2B SaaS Design', 'Print Production',
                'AI Implementation', 'Interactive Design', 'Concert Photography',
                'Entertainment Design', 'Gaming Creative', 'Web Design',
                'UX Design', 'Production Management'
              ],
              hasOccupation: {
                '@type': 'Occupation',
                name: 'Multidisciplinary Designer & Art Director',
                occupationalCategory: '27-1024.00',
                skills: 'Brand Design, Digital Design, Print Production, AI Integration, Art Direction, Photography'
              },
            }),
          }}
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site description" />
        {children}
      </body>
    </html>
  );
}
