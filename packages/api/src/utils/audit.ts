/**
 * Audit Trail Utilities
 * Helper functions for logging state changes per CONTRIBUTING.md requirements
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@precisionflow/database';

/**
 * Log an audit trail entry
 * Per CONTRIBUTING.md §176-178, all state changes must be logged
 */
export async function logAudit(params: {
  supabase: SupabaseClient<Database>;
  tableName: string;
  recordId: string;
  action: 'created' | 'updated' | 'deleted';
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  userId: string;
}) {
  const { supabase, tableName, recordId, action, oldData, newData, userId } = params;

  try {
    await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action: action === 'created' ? 'INSERT' : action === 'updated' ? 'UPDATE' : 'DELETE',
      old_data: oldData as any,
      new_data: newData as any,
      user_id: userId,
    });
  } catch (error) {
    // Log error but don't fail the operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create audit log for a creation operation
 */
export async function logCreation(params: {
  supabase: SupabaseClient<Database>;
  tableName: string;
  recordId: string;
  data: Record<string, unknown>;
  userId: string;
}) {
  return logAudit({
    ...params,
    action: 'created',
    oldData: null,
    newData: params.data,
  });
}

/**
 * Create audit log for an update operation
 */
export async function logUpdate(params: {
  supabase: SupabaseClient<Database>;
  tableName: string;
  recordId: string;
  oldData: Record<string, unknown>;
  newData: Record<string, unknown>;
  userId: string;
}) {
  return logAudit({
    ...params,
    action: 'updated',
  });
}

/**
 * Create audit log for a deletion operation
 */
export async function logDeletion(params: {
  supabase: SupabaseClient<Database>;
  tableName: string;
  recordId: string;
  data: Record<string, unknown>;
  userId: string;
}) {
  return logAudit({
    ...params,
    action: 'deleted',
    oldData: params.data,
    newData: null,
  });
}
