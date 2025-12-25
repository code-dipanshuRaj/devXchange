import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import getOrCreateDB from "./models/server/seedDB";
import getOrCreateStorage from "./models/server/storage.collection";

// Initialize Database and Storage Bucket
export async function proxy(req : NextRequest){
  await getOrCreateDB();
  await getOrCreateStorage();
  return NextResponse.next();
}

export const config = {
  matcher : ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}