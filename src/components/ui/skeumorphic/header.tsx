"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, ShoppingCart, User, Sparkles, ArrowLeft } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

export interface HeaderProps {
    showBack?: boolean;
    title?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Header({ showBack, title, className, children }: HeaderProps) {
    const pathname = usePathname();
    const cartCount = useCartStore(state => state.getCartCount());

    return (
        <>
            {/* Desktop Header */}
            <header
                className={cn(
                    "hidden md:flex fixed top-0 left-0 right-0 z-50 h-[80px] items-center justify-between px-8",
                    "bg-[#ffffff]/95 backdrop-blur-md border-b border-white/50",
                    "shadow-sm",
                    className
                )}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 active:scale-95">
                        <span className="text-primary-foreground font-black text-xl">P</span>
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-slate-800">PAVLICEVITS</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-8">
                    <Link
                        href="/categories"
                        className={cn(
                            "text-[15px] font-bold transition-colors tracking-tight",
                            pathname.startsWith('/categories') ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        Products
                    </Link>
                    <Link
                        href="/expert"
                        className={cn(
                            "text-[15px] font-bold flex items-center gap-1.5 transition-colors tracking-tight px-4 py-2 rounded-full",
                            pathname === '/expert'
                                ? "text-accent bg-white shadow-sm"
                                : "text-slate-500 hover:text-accent hover:bg-white/50"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        Expert Guide
                    </Link>
                </nav>

                {children}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/search"
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-[#ffffff] text-slate-500 hover:text-slate-800",
                            "shadow-sm",
                            "hover:shadow-sm",
                            "active:shadow-sm active:scale-95"
                        )}
                    >
                        <Search className="w-5 h-5" strokeWidth={2} />
                    </Link>
                    <Link
                        href="/cart"
                        className={cn(
                            "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-[#ffffff] text-slate-500 hover:text-slate-800",
                            "shadow-sm",
                            "hover:shadow-sm",
                            "active:shadow-sm active:scale-95"
                        )}
                    >
                        <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground border-2 border-[#F0F2F6] text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/profile"
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-[#ffffff] text-slate-500 hover:text-slate-800",
                            "shadow-sm",
                            "hover:shadow-sm",
                            "active:shadow-sm active:scale-95"
                        )}
                    >
                        <User className="w-5 h-5" strokeWidth={2} />
                    </Link>
                </div>
            </header>

            {/* Mobile Header */}
            {(showBack || title) && (
                <header
                    className={cn(
                        "md:hidden fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center px-4",
                        "bg-[#ffffff]/95 backdrop-blur-md border-b border-white/50",
                        "shadow-sm",
                        className
                    )}
                >
                    {showBack && (
                        <Link
                            href="/"
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                "bg-[#ffffff] text-slate-600",
                                "shadow-sm"
                            )}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    )}
                    {title && (
                        <h1 className="flex-1 text-center font-bold text-slate-800 text-lg tracking-tight">
                            {title}
                        </h1>
                    )}
                    {showBack && <div className="w-10" />}
                </header>
            )}
        </>
    )
}
