import { NextRequest,NextResponse } from "next/server";

export async function POST(req : NextRequest){
  try {
    
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