import { NextRequest, NextResponse } from 'next/server';
import { mapService } from '@/services/MapService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination } = body;

    if (!origin || !destination || typeof origin.lat !== 'number' || typeof destination.lat !== 'number') {
      return NextResponse.json({ error: 'Origin and destination lat/lng required' }, { status: 400 });
    }

    const result = await mapService.calculateDistance(origin, destination);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Distance calculation error:', err);
    return NextResponse.json({ error: 'Failed to calculate distance' }, { status: 500 });
  }
}
