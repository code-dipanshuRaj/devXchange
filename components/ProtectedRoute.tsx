"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children
 * If user is not authenticated, redirects to login page
 */
export default function ProtectedRoute({ 
  children, 
  redirectTo = "/login",
  requireAuth = true 
}: ProtectedRouteProps) {
  const { hydrated, user, session, verifySession, isVerifying } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  const [hasChecked, setHasChecked] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated || hasChecked) {
      return;
    }

    const checkAuth = async () => {
      if (!requireAuth) {
        setIsChecking(false);
        setHasChecked(true);
        return;
      }

      // Always verify session to ensure it's still valid
      const isValid = await verifySession();
      
      if (!isValid) {
        // No valid session, redirect to login
        router.push(redirectTo);
        setIsChecking(false);
        setHasChecked(true);
        return;
      }

      setIsChecking(false);
      setHasChecked(true);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]); // Only depend on hydrated to prevent infinite loops

  // Show loading while checking authentication
  if (!hydrated || (isChecking && !hasChecked) || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If requireAuth is true and we don't have a user after verification, don't render (redirect will happen)
  if (requireAuth && hasChecked && !user) {
    return null;
  }

  return <>{children}</>;
}
