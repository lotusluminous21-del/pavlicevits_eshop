import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteFooter() {
    return (
        <footer className="bg-secondary/5 border-t border-secondary/20 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                    {/* Brand Column - Large */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex flex-col space-y-2">
                            <h3 className="font-bold text-3xl tracking-tighter text-primary uppercase">Pavlicevits</h3>
                            <div className="flex items-center gap-2">
                                <span className="h-px w-8 bg-primary/50"></span>
                                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Est. 1982</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Technical expertise in automotive coatings and specialized construction solutions. German precision meets industrial durability.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="p-2 border border-border/50 rounded-sm text-muted-foreground hover:text-primary hover:border-primary transition-all">
                                <Facebook className="h-4 w-4" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="p-2 border border-border/50 rounded-sm text-muted-foreground hover:text-primary hover:border-primary transition-all">
                                <Instagram className="h-4 w-4" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="p-2 border border-border/50 rounded-sm text-muted-foreground hover:text-primary hover:border-primary transition-all">
                                <Twitter className="h-4 w-4" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns - Grid */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/80 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-sm"></span>
                                Products
                            </h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/proionta/vafes" className="hover:text-primary transition-colors block py-0.5">Automotive Paints</Link></li>
                                <li><Link href="/proionta/astaria" className="hover:text-primary transition-colors block py-0.5">Primers & Substrates</Link></li>
                                <li><Link href="/proionta/vernikia" className="hover:text-primary transition-colors block py-0.5">Varnishes</Link></li>
                                <li><Link href="/proionta/analosima" className="hover:text-primary transition-colors block py-0.5">Consumables</Link></li>
                                <li><Link href="/proionta/ergaleia" className="hover:text-primary transition-colors block py-0.5">Tools & Equipment</Link></li>
                                <li><Link href="/vres-xroma" className="text-primary hover:underline font-medium block py-0.5 mt-2">Find Color Code</Link></li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/80 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-sm"></span>
                                Information
                            </h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link href="/etaireia" className="hover:text-primary transition-colors block py-0.5">The Company</Link></li>
                                <li><Link href="/epikoinonia" className="hover:text-primary transition-colors block py-0.5">Contact</Link></li>
                                <li><Link href="/odigos" className="hover:text-primary transition-colors block py-0.5">Application Guides</Link></li>
                                <li><Link href="/nomika/oroi-xrisis" className="hover:text-primary transition-colors block py-0.5">Terms of Use</Link></li>
                                <li><Link href="/nomika/politiki-aporritou" className="hover:text-primary transition-colors block py-0.5">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        {/* Column 3 - Contact & Newsletter */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/80 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-sm"></span>
                                Contact
                            </h4>
                            <ul className="space-y-4 text-sm text-muted-foreground font-mono">
                                <li className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                    <span>XXX Street, Kalamaria,<br />Thessaloniki, 5513X</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-primary shrink-0" />
                                    <a href="tel:+302310XXXXXX" className="hover:text-primary">2310-XXX-XXX</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-primary shrink-0" />
                                    <a href="mailto:info@pavlicevits.gr" className="hover:text-primary">info@pavlicevits.gr</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-mono">
                    <p>© {new Date().getFullYear()} Pavlicevits. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 opacity-50">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>PayPal</span>
                        <span>IRIS</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
