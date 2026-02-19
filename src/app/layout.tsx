import type { Metadata } from "next";
import { Inter, Source_Sans_3, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
// Imports removed
import { Providers } from "@/providers/Providers";
import { AuthProvider } from "@/lib/auth-context";
// Imports removed
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// Imports removed

import { constructMetadata } from "@/lib/seo/metadata";
import { constructOrganizationSchema } from "@/lib/seo/structured-data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${inter.variable} ${sourceSans.variable} ${geistMono.variable} ${manrope.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        </Providers>
      </body>
    </html>
  );
}
