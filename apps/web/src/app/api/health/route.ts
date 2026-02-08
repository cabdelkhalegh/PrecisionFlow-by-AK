/**
 * Health check endpoint for PrecisionFlow
 * Returns 200 OK if the application is running
 * Optionally verifies Supabase database connectivity
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '@tikit/database';

export async function GET() {
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'precisionflow-web',
  };

  // Verify Supabase connectivity (only reports connected/unavailable, no data counts)
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .limit(0);

    if (error) {
      health.database = { status: 'error', message: error.message };
    } else {
      health.database = { status: 'connected' };
    }
  } catch (e) {
    health.database = {
      status: 'unavailable',
      message: e instanceof Error ? e.message : 'Unknown error',
    };
  }

  return NextResponse.json(health);
}
