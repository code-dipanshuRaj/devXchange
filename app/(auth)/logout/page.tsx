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
        window.location.href = "/";
      }
    })();

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
