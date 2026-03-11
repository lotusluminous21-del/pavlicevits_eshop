"use client"

import * as React from "react"
import { Product } from "@/lib/shopify/types"
import { useCartStore } from "@/store/cart-store"
import { addItemToCart } from "@/app/actions/cart"
import { CustomColorForm } from "@/components/custom-paint/custom-color-form"
import { isCustomPaintProduct, colorSpecToAttributes, type CustomColorSpec } from "@/components/custom-paint/custom-paint-helpers"
import { RAL_COLORS } from "@/components/custom-paint/color-system-data"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ImageReveal, IndexedFadeInUp, StaggerContainer, FadeInUp } from "@/components/ui/motion"
import { Sparkles, Ruler, Timer, FlaskConical, MapPin, Layers, Paintbrush, ListChecks, Shapes, ListOrdered, Info } from "lucide-react"

const colorNameToHex: Record<string, string> = {
    // Basic Greek Colors
    "ΛΕΥΚΟ": "#FFFFFF",
    "ΜΑΥΡΟ": "#111111",
    "ΚΙΤΡΙΝΟ": "#FFD700",
    "ΚΟΚΚΙΝΟ": "#FF0000",
    "ΜΠΛΕ": "#0000FF",
    "ΠΡΑΣΙΝΟ": "#008000",
    "ΠΟΡΤΟΚΑΛΙ": "#FFA500",
    "ΡΟΖ": "#FFC0CB",
    "ΜΩΒ": "#800080",
    "ΚΑΦΕ": "#8B4513",
    "ΓΚΡΙ": "#808080",
    "ΑΣΗΜΙ": "#C0C0C0",
    "ΧΡΥΣΟ": "#FFD700",
    "ΔΙΑΦΑΝΕΣ": "transparent",

    // Industrial specific
    "BASALT GREY": "#4A4E52",
    "SIGNAL WHITE": "#F4F4F4",
    "COBALT TEAL": "#004F52",
    "CARBON BLACK": "#1C1C1C",

    // English Fallbacks
    "WHITE": "#FFFFFF",
    "BLACK": "#111111",
    "RED": "#FF0000",
    "BLUE": "#0000FF",
    "GREEN": "#008000",
    "YELLOW": "#FFD700"
};

function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substring(-2);
    }
    return color;
}

const normalizeColorName = (name: string) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();
};

const levenshteinDistance = (s1: string, s2: string): number => {
    if (!s1 || !s2) return Math.max(s1?.length || 0, s2?.length || 0);
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) matrix[j][0] = j;
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // insertion
                matrix[j - 1][i] + 1, // deletion
                matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    return matrix[s2.length][s1.length];
};

const getHexForColorName = (name: string): string => {
    const uppercaseName = normalizeColorName(name);

    // 1. Check our robust RAL database first!
    const ralMatch = RAL_COLORS.find(c =>
        normalizeColorName(c.name) === uppercaseName ||
        normalizeColorName(c.nameEn) === uppercaseName ||
        normalizeColorName(`RAL ${c.code}`) === uppercaseName ||
        c.code === uppercaseName
    );
    if (ralMatch) return ralMatch.hex;

    // 2. Exact match in fallback dictionary
    if (colorNameToHex[uppercaseName]) {
        return colorNameToHex[uppercaseName];
    }

    // 3. Smart Algorithmic Matcher (Fuzzy Distance)
    // Similar text-based architecture to delta_e algorithms
    const tokens = uppercaseName.split(/[\/\-,\s]+/);
    let bestHex = "";
    let bestDistance = Infinity;

    for (const token of tokens) {
        if (!token) continue;

        // Algorithmic similarity against base dictionaries
        for (const [key, hex] of Object.entries(colorNameToHex)) {
            const d = levenshteinDistance(token, key);
            if (d < bestDistance && d <= 2) {
                bestDistance = d;
                bestHex = hex;
            }
        }

        // Algorithmic similarity against RAL dictionary
        for (const c of RAL_COLORS) {
            const d1 = levenshteinDistance(token, normalizeColorName(c.name));
            const d2 = levenshteinDistance(token, normalizeColorName(c.nameEn));
            const minD = Math.min(d1, d2);
            if (minD < bestDistance && minD <= 2) {
                bestDistance = minD;
                bestHex = c.hex;
            }
        }
    }

    if (bestHex) return bestHex;

    // 4. Partial substring fallback
    for (const [key, hex] of Object.entries(colorNameToHex)) {
        if (uppercaseName.includes(key)) return hex;
    }

    if (/^(#|rgb|rgba|hsl|hsla)/i.test(name)) return name;

    // 5. Hash-based deterministic fallback color
    return stringToColor(name);
}

const isColorOption = (optionName: string) => {
    const n = normalizeColorName(optionName);
    return n.includes('COLOR') || n.includes('ΧΡΩΜΑ') || n.includes('ΑΠΟΧΡΩΣΗ') || n.includes('RAL') || n.includes('FINISH');
};

export function ProductClient({ product }: { product: Product }) {
    // Hardcode quantity to 1 to match reference design exactly
    const quantity = 1;
    const isCustomPaint = isCustomPaintProduct(product.handle);
    const [colorSpec, setColorSpec] = React.useState<CustomColorSpec | null>(null);
    const [showColorValidation, setShowColorValidation] = React.useState(false);

    // Shopify variants selection state
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
        const defaultOptions: Record<string, string> = {};
        if (product.options) {
            product.options.forEach(opt => {
                if (opt.values.length > 0) defaultOptions[opt.name] = opt.values[0];
            });
        }
        return defaultOptions;
    });

    const selectedVariant = product.variants.edges.find((variantEdge) =>
        variantEdge.node.selectedOptions.every(
            (option) => selectedOptions[option.name] === option.value
        )
    )?.node || product.variants.edges[0]?.node;

    const isAvailable = selectedVariant?.availableForSale ?? false;
    const price = selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount;

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: value
        }));
    };

    const { setCart, isSyncing, setIsSyncing } = useCartStore();
    const handleAddToCart = async () => {
        if (!selectedVariant || isSyncing) return;

        if (isCustomPaint && !colorSpec) {
            setShowColorValidation(true);
            return;
        }

        setIsSyncing(true);

        try {
            const attributes = isCustomPaint && colorSpec
                ? colorSpecToAttributes(colorSpec)
                : undefined;

            const updatedCart = await addItemToCart(selectedVariant.id, quantity, attributes);
            if (updatedCart) {
                setCart(updatedCart);
                alert(`Added ${quantity} x ${product.title} to cart`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to add to cart");
        }

        setIsSyncing(false);
    };

    const images = product.images?.edges.map(e => e.node) || [];
    if (product.featuredImage && images.length === 0) {
        images.push(product.featuredImage);
    }

    // Check if the currently selected variant has a specific image
    const variantImage = selectedVariant?.image;

    // Fallbacks: Variant Image -> First Product Image -> Empty
    const heroImage = variantImage?.url || (images.length > 0 ? images[0].url : "");
    const heroAlt = variantImage?.altText || (images.length > 0 ? images[0].altText || product.title : product.title);

    // Semantic spec configuration — controls labels, icons, and top-grid eligibility
    const SPEC_CONFIG: Record<string, { label: string; icon: any; topGrid: boolean }> = {
        finish:             { label: "Φινίρισμα",      icon: Sparkles,           topGrid: true  },
        coverage:           { label: "Κάλυψη",         icon: Ruler,              topGrid: true  },
        drying_time:        { label: "Στέγνωμα",       icon: Timer,              topGrid: true  },
        chemical_base:      { label: "Βάση",           icon: FlaskConical,       topGrid: false },
        environment:        { label: "Χώρος",          icon: MapPin,             topGrid: false },
        surfaces:           { label: "Επιφάνειες",     icon: Layers,             topGrid: false },
        application_method: { label: "Εφαρμογή",       icon: Paintbrush,         topGrid: false },
        features:           { label: "Χαρακτηριστικά", icon: ListChecks,         topGrid: false },
        category:           { label: "Κατηγορία",      icon: Shapes,             topGrid: false },
        sequence_step:      { label: "Στάδιο",         icon: ListOrdered,        topGrid: false },
    };

    const getSpecLabel = (key: string) => SPEC_CONFIG[key]?.label || key.replace(/_/g, ' ');
    const getSpecIcon = (key: string) => SPEC_CONFIG[key]?.icon || Info;

    // Helper: normalize a metafield value (which may be a JSON array or plain string)
    // into a clean display string or array of tags
    const parseSpecValue = (value: string): string[] => {
        let parsed = value;

        // Try to parse JSON arrays like ["Σπρέι","Πινέλο"]
        try {
            const jsonVal = JSON.parse(value);
            if (Array.isArray(jsonVal)) {
                return jsonVal.map(v => String(v).trim()).filter(Boolean);
            }
            parsed = String(jsonVal);
        } catch {
            // Not JSON, continue with string parsing
        }

        // Split comma-separated values
        if (parsed.includes(',') || parsed.includes('·')) {
            return parsed.split(/[,·]+/).map(v => v.trim()).filter(Boolean);
        }

        return [parsed];
    };

    // Helper: get a clean display string for a single metafield value
    const getDisplayValue = (value: string): string => {
        const tags = parseSpecValue(value);
        return tags.join(', ');
    };

    const validMetafields = product.metafields?.filter(m => m !== null) || [];

    // Top grid: Only specs explicitly marked for the hero area
    const topGridSpecs = validMetafields.filter(m => SPEC_CONFIG[m!.key]?.topGrid);

    // Tech specs table: ALL valid metafields (repeated from top grid for completeness)
    const allSpecs = validMetafields;

    // Title processing to break into two lines dynamically for aesthetic matching
    const formatTitle = (title: string) => {
        const words = title.split(' ');
        if (words.length <= 2) return title;
        const middle = Math.ceil(words.length / 2);
        return (
            <>
                {words.slice(0, middle).join(' ')} <br />
                {words.slice(middle).join(' ')}
            </>
        );
    };

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light text-slate-900 grid-bg font-display" style={{ fontFamily: '"Public Sans", sans-serif' }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                .grid-bg {
                    background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
                    background-size: 32px 32px;
                }
            `}</style>

            <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                    <Link href="/products" className="hover:text-slate-900 transition-colors">Products</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-slate-900">{product.title}</span>
                </nav>

                {/* Product Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                    {/* Image Display */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <ImageReveal delay={0.1} className="sticky top-8 h-[400px] sm:h-[500px] lg:h-[calc(100vh-8rem)] max-h-[850px] bg-white border border-slate-200 flex items-center justify-center p-8 lg:p-20 overflow-hidden group">
                            {heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={heroAlt}
                                    className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    No Image Available
                                </div>
                            )}
                        </ImageReveal>
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="border-b border-slate-200 pb-8">
                            <IndexedFadeInUp index={0} className="flex justify-between items-start mb-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-[#0f3d3e] text-white px-2.5 py-1" style={{ backgroundColor: '#0f3d3e' }}>
                                    INDUSTRIAL GRADE
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2",
                                    isAvailable ? "text-[#0f3d3e]" : "text-red-600"
                                )} style={isAvailable ? { color: '#0f3d3e' } : {}}>
                                    <span className={cn(
                                        "size-1.5 rounded-full",
                                        isAvailable ? "animate-pulse" : "bg-red-600"
                                    )} style={isAvailable ? { backgroundColor: '#0f3d3e' } : {}}></span>
                                    {isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                                </span>
                            </IndexedFadeInUp>
                            <IndexedFadeInUp index={1}>
                                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-2 leading-[0.85] text-slate-900" style={{ letterSpacing: '-0.06em' }}>
                                    {formatTitle(product.title)}
                                </h1>
                            </IndexedFadeInUp>
                            <IndexedFadeInUp index={2}>
                                <p className="text-2xl font-light tracking-tight text-slate-600 mt-4">${Number(price).toFixed(2)}</p>
                            </IndexedFadeInUp>
                        </div>

                        {/* Performance Specs Grid (Semantic Hero Specs) */}
                        {topGridSpecs.length > 0 && (
                            <IndexedFadeInUp index={3}>
                                <div className="h-[1px] bg-slate-200/60 w-full mb-6 mt-2" />
                                <div className={cn("grid gap-3",
                                    topGridSpecs.length === 1 ? "grid-cols-1" :
                                        topGridSpecs.length === 2 ? "grid-cols-2" : "grid-cols-3"
                                )}>
                                    {topGridSpecs.map(m => {
                                        const Icon = getSpecIcon(m!.key);
                                        return (
                                            <div key={m?.id} className="bg-[#f8fafc] p-4 lg:p-5 border border-slate-100 flex flex-col gap-3.5 min-w-0">
                                                <div className="flex items-center gap-2 text-[#8b9dba]">
                                                    <Icon className="w-[14px] h-[14px] flex-shrink-0" strokeWidth={2} />
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] leading-none pt-[1px]">{getSpecLabel(m!.key)}</span>
                                                </div>
                                                <p className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#0f172a] leading-[1.3] break-words">
                                                    {getDisplayValue(m?.value || '')}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </IndexedFadeInUp>
                        )}

                        {/* Options/Variants Selectors */}
                        {product.options && product.options.map((option) => {
                            if (option.name === "Title" && option.values[0] === "Default Title") return null;
                            const isColor = isColorOption(option.name);

                            return (
                                <IndexedFadeInUp index={4} key={option.id} className="space-y-4">
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-900">
                                        {isColor ? "Select Finish / RAL" : `Select ${option.name}`}
                                    </p>
                                    <div className="flex flex-wrap gap-x-2 gap-y-4">
                                        {option.values.map((val) => {
                                            const isSelected = selectedOptions[option.name] === val;

                                            if (isColor) {
                                                const hexColor = getHexForColorName(val);
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleOptionChange(option.name, val)}
                                                        className={cn(
                                                            "group flex flex-col items-center gap-1.5 transition-all w-12",
                                                            !isSelected && "opacity-70 hover:opacity-100"
                                                        )}
                                                        title={val}
                                                    >
                                                        <div className={cn(
                                                            "size-9 border transition-all flex items-center justify-center overflow-hidden",
                                                            isSelected ? "border-[#0f3d3e] ring-[1.5px] ring-[#0f3d3e] ring-offset-2" : "border-slate-300 hover:border-slate-500"
                                                        )} style={{ backgroundColor: hexColor }}>
                                                        </div>
                                                        <span className={cn(
                                                            "text-[7px] font-black uppercase text-center leading-tight tracking-[0.05em]",
                                                            isSelected ? "text-slate-900" : "text-slate-400"
                                                        )}>{val}</span>
                                                    </button>
                                                );
                                            }

                                            // Text standard button
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleOptionChange(option.name, val)}
                                                    className={cn(
                                                        "group flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition-all",
                                                        isSelected && "opacity-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center px-4 py-2 min-w-[3rem] text-[10px] sm:text-xs font-bold uppercase border bg-slate-50",
                                                        isSelected
                                                            ? "border-[#0f3d3e] ring-1 ring-[#0f3d3e] ring-offset-1 text-slate-900 shadow-sm"
                                                            : "border-slate-200 text-slate-500"
                                                    )}>
                                                        <span>{val}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </IndexedFadeInUp>
                            )
                        })}

                        {/* Custom Color Form */}
                        {isCustomPaint && (
                            <IndexedFadeInUp index={5} className="mt-4">
                                <CustomColorForm
                                    onChange={setColorSpec}
                                    showValidation={showColorValidation}
                                />
                            </IndexedFadeInUp>
                        )}

                        {/* Actions */}
                        <IndexedFadeInUp index={6} className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!isAvailable || (isCustomPaint && !colorSpec)}
                                className={cn(
                                    "w-full text-white py-4 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-slate-900 transition-colors flex items-center justify-center gap-2",
                                    (!isAvailable || (isCustomPaint && !colorSpec)) ? "opacity-50 cursor-not-allowed bg-slate-400" : "bg-[#0f3d3e]"
                                )}
                                style={isAvailable && !(isCustomPaint && !colorSpec) ? { backgroundColor: '#0f3d3e' } : {}}
                            >
                                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                {!isAvailable ? "Sold Out" : isCustomPaint && !colorSpec ? "Select Color" : "Add to Project"}
                            </button>

                            <button className="w-full border border-slate-200 py-4 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-slate-900 bg-white">
                                <span className="material-symbols-outlined text-[16px]">bookmark</span>
                                Save for Later
                            </button>
                        </IndexedFadeInUp>

                        {/* Tech Docs */}
                        <IndexedFadeInUp index={7} className="flex gap-4 mt-6">
                            <a href="#" className="flex items-center gap-2 group text-slate-900 border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition-colors bg-white">
                                <span className="material-symbols-outlined text-[12px]">description</span>
                                <span className="text-[7px] font-black uppercase tracking-widest underline underline-offset-4">SDS (Safety Sheet)</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 group text-slate-900 border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition-colors bg-white">
                                <span className="material-symbols-outlined text-[12px]">architecture</span>
                                <span className="text-[7px] font-black uppercase tracking-widest underline underline-offset-4">TDS (Technical Data)</span>
                            </a>
                        </IndexedFadeInUp>
                    </div>
                </div>

                {/* Product Description */}
                {product.descriptionHtml && (
                    <FadeInUp className="mt-32">
                        <div className="flex items-end gap-6 mb-12 text-slate-900">
                            <h3 className="text-5xl font-black uppercase tracking-tighter leading-[0.85]">Product <br />Description</h3>
                            <div className="h-[1px] bg-slate-200 grow mb-2"></div>
                        </div>
                        <div
                            className="prose prose-sm prose-slate max-w-none font-medium leading-relaxed text-slate-700 max-w-3xl"
                            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                        />
                    </FadeInUp>
                )}

                {/* Technical Specifications Table — ALL specs including those from top grid */}
                {allSpecs.length > 0 && (
                    <FadeInUp className="mt-32">
                        <div className="flex items-end gap-6 mb-10 text-slate-900">
                            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.85]" style={{ letterSpacing: '-0.05em' }}>Technical <br />Specifications</h3>
                            <div className="h-[1px] bg-slate-200/80 grow mb-1.5"></div>
                        </div>
                        <div className="bg-[#f8fafc] p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 border border-slate-100">
                            {allSpecs.map((metafield) => {
                                const tags = parseSpecValue(metafield?.value || '');
                                const isMultiTag = tags.length > 1;

                                return (
                                    <div key={metafield?.id} className="flex flex-col gap-3.5 min-w-0">
                                        {/* Label row with icon */}
                                        <div className="flex items-center gap-2 text-[#8b9dba]">
                                            {React.createElement(getSpecIcon(metafield!.key), { className: "w-[14px] h-[14px] flex-shrink-0", strokeWidth: 2 })}
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] leading-none pt-[1px]">{getSpecLabel(metafield!.key)}</span>
                                        </div>
                                        {/* Value — pills for lists, plain text for single values */}
                                        {isMultiTag ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#0f172a] bg-white border border-slate-200/80 px-2.5 py-[3px] whitespace-nowrap rounded-[2px] shadow-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#0f172a] leading-[1.3] break-words">
                                                {tags[0]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </FadeInUp>
                )}

                {/* Related Equipment (Mock layout from reference) */}
                <section className="mt-40 pb-32">
                    <div className="flex justify-between items-center mb-12 text-slate-900">
                        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none" style={{ letterSpacing: '-0.06em' }}>Related Equipment</h3>
                        <div className="flex gap-2">
                            <button className="size-8 border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors bg-white text-slate-400">
                                <span className="material-symbols-outlined text-[16px]">west</span>
                            </button>
                            <button className="size-8 border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors bg-white text-slate-400">
                                <span className="material-symbols-outlined text-[16px]">east</span>
                            </button>
                        </div>
                    </div>

                    <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
                        {/* Mock Card 1 */}
                        <FadeInUp inStaggerGroup className="group cursor-pointer flex flex-col h-full bg-white border border-slate-100 p-6 hover:shadow-xl transition-all duration-500">
                            <div className="aspect-square bg-slate-50 border border-slate-200 p-6 flex items-center justify-center mb-6 transition-all group-hover:border-[#0f3d3e] grow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaSggoBdzh3I6xCmrSyAsPEElBPA3yFxb0rC5pfyyC0Ig1T8AiKsp1bi9ksOSQgQEuJyc0CpKm98ZKKktAr03DhdqJL5EFXqGoF14wA7F4-MOyRZPUrsy6KWo4GcjO8CbReYP79p8pcaEBkpYARrx5v-IYXBb4m0tBSJDNR_EuVxtLNrUgItgtKKDVu_BTNoJIywrPge85JQFYXqqfxbGby8Nz_1m3ETGOKuXwJC4SrjHD5ySB0fC61-aQDFYaoMYB85sj-9N0r7k" alt="Surface Primer" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-md" />
                            </div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">Preparation</p>
                            <h4 className="text-[11px] font-black uppercase tracking-tight group-hover:text-[#0f3d3e] transition-colors leading-tight">Surface Primer X-1</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-1.5">$32.00</p>
                        </FadeInUp>

                        {/* Mock Card 2 */}
                        <FadeInUp inStaggerGroup className="group cursor-pointer flex flex-col h-full bg-white border border-slate-100 p-6 hover:shadow-xl transition-all duration-500">
                            <div className="aspect-square bg-slate-50 border border-slate-200 p-6 flex items-center justify-center mb-6 transition-all group-hover:border-[#0f3d3e] grow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBevcDKs8gNKgptC9Rt114vvQDebW_QtgeF2Hfb9kklk14TKOJKy56b_eRS8iP_PteFt0VlHnUnQ7k_gUElxefQZcB-Uz6raZBbLNLrQ3Uf0dWw_AJX3WMAroELMNnvzSd5feVO63moRPRsZ6tcuiu3kO2scn_wxKAYt7o0l32fGTpXjCMf6y5lpCacuyEcrmJGVFIVNkQZXwroSKjVpOoXNr5bgWbGjL23AMTo_NlgZK9Gsy2ZmtM0CbRXURbQy3O6C3oEh_hFC9g" alt="Detailing Brush Set" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-md" />
                            </div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">Tools</p>
                            <h4 className="text-[11px] font-black uppercase tracking-tight group-hover:text-[#0f3d3e] transition-colors leading-tight">Detailing Brush Set</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-1.5">$18.50</p>
                        </FadeInUp>

                        {/* Mock Card 3 */}
                        <FadeInUp inStaggerGroup className="group cursor-pointer flex flex-col h-full bg-white border border-slate-100 p-6 hover:shadow-xl transition-all duration-500">
                            <div className="aspect-square bg-slate-50 border border-slate-200 p-6 flex items-center justify-center mb-6 transition-all group-hover:border-[#0f3d3e] grow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdPTUCE6mrWY1OkDkzZn1jrleWWEmMFl3V40OaYuA4zC1C4tx4gsnrxJXf9O0Yghpg5JEQEBcjzelLxRSZBnqvUWOKmxDuLZxYdq8NrlSTwdU2oN4xE303HGyGlgsRieTmdOqx1oRh3xGyLFqtjdcF780BDAt9E6-N533iy8uSjEu85w7vIndNtwpZv23jd2ZbLRDfyLdcNmJeQIHKmVgclmlvAX506mySIA4nGsdNSOUO3lyd4NHBjz-dyrIgC_lZOC_QhxaFvbE" alt="Pro-Clean Solvent" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-md" />
                            </div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">Cleaning</p>
                            <h4 className="text-[11px] font-black uppercase tracking-tight group-hover:text-[#0f3d3e] transition-colors leading-tight">Pro-Clean Solvent</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-1.5">$24.00</p>
                        </FadeInUp>

                        {/* Mock Card 4 */}
                        <FadeInUp inStaggerGroup className="group cursor-pointer flex flex-col h-full bg-white border border-slate-100 p-6 hover:shadow-xl transition-all duration-500">
                            <div className="aspect-square bg-slate-50 border border-slate-200 p-6 flex items-center justify-center mb-6 transition-all group-hover:border-[#0f3d3e] grow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYQd4crcsc7f4PTez8XIl2d-clv_533S_9V7fp7jOEdmD_GoY37bXg6II93UoU2vsd_bIIxvp_-7xxXRdP2igamUj_2iHBvHI71GS59YOHMz3hc9C4TnGXuridf64R8Fu2CPHHXnZ0sdnxNbYWVacq9UT-FI54YIPxoAuFdIFYVTaZQpa1shhfDhLHTvl-y1SqtmYO2cmSpCBiKZWSFJqZxZUAqEVJEqwxtr2xZf89STJuoNkE8NTQqYIjQW1ZxS0qarlydDxwXTo" alt="Nitrile Safety Pack" className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-md" />
                            </div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">Safety</p>
                            <h4 className="text-[11px] font-black uppercase tracking-tight group-hover:text-[#0f3d3e] transition-colors leading-tight">Nitrile Safety Pack</h4>
                            <p className="text-[11px] font-medium text-slate-500 mt-1.5">$15.00</p>
                        </FadeInUp>
                    </StaggerContainer>
                </section>
            </div>
        </div>
    );
}
