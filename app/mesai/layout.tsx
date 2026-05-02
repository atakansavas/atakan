import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "./mesai.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mesai | Her projene bir AI ofisi",
  description:
    "Mesai — AI ofislerinin orkestrasyon ağı. Her projeye bir Chef ata, ekibini topla, ofisini tasarla, başkalarınınkini gez. Closed beta.",
};

export default function MesaiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} ${jetbrainsMono.variable} ${pressStart.variable} ${vt323.variable} mesai-scope scanlines min-h-screen antialiased`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
