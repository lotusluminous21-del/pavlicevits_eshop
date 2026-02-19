"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronRight, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const [open, setOpen] = React.useState(false)
    const pathname = usePathname()

    // Close menu when route changes
    React.useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-over Panel */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-transform duration-300 ease-in-out transform",
                open ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex justify-between items-center">
                        <span className="font-bold text-lg">Menu</span>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="px-4 mb-6">
                            <form>
                                <input
                                    type="search"
                                    placeholder="Αναζήτηση προϊόντων..."
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </form>
                        </div>

                        <nav className="flex flex-col space-y-1">
                            <Link
                                href="/proionta"
                                className="flex items-center justify-between px-4 py-3 text-sm font-heading font-semibold tracking-wide uppercase hover:bg-muted"
                            >
                                Προϊόντα
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link
                                href="/markes"
                                className="flex items-center justify-between px-4 py-3 text-sm font-heading font-semibold tracking-wide uppercase hover:bg-muted"
                            >
                                Μάρκες
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link
                                href="/vres-xroma"
                                className="flex items-center justify-between px-4 py-3 text-sm font-heading font-bold tracking-wide uppercase text-secondary bg-secondary/10 hover:bg-secondary/20"
                            >
                                <span className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Βρες Χρώμα
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/odigos"
                                className="flex items-center justify-between px-4 py-3 text-sm font-heading font-semibold tracking-wide uppercase hover:bg-muted"
                            >
                                Οδηγοί
                            </Link>
                            <Link
                                href="/blog"
                                className="flex items-center justify-between px-4 py-3 text-sm font-heading font-semibold tracking-wide uppercase hover:bg-muted"
                            >
                                Blog
                            </Link>
                        </nav>

                        <div className="mt-6 border-t pt-4 px-4 space-y-4">
                            <div className="space-y-1">
                                <Link href="/logariasmos" className="block py-2 text-sm text-muted-foreground hover:text-primary">
                                    Ο Λογαριασμός μου
                                </Link>
                                <Link href="/epikoinonia" className="block py-2 text-sm text-muted-foreground hover:text-primary">
                                    Επικοινωνία
                                </Link>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                <p>Καλαμαριά, Θεσσαλονίκη</p>
                                <p>2310-XXX-XXX</p>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button className="text-sm font-bold">ΕΛ</button>
                                <button className="text-sm text-muted-foreground">EN</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
