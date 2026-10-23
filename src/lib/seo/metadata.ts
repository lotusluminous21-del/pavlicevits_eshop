import { Metadata } from 'next';
import { env } from '@/lib/env';

/**
 * Validates and formats a complete URL
 */
function getAbsoluteUrl(path: string): string {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
}

interface MetadataProps {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
}

/**
 * Constructs a Next.js Metadata object with sensible defaults
 */
export function constructMetadata({
    title = 'PAVLICEVITS COLORS',
    description = 'PAVLICEVITS COLORS — Εξειδικευμένα χρώματα στην Καλαμαριά, Θεσσαλονίκη από το 1990. Αρχιτεκτονικά, φανοποιία, ναυτιλιακά, ειδικές εφαρμογές. Επίσημος συνεργάτης Pellachrom.',
    image = '/brand-site/og-image.jpg',
    noIndex = false,
}: MetadataProps = {}): Metadata {
    return {
        title: {
            default: title,
            template: `%s | ${env.NEXT_PUBLIC_SITE_NAME || 'PAVLICEVITS COLORS'}`,
        },
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image, // If absolute, fine. If relative, Next.js handles it or we can enforce absolute.
                },
            ],
            type: 'website',
            siteName: env.NEXT_PUBLIC_SITE_NAME || 'PAVLICEVITS COLORS',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
        metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    };
}
