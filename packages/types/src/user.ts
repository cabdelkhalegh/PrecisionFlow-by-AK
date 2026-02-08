import { z } from 'zod';
import { UserRole } from './index';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  avatar_url: z.string().url().optional(),
  role: UserRole,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof User>;
