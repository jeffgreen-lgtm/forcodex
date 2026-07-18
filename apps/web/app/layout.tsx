import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { RecoveryRedirector } from "./RecoveryRedirector";
import "./globals.css";
import "./visual-correction.css";
import "./rc4-production.css";

const siteUrl = "https://cosmo.greenhenncollective.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CosmoScope — Your chart. Today’s sky.",
    template: "%s | CosmoScope"
  },
  description:
    "Personal astrological guidance built from your exact birth data and today’s sky, designed for preparation rather than prediction.",
  applicationName: "CosmoScope",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "personal astrology",
    "daily astrology reading",
    "natal chart",
    "astrological guidance",
    "Today’s Brief"
  ],
  authors: [{ name: "CosmoScope" }],
  creator: "CosmoScope",
  publisher: "CosmoScope",
  formatDetection: {
    address: false,
    email: false,
    telephone: false
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "CosmoScope",
    title: "CosmoScope — Your chart. Today’s sky.",
    description:
      "Personal astrological guidance built from your exact birth data and today’s sky. Preparation over prediction."
  },
  twitter: {
    card: "summary_large_image",
    title: "CosmoScope — Your chart. Today’s sky.",
    description:
      "Personal astrological guidance built from your exact birth data and today’s sky."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#120f1f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id="main-content">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <RecoveryRedirector />
        {children}
      </body>
    </html>
  );
}
