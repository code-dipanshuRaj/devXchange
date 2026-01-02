import { tableDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import React from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { answersCollection, db, questionsCollection } from "@/models/name";
import { Query } from "node-appwrite";

const Page = async ({ params }: { params: { userId: string; userSlug: string } }) => {
    // params is a plain object on the server
    const { userId } = await params;

    try {
        const [user, questions, answers] = await Promise.all([
            users.get<UserPrefs>({userId}),
            tableDB.listRows({
                databaseId: db,
                tableId: questionsCollection,
                queries: [Query.equal("authorId", userId), Query.limit(1)],
            }),
            tableDB.listRows({
                databaseId: db,
                tableId: answersCollection,
                queries: [Query.equal("authorId", userId), Query.limit(1)],
            }),
        ]);

        return (
            <div className={"flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"}>
                <MagicCard className="relative flex w-full cursor-pointer flex-col overflow-hidden p-6 shadow-2xl">
                    <div className="absolute inset-x-4 top-4 z-20">
                        <h2 className="text-xl font-medium">Reputation</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center pt-8">
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={user.prefs.reputation} />
                        </p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
                <MagicCard className="relative flex w-full cursor-pointer flex-col overflow-hidden p-6 shadow-2xl">
                    <div className="absolute inset-x-4 top-4 z-20">
                        <h2 className="text-xl font-medium">Questions asked</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center pt-8">
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={questions.total} />
                        </p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
                <MagicCard className="relative flex w-full cursor-pointer flex-col overflow-hidden p-6 shadow-2xl">
                    <div className="absolute inset-x-4 top-4 z-20">
                        <h2 className="text-xl font-medium">Answers given</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-center pt-8">
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                            <NumberTicker value={answers.total} />
                        </p>
                    </div>
                    <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                </MagicCard>
            </div>
        );
    } catch (err: any) {
        // Appwrite returns an exception when the current client is not authorized. This most
        // commonly happens if this code runs on the client or if the server key is missing.
        console.error("Failed to load user page data:", err?.message || err);

        return (
            <div className="container mx-auto p-6">
                <div className="rounded-md border border-red-500/30 bg-red-900/40 p-4 text-red-200">
                    <strong>Unable to load user data.</strong>
                    <p className="mt-2 text-sm text-red-200/80">{err?.message || "Unauthorized"}</p>
                </div>
            </div>
        );
    }
};

export default Page;
