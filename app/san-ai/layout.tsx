import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./san-ai.css";

// Cinematic display serif — includes latin-ext so Turkish glyphs (ş, ğ, ı, ç)
// render correctly in the big headlines.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const SANAI_TITLE = "San·ai | Yapay zeka çağının sanayisi";
const SANAI_DESC =
  "San·ai — Dalyan'da, doğanın içinde bir paylaşımlı yazılım evi. Yapay zeka çağının sanayisi: kod yazdığımız, ürettiğimiz ve yaşadığımız çatı.";

export const metadata: Metadata = {
  title: SANAI_TITLE,
  description: SANAI_DESC,
  icons: {
    icon: [{ url: "/brand/icon-green.svg", type: "image/svg+xml" }],
    apple: "/brand/apple-touch.png",
  },
  openGraph: {
    title: SANAI_TITLE,
    description: SANAI_DESC,
    url: "/san-ai",
    siteName: "San·ai",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "San·ai — Yapay zeka çağının sanayisi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SANAI_TITLE,
    description: SANAI_DESC,
    images: ["/brand/og.png"],
  },
};

export default function SanAiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${instrumentSerif.variable} ${inter.variable} sanai-scope min-h-screen antialiased`}
    >
      {children}
    </div>
  );
}
