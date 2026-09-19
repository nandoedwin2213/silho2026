import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth";
import { SiteChrome } from "@/components/site/site-chrome";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SILHO | Medicina Estética",
    template: "%s | SILHO Medicina Estética",
  },
  description: "Medicina estética diseñada alrededor de ti.",
  openGraph: {
    title: "SILHO | Medicina Estética",
    description: "Tratamientos faciales, capilares y de rejuvenecimiento con valoración médica personalizada.",
    type: "website",
    locale: "es_EC",
    siteName: "SILHO Medicina Estética",
  },
  twitter: {
    card: "summary_large_image",
    title: "SILHO | Medicina Estética",
    description: "Medicina estética diseñada alrededor de ti.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locations, settings] = await Promise.all([
    db.location.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { name: true, city: true, address: true } }),
    getSettings(["WHATSAPP_NUMBER", "INSTAGRAM_URL", "TIKTOK_URL", "FACEBOOK_URL"]),
  ]);
  const adminSession = await getSession();
  return (
    <html lang="es" className={`${manrope.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><SiteChrome adminSession={Boolean(adminSession)} header={<Header />} footer={<><Footer locations={locations} settings={settings} /><WhatsAppButton number={settings.WHATSAPP_NUMBER ?? "593999999999"} /></>}>{children}</SiteChrome><Toaster /></body>
    </html>
  );
}
