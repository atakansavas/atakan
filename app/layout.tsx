import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ben Atakan | İşinize Yapay Zeka Desteği Alın",
  description:
    "İşinize yapay zeka desteği alın. Sesli asistanlar, süreç otomasyonları ve AI destekli çözümlerle işletmenizi geleceğe taşıyın.",
  keywords: [
    "yapay zeka desteği",
    "dijital otomasyon",
    "sesli asistan",
    "logo entegrasyonu",
    "whatsapp bot",
    "atakan savaş",
    "ai destekli çözümler",
    "süreç otomasyonu",
    "n8n otomasyon",
    "web scraping",
    "veri analitiği",
    "benatakanai",
  ],
  authors: [{ name: "Atakan Savaş" }],
  creator: "Atakan Savaş",
  publisher: "Ben Atakan AI Solutions",
  metadataBase: new URL("https://benatakan.com"),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Ben Atakan | İşinize Yapay Zeka Desteği Alın",
    description:
      "İşinize yapay zeka desteği alın. Sesli asistanlar, süreç otomasyonları ve AI destekli çözümlerle işletmenizi geleceğe taşıyın.",
    url: "https://benatakan.com",
    siteName: "Ben Atakan AI Solutions",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Ben Atakan - Yapay Zeka Uzmanı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ben Atakan | İşinize Yapay Zeka Desteği Alın",
    description:
      "İşinize yapay zeka desteği alın. Sesli asistanlar, süreç otomasyonları ve AI destekli çözümler.",
    creator: "@benatakanai",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="canonical" href="https://benatakan.com/" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${sora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
