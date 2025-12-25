import { Permission } from "node-appwrite";
import { db, votesCollection } from "../name";
import { tableDB } from "./config";

export default async function createVotesCollection() {
    // Creating Collection
    await tableDB.createTable({
        databaseId: db,
        tableId: votesCollection,
        name: votesCollection,
        permissions: [
            Permission.create("users"),
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ],
    });
    console.log("Vote Collection Created");

    // Creating Attributes
    await Promise.all([
        tableDB.createEnumColumn({
            databaseId: db,
            tableId: votesCollection,
            key: "type",
            elements: ["question", "answer"],
            required: true
        }),
        tableDB.createStringColumn({
            databaseId: db,
            tableId: votesCollection,
            key: "typeId",
            size: 50,
            required: true
        }),
        tableDB.createEnumColumn({
            databaseId: db,
            tableId: votesCollection,
            key: "voteStatus",
            elements: ["upvoted", "downvoted"],
            required: true
        }),
        tableDB.createStringColumn({
            databaseId: db,
            tableId: votesCollection,
            key: "votedById",
            size: 50,
            required: true
        }),
    ]);
    console.log("Vote Attributes Created");
}
