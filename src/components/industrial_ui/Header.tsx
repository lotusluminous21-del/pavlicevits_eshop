import React from 'react';
import Link from 'next/link';
import { Layers, Search, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    return (
        <header className={cn(
            "border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50",
            className
        )}>
            <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-4 flex items-center justify-between whitespace-nowrap">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded">
                            <Layers className="text-primary-foreground w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Pavlicevits</h2>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            { label: 'Shop', href: '/shop' },
                            { label: 'AI Expert', href: '/expert' },
                            { label: 'Services', href: '/services' },
                            { label: 'About', href: '/about' },
                            { label: 'Contact', href: '/contact' },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-muted-foreground hover:text-accent text-sm font-semibold uppercase tracking-wider transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="hidden sm:flex items-center bg-secondary rounded-lg px-3 py-1.5 border border-border">
                        <Search className="text-muted-foreground w-5 h-5" />
                        <Input
                            className="bg-transparent border-none focus-visible:ring-0 shadow-none text-sm w-32 lg:w-48 placeholder:text-muted-foreground h-auto py-0"
                            placeholder="Search catalog..."
                            type="text"
                        />
                    </div>

                    <button className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                    </button>

                    <div
                        className="w-10 h-10 rounded-full border border-border bg-cover bg-center"
                        title="User profile"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQEM7QszTqwjXRih_KjFMBGpQ-p0_Ek4_e_wMciTO-o0cRwhXumd5NXvQBm6w2NzTStpPox8V9E0-ddZAXhnN0aaoj9vvGCOHsmgXKzr8D3dAxV9bOEvwn-wc3c_eC8vJPVGQ4jEF1VrDk5UTbDP1TKUXRy0lPGVJZfelyI-Lt8ehnOmS5ERQZb0Hbulcd3ZvGF3XTvlR_OHRKsIML5oDeY7N5fjrJpXSGXqgWHwoEdX5bXZqXJ3xRZJnGG8a8rNP5Yv99uVnctec")' }}
                    ></div>
                </div>
            </div>
        </header>
    );
}
