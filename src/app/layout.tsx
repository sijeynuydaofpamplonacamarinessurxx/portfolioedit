import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "sijey. — Video Editor & Motion Designer",
  description:
    "Professional video editing and motion design portfolio. Cinematic storytelling, AMV edits, and shortform content that captivates audiences.",
  keywords: [
    "video editor",
    "motion designer",
    "video editing portfolio",
    "cinematic",
    "AMV",
    "shortform",
  ],
  openGraph: {
    title: "sijey. — Video Editor & Motion Designer",
    description:
      "Professional video editing and motion design portfolio. Cinematic storytelling, AMV edits, and shortform content.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col noise">{children}</body>
    </html>
  );
}
