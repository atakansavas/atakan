import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./san-ai.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${fraunces.variable} ${instrument.variable} ${jetbrains.variable} sanai-scope grain min-h-screen antialiased`}
    >
      {children}
    </div>
  );
}
