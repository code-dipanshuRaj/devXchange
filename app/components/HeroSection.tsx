import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { tableDB } from "@/models/server/config";
import { db, questionAttachmentsBucket, questionsCollection } from "@/models/name";
import { Models, Query } from "node-appwrite";
import slugify from "@/utils/slugify";
import { storage } from "@/models/client/config";
import HeroSectionHeader from "./HeroSectionHeader";

type QuestionData = Models.Row & {
    title: string;
    attachmentId: string;
};

export default async function HeroSection() {
    const questions = await tableDB.listRows<QuestionData>({databaseId : db, tableId : questionsCollection, queries : [
        Query.orderDesc("$createdAt"),
        Query.limit(15),
    ]});

    return (
        <>
            <HeroSectionHeader />
            <HeroParallax
                products={questions.rows.map(q => ({
                    title: q.title,
                    link: `/questions/${q.$id}/${slugify(q.title)}`,
                    thumbnail: storage.getFilePreview({bucketId : questionAttachmentsBucket, fileId: q.attachmentId}),
                }))}
            />
        </>
    );
}
