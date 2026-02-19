"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Database,
    LayoutGrid,
    LogOut,
    Menu,
    Search,
    Bell,
    ChevronRight,
    Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const navItems = [
        {
            title: "Staging Area",
            href: "/admin/products",
            icon: LayoutGrid,
            matchExample: "/admin/products"
        }
    ];

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-gray-100/50 shrink-0">
                <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-gray-900 tracking-tight">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        P
                    </div>
                    <span>Pava<span className="text-indigo-600">Admin</span></span>
                </Link>
            </div>

            <ScrollArea className="flex-1 py-6 px-4">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 mb-1 font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-gray-400")} />
                                    {item.title}
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-8 px-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Systems</h4>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-xs text-gray-500 hover:text-gray-900">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Operational
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-9 text-xs text-gray-500 hover:text-gray-900">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            v2.4.0-stable
                        </Button>
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-100/50 mt-auto bg-gray-50/30 backdrop-blur-sm">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 hover:bg-white hover:shadow-sm ring-1 ring-transparent hover:ring-gray-100 px-2 transition-all">
                            <Avatar className="h-8 w-8 border border-gray-200">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-xs text-left">
                                <span className="font-bold text-gray-900">Admin User</span>
                                <span className="text-gray-500">admin@pavlicevits.com</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-red-600 flex items-center gap-2">
                            <LogOut className="w-3 h-3" /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 z-50 transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                <NavContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 bg-white w-72">
                    <NavContent />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 flex flex-col h-screen transition-all duration-300 overflow-hidden">

                {/* Header */}
                <header className="h-16 shrink-0 bg-white/70 backdrop-blur-md border-b border-gray-200/50 z-40 px-6 flex items-center justify-between gap-4 transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1">
                        <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-gray-500 hover:text-gray-900" onClick={() => setIsMobileOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </Button>

                        {!pathname.includes('/wizard') && (
                            <div className="hidden md:flex items-center text-sm font-medium text-gray-500">
                                <Link href="/admin" className="hover:text-gray-900 transition-colors flex items-center gap-1">
                                    <Home className="w-3.5 h-3.5" />
                                </Link>
                                {pathname !== "/admin" && (
                                    <>
                                        <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                        <span className="text-gray-900 capitalize font-semibold">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 w-64 h-9 bg-gray-100/50 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100 transition-all rounded-full text-sm"
                            />
                        </div>

                        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 rounded-full w-9 h-9">
                            <Bell className="w-4.5 h-4.5" />
                            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </Button>
                    </div>
                </header>

                <div className={cn(
                    "flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0",
                    pathname.includes('/wizard') ? "p-0 overflow-hidden" : "p-6 md:p-8 max-w-[1600px] w-full mx-auto overflow-auto"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
