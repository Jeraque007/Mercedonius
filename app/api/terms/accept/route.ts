import { NextRequest, NextResponse } from 'next/server';

/**
 * Current terms version the acceptance gate is keyed to.
 * Kept internal; version string used inline where needed.
 */
const TERMS_VERSION = '1.0';

/**
 * IP addresses that have accepted the terms, keyed by IP.
 *
 * This is the "webservice" the acceptance popup consults: GET returns the
 * requester's IP and whether that IP has recorded acceptance; POST records
 * acceptance for the requester's IP.
 *
 * Kept in memory (per server instance) because no persistence layer is wired
 * into this build yet. The durable client-side record lives in localStorage
 * (`mercedonius:terms`); the endpoint exists so acceptance can be tracked per
 * IP across devices, as required for the "new IP ⇒ re-accept" behaviour.
 */
const acceptedIps = new Map<string, { version: string; at: string }>();

/** Best-effort client IP from standard proxy headers. */
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const record = acceptedIps.get(ip);
  return NextResponse.json({
    ip,
    accepted: Boolean(record && record.version === TERMS_VERSION),
    version: TERMS_VERSION,
  });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  acceptedIps.set(ip, { version: TERMS_VERSION, at: new Date().toISOString() });
  return NextResponse.json({ ok: true, ip, version: TERMS_VERSION });
}
