import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { getDict } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getDict();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.siteTitle, template: "%s | My 4 Wheels" },
    description: t.meta.siteDescription,
    openGraph: { type: "website", siteName: "My 4 Wheels", locale: locale === "fr" ? "fr_CA" : "en_CA" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#0B0B0D", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDict();
  return (
    <html lang={locale === "fr" ? "fr-CA" : "en-CA"} className={inter.variable}>
      <body className="min-h-screen font-sans">
        <I18nProvider locale={locale} t={t}>
          {children}
        </I18nProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
