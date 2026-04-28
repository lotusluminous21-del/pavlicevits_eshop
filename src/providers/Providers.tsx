'use client';

import { ReactNode, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SmoothScrollProvider } from './SmoothScrollProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Devtools are dynamic-imported only in development. In production builds
// the import path is dead-code-eliminated and the devtools chunk is never
// emitted, removing ~30KB of overlay UI from the marketing-site bundle.
const ReactQueryDevtools =
    process.env.NODE_ENV === 'development'
        ? lazy(() =>
              import('@tanstack/react-query-devtools').then((mod) => ({
                  default: mod.ReactQueryDevtools,
              }))
          )
        : null;

/**
 * App-wide client-only providers that every route benefits from:
 *   - QueryClient for server-state caching
 *   - Lenis smooth-scroll
 *
 * NOTE: Firebase + Auth used to live here, which forced every visitor on
 * the marketing homepage to download `firebase/{app,auth,firestore,
 * functions}` + `reactfire` (≈250KB gzip) and pay an auth-state network
 * call on cold load. They've been pushed down into the route groups that
 * actually need authenticated data — `(legacy)` and `admin`. The (brand)
 * marketing route group skips them entirely.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
            {ReactQueryDevtools ? (
                <Suspense fallback={null}>
                    <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
            ) : null}
        </QueryClientProvider>
    );
}
