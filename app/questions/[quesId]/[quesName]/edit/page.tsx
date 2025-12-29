import { db, questionsCollection } from "@/models/name";
import { tableDB } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";

const Page = async ({ params }: { params: { quesId: string; quesName: string } }) => {
    const question = await tableDB.getRow({databaseId : db, tableId : questionsCollection, rowId : params.quesId});

    return <EditQues question={question} />;
};

export default Page;
