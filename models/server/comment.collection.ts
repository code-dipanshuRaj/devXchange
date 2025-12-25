import { Permission } from "node-appwrite";
import { commentsCollection, db } from "../name";
import { tableDB } from "./config";

export default async function createCommentsCollection() {
    // Creating Collection
    await tableDB.createTable({
        databaseId: db,
        tableId: commentsCollection,
        name: commentsCollection,
        permissions: [
            Permission.create("users"),
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ],
    });
    console.log("Comment Collection Created");

    // Creating Attributes
    await Promise.all([
        tableDB.createStringColumn({
            databaseId: db,
            tableId: commentsCollection,
            key: "content",
            size: 10000,
            required: true
        }),
        tableDB.createEnumColumn({
            databaseId: db,
            tableId: commentsCollection,
            key: "type",
            elements: ["answer", "question"],
            required: true
        }),
        tableDB.createStringColumn({
            databaseId: db,
            tableId: commentsCollection,
            key: "typeId",
            size: 50,
            required: true
        }),
        tableDB.createStringColumn({
            databaseId: db,
            tableId: commentsCollection,
            key: "authorId",
            size: 50,
            required: true
        }),
    ]);
    console.log("Comment Attributes Created");  
}
