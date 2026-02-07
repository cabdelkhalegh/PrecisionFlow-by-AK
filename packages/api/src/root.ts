/**
 * Root tRPC router
 * Combines all sub-routers
 */

import { router } from './trpc';
import { campaignsRouter } from './routers/campaigns';

export const appRouter = router({
  campaigns: campaignsRouter,
});

export type AppRouter = typeof appRouter;
