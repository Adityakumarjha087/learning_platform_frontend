'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'learner')[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 