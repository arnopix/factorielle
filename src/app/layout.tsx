import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Factorielle - Facturation gratuite pour indépendants",
  description: "Créez vos factures et devis gratuitement. Conçu pour les auto-entrepreneurs, freelances et TPE. 100% gratuit, sans inscription.",
  keywords: ["facturation", "facture", "devis", "auto-entrepreneur", "freelance", "gratuit", "TPE"],
  openGraph: {
    title: "Factorielle - La facturation gratuite qui tue",
    description: "Factures pro en 30 secondes. Gratuit pour toujours.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
