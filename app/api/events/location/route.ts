import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../../lib/db';
import { AnalyticsEvent } from '../../../../server/src/models/AnalyticsEvent';
import { lookupIpLocation } from '../../../../server/src/services/geoService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { anonymousId, pageUrl } = body || {};

    const forwarded = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwarded.split(',')[0].trim() || '127.0.0.1';
    const ipHash = clientIp ? crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16) : undefined;
    const userAgent = req.headers.get('user-agent') || '';

    const approxLocation = await lookupIpLocation(clientIp);

    await connectToDatabase();

    const event = await (AnalyticsEvent as any).create({
      eventType: 'session_location',
      pageUrl: pageUrl || '/',
      anonymousId,
      approxLocation,
      ipHash,
      userAgent: userAgent.substring(0, 250),
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: event._id,
          approxLocation,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Session Location Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: (error as Error).message || 'Failed to determine location',
        },
      },
      { status: 500 }
    );
  }
}
