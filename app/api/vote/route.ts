import { UserPrefs } from "@/store/auth";
import { NextRequest,NextResponse } from "next/server";
import {tableDB, users} from "@/models/server/config";
import { db, votesCollection } from "@/models/name";
import { ID, Query } from "node-appwrite";
import { questionsCollection, answersCollection } from "@/models/name";

export async function POST(req : NextRequest){
  try {
    const {votedById, voteStatus, type, typeId} = await req.json();
    
    // Check if user already voted on this question/answer
    const existingVoteResponse = await tableDB.listRows({
      databaseId : db,
      tableId : votesCollection,
      queries : [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("votedById", votedById)
      ]
    });
    
    const existingVote = existingVoteResponse.rows[0];
    const previousVoteStatus = existingVote?.voteStatus;
    
    // Get the question or answer to find the AUTHOR
    const questionOrAnswer = await tableDB.getRow({
      databaseId : db,
      tableId : type === "question" ? questionsCollection : answersCollection,
      rowId : typeId
    });
    
    const authorPrefs = await users.getPrefs<UserPrefs>({userId : questionOrAnswer.authorId});
    let newReputation = Number(authorPrefs.reputation);
    
    // If vote already exists and user is clicking the same vote again
    if (existingVote && previousVoteStatus === voteStatus) {
      // Remove the vote
      await tableDB.deleteRow({
        databaseId : db,
        tableId : votesCollection,
        rowId : existingVote.$id
      });
      
      // Reverse change
      if (voteStatus === "upvoted") {
        newReputation -= 1;
      } else {
        newReputation += 1;
      }
      
      await users.updatePrefs({
        userId : questionOrAnswer.authorId, 
        prefs: { reputation: newReputation }
      });
      
      const [upvotesResponse, downvotesResponse] = await Promise.all([
        tableDB.listRows({
          databaseId : db,
          tableId : votesCollection,
          queries : [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1)
          ]}),
        tableDB.listRows({
          databaseId : db,
          tableId : votesCollection,
          queries : [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1)
          ]})
      ]);
      
      return NextResponse.json(
        { 
          data : {document : null, voteResult : upvotesResponse.total - downvotesResponse.total},
          message: "Vote Withdrawn",
        },
        {
          status : 200
        }
      );
    }
    
    // If vote exists but status is different (toggling)
    if (existingVote && previousVoteStatus !== voteStatus) {
      await tableDB.deleteRow({
        databaseId : db,
        tableId : votesCollection,
        rowId : existingVote.$id
      });
      
      // Reverse the old vote's reputation change
      if (previousVoteStatus === "upvoted") {
        newReputation -= 1;
      } else {
        newReputation += 1;
      }
    }
    
    const voteRes = await tableDB.createRow({
      databaseId : db,
      tableId : votesCollection,
      rowId : ID.unique(),
      data : {
        type,
        typeId,
        voteStatus,
        votedById
      }
    });
    
    // Apply the new vote's reputation change
    if (voteStatus === "upvoted") {
      newReputation += 1;
    } else {
      newReputation -= 1;
    }
    
    // Update reputation 
    await users.updatePrefs({
      userId : questionOrAnswer.authorId, 
      prefs: { reputation: newReputation }
    });
    
    const [upvotesResponse, downvotesResponse] = await Promise.all([
      tableDB.listRows({
        databaseId : db,
        tableId : votesCollection,
        queries : [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "upvoted"),
          Query.limit(1)
        ]}),
      tableDB.listRows({
        databaseId : db,
        tableId : votesCollection,
        queries : [
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.equal("voteStatus", "downvoted"),
          Query.limit(1)
        ]})
    ]);

    return NextResponse.json(
      { 
        data : {document : voteRes, voteResult : upvotesResponse.total - downvotesResponse.total},
        message: existingVote ? "Vote Status Updated" : "Voted",
      },
      {
        status : 201
      }
    );
  }catch (error : any) {
    console.error("Vote API Error:", error);
    return NextResponse.json(
      {
        message : error?.message || "Internal Server Error"
      }, 
      {
        status : error?.status || error?.code || 500
      }
    );
  }
}