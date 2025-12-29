"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Layout({children} : {children : React.ReactNode}) {
  const {session, user, hydrated, isVerifying, verifySession} = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  
  React.useEffect(() => {
    const checkAuth = async () => {
      // Wait for store to hydrate
      if (!hydrated) {
        return;
      }

      // If we have a session, verify it's still valid
      if (session) {
        setIsChecking(true);
        const isValid = await verifySession();
        if (isValid && user) {
          router.push("/");
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [hydrated, session, user, verifySession, router]);

  // Show loading state while checking
  if (!hydrated || isChecking || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't show auth pages
  if (session && user) {
    return null;
  }
  
  return (
    <>
      <WavyBackground className="relative flex min-h-screen flex-col items-center justify-center py-12">
      <div className="relative">{children}</div>
      </WavyBackground>
    </>
  )
}