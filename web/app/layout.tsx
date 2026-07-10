import type { Metadata } from "next";
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
      <body className={`${mono.variable} ${grotesk.variable} min-h-full flex flex-col`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Charles W. Clark',
              jobTitle: 'Senior Designer',
              worksFor: { '@type': 'Organization', name: 'DemandScience' },
              url: 'https://www.charleswclark.com',
              sameAs: ['https://www.linkedin.com/in/charleswclarkii/'],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
