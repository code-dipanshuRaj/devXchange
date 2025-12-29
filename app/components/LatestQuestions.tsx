import QuestionCard from "@/components/QuestionCard";
import { Models } from "appwrite";
import { answersCollection, db, questionsCollection, votesCollection } from "@/models/name";
import { tableDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/auth";
import { Query } from "node-appwrite";
import React from "react";

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

const LatestQuestions = async () => {
    const questions = await tableDB.listRows<QuestionAttributes>({databaseId : db, tableId : questionsCollection, queries :  [
        Query.limit(5),
        Query.orderDesc("$createdAt"),
    ]});
    console.log("Fetched Questions:", questions);

    const enrichedRows = await Promise.all(
        questions.rows.map(async (ques) : Promise<QuestionWithExtraData> => {
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

            return{
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

    console.log("Latest question")
    console.log(questions)
    return (
        <div className="space-y-6">
            {enrichedRows.map(question => (
                <QuestionCard key={question.$id} ques={question} />
            ))}
        </div>
    );
};

export default LatestQuestions;
