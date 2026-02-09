/**
 * Root layout - Expo Router entry point
 */

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { getAuthToken } from '../lib/auth';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/trpc',
          async headers() {
            const token = await getAuthToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="campaign/[id]" options={{ headerShown: true, title: 'Campaign' }} />
          <Stack.Screen name="client/[id]" options={{ headerShown: true, title: 'Client' }} />
          <Stack.Screen name="creator/[id]" options={{ headerShown: true, title: 'Creator' }} />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
