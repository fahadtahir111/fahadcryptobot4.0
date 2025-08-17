'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthProvider } from '@/contexts/AuthContext';

function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}