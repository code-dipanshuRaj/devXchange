"use client";

import React from "react";
import { useAuthStore } from "@/store/auth";

/**
 * SessionProvider component that verifies session on mount and handles session expiration
 * This should be used at the root level to ensure session is verified before any components render
 */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, verifySession, session, user, isVerifying } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    // Only verify session after store is hydrated
    if (!hydrated) {
      setIsInitializing(false);
      return;
    }

    // If we have session/user in store, verify it's still valid
    if (session || user) {
      verifySession()
        .then(() => {
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error("Session verification error:", error);
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, [hydrated]); // to avoid infinite loops

  // loading screen if we have a session 
  if (!hydrated || isInitializing || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

