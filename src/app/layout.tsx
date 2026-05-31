import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolplex.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Toolplex – Free Online Image Tools",
    template: "%s | Toolplex",
  },
  description:
    "Free online image tools: compress, resize, convert, remove backgrounds and more. Fast, private, and client-side processing.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Toolplex",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
