"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

const Page = () => {
    const { userId } = useParams();
    const { user, hydrated } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        if (hydrated && (!user || user.$id !== userId)) {
            router.push(`/users/${userId}`);
        }
    }, [hydrated, user, userId, router]);

    if (!hydrated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.$id !== userId) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
                <h1 className= "flex w-full justify-center bg-gray-900">Will do it later...</h1>
            </div>
        </ProtectedRoute>
    );
};

export default Page;
