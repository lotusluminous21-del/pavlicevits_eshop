'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IndexedFadeInUp, StaggerContainer, FadeInUp, ImageReveal } from '@/components/ui/motion';

const MOCK_PROJECTS = [
    {
        id: '1',
        title: 'Βαφή Ναυτιλιακών Εγκαταστάσεων',
        category: 'Ναυτιλιακά Χρώματα',
        description: 'Ολοκληρωμένη προστασία και βαφή ναυτιλιακών εγκαταστάσεων με εξειδικευμένα αντιδιαβρωτικά υστήματα μεγάλης αντοχής στις αντίξοες συνθήκες της θάλασσας.',
        image: '/images/homescreen/marine.webp',
        year: '2025'
    },
    {
        id: '2',
        title: 'Ανακαίνιση Ξενοδοχειακής Μονάδας',
        category: 'Οικοδομικά Χρώματα',
        description: 'Πλήρης ανακαίνιση εσωτερικών και εξωτερικών χώρων ξενοδοχείου 5 αστέρων, χρησιμοποιώντας οικολογικά χρώματα υψηλής αντοχής και τέλειας κάλυψης.',
        image: '/images/homescreen/building.webp',
        year: '2024'
    },
    {
        id: '3',
        title: 'Ειδικές Βαφές Βιομηχανικού Δαπέδου',
        category: 'Ειδικές Εφαρμογές',
        description: 'Εφαρμογή εποξειδικών ρητινών και βαφών βαρέως τύπου σε βιομηχανικό δάπεδο εργοστασίου παραγωγής, εξασφαλίζοντας μέγιστη αντοχή στη φθορά και τα χημικά.',
        image: '/images/homescreen/special.webp',
        year: '2023'
    }
];

export default function ProjectsClient() {
    return (
        <>
            {/* ───── Hero Section ───── */}
            <section className="relative flex items-center overflow-hidden bg-black min-h-[40vh] md:min-h-[50vh]">
                {/* Background Image */}
                <ImageReveal delay={0.1} className="absolute inset-0">
                    <Image
                        src="/images/projects/create-a-professional-product-photography-image-co.png"
                        alt="Τα Έργα μας - Παυλιτσέβιτς"
                        fill
                        className="object-cover grayscale brightness-50"
                        sizes="100vw"
                        priority
                    />
                </ImageReveal>
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full py-16 md:py-24">
                    <div className="max-w-3xl space-y-6">
                        <IndexedFadeInUp index={0}>
                            <span className="inline-block px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-[0.25em]">
                                Portfolio
                            </span>
                        </IndexedFadeInUp>

                        <IndexedFadeInUp index={1}>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                                Χαρακτηριστικα <br />
                                <span className="text-white/50 italic">Εργα.</span>
                            </h1>
                        </IndexedFadeInUp>

                        <IndexedFadeInUp index={2}>
                            <p className="text-lg text-white/70 font-light leading-relaxed border-l-2 border-white/30 pl-6 max-w-lg">
                                Ανακαλύψτε επιλεγμένα έργα που αναδεικνύουν την ποιότητα των υλικών μας και την τεχνογνωσία που προσφέρουμε σε κάθε εφαρμογή.
                            </p>
                        </IndexedFadeInUp>
                    </div>
                </div>
            </section>

            {/* ───── Projects List Section ───── */}
            <section className="py-16 md:py-24 bg-background">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="space-y-20 md:space-y-32">
                        {MOCK_PROJECTS.map((project, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={project.id} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}>
                                    
                                    {/* Image Column */}
                                    <div className="w-full md:w-3/5">
                                        <ImageReveal delay={0.1} className="relative aspect-[4/3] w-full overflow-hidden shadow-xl border border-border group">
                                            <Image
                                                src={project.image}
                                                alt={project.title}
                                                fill
                                                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 60vw"
                                            />
                                            {/* Overlay overlay for title on hover */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                                                    Προβολή Λεπτομερειών
                                                </Button>
                                            </div>
                                        </ImageReveal>
                                    </div>

                                    {/* Text Column */}
                                    <div className="w-full md:w-2/5 space-y-6">
                                        <FadeInUp>
                                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                <span>{project.year}</span>
                                                <span className="w-8 h-[1px] bg-border" />
                                                <span className="text-accent">{project.category}</span>
                                            </div>
                                        </FadeInUp>
                                        
                                        <FadeInUp delay={0.1}>
                                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground leading-tight">
                                                {project.title}
                                            </h2>
                                        </FadeInUp>
                                        
                                        <FadeInUp delay={0.2}>
                                            <p className="text-muted-foreground leading-loose">
                                                {project.description}
                                            </p>
                                        </FadeInUp>
                                        
                                        <FadeInUp delay={0.3}>
                                            <Button variant="link" className="p-0 h-auto text-primary hover:text-accent font-black uppercase tracking-widest text-xs flex items-center gap-2 group">
                                                Περισσοτερα 
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </FadeInUp>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ───── CTA Section ───── */}
            <section className="py-16 md:py-24 bg-[#19657a]">
                <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
                    <FadeInUp>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight text-white">
                            Έχετε ένα νέο έργο στα σκαριά;
                        </h2>
                    </FadeInUp>
                    <FadeInUp delay={0.2} className="flex justify-center">
                        <Link href="/contact">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="rounded-none px-8 md:px-10 py-6 text-xs font-black uppercase tracking-widest min-w-[200px] shadow-none"
                            >
                                Επικοινωνήστε μαζί μας
                            </Button>
                        </Link>
                    </FadeInUp>
                </div>
            </section>
        </>
    );
}
