import { db } from "../name";
import createDBIfNotExists from "./createDB";
import createQuestionsCollection from "./question.collection";
import createAnswersCollection from "./answer.collection";
import createCommentsCollection from "./comment.collection";
import createVotesCollection from "./vote.collection";

import { tableDB } from "./config";

let dbInitialized = false;
let dbInitializationPromise: Promise<void> | null = null;

export default async function getOrCreateDB(): Promise<void> {
    if (dbInitialized) {
        return;
    }

    if (dbInitializationPromise) {
        return dbInitializationPromise;
    }

    dbInitializationPromise = (async () => {
        try {
            // Quick check if DB exists 
            await tableDB.get({databaseId : db});
            console.log("Database connection verified");
            dbInitialized = true;
        } catch (error) {
            // DB doesn't exist, creating DB and collections 
            try {
                await createDBIfNotExists();
                await Promise.all([
                    createAnswersCollection(),
                    createQuestionsCollection(),
                    createCommentsCollection(),
                    createVotesCollection()  
                ]);
                console.log("Database and collections created successfully");
                dbInitialized = true;
            } catch (createError) {
                console.error("Error creating Database:", createError);
                throw createError;
            }
        }
    })();

    return dbInitializationPromise;
}