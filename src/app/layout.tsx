import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sijey · Video editor & motion designer",
  description:
    "Sijey is a video editor and motion designer cutting short-form, long-form and cinematic work for creators.",
  keywords: [
    "video editor",
    "motion designer",
    "video editing portfolio",
    "cinematic",
    "AMV",
    "shortform",
  ],
  openGraph: {
    title: "Sijey · Video editor & motion designer",
    description:
      "Professional video editing and motion design portfolio. Cinematic storytelling, AMV edits, and shortform content.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col noise">{children}</body>
    </html>
  );
}
