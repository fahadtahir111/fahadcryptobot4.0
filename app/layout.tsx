import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { SupportChat } from '@/components/SupportChat';

export const metadata: Metadata = {
  title: 'SignalX - AI Trading Platform',
  description: 'Professional AI-powered cryptocurrency trading analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-black text-white">
        <AuthProvider>
          {children}
          <SupportChat />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}