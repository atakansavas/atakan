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

export const metadata: Metadata = {
  title: "San·ai | Yapay zeka çağının sanayisi",
  description:
    "San·ai — Dalyan'da, doğanın içinde bir paylaşımlı yazılım evi. Yapay zeka çağının sanayisi: kod yazdığımız, ürettiğimiz ve yaşadığımız çatı.",
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
