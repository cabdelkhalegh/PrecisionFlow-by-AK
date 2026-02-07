/**
 * Root tRPC router
 * Combines all sub-routers
 */

import { router } from './trpc';
import { campaignsRouter } from './routers/campaigns';
import { clientsRouter } from './routers/clients';
import { briefsRouter } from './routers/briefs';

export const appRouter = router({
  campaigns: campaignsRouter,
  clients: clientsRouter,
  briefs: briefsRouter,
});

export type AppRouter = typeof appRouter;
