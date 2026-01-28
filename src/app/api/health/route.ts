import { NextResponse } from 'next/server';
import { getHealthCheckData } from '@/lib/config';

export async function GET() {
    const health = getHealthCheckData();

    return NextResponse.json(health, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}
