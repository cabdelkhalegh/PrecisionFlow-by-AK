/**
 * Root tRPC router
 * Combines all sub-routers
 */

import { router } from './trpc';
import { campaignsRouter } from './routers/campaigns';
import { clientsRouter } from './routers/clients';
import { briefsRouter } from './routers/briefs';
import { approvalsRouter } from './routers/approvals';

export const appRouter = router({
  campaigns: campaignsRouter,
  clients: clientsRouter,
  briefs: briefsRouter,
  approvals: approvalsRouter,
});

export type AppRouter = typeof appRouter;
