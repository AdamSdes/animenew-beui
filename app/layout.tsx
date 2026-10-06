import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/site/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "animenew",
  title: { default: "animenew — каталог аниме", template: "%s · animenew" },
  description: "Каталог аниме, календарь онгоингов, списки просмотренного и обсуждения.",
  openGraph: { type: "website", locale: "ru_RU", siteName: "animenew" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className="min-h-screen antialiased">
        <Providers>
          <SiteHeader />
          <main className="pt-14">{children}</main>
          <SiteFooter mock={process.env.SHIKIMORI_MOCK === "1"} />
        </Providers>
      </body>
    </html>
  );
}
