import { NextRequest,NextResponse } from "next/server";
import { tableDB, users } from "@/models/server/config";
import { db, answersCollection } from "@/models/name";
import { UserPrefs } from "@/store/auth";
import { ID } from "node-appwrite";

export async function POST(req : NextRequest){
  try {
    const {questionId, answer, authorId} = await req.json();
    const response =  await tableDB.createRow({
      databaseId : db,
      tableId : answersCollection,
      rowId : ID.unique(),
      data : {
        questionId,
        answer,
        authorId
      }
    });
    console.log("Answer Creation Response in app/api/answer [\"route\"]:", response);
    const prefs = await users.getPrefs<UserPrefs>({userId : authorId});
    await users.updatePrefs({userId: authorId, prefs: {
      reputation: Number(prefs.reputation) + 1
    }});

    return NextResponse.json(response, {
      status : 201
    });
  } catch (error : any) {
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