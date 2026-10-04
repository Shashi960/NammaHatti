import { NextRequest, NextResponse } from 'next/server';
import { mapService } from '@/services/MapService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === 'reverse' && typeof body.lat === 'number' && typeof body.lng === 'number') {
      const location = await mapService.reverseGeocode(body.lat, body.lng);
      return NextResponse.json({ success: true, location });
    }

    if (body.address && typeof body.address === 'string') {
      const locations = await mapService.geocode(body.address);
      return NextResponse.json({ success: true, locations });
    }

    return NextResponse.json(
      { error: 'Provide either { address } or { type: "reverse", lat, lng }' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Geocode API error:', err);
    return NextResponse.json({ error: 'Failed to process location request' }, { status: 500 });
  }
}
