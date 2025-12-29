"use client";

import { tableDB } from "@/models/client/config";
import { db, questionsCollection } from "@/models/name";
import { useAuthStore } from "@/store/auth";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";

const DeleteQuestion = ({ questionId, authorId }: { questionId: string; authorId: string }) => {
    const router = useRouter();
    const { user, hydrated } = useAuthStore();

    const deleteQuestion = async () => {
        if (!hydrated || !user || user.$id !== authorId) {
            window.alert("You don't have permission to delete this question");
            return;
        }

        try {
            await tableDB.deleteRow({databaseId : db, tableId : questionsCollection, rowId : questionId});

            router.push("/questions");
        } catch (error: any) {
            window.alert(error?.message || "Something went wrong");
        }
    };

    if (!hydrated || !user || user.$id !== authorId) return null;

    return (
        <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
            onClick={deleteQuestion}
        >
            <IconTrash className="h-4 w-4" />
        </button>
    );
};

export default DeleteQuestion;
