/**
 * Root tRPC router
 * Combines all sub-routers
 */

import { router } from './trpc';
import { campaignsRouter } from './routers/campaigns';
import { clientsRouter } from './routers/clients';
import { briefsRouter } from './routers/briefs';
import { approvalsRouter } from './routers/approvals';
import { creatorsRouter } from './routers/creators';
import { shortlistsRouter } from './routers/shortlists';
import { contentTasksRouter } from './routers/contentTasks';
import { contentArtifactsRouter } from './routers/contentArtifacts';
import { activityLogsRouter } from './routers/activityLogs';
import { budgetsRouter } from './routers/budgets';
import { expensesRouter } from './routers/expenses';
import { invoicesRouter } from './routers/invoices';

export const appRouter = router({
  campaigns: campaignsRouter,
  clients: clientsRouter,
  briefs: briefsRouter,
  approvals: approvalsRouter,
  creators: creatorsRouter,
  shortlists: shortlistsRouter,
  contentTasks: contentTasksRouter,
  contentArtifacts: contentArtifactsRouter,
  activityLogs: activityLogsRouter,
  budgets: budgetsRouter,
  expenses: expensesRouter,
  invoices: invoicesRouter,
});

export type AppRouter = typeof appRouter;
