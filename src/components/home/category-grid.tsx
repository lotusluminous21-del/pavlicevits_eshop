import Link from 'next/link';
import { ArrowRight, PaintBucket, Hammer, Layers, SprayCan, FileText, Component } from 'lucide-react';
import { TechBadge } from '@/components/ui/tech-badge';

const categories = [
    {
        title: 'Automotive Paints',
        href: '/proionta/vafes',
        icon: PaintBucket,
        description: 'Precision color matching and high-durability bases.',
        ref: 'CAT-01'
    },
    {
        title: 'Primers & Substrates',
        href: '/proionta/astaria',
        icon: Layers,
        description: 'Foundation layers for perfect adhesion and surfacing.',
        ref: 'CAT-02'
    },
    {
        title: 'Varnishes & Hardeners',
        href: '/proionta/vernikia',
        icon: SprayCan, // Using SprayCan as a proxy for varnish/finish
        description: 'Crystal clear coats for ultimate protection and gloss.',
        ref: 'CAT-03'
    },
    {
        title: 'Consumables',
        href: '/proionta/analosima',
        icon: Component, // Generic component icon for consumables
        description: 'Masking tapes, abrasives, and protective gear.',
        ref: 'CAT-04'
    },
    {
        title: 'Tools & Equipment',
        href: '/proionta/ergaleia',
        icon: Hammer, // Tools icon
        description: 'Professional spray guns and workshop equipment.',
        ref: 'CAT-05'
    },
    {
        title: 'Application Guides',
        href: '/odigos',
        icon: FileText,
        description: 'Technical data sheets and step-by-step manuals.',
        ref: 'DOC-06'
    }
];

export function CategoryGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
                <Link
                    key={category.title}
                    href={category.href}
                    className="group relative bg-white/60 backdrop-blur-md border border-white/40 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col h-64 rounded-xl overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-secondary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <category.icon className="h-6 w-6" />
                        </div>
                        <TechBadge variant="ghost" className="opacity-0 group-hover:opacity-50 transition-opacity bg-white/50 backdrop-blur-sm">
                            {category.ref}
                        </TechBadge>
                    </div>

                    <div className="mt-auto">
                        <h3 className="font-bold text-xl tracking-tight mb-2 group-hover:text-primary transition-colors">
                            {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 group-hover:text-foreground/80 transition-colors">
                            {category.description}
                        </p>

                        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Access Module <ArrowRight className="ml-2 h-3 w-3" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
