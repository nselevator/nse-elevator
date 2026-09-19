import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { connectToDatabase } from '../../../lib/db';
import { AnalyticsEvent } from '../../../server/src/models/AnalyticsEvent';

const createEventSchema = z.object({
  eventType: z.string().min(1).max(100),
  pageUrl: z.string().min(1).max(500),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  gclid: z.string().max(250).optional(),
  fbclid: z.string().max(250).optional(),
  anonymousId: z.string().max(100).optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  contactMethod: z.enum(['phone', 'whatsapp']).optional(),
  stepNumber: z.number().int().min(1).max(10).optional(),
  timeSpentMs: z.number().nonnegative().optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Lead ID').optional(),
  metadata: z.record(z.any()).optional(),
  approxLocation: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      source: z.literal('ip').optional(),
    })
    .optional(),
  preciseLocation: z
    .object({
      lat: z.number(),
      lng: z.number(),
      source: z.literal('gps'),
      consentedAt: z.coerce.date().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = createEventSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid analytics event payload',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const {
      eventType,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      gclid,
      fbclid,
      anonymousId,
      deviceType,
      contactMethod,
      stepNumber,
      timeSpentMs,
      scrollDepth,
      leadId,
      metadata,
      approxLocation,
      preciseLocation,
    } = parseResult.data;

    const forwarded = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwarded.split(',')[0].trim() || '127.0.0.1';
    const ipHash = clientIp ? crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16) : undefined;
    const userAgent = req.headers.get('user-agent') || '';

    let detectedDevice: 'desktop' | 'mobile' | 'tablet' = deviceType || 'desktop';
    if (!deviceType && userAgent) {
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        detectedDevice = 'tablet';
      } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent)) {
        detectedDevice = 'mobile';
      }
    }

    await connectToDatabase();

    const event = await (AnalyticsEvent as any).create({
      eventType,
      pageUrl,
      utmSource: utmSource || 'direct',
      utmMedium: utmMedium || 'none',
      utmCampaign: utmCampaign || 'none',
      gclid,
      fbclid,
      anonymousId,
      deviceType: detectedDevice,
      contactMethod,
      stepNumber,
      timeSpentMs,
      scrollDepth,
      leadId: leadId ? leadId : undefined,
      metadata: metadata || {},
      approxLocation,
      preciseLocation,
      ipHash,
      userAgent: userAgent.substring(0, 250),
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: event._id,
          eventType: event.eventType,
          recorded: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Telemetry Event Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: (error as Error).message || 'Failed to record event',
        },
      },
      { status: 500 }
    );
  }
}
