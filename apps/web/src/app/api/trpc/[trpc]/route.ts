/**
 * tRPC API route handler for Next.js App Router
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@tikit/api';
import type { Context } from '@tikit/api';
import { supabase } from '@tikit/database';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Get user from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return {
        user: session?.user || null,
        supabase,
      };
    },
  });

export { handler as GET, handler as POST };
