/**
 * tRPC API route handler for Next.js App Router
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@precisionflow/api';
import type { Context } from '@precisionflow/api';
import { supabase } from '@precisionflow/database';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Extract JWT from Authorization header sent by the browser client
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      let user = null;

      if (token) {
        // Verify the JWT and get the user
        const { data } = await supabase.auth.getUser(token);
        user = data.user;
      }

      if (!user) {
        // Fall back to cookie-based session (SSR / server components)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }

      return {
        user,
        supabase,
      };
    },
  });

export { handler as GET, handler as POST };
