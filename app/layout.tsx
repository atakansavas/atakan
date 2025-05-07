import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Atakan | Code Wizard",
  description:
    "The digital playground of Atakan, where bugs fear to tread and coffee is the primary fuel source",
  keywords: ["developer", "Atakan", "coding", "programming", "tech humor"],
  openGraph: {
    title: "Developer Atakan | Code Wizard",
    description:
      "The digital playground of Atakan, where bugs fear to tread and coffee is the primary fuel source",
    images: ["/atakan-profile.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Atakan | Code Wizard",
    description:
      "The digital playground of Atakan, where bugs fear to tread and coffee is the primary fuel source",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-atakan.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
