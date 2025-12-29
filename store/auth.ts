import {create} from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { account } from "@/models/client/config";

import { AppwriteException, ID, Models } from "appwrite";

export interface UserPrefs {
  reputation: number;
}

interface InterfaceOfAuthStore {
  session : Models.Session | null;
  user: Models.User<UserPrefs> | null;
  jwt : string | null;
  hydrated : boolean;
  isVerifying : boolean;

  setHydrated() : void;
  verifySession() : Promise<boolean>;
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
    immer((set, get)=>({
      session: null,
      user: null,
      jwt: null,
      hydrated: false,
      isVerifying: false,

      setHydrated() {
        set({hydrated : true});
      },
      
      async verifySession(){
        // Prevent multiple simultaneous verifications
        if (get().isVerifying) {
          return false;
        }

        set({isVerifying: true});
        
        try {
          // First, try to get the current session
          const session = await account.getSession({sessionId : "current"});
          
          // Check if session is expired
          const now = new Date().getTime();
          const expiresAt = new Date(session.expire).getTime();
          
          if (now >= expiresAt) {
            // Session expired, clear everything
            set({session: null, user: null, jwt: null, isVerifying: false});
            return false;
          }

          // Session is valid, fetch fresh user data
          try {
            const [user, {jwt}] = await Promise.all([
              account.get<UserPrefs>(),
              account.createJWT()
            ]);
            
            set({session, user, jwt, isVerifying: false});
            return true;
          } catch (error) {
            // User fetch failed, session might be invalid
            console.error("Failed to fetch user:", error);
            set({session: null, user: null, jwt: null, isVerifying: false});
            return false;
          }
        } catch (error) {
          // Session doesn't exist or is invalid
          console.log("Session verification failed:", error);
          set({session: null, user: null, jwt: null, isVerifying: false});
          return false;
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
          console.log("User created:", user);
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
          // Even if logout fails on server, clear local state
          set({session : null, user : null, jwt : null});
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
export const getAuthStore = () => useAuthStore.getState();