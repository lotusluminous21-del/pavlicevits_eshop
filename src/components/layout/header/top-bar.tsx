import Link from "next/link"
import { Phone, MapPin, Truck } from "lucide-react"

export function TopBar() {
    return (
        <div className="bg-primary text-primary-foreground text-xs py-2 hidden md:block">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex gap-6">
                    <a href="tel:+302310XXXXXX" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                        <Phone className="h-3 w-3" />
                        <span>2310-XXX-XXX</span>
                    </a>
                    <Link href="/epikoinonia" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                        <MapPin className="h-3 w-3" />
                        <span>Καλαμαριά, Θεσσαλονίκη</span>
                    </Link>
                    <Link href="/nomika/politiki-apostolwn" className="flex items-center gap-2 hover:text-white/80 transition-colors font-medium">
                        <Truck className="h-3 w-3" />
                        <span>Δωρεάν αποστολή άνω €50</span>
                    </Link>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">EL</span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/60 hover:text-white cursor-pointer transition-colors">EN</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
