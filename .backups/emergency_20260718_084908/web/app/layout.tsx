import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { mono, grotesk } from "@/lib/fonts";
import { fetchAbout, fetchSettings } from "@/lib/sanity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [about, settings] = await Promise.all([
    fetchAbout().catch(() => null),
    fetchSettings().catch(() => null),
  ]);

  const siteTitle = settings?.siteTitle || "Charles W. Clark | Multidisciplinary Designer & Art Director";
  const siteDescription = about?.heroBio || "Portfolio of Charles W. Clark — multidisciplinary designer and art director...";

  return {
    metadataBase: new URL('https://www.charleswclark.com'),
    title: siteTitle,
    description: siteDescription,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: "website",
      url: "https://www.charleswclark.com",
      siteName: "Charles W. Clark",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${mono.variable} ${grotesk.variable} min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}