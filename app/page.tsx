'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomeContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const isAdmin = (searchParams?.get?.('admin') ?? '') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (user && isAdmin && user.isAdmin) {
    return <AdminDashboard />;
  }

  return user ? <Dashboard /> : <LandingPage />;
}

function HomeContentWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContentWithSuspense />
    </AuthProvider>
  );
}