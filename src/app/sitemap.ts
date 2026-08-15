import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// The e-shop (search/products/cart) is intentionally OUT of the sitemap and
// served with X-Robots-Tag noindex (see next.config.ts) until the client
// green-lights the shop and it gets rebranded. To restore the product and
// collection entries, see this file's history before commit "de-index eshop".
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.2,
        },
    ];
}
