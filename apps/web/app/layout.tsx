import type { ReactNode } from "react";
import type { Metadata } from "next";
import { RecoveryRedirector } from "./RecoveryRedirector";
import "./globals.css";

export const metadata: Metadata = {
  title: "CosmoScope",
  description: "Premium astrology, rendered with restraint."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RecoveryRedirector />
        {children}
      </body>
    </html>
  );
}
