// src/components/custom-paint/custom-paint-helpers.ts
// Utility functions for custom paint products

import type { ColorSystem } from './color-system-data';

// The three custom paint product handles from our Shopify store
export const CUSTOM_PAINT_HANDLES = [
    'custom-spray-paint',
    'custom-bucket-paint',
    'custom-touchup-kit',
] as const;

export type CustomPaintHandle = typeof CUSTOM_PAINT_HANDLES[number];

/**
 * The structured color specification collected from the customer.
 */
export interface CustomColorSpec {
    colorSystem: ColorSystem;
    colorCode: string;       // The code or description text
    carMake?: string;        // For OEM system
    carYear?: string;        // For OEM system
    customerNotes?: string;  // Optional special instructions
    precision: 'exact' | 'approximate';
}

/**
 * Check if a Shopify product handle is one of our custom paint products.
 */
export function isCustomPaintProduct(handle: string): boolean {
    return CUSTOM_PAINT_HANDLES.includes(handle as CustomPaintHandle);
}

/**
 * Convert a CustomColorSpec into Shopify cart line item attributes.
 * Keys are prefixed with _ so they appear in checkout and order confirmation.
 */
export function colorSpecToAttributes(spec: CustomColorSpec): { key: string; value: string }[] {
    const attrs: { key: string; value: string }[] = [
        { key: '_color_system', value: spec.colorSystem },
        { key: '_color_code', value: spec.colorCode },
        { key: '_color_precision', value: spec.precision },
    ];

    if (spec.carMake) {
        attrs.push({ key: '_car_make', value: spec.carMake });
    }
    if (spec.carYear) {
        attrs.push({ key: '_car_year', value: spec.carYear });
    }
    if (spec.customerNotes) {
        attrs.push({ key: '_customer_notes', value: spec.customerNotes });
    }

    return attrs;
}

/**
 * Reverse: extract a CustomColorSpec from Shopify cart line attributes.
 * Used in the cart UI to display color info badges.
 */
export function attributesToColorSpec(attributes: { key: string; value: string }[]): CustomColorSpec | null {
    const attrMap = new Map(attributes.map(a => [a.key, a.value]));

    const colorSystem = attrMap.get('_color_system');
    const colorCode = attrMap.get('_color_code');

    if (!colorSystem || !colorCode) return null;

    return {
        colorSystem: colorSystem as ColorSystem,
        colorCode,
        carMake: attrMap.get('_car_make'),
        carYear: attrMap.get('_car_year'),
        customerNotes: attrMap.get('_customer_notes'),
        precision: (attrMap.get('_color_precision') as 'exact' | 'approximate') || 'exact',
    };
}

/**
 * Format a CustomColorSpec into a human-readable label for display.
 * Used in cart badges and solution plan.
 */
export function formatColorLabel(spec: CustomColorSpec): string {
    switch (spec.colorSystem) {
        case 'RAL':
            return `RAL ${spec.colorCode.replace(/^RAL\s*/i, '')}`;
        case 'NCS':
            return `NCS ${spec.colorCode.replace(/^NCS\s*/i, '')}`;
        case 'Pantone':
            return `Pantone ${spec.colorCode.replace(/^Pantone\s*/i, '')}`;
        case 'OEM':
            return `${spec.carMake || 'OEM'} — ${spec.colorCode}`;
        case 'description':
            return spec.colorCode.length > 40
                ? spec.colorCode.substring(0, 37) + '...'
                : spec.colorCode;
        default:
            return spec.colorCode;
    }
}

/**
 * Determine if a color spec qualifies as "exact" or "approximate" precision.
 */
export function computePrecision(colorSystem: ColorSystem, colorCode: string): 'exact' | 'approximate' {
    if (colorSystem === 'description') return 'approximate';
    if (!colorCode || colorCode.trim().length < 2) return 'approximate';
    return 'exact';
}
