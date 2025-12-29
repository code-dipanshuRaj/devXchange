"use client";

import QuestionForm from "@/components/QuestionForm";
import { useAuthStore } from "@/store/auth";
import slugify from "@/utils/slugify";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";

// type need to be fixed
const EditQues = ({ question }: { question: any }) => {
    const { user, hydrated } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        if (!hydrated) return;
        
        if (!user || question.authorId !== user.$id) {
            router.push(`/questions/${question.$id}/${slugify(question.title)}`);
        }
    }, [hydrated, user, question, router]);

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

    if (!user || user.$id !== question.authorId) return null;

    return (
        <div className="block pb-20 pt-32">
            <div className="container mx-auto px-4">
                <h1 className="mb-10 mt-4 text-2xl">Edit your public question</h1>

                <div className="flex flex-wrap md:flex-row-reverse">
                    <div className="w-full md:w-1/3"></div>
                    <div className="w-full md:w-2/3">
                        <QuestionForm question={question} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditQues;
