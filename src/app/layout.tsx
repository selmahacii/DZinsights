import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DZinsights - Business Intelligence pour E-commerce",
  description: "Plateforme d'analyse avancée pour le marché e-commerce algérien. Prévisions de revenus, optimisation des stocks et intelligence client.",
  keywords: ["DZinsights", "Business Intelligence", "E-commerce Algérie", "Analytics ML", "Algérie", "DZD"],
  authors: [{ name: "Selma Haci" }],
  openGraph: {
    title: "DZinsights - Business Intelligence pour E-commerce",
    description: "Intelligence business en temps réel pour e-commerce algérien.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DZinsights - Business Intelligence pour E-commerce",
    description: "Intelligence business en temps réel pour e-commerce algérien.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
