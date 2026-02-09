/**
 * tRPC client configuration for Next.js App Router
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@precisionflow/api';

export const trpc = createTRPCReact<AppRouter>();
