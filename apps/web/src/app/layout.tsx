import type { Metadata } from 'next';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc-provider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'TiKiT OS - Campaign Execution & Intelligence',
  description: 'Enterprise-grade operating system for influencer marketing agencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
