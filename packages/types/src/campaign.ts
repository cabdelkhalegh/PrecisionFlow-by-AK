import { z } from 'zod';
import { CampaignStatus, RiskLevel } from './index';

export const Campaign = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  status: CampaignStatus,
  risk_level: RiskLevel,
  client_id: z.string().uuid(),
  campaign_manager_id: z.string().uuid(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Campaign = z.infer<typeof Campaign>;
