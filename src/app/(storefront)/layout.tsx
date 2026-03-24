"use client";

import React from "react";
import { Header } from "@/components/industrial_ui/Header";
import { Footer, FooterColumn } from "@/components/industrial_ui/Footer";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const footerColumns: FooterColumn[] = [
    {
        title: "ΕΤΑΙΡΕΙΑ",
        links: [
            { label: "Η Εταιρεία", href: "/about" },
            { label: "Έργα", href: "/projects" },
            { label: "Υπηρεσίες", href: "/services" },
            { label: "Επικοινωνία", href: "/contact" }
        ]
    }
];

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isExpertPage = pathname?.startsWith('/expert');

    return (
        <div className={cn(
            "relative flex w-full flex-col overflow-x-clip bg-background text-foreground font-sans bg-[radial-gradient(circle,#00000010_1px,transparent_1px)] bg-[size:40px_40px] bg-fixed",
            isExpertPage ? "h-screen overflow-hidden" : "min-h-screen"
        )}>
            <div className="flex h-full grow flex-col min-h-0">
                <Header />
                <main className={cn(
                    "flex-1 w-full flex flex-col min-h-0",
                    isExpertPage ? "" : "mb-16"
                )}>
                    {children}
                </main>
                {!isExpertPage && (
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pb-12 mt-24 border-t border-border pt-12">
                        <Footer
                            logo={<img src="/svg/pavlicevits_logo.svg" alt="Pavlicevits" className="h-10 w-auto" />}
                            companyName=""
                            tagline="Θέτοντας τα πρότυπα στις βαφές υψηλής απόδοσης και στα αρχιτεκτονικά φινιρίσματα. Ακρίβεια σε κάθε στρώση."
                            columns={footerColumns}
                            copyrightYear={new Date().getFullYear()}
                            className="bg-transparent border-t-0 !px-0 mt-0 pt-0"
                            bottomLinks={[
                                { label: "Πολιτική Απορρήτου", href: "/privacy" },
                                { label: "Όροι Χρήσης", href: "/terms" }
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
