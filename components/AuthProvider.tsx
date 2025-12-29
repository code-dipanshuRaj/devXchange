"use client";

import React from "react";
import { useAuthStore } from "@/store/auth";

/**
 * AuthProvider component that verifies session on app initialization
 * This ensures that expired sessions are cleared when the app loads
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, session, user, verifySession } = useAuthStore();
  const [hasVerified, setHasVerified] = React.useState(false);

  React.useEffect(() => {
    const initializeAuth = async () => {
      // Wait for store to hydrate from localStorage
      if (!hydrated) {
        return;
      }

      // Only verify if we have a session or user in store
      // This prevents unnecessary API calls on first visit
      if (session || user) {
        await verifySession();
      }

      setHasVerified(true);
    };

    initializeAuth();
  }, [hydrated, session, user, verifySession]);

  // Don't block rendering, but verify in background
  return <>{children}</>;
}

