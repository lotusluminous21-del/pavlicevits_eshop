"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
// import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu" (Assuming custom for now)
import { Palette, ChevronDown } from "lucide-react"

const categories = [
    {
        title: "Βαφές",
        href: "/proionta/vafes",
        subcategories: ["Αυτοκινήτου", "Επαγγελματικές", "Σπιτιού", "Candy/Perla", "Θερμοάντοχες"]
    },
    {
        title: "Αστάρια",
        href: "/proionta/astaria",
        subcategories: ["Εποξειδικά", "Ακρυλικά", "Πλαστικών", "Αντισκουριακά", "Spray"]
    },
    {
        title: "Βερνίκια",
        href: "/proionta/vernikia",
        subcategories: ["2K Clear Coat", "1K Clear Coat", "HS Clear Coat", "Matte"]
    },
    // Add other categories as needed
]

export function MainNav() {
    const pathname = usePathname()

    return (
        <nav className="hidden lg:flex items-center gap-6">
            {/* Mega Menu Trigger */}
            <div className="group relative">
                <Link
                    href="/proionta"
                    className={cn(
                        "flex items-center gap-1 text-sm font-heading font-semibold tracking-wide uppercase transition-colors hover:text-primary",
                        pathname?.startsWith("/proionta") ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    ΠΡΟΙΟΝΤΑ
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </Link>

                {/* Mega Menu Dropdown */}
                <div className="absolute top-full left-0 w-[600px] -translate-x-1/4 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6 grid grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div key={category.title} className="space-y-3">
                                <Link href={category.href} className="font-semibold text-sm hover:underline block mb-2 text-primary">
                                    {category.title}
                                </Link>
                                <ul className="space-y-2">
                                    {category.subcategories.map((sub) => (
                                        <li key={sub}>
                                            <Link
                                                href={`${category.href}/${sub.toLowerCase().replace(/ /g, '-')}`}
                                                className="text-sm text-primary/70 hover:text-primary transition-colors block font-medium"
                                            >
                                                {sub}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div className="col-span-3 pt-4 mt-2 border-t border-white/20 flex justify-between items-center bg-white/10 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                            <Link href="/proionta" className="text-sm font-bold text-primary hover:underline">
                                Δείτε Όλα τα Προϊόντα &rarr;
                            </Link>
                            <Link href="/epaggelmatiki-agora" className="text-sm font-bold text-primary hover:underline">
                                Επαγγελματική Αγορά &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href="/markes"
                className={cn(
                    "text-sm font-heading font-semibold tracking-wide uppercase transition-colors hover:text-primary",
                    pathname === "/markes" ? "text-primary" : "text-muted-foreground"
                )}
            >
                ΜΑΡΚΕΣ
            </Link>

            <Link
                href="/vres-xroma"
                className={cn(
                    "flex items-center gap-2 text-sm font-heading font-bold tracking-wide uppercase transition-colors text-secondary hover:text-secondary/80",
                    pathname === "/vres-xroma" && "underline"
                )}
            >
                <Palette className="h-4 w-4" />
                ΒΡΕΣ ΧΡΩΜΑ
            </Link>

            <Link
                href="/odigos"
                className={cn(
                    "text-sm font-heading font-semibold tracking-wide uppercase transition-colors hover:text-primary",
                    pathname?.startsWith("/odigos") ? "text-primary" : "text-muted-foreground"
                )}
            >
                ΟΔΗΓΟΙ
            </Link>

            <Link
                href="/blog"
                className={cn(
                    "text-sm font-heading font-semibold tracking-wide uppercase transition-colors hover:text-primary",
                    pathname?.startsWith("/blog") ? "text-primary" : "text-muted-foreground"
                )}
            >
                BLOG
            </Link>
        </nav>
    )
}
