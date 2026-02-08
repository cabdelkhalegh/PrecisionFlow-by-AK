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

  // Verify Supabase connectivity
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (error) {
      health.database = { status: 'error', message: error.message };
    } else {
      health.database = { status: 'connected', clientCount: count ?? 0 };
    }
  } catch (e) {
    health.database = {
      status: 'unavailable',
      message: e instanceof Error ? e.message : 'Unknown error',
    };
  }

  return NextResponse.json(health);
}
