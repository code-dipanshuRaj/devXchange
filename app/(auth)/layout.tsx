"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Layout({children} : {children : React.ReactNode}) {
  const {session, user, hydrated, isVerifying, verifySession} = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = React.useState(true);
  const hasCheckedRef = React.useRef(false);
  
  // Don't redirect from logout page - allow authenticated users to logout
  const isLogoutPage = pathname === '/logout';
  
  React.useEffect(() => {
    const checkAuth = async () => {
      // Wait for store to hydrate
      if (!hydrated || hasCheckedRef.current) {
        return;
      }

      // Skip redirect check for logout page
      if (isLogoutPage) {
        setIsChecking(false);
        hasCheckedRef.current = true;
        return;
      }

      setIsChecking(true);
      
      // If we have session/user in store, verify they're still valid
      if (session || user) {
        const isValid = await verifySession();
        
        // If session is valid, redirect to home (but not from logout page)
        if (isValid && !isLogoutPage) {
          router.push("/");
          setIsChecking(false);
          hasCheckedRef.current = true;
          return;
        }
      }

      setIsChecking(false);
      hasCheckedRef.current = true;
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isLogoutPage]); // Only depend on hydrated and isLogoutPage to prevent infinite loops

  // Show loading state only while checking initially
  if (!hydrated || (isChecking && !hasCheckedRef.current)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // After initial check, if we have valid session and user, redirect (but not from logout page)
  if (hasCheckedRef.current && session && user && !isLogoutPage) {
    return null;
  }
  
  // For logout page, don't wrap in WavyBackground
  if (isLogoutPage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <WavyBackground className="relative flex min-h-screen flex-col items-center justify-center py-12">
      <div className="relative">{children}</div>
      </WavyBackground>
    </>
  )
}