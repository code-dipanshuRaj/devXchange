"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getAuthStore } from "@/store/auth";

export default function LogoutPage() {
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      try {
        await getAuthStore().logOut();
      } catch (err) {
        console.error("Logout failed:", err);
      } finally {
        // Redirect to home after logout
        router.push("/");
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
