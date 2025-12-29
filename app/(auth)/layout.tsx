"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Layout({children} : {children : React.ReactNode}) {
  const {hydrated, session, user, verifySession, isVerifying} = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  
  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    const checkAuth = async () => {
      // If we have session/user, verify it's still valid
      if (session || user) {
        const isValid = await verifySession();
        if (isValid) {
          router.push("/");
          return;
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [hydrated, session, user, verifySession, router]);

  // Show loading while checking
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

  // If user is authenticated, don't render auth pages
  if (session || user) {
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