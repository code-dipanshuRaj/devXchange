import { tableDB, users } from "@/models/server/config";
import { answersCollection, db, votesCollection, questionsCollection } from "@/models/name";
import { Query } from "node-appwrite";
import React from "react";
import Link from "next/link";
import {ShimmerButton} from "@/components/ui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/store/auth";
import Pagination from "@/components/Pagination";
import Search from "./Search";
import { Models } from "appwrite";

type QuestionAttributes = Models.Row  & {
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    attachmentId?: string;
}

type QuestionWithExtraData = QuestionAttributes & {
    author: {
        $id: string;
        name: string;
        reputation: number;
    };
    totalVotes: number;
    totalAnswers: number;
};

const Page = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tag?: string; search?: string }>;
}) => {
    const {page, tag, search} = await searchParams;
    const searchPage = page || "1";

    const queries = [
        Query.orderDesc("$createdAt"),
        Query.offset((Number(searchPage) - 1) * 25),
        Query.limit(25),
    ];

    if (tag) queries.push(Query.equal("tags", tag));
    if (search)
        queries.push(
            Query.or([
                Query.search("title", search),
                Query.search("content", search),
            ])
        );

    const questions = await tableDB.listRows<QuestionAttributes>({databaseId : db, tableId :questionsCollection, queries});
    console.log("Questions", questions)

    const enrichedRows = await Promise.all(
        questions.rows.map(async ques => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>({userId : ques.authorId}),
                tableDB.listRows({databaseId : db, tableId :answersCollection, queries: [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1), // for optimization
                ]}),
                tableDB.listRows({databaseId : db, tableId :votesCollection, queries: [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1), // for optimization
                ]}),
            ]);

            return {
                ...ques,
                totalAnswers: answers.total,
                totalVotes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs.reputation,
                    name: author.name,
                },
            } as QuestionWithExtraData;
        })
    );

    return (
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Questions</h1>
                <Link href="/questions/ask">
                    <ShimmerButton className="shadow-2xl">
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                            Ask a question
                        </span>
                    </ShimmerButton>
                </Link>
            </div>
            <div className="mb-4">
                <Search />
            </div>
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {enrichedRows.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;
