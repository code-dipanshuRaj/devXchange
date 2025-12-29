import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import { answersCollection, db, questionsCollection, votesCollection } from "@/models/name";
import { tableDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import { Models, Query } from "node-appwrite";
import { use } from "react";
import React from "react";
    
type QuestionAttributes = Models.Row & {
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    attachmentId?: string;
};

type QuestionWithFields = QuestionAttributes & {
    author: {
        $id: string;
        name: string;
        reputation: number;
    };
    totalVotes: number;
    totalAnswers: number;
};

const Page = async ({
    params,
    searchParams,
}: {
    params: { userId: string; userSlug: string };
    searchParams: { page?: string };
}) => {
    const {userId, userSlug} = await params;
    console.log(userId)
    const errFix = await searchParams;
    const page = errFix.page ?? "1";

    const queries = [
        Query.equal("authorId", String(userId)),
        Query.orderDesc("$createdAt"),
        Query.offset((Number(page) - 1) * 25),
        Query.limit(25),
    ];

    const questions = await tableDB.listRows<QuestionAttributes>({databaseId : db, tableId : questionsCollection, queries});

    const enrichedQuestions = await Promise.all(
        questions.rows.map(async ques => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>({userId : ques.authorId}),
                tableDB.listRows({databaseId : db, tableId : answersCollection, queries : [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1), // for optimization
                ]}),
                tableDB.listRows({databaseId : db, tableId : votesCollection, queries : [
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
            } as QuestionWithFields;
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{questions.total} questions</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {enrichedQuestions.map(ques => (
                    <QuestionCard key={ques.$id} ques={ques} />
                ))}
            </div>
            <Pagination total={questions.total} limit={25} />
        </div>
    );
};

export default Page;
