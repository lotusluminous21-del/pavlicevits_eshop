"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User } from "lucide-react"

import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CartSheet } from "@/components/cart/cart-sheet"
import { useCart } from "@/hooks/useCart"

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY
            setIsScrolled(offset > 100) // Switch after 100px scroll
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const capsuleClass = "pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/20 rounded-full shadow-lg transition-all duration-300 hover:bg-white/80"

    return (
        <>
            {/* STATE 1: HERO PILLS (Visible when NOT scrolled) */}
            <div className={cn(
                "fixed top-4 md:top-6 w-full z-50 transition-all duration-500 ease-in-out",
                isScrolled ? "-translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}>
                <div className="container mx-auto px-4 h-16 relative flex items-center justify-between pointer-events-none">
                    {/* CAPSULE 1: Branding (Left) */}
                    <div className="flex items-center gap-4 pl-2 pr-6 py-2 pointer-events-auto">
                        <MobileNav />
                        <Link href="/" className="flex flex-col items-center gap-1">
                            <Image
                                src="/svg/logomark.svg"
                                alt="Logo"
                                width={100}
                                height={40}
                                className="w-[100px] h-auto drop-shadow-md"
                            />
                            <Image
                                src="/svg/logotype.svg"
                                alt="Pavlicevits"
                                width={100}
                                height={20}
                                className="w-[100px] h-auto drop-shadow-md"
                            />
                        </Link>
                    </div>

                    {/* CAPSULE 2: Navigation (Center - Desktop Only) */}
                    <div className={cn(capsuleClass, "hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2.5")}>
                        <div className="pointer-events-auto">
                            <MainNav />
                        </div>
                    </div>

                    {/* CAPSULE 3: Actions (Right) */}
                    <div className={cn(capsuleClass, "flex items-center gap-1 px-2 py-2 ml-auto")}>
                        <HeaderActions />
                    </div>
                </div>
            </div>

            {/* STATE 2: SCROLLED APPBAR (Visible when scrolled) */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-500 ease-in-out",
                isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MobileNav />
                        <Link href="/" className="flex items-center gap-2 h-full">
                            <Image
                                src="/svg/logomark.svg"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="h-10 w-auto"
                            />
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center justify-center flex-1 px-8">
                        <MainNav />
                    </div>

                    <div className="flex items-center gap-2">
                        <HeaderActions />
                    </div>
                </div>
            </header>
        </>
    )
}

function HeaderActions() {
    const { cart } = useCart()
    const itemCount = cart?.lines?.edges?.reduce((acc, { node }) => acc + node.quantity, 0) || 0

    return (
        <>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 hover:text-black transition-all text-primary" aria-label="Search">
                <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full hover:bg-black/5 hover:text-black transition-all text-primary">
                <User className="h-5 w-5" />
            </Button>

            <CartSheet>
                <Button variant="ghost" size="icon" aria-label="Cart" className="relative rounded-full hover:bg-black/5 hover:text-black transition-all text-primary">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                            {itemCount}
                        </span>
                    )}
                    <span className="sr-only">Cart</span>
                </Button>
            </CartSheet>

            <button className="text-xs font-bold ml-2 mr-1 px-2 py-1 rounded-md hover:bg-black/5 transition-colors text-primary">
                EN
            </button>
        </>
    )
}
