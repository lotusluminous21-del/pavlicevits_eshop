"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Home, CheckCircle2, ShoppingCart, MessageSquareText, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useCartStore } from "@/store/cart-store"

export interface BottomNavProps extends React.HTMLAttributes<HTMLDivElement> { }

export function BottomNav({ className, ...props }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<"home" | "check" | "cart" | "chat" | "profile">("home")
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartCount = useCartStore(state => state.getCartCount());

    // Sync active tab with pathname
    useEffect(() => {
        if (pathname === "/") setActiveTab("home");
        else if (pathname.startsWith("/profile")) setActiveTab("profile");
        else if (pathname.startsWith("/proionta") || pathname.startsWith("/categories")) setActiveTab("check"); // Assuming Check is browse/categories for now
        else if (pathname.startsWith("/cart")) setActiveTab("cart");
        // Keep existing tab for other routes unless cart is open
    }, [pathname]);

    // Helper to render the diamond pip only for the active tab
    const renderPip = (tab: string) => (
        <div
            className={cn(
                "absolute -bottom-[10px] w-1.5 h-1.5 rotate-45 rounded-[1px] transition-all duration-300",
                activeTab === tab ? "bg-slate-800 shadow-sm opacity-100 scale-100" : "bg-transparent opacity-0 scale-0"
            )}
        />
    )

    const handleNavigation = (tab: "home" | "check" | "chat" | "profile", path: string) => {
        setActiveTab(tab);
        router.push(path);
    };

    return (
        <>
            <div
                className={cn(
                    "relative w-full max-w-[420px] h-[64px] pb-[8px] flex items-center justify-between px-6",
                    "bg-[#ffffff] rounded-none z-40", // Ensure sits under modals/drawers
                    "shadow-sm",
                    className
                )}
                {...props}
            >
                {/* Home */}
                <button
                    onClick={() => handleNavigation("home", "/")}
                    className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
                >
                    <Home
                        className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "home" ? "text-slate-800 fill-slate-800" : "text-slate-500 fill-transparent group-hover:text-slate-700")}
                        strokeWidth={1.5}
                    />
                    {renderPip("home")}
                </button>

                {/* Check/Tasks (Mapped to Browse/Categories) */}
                <button
                    onClick={() => handleNavigation("check", "/categories")}
                    className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
                >
                    <CheckCircle2
                        className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "check" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                        strokeWidth={activeTab === "check" ? 2.5 : 1.5}
                    />
                    {renderPip("check")}
                </button>

                {/* Center Floating Cart */}
                <div className="relative flex justify-center w-[60px] h-full z-10">
                    <button
                        onClick={() => {
                            setActiveTab("cart");
                            setIsCartOpen(true);
                        }}
                        className={cn(
                            "absolute -top-[16px] left-1/2 -translate-x-1/2 w-[64px] h-[64px] rounded-full flex items-center justify-center outline-none transition-all duration-300",
                            "bg-[#ffffff]",
                            "shadow-sm",
                            activeTab === "cart" && "scale-[0.96] shadow-sm"
                        )}
                    >
                        <ShoppingCart className={cn("w-[26px] h-[26px] transition-colors drop-shadow-sm", activeTab === "cart" ? "text-slate-900" : "text-slate-700")} strokeWidth={2.2} />

                        {cartCount > 0 && (
                            <span className="absolute top-1 right-2 w-5 h-5 rounded-full bg-primary border-2 border-[#F0F2F6] text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-sm pointer-events-none">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Messages (Mapped to Connect/Expert) */}
                <button
                    onClick={() => handleNavigation("chat", "/expert")}
                    className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
                >
                    <MessageSquareText
                        className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "chat" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                        strokeWidth={activeTab === "chat" ? 2.5 : 1.5}
                    />
                    {renderPip("chat")}
                </button>

                {/* Profile */}
                <button
                    onClick={() => handleNavigation("profile", "/profile")}
                    className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
                >
                    <User
                        className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "profile" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                        strokeWidth={activeTab === "profile" ? 2.5 : 1.5}
                    />
                    {renderPip("profile")}
                </button>
            </div>

        </>
    )
}
