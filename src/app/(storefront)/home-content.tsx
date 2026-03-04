import React from 'react';
import Link from 'next/link';
import { ChevronRight, Droplets, Target, ShieldCheck, Layers } from 'lucide-react';
import { CollectionCard } from '@/components/industrial_ui/CollectionCard';
import { ServiceCard } from '@/components/industrial_ui/ServiceCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/shopify/types';

interface CategoryData {
    id: string;
    name: string;
    slug: string;
    icon: string;
    count: number;
}

interface HomeContentProps {
    initialProducts: Product[];
    initialCategories: CategoryData[];
}

export default function HomeContent({ initialProducts, initialCategories }: HomeContentProps) {
    return (
        <>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pt-6 md:pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center min-h-[auto] md:min-h-[500px]">
                    <div className="flex flex-col justify-center gap-6 md:gap-8 order-2 md:order-1 py-4 md:py-8">
                        <div className="space-y-4">
                            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded">
                                Professional Grade
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1] md:leading-[0.9] tracking-tighter uppercase text-primary">
                                Industrial <br className="hidden sm:block" /> Coating <br className="hidden sm:block" /> <span className="text-[#165c52]">Excellence.</span>
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl font-light leading-relaxed">
                                Precision-engineered paints and aerosols for high-performance architectural and industrial applications.
                            </p>
                        </div>
                        <div className="flex flex-col flex-wrap sm:flex-row gap-3 sm:gap-4 mt-4">
                            <Button className="w-full sm:w-auto rounded-none uppercase tracking-widest font-bold px-6 sm:px-8 py-6 shadow-none" size="lg">
                                View Catalog
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto rounded-none uppercase tracking-widest font-bold px-6 sm:px-8 py-6 shadow-none border-primary text-primary hover:bg-muted" size="lg">
                                Request Quote
                            </Button>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 h-[300px] sm:h-[400px] md:h-[600px] w-full relative">
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-cover grayscale hover:grayscale-0 transition-all duration-700 border border-border"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB25Iqv14RH2RHGeldWYYsxXGI-x3rPAaO14B2BCKly09lfPq8CM5ZZLXVzHL2acQnt5HWXtGKR4uy6IJTWTvl7Kf9-G6RTz7pfSg7mMsiHAPkSeMSTTx9jlhODNJnSmovW3wsAQC9gLO-rzLNVxdMuIN8ysd9wcQCgFagTAk7r6L9AW-dLs9OE10E_pQeBkgrLXqgSHqXl-d9EMHeLtTuuMNfBuq526o0gcYibG4alkTsRGeyq7T-D4lTjnjQdbrbWRF9Z25BugyU")' }}>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-0 mb-8 md:mb-10 border-b border-border pb-4 md:pb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-primary">Collections</h2>
                        <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-widest mt-1">Selected Performance Tiers</p>
                    </div>
                    <Link href="/collections" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#165c52] hover:underline hover:text-primary transition-colors">
                        Explore All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CollectionCard
                        title="Architectural Matte"
                        description="Industrial grade interior finishes for brutalist design."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuAUamqwHmBSXqPpAwTcmFc3pO7YzdBmSswz100-e68HhR7asVXmWU8a81owRkgiPA2LnYSS9NNJAxGifqhgFA0-PM2hCFwGQlHntB0US_D5tXc3vMR7tkFY6-yGGB0EEG5mg1yeh6VPCoYHQruj8WbEuoXvZxwKvN-dk9AiDiSELf3_Rs-RnaTYak3fGDu-Glnhe2Vnx9VeFbntXERdSSYLX7dyg-GJR--UlqHjfjBfkskkrIPejBUGpK5PRMJ5bM_tc1AtQc7ZaJs"
                        variant="featured"
                        colors={['bg-[#0f172a]', 'bg-[#1e293b]', 'bg-[#e2e8f0]']}
                    />

                    <CollectionCard
                        title="Precision Aerosols"
                        description="High-pressure sprays for structural metal coating."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuAWrbULLO07oekCtWBD2kukhKrEg2kcxweq86wACYrVtmK9psheQ2LjuwFQPsLsl4skTmtc8l3cz7xM3T5XH2vfKO8-32U-aIbe7j65NshNnY8BY54DlGD3nDnUrCMvOB6RNP1RMB0Oc4ytCSMMY9Gr9uHtLHTOScdIGhd5M6k6Knbfm3pUNHkzcVRI12xq8XurIIyIDNuvTbefdbtDIRR78xkWOUt__xC0rzDgohthIUosxLcChoPoCRwVU4R5REDLsnqC49oOwi0"
                        variant="featured"
                        colors={['bg-[#165c52]', 'bg-[#0f172a]', 'bg-[#334155]']}
                    />

                    <CollectionCard
                        title="Application Kits"
                        description="Professional-level tools for seamless layer application."
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuAjF96LCtmivjlbMf367DXNKtklNiCgqdupmpiV9ZMBPxvQitE9WBaND8bcalULsRkbGJcE9R55pvWQdaN9ND5mTX36WlbbIQZstHnkPtUBjH-2TU0LH57GZts-qF9OsXBlqA4kZnfUEZ_H54yJdOX8PvpjycWcS-7ok8Yf98vZMK1ETD73B0Vnie1KR-ogySW7uOJtI15aL89S9FtJ3u1AaX5eJVJVTaD_9O-e1Qh1PUSi3stt1kINCvde1Dg4TOQ1hhEh4XPDijU"
                        variant="featured"
                        badge="Certified Equipment"
                    />
                </div>
            </section>

            {/* Professional Services */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10">
                <div className="bg-[#0b1120] text-primary-foreground border border-[#1e293b]">
                    <div className="flex flex-col lg:flex-row">
                        <div className="flex-1 p-6 sm:p-8 md:p-12 lg:p-16 space-y-8 md:space-y-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 !text-white">Professional Services</h2>
                                <p className="text-white/70 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                                    We don't just provide the materials; we provide the expertise. From custom color matching to large-scale industrial coating consultancy.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                                <ServiceCard
                                    icon={<Target className="w-8 h-8 text-[#165c52]" />}
                                    title="On-Site Consulting"
                                    description="Expert surface analysis and material recommendation for architectural projects."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<Droplets className="w-8 h-8 text-[#165c52]" />}
                                    title="Custom Pigmentation"
                                    description="Proprietary color development for exclusive brand identity and interiors."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<ShieldCheck className="w-8 h-8 text-[#165c52]" />}
                                    title="Coating Certification"
                                    description="Quality assurance testing for high-durability industrial standards."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                                <ServiceCard
                                    icon={<Layers className="w-8 h-8 text-[#165c52]" />}
                                    title="Surface Engineering"
                                    description="Advanced layering techniques for acoustic and thermal optimization."
                                    iconColor="accent"
                                    className="!text-white [&_h4]:!text-white [&_h4]:hover:text-[#165c52] [&_p]:text-white/60"
                                />
                            </div>
                        </div>
                        <div className="lg:w-1/3 flex-none relative h-[300px] sm:h-[400px] lg:h-auto">
                            <div className="absolute inset-0 bg-cover bg-center grayscale border border-[#1e293b]"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2kdPOwjjNjCZroVs55zhYzDHIAox0rVdmpVBhAGmuR1JwXYSa3T2lKeNKiy0zCumiOUdhOtrGuiNl8-kDibemvl0s2epPsk6E6_ZOI4fV4iTyYrmvHKqhqNU9G4v43cRYi0G6C4HQM4n0iJBxwuJRvE1sQ0la840egmY4x1jhnQ-WYVhkm7vQ-AEhOOwey3VPHXe1GykxsypHXecsJZ8Uk8PgRxLgPq9iFOejFwRt4O-QC0zG4NETwZppEPMFstWizjZMw-nbF2g")' }}>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-[#0f4d44] text-white p-6 z-10 hidden lg:block">
                                <p className="text-3xl font-black italic">25+</p>
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Years Technical Experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
