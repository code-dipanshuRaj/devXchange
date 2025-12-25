import { answersCollection, db } from "../name";
import createQuestionsCollection from "./question.collection";
import createAnswersCollection from "./answer.collection";
import createCommentsCollection from "./comment.collection";

import { tableDB } from "./config";
import { table } from "console";
import { ClientPageRoot } from "next/dist/client/components/client-page";

export default async function getOrCreateDB(){
    try {
        await tableDB.get({databaseId : db})
        console.log("Database connection established successfully")
    } catch (error) {
      try {
        await Promise.all([
          createAnswersCollection(),
          createQuestionsCollection(),
          createCommentsCollection(),
        ])
        console.log("Database connected and all collections created")
      } catch (error) {
        console.log("Error connecting or creating Database", error)
      }
    }
}