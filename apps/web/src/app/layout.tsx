import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc-provider';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth-provider';

export const metadata: Metadata = {
  title: '🦖 Ubuntu TiKiT OS (Dev) - Campaign Intelligence',
  description: 'Ubuntu TiKiT OS - Development Version (Version B)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TRPCProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
