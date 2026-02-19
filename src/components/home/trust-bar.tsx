import { Truck, ShieldCheck, Award, MessageCircleQuestion } from "lucide-react"

const features = [
    {
        icon: Award,
        title: "ΕΞΟΥΣΙΟΔΟΤΗΜΕΝΟΣ ΣΥΝΕΡΓΑΤΗΣ",
        description: "Επίσημοι αντιπρόσωποι κορυφαίων brands."
    },
    {
        icon: ShieldCheck,
        title: "ΑΣΦΑΛΕΙΣ ΣΥΝΑΛΛΑΓΕΣ",
        description: "Πιστοποιημένη ασφάλεια πληρωμών."
    },
    {
        icon: Truck,
        title: "ΑΜΕΣΗ ΑΠΟΣΤΟΛΗ",
        description: "Πανελλαδική κάλυψη & γρήγορη παράδοση."
    },
    {
        icon: MessageCircleQuestion,
        title: "ΤΕΧΝΙΚΗ ΥΠΟΣΤΗΡΙΞΗ",
        description: "Συμβουλές από εξειδικευμένους τεχνικούς."
    }
]

export function TrustBar() {
    return (
        <section className="absolute bottom-0 left-0 w-full z-20 border-t border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white/90">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                            <div className="flex-shrink-0">
                                <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide uppercase">{feature.title}</h3>
                                <p className="text-xs text-white/60 font-medium">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
