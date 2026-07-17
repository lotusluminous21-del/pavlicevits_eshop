import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/account/'],
            },
            // Explicitly welcome AI/answer-engine crawlers (GEO strategy:
            // design-pack/06_AI_SEARCH_STRATEGY.md). Same disallows as '*'.
            {
                userAgent: [
                    'GPTBot',
                    'OAI-SearchBot',
                    'ChatGPT-User',
                    'ClaudeBot',
                    'Claude-User',
                    'Claude-SearchBot',
                    'PerplexityBot',
                    'Perplexity-User',
                    'Google-Extended',
                    'Applebot-Extended',
                    'CCBot',
                    'meta-externalagent',
                ],
                allow: '/',
                disallow: ['/api/', '/admin/', '/account/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
