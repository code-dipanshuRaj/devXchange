import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { tableDB } from "@/models/server/config";
import { db, questionAttachmentsBucket, questionsCollection } from "@/models/name";
import { Models, Query } from "node-appwrite";
import slugify from "@/utils/slugify";
import { storage } from "@/models/client/config";
import HeroSectionHeader from "./HeroSectionHeader";
import { title } from "process";

type QuestionData = Models.Row & {
    title: string;
    attachmentId: string;
};

const testingImages = [
    {
        title: "Sample Question 1",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/300/300.jpg"
    },
    {
        title: "Sample Question 2",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/400/400.jpg"
    },
    {
        title: "Sample Question 3",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/200/300.jpg"
    },
    {
        title: "Sample Question 4",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/300/200.jpg"
    },
    {
        title: "Sample Question 10",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/200/200.jpg"
    },
    {
        title: "Sample Question 5",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/250/300.jpg"
    },
    {
        title: "Sample Question 6",
        link: "/questions/1/sample-question-1",
        thumbnail: "https://picsum.photos/200/350.jpg"
    },
    {
        title: "Sample Question 7",
        link: "https://picsum.photos/",
        thumbnail: "https://picsum.photos/250/350.jpg"
    },

]

export default async function HeroSection() {
    const questions = await tableDB.listRows<QuestionData>({databaseId : db, tableId : questionsCollection, queries : [
        Query.orderDesc("$createdAt"),
        Query.limit(15),
    ]});

    return (
        <>
            {/* <HeroParallax products={ testingImages }/> */}
            <HeroParallax
                products={questions.rows.map(q => ({
                    title: q.title,
                    link: `/questions/${q.$id}/${slugify(q.title)}`,
                    thumbnail: storage.getFileView({bucketId : questionAttachmentsBucket, fileId: q.attachmentId}),
                }))}
            /> 
        </>
    );
}
