import type { Metadata } from "next";
import { Nunito, Source_Sans_3, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
// Imports removed
import { Providers } from "@/providers/Providers";
import { AuthProvider } from "@/lib/auth-context";
import { KineticPostEffects } from "@/components/effects/KineticPostEffects";

import { constructMetadata } from "@/lib/seo/metadata";
import { constructOrganizationSchema } from "@/lib/seo/structured-data";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic", "vietnamese"], // supports extensive characters including greek where available, though greek may require explicit load or fallback. Wait, actually we can just ask google fonts for it.
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "greek"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = constructMetadata();
const organizationSchema = constructOrganizationSchema();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body
        className={`${nunito.variable} ${sourceSans.variable} ${geistMono.variable} ${manrope.variable} antialiased min-h-screen flex flex-col font-sans overflow-x-clip w-full relative`}
      >
        <Providers>
          <AuthProvider>
            <KineticPostEffects>
              {children}
            </KineticPostEffects>
            {/* Skeumorphic app removes global bottom nav for shop layout */}
          </AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
