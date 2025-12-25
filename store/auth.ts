import {create} from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { account } from "@/models/client/config";

import { AppwriteException, ID, Models } from "appwrite";
import { Mode } from "fs";

export interface UserPrefs {
  reputation: number;
}

interface InterfaceOfAuthStore {
  session : Models.Session | null;
  user: Models.User<UserPrefs> | null;
  jwt : string | null;
  hydrated : boolean;

  setHydrated() : void;
  verifySession() : Promise<void>;
  logOut() : Promise<void>
  signIn(
    email : string,
    password : string,
    name : string
  ) : Promise<{
    success : boolean,
    error? : AppwriteException | null
  }>;
  logIn(
    email : string,
    password : string
  ) : Promise<{
    success : boolean,
    error? : AppwriteException | null
  }>
}

export const useAuthStore = create<InterfaceOfAuthStore>()(
  persist(
    immer((set)=>({
      session: null,
      user: null,
      jwt: null,
      hydrated: false,

      setHydrated() {
        set({hydrated : true});
      },
      
      async verifySession(){
        try {
          const session = await account.getSession({sessionId : "current"});
          set({session});
        } catch (error) {
          console.log(error);
        }
      },
      
      async signIn(email, password, name) {
        try {
          const user  =  await account.create({
            userId: ID.unique(),
            email,
            password,
            name
          })
          return {success : true}
        } catch (error) {
          return {
            success : false, 
            error : error instanceof AppwriteException ? error : null}
        }
      },
      
      async logIn(email, password) {
        try {
          const session = await account.createEmailPasswordSession({email, password});
          const [user, {jwt}] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT()
          ])
          if(!user.prefs?.reputation) { 
            await account.updatePrefs({reputation : 0} as any);
          }
          set({session, user, jwt});
          return {success : true}
        } catch (error) {
          return {
            success : false,
            error : error instanceof AppwriteException ? error : null
          }
        }
      },

      async logOut() {
        try {
          await account.deleteSessions();
          set({session : null, user : null, jwt : null});
        } catch (error) {
          console.log(error);
        }
      },
    })),
    {
      name : "auth-store",
      onRehydrateStorage(){
        return (state,error) => {
          if (!error) state?.setHydrated();
        }
      }
    }
  )
) 