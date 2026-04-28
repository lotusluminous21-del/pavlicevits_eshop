import type { Metadata } from "next";
import { Nunito, Source_Sans_3, Geist_Mono, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PaintStyleProvider } from "@/providers/PaintStyleProvider";

import { constructMetadata } from "@/lib/seo/metadata";
import { constructOrganizationSchema } from "@/lib/seo/structured-data";
import { Toaster } from "@/components/ui/sonner";

// Inter was loaded with latin/latin-ext/greek/greek-ext but its CSS
// variable was unused (font-greek = source-sans, font-sans = nunito) —
// dropping it removes ~80KB of unused webfont bytes from every page.

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "greek"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin", "greek"],
  display: "swap",
});

export const metadata: Metadata = constructMetadata();
const organizationSchema = constructOrganizationSchema();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${sourceSans.variable} ${geistMono.variable} ${manrope.variable} antialiased min-h-screen flex flex-col font-sans overflow-x-clip w-full relative`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <PaintStyleProvider>
              <Providers>{children}</Providers>
              <Toaster />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
              />
            </PaintStyleProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
