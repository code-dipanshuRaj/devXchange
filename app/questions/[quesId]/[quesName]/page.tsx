import Answers from "@/components/Answers";
import Comments from "@/components/Comments";
import { MarkdownPreview } from "@/components/RTE";
import VoteButtons from "@/components/VoteButtons";
import {Particles} from "@/components/ui/particles";
import {ShimmerButton} from "@/components/ui/shimmer-button";
import { avatars } from "@/models/client/config";
import {
    answersCollection,
    db,
    votesCollection,
    questionsCollection,
    commentsCollection,
    questionAttachmentsBucket,
} from "@/models/name";
import { tableDB, users } from "@/models/server/config";
import { storage } from "@/models/client/config";
import { UserPrefs } from "@/store/auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { Models, Query } from "node-appwrite";
import React from "react";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";
import { TracingBeam } from "@/components/ui/tracing-beam";

type QuestionAttributes = Models.Row  & {
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    attachmentId: string;
}
type AnswerAttributes = Models.Row & {
    content: string;
    authorId: string;
    questionId: string;
}
type CommentAttributes = Models.Row & {
    content: string;
    authorId: string;
    type: "question" | "answer";
    typeId: string;
}
type AnswersWithExtraData = AnswerAttributes & {
    upvotesDocuments: Models.RowList<Models.Row>,
    downvotesDocuments: Models.RowList<Models.Row>,
    comments: Models.RowList<Models.Row>,
    author: {
        $id: string;
        name: string;
        reputation: number;
    };
}

const Page = async ({ params }: { params: { quesId: string; quesName: string } }) => {
    const [question, answers, upvotes, downvotes, comments] = await Promise.all([
        tableDB.getRow({databaseId : db, tableId: questionsCollection, rowId: params.quesId}),
        tableDB.listRows<AnswerAttributes>({databaseId : db, tableId: answersCollection, queries: [
            Query.orderDesc("$createdAt"),
            Query.equal("questionId", params.quesId),
        ]}),
        tableDB.listRows({databaseId : db, tableId: votesCollection, queries: [
            Query.equal("typeId", params.quesId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1), // for optimization
        ]}),
        tableDB.listRows({databaseId : db, tableId: votesCollection, queries: [
            Query.equal("typeId", params.quesId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1), // for optimization
        ]}),
        tableDB.listRows<CommentAttributes>({databaseId : db, tableId: commentsCollection, queries: [
            Query.equal("type", "question"),
            Query.equal("typeId", params.quesId),
            Query.orderDesc("$createdAt"),
        ]}),
    ]);
    console.log("Fetched Question:", question);
    console.log("Fetched Answers:", answers);
    console.log("Fetched Comments:", comments);
    console.log("Fetched Upvotes:", upvotes);
    console.log("Fetched Downvotes:", downvotes);

    // since it is dependent on the question, we fetch it here outside of the Promise.all
    const author = await users.get<UserPrefs>(question.authorId);
    const [enrichedComments, enrichedAnswers] = await Promise.all([
        Promise.all(
            comments.rows.map(async comment => {
                const author = await users.get<UserPrefs>({userId : comment.authorId});
                return {
                    ...comment,
                    author: {
                        $id: author.$id,
                        name: author.name,
                        reputation: author.prefs.reputation,
                    },
                };
            })
        ),
        Promise.all(
            answers.rows.map(async answer => {
                const [author, comments, upvotes, downvotes] = await Promise.all([
                    users.get<UserPrefs>({userId : answer.authorId}),
                    tableDB.listRows({databaseId : db, tableId: commentsCollection, queries: [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        Query.orderDesc("$createdAt"),
                    ]}),
                    tableDB.listRows({databaseId : db, tableId: votesCollection, queries: [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        Query.equal("voteStatus", "upvoted"),
                        Query.limit(1), // for optimization
                    ]}),
                    tableDB.listRows({databaseId : db, tableId: votesCollection, queries: [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        Query.equal("voteStatus", "downvoted"),
                        Query.limit(1), // for optimization
                    ]}),
                ]);

                comments.rows = await Promise.all(
                    comments.rows.map(async comment => {
                        const author = await users.get<UserPrefs>(comment.authorId);
                        return {
                            ...comment,
                            author: {
                                $id: author.$id,
                                name: author.name,
                                reputation: author.prefs.reputation,
                            },
                        };
                    })
                );

                return {
                    ...answer,
                    comments,
                    upvotesDocuments: upvotes,
                    downvotesDocuments: downvotes,
                    author: {
                        $id: author.$id,
                        name: author.name,
                        reputation: author.prefs.reputation,
                    },
                } as any;
            })
        ),
    ]);
    const enrichedAnswersList: Models.RowList<AnswersWithExtraData> = {
        total: enrichedAnswers.length,
        rows: enrichedAnswers,
    };
    return (
        <TracingBeam className="container pl-6">
            <Particles
                className="fixed inset-0 h-full w-full"
                quantity={500}
                ease={100}
                color="#ffffff"
                refresh
            />
            <div className="relative mx-auto px-4 pb-20 pt-36">
                <div className="flex">
                    <div className="w-full">
                        <h1 className="mb-1 text-3xl font-bold">{question.title}</h1>
                        <div className="flex gap-4 text-sm">
                            <span>
                                Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
                            </span>
                            <span>Answer {answers.total}</span>
                            <span>Votes {upvotes.total + downvotes.total}</span>
                        </div>
                    </div>
                    <Link href="/questions/ask" className="ml-auto inline-block shrink-0">
                        <ShimmerButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                Ask a question
                            </span>
                        </ShimmerButton>
                    </Link>
                </div>
                <hr className="my-4 border-white/40" />
                <div className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <VoteButtons
                            type="question"
                            id={question.$id}
                            className="w-full"
                            upvotes={upvotes}
                            downvotes={downvotes}
                        />
                        <EditQuestion
                            questionId={question.$id}
                            questionTitle={question.title}
                            authorId={question.authorId}
                        />
                        <DeleteQuestion questionId={question.$id} authorId={question.authorId} />
                    </div>
                    <div className="w-full overflow-auto">
                        <MarkdownPreview className="rounded-xl p-4" source={question.content} />
                        <picture>
                            <img
                                src={
                                    storage.getFilePreview({
                                        bucketId: questionAttachmentsBucket,
                                        fileId : question.attachmentId
                                    })
                                }
                                alt={question.title}
                                className="mt-3 rounded-lg"
                            />
                        </picture>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            {question.tags.map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/questions?tag=${tag}`}
                                    className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-1">
                            <picture>
                                <img
                                    src={avatars.getInitials({name: author.name, width: 36, height: 36})}
                                    alt={author.name}
                                    className="rounded-lg"
                                />
                            </picture>
                            <div className="block leading-tight">
                                <Link
                                    href={`/users/${author.$id}/${slugify(author.name)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {author.name}
                                </Link>
                                <p>
                                    <strong>{author.prefs.reputation}</strong>
                                </p>
                            </div>
                        </div>
                        <Comments
                            comments={comments}
                            className="mt-4"
                            type="question"
                            typeId={question.$id}
                        />
                        <hr className="my-4 border-white/40" />
                    </div>
                </div>
                <Answers answers={enrichedAnswersList} questionId={question.$id} />
            </div>
        </TracingBeam>
    );
};

export default Page;
