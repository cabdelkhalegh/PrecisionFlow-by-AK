/**
 * Health check endpoint for PrecisionFlow
 * Returns 200 OK if the application is running
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'precisionflow-web',
  });
}
