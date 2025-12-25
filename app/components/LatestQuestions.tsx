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
// import QuestionCard from "@/components/QuestionCard";
// import { answersCollection, db, questionsCollection, votesCollection } from "@/models/name";
// import { tableDB, users } from "@/models/server/config";
// import { UserPrefs } from "@/store/auth";
// import { Query } from "node-appwrite";
// import React from "react";
// import { ID, Models } from "appwrite";

// /**
//  * Minimal types for table columns (columns you actually use)
//  */
// type QuestionData = {
//   title?: string;
//   body?: string;
//   authorId: string;
//   // add other question columns here if needed
// };

// type AnswerData = {
//   questionId: string;
//   // add other answer columns if needed
// };

// type VoteData = {
//   type: string;
//   typeId: string;
//   // add other vote columns if needed
// };

// type QuestionWithMeta = Models.Row & QuestionData & {
//   totalAnswers: number;
//   totalVotes: number;
//   author: {
//     $id: string;
//     name?: string;
//     reputation?: number;
//   };
// };

// const LatestQuestions = async () => {
//   // 1) Fetch the latest questions — use generics to get typed rows
//   const questions = await tableDB.listRows<QuestionData>({
//     databaseId: db,
//     tableId: questionsCollection,
//     queries: [
//       Query.limit(5),
//       Query.orderDesc("$createdAt"),
//     ],
//   });

//   // 2) Enrich each question row with author and counts.
//   //    Build a new array (do not mutate questions.rows)
//   const enrichedRows = await Promise.all(
//     questions.rows.map(async (ques): Promise<QuestionWithMeta> => {
//       try {
//         // Fetch author and counts in parallel
//         const [author, answers, votes] = await Promise.all([
//           users.get<UserPrefs>(ques.authorId),
//           tableDB.listRows<AnswerData>({
//             databaseId: db,
//             tableId: answersCollection,
//             queries: [
//               Query.equal("questionId", ques.$id),
//               Query.limit(1), // optimization: we only need total
//             ],
//           }),
//           tableDB.listRows<VoteData>({
//             databaseId: db,
//             tableId: votesCollection,
//             queries: [
//               Query.equal("type", "question"),
//               Query.equal("typeId", ques.$id),
//               Query.limit(1), // optimization: we only need total
//             ],
//           }),
//         ]);

//         const meta: QuestionWithMeta = {
//           // preserve all row metadata and columns from `ques`
//           ...ques,
//           // attach computed metadata
//           totalAnswers: answers?.total ?? 0,
//           totalVotes: votes?.total ?? 0,
//           author: {
//             $id: author.$id,
//             name: author.name ?? undefined,
//             reputation: author.prefs?.reputation ?? 0,
//           },
//         };

//         return meta;
//       } catch (err) {
//         // Minimal fallback: if any of the extra calls fail, return a row with defaults
//         // Do not throw — renderable fallback is better for SSR stability
//         console.error("Failed to enrich question", ques.$id, err);

//         const fallback: QuestionWithMeta = {
//           ...ques,
//           totalAnswers: 0,
//           totalVotes: 0,
//           author: {
//             $id: ques.authorId,
//             name: undefined,
//             reputation: 0,
//           },
//         };

//         return fallback;
//       }
//     })
//   );

//   // 3) Render using the enriched array (typed)
//   return (
//     <div className="space-y-6">
//       {enrichedRows.map(question => (
//         <QuestionCard key={question.$id} ques={question} />
//       ))}
//     </div>
//   );
// };

// export default LatestQuestions;
