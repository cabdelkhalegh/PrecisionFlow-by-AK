/**
 * User-related types
 */

export type UserRole = 'CM' | 'DIR' | 'FIN' | 'ADM' | 'CLIENT' | 'INF';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
