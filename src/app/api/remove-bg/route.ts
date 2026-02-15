import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for the rembg Cloud Run service.
 * Avoids exposing the Cloud Run URL to the client.
 */
export async function POST(req: NextRequest) {
    try {
        const { image_url, sku } = await req.json();

        if (!image_url || !sku) {
            return NextResponse.json(
                { error: 'image_url and sku are required' },
                { status: 400 }
            );
        }

        const serviceUrl = process.env.REMBG_SERVICE_URL;
        if (!serviceUrl) {
            return NextResponse.json(
                { error: 'REMBG_SERVICE_URL not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(`${serviceUrl}/remove-bg`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url, sku }),
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                return NextResponse.json(errorData, { status: response.status });
            } else {
                const text = await response.text();
                return NextResponse.json(
                    { error: `Downstream service error (${response.status}): ${text.slice(0, 100)}` },
                    { status: response.status }
                );
            }
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error('Remove BG proxy error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
