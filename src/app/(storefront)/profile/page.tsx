"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { signInWithGoogle, signOutUser } from "@/lib/auth"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { PrimaryButton } from "@/components/ui/skeumorphic/primary-button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { LogOut, Package, CreditCard, Bell, Settings, ChevronRight, User as UserIcon } from "lucide-react"

export default function ProfilePage() {
    const { user, loading } = useAuth()
    const [isSigningIn, setIsSigningIn] = React.useState(false)

    const handleLogin = async () => {
        setIsSigningIn(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error(error)
        }
        setIsSigningIn(false)
    }

    const handleLogout = async () => {
        try {
            await signOutUser()
        } catch (error) {
            console.error(error)
        }
    }

    // A reusable menu item component matching the neumorphic style
    const MenuItem = ({ icon: Icon, title, onClick, colorClass = "text-slate-700" }: any) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-[24px] bg-[#ffffff] transition-all duration-300 outline-none",
                "shadow-sm",
                "active:shadow-sm active:scale-[0.98]",
                "hover:shadow-sm"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-[44px] h-[44px] rounded-full bg-[#ffffff] flex items-center justify-center",
                    "shadow-sm",
                    colorClass
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-[16px] text-slate-800 tracking-tight">{title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
    )

    return (
        <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans mb-[80px]">
            <Header showBack title={user ? "Profile" : "Account"} />

            <main className="flex-1 w-full max-w-md mx-auto relative px-6 md:px-8 mt-[90px] md:mt-[100px] mb-8 z-10 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center -mt-20">
                        <div className="w-[50px] h-[50px] rounded-full border-[4px] border-[#F0F2F6] border-t-primary animate-spin shadow-sm"></div>
                    </div>
                ) : !user ? (
                    <div className="flex-1 flex flex-col items-center justify-center -mt-20 text-center">
                        <div className="w-[120px] h-[120px] rounded-[36px] bg-[#ffffff] shadow-sm flex items-center justify-center mb-8">
                            <UserIcon className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Welcome to Pavlicevits</h1>
                        <p className="text-[15px] font-medium text-slate-500 mb-10 max-w-[280px]">
                            Log in to track your orders, save your data, and unlock premium access.
                        </p>

                        <div className="w-full">
                            <PrimaryButton
                                onClick={handleLogin}
                                disabled={isSigningIn}
                                className={cn("w-full bg-slate-900 text-white shadow-sm", isSigningIn && "opacity-70")}
                            >
                                {isSigningIn ? "Connecting..." : "Continue with Google"}
                            </PrimaryButton>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 flex-1 flex flex-col">
                        {/* User Card */}
                        <div className="p-6 rounded-[36px] bg-[#ffffff] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            {/* Decorative background shapes for the card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-xl -ml-6 -mb-6" />

                            <div className="w-[88px] h-[88px] rounded-full p-[4px] bg-[#ffffff] shadow-sm mb-4 relative z-10">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        width={80}
                                        height={80}
                                        className="rounded-full w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                                        <span className="text-2xl font-black text-slate-500">{user.email?.[0].toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight relative z-10">
                                {user.displayName || "Valued Customer"}
                            </h2>
                            <p className="text-[14px] font-medium text-slate-500 relative z-10 mt-1">
                                {user.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-4">
                            <MenuItem icon={Package} title="My Orders" onClick={() => console.log('Orders clicked')} colorClass="text-accent" />
                            <MenuItem icon={CreditCard} title="Payment Methods" onClick={() => console.log('Payment clicked')} colorClass="text-emerald-500" />
                            <MenuItem icon={Bell} title="Notifications" onClick={() => console.log('Notifications clicked')} colorClass="text-amber-500" />
                            <MenuItem icon={Settings} title="Account Settings" onClick={() => console.log('Settings clicked')} colorClass="text-slate-500" />

                            <button
                                onClick={handleLogout}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-[24px] bg-[#ffffff] transition-all duration-300 outline-none mt-6",
                                    "shadow-sm",
                                    "active:shadow-sm active:scale-[0.98]",
                                    "hover:shadow-sm"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-[44px] h-[44px] rounded-full bg-[#ffffff] flex items-center justify-center",
                                        "shadow-sm",
                                        "text-red-500"
                                    )}>
                                        <LogOut className="w-5 h-5 ml-[-2px]" />
                                    </div>
                                    <span className="font-bold text-[16px] text-red-500 tracking-tight">Log Out</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation Wrapper */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center pb-6 z-50 pointer-events-none">
                <div className="pointer-events-auto w-[calc(100%-48px)] max-w-[420px]">
                    <BottomNav className="w-full rounded-[32px]" />
                </div>
            </div>
        </div>
    )
}


