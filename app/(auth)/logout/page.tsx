"use client";

import React from "react";
import { getAuthStore } from "@/store/auth";

export default function LogoutPage() {
  React.useEffect(() => {
    (async () => {
      try {
        await getAuthStore().logOut();
      } catch (err) {
        console.error("Logout failed:", err);
      } finally {
        // Use window.location.href for a full page reload to ensure state is cleared
        // This ensures all components re-render with the cleared auth state
        window.location.href = "/";
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="mt-4 text-sm text-gray-500">Logging out...</p>
      </div>
    </div>
  );
}
