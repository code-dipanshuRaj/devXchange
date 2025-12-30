import { db, questionsCollection } from "@/models/name";
import { tableDB } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
import ProtectedRoute from "@/components/ProtectedRoute";

const Page = async ({ params }: { params: { quesId: string; quesName: string } }) => {
    const {quesId} = await params;
    const question = await tableDB.getRow({databaseId : db, tableId : questionsCollection, rowId : quesId});

    return (
        <ProtectedRoute>
            <EditQues question={question} />
        </ProtectedRoute>
    );
};

export default Page;
