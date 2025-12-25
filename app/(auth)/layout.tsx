"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { BackgroundBeams } from "@/components/ui/background-beams"
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Layout({children} : {children : React.ReactNode}) {
  const {session} = useAuthStore();
  const router = useRouter();
  
  React.useEffect(() => {
    if(session) router.push("/");
  }, [session, router])

  if(session) return null;
  
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center py-12">
      <WavyBackground />
      <div className="relative">{children}</div>
    </div>
  )
}