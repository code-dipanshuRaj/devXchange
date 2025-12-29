import { UserPrefs } from "@/store/auth";
import { NextRequest,NextResponse } from "next/server";
import {tableDB, users} from "@/models/server/config";
import { db, votesCollection } from "@/models/name";
import { ID, Query } from "node-appwrite";
import { questionsCollection, answersCollection } from "@/models/name";

export async function POST(req : NextRequest){
  try {
    const {votedById, voteStatus, type, typeId} = await req.json();
    const response = await tableDB.listRows({
      databaseId : db,
      tableId : votesCollection,
      queries : [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("votedById", votedById)
      ]
    })
    console.log("Vote Check Response in app/api/vote [\"route\"]:", response);

    // vote already exists
    if(response.rows.length > 0){
      await tableDB.deleteRow({
        databaseId : db,
        tableId : votesCollection,
        rowId : response.rows[0].$id
      });

      const questionOrAnswer = await tableDB.getRow({
        databaseId : db,
        tableId : type === "question" ? "questions" : "answers",
        rowId : typeId
      });
      const authorPrefs = await users.getPrefs<UserPrefs>({userId : questionOrAnswer.authorId});

      await users.updatePrefs({userId : questionOrAnswer.authorId, prefs: {
        reputation : response.rows[0].voteStatus === "upvoted" 
          ? Number(authorPrefs.reputation) - 1 
          : Number(authorPrefs.reputation) + 1
      }});
    }

    // that means prev vote does not exists or voteStatus changed
    if(response.rows[0]?.voteStatus !== voteStatus){
      const res = await tableDB.createRow({
        databaseId : db,
        tableId : votesCollection,
        rowId : ID.unique(),
        data : {
          type,
          typeId,
          voteStatus,
          votedById
        }
      })
      console.log("Vote Creation Response in app/api/vote [\"route\"]:", res);

      const questionOrAnswer = await tableDB.getRow({
                databaseId : db,
                tableId : type === "question" ? questionsCollection : answersCollection,
                rowId :typeId
            });
      const authorPrefs = await users.getPrefs<UserPrefs>({userId : questionOrAnswer.authorId});
      
      // if vote was present on this question or ans then user toggled the vote or else changed from no vote to upvote/downvote
        await users.updatePrefs({userId :  questionOrAnswer.authorId, prefs: {
          reputation : 
            // current opted status update
            voteStatus === "upvoted" 
              ? Number(authorPrefs.reputation) + 1 
              : Number(authorPrefs.reputation) - 1
        }});

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
          data : {document : res, voteResult : upvotesResponse.total - downvotesResponse.total},
          message: response.rows[0] ? "Vote Status Updated" : "Voted",
        },
        {
          status : 201
        }
      )
    }

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
    });
  }catch (error : any) {
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