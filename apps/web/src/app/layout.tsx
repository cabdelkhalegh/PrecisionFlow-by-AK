import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
