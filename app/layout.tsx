import type { Metadata } from "next";
import { getServerData } from "@/lib/server-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export function generateMetadata(): Metadata {
  const data = getServerData();
  return {
    title: `${data.serverName} — Growtopia Private Server Host Files`,
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
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}