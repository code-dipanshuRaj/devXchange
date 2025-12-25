import { db } from "../name";
import createDBIfNotExists from "./createDB";
import createQuestionsCollection from "./question.collection";
import createAnswersCollection from "./answer.collection";
import createCommentsCollection from "./comment.collection";
import createVotesCollection from "./vote.collection";

import { tableDB } from "./config";

export default async function getOrCreateDB(){
    try {
        const res = await tableDB.get({databaseId : db})
        console.log("Database connection established successfully ",res)
    } catch (error) {
      try {
        await createDBIfNotExists(),
        await Promise.all([
          createAnswersCollection(),
          createQuestionsCollection(),
          createCommentsCollection(),
          createVotesCollection()  
        ])
        console.log("Database connected and all collections created")
      } catch (error) {
        console.log("Error connecting or creating Database", error)
      }
    }
}