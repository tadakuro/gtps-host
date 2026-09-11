import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import { getServerData } from "@/lib/server-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export function generateMetadata(): Metadata {
  const data = getServerData();
  return {
    title: `${data.serverName} — Growtopia Private Server`,
    description: data.description,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${inter.variable} min-h-screen font-[family-name:var(--font-inter)]`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
