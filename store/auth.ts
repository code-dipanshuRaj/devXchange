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
        // Prevent concurrent verification calls
        if (get().isVerifying) {
          console.log("verifySession: already verifying");
          return get().session !== null;
        }

        console.log("verifySession: start");
        set({isVerifying: true});
        
        try {
          // First check if we have a session cookie by trying to get current session
          const session = await account.getSession({sessionId : "current"});
          console.log("verifySession: got session", session);
          
          // Verify session is not expired
          const now = new Date().getTime();
          const expiresAt = new Date(session.expire).getTime();
          
          if (expiresAt <= now) {
            // Session expired, clear state
            console.log("verifySession: session expired");
            set({session: null, user: null, jwt: null, isVerifying: false});
            return false;
          }

          // Session is valid, get user and JWT
          try {
            const [user, {jwt}] = await Promise.all([
              account.get<UserPrefs>(),
              account.createJWT()
            ]);
            
            if(!user.prefs?.reputation) { 
              await account.updatePrefs({reputation : 0} as any);
            }
            
            set({session, user, jwt, isVerifying: false});
            console.log("verifySession: success", {user, jwt});
            return true;
          } catch (error) {
            // Failed to get user, session might be invalid
            console.error("verifySession: Failed to get user:", error);
            set({session: null, user: null, jwt: null, isVerifying: false});
            return false;
          }
        } catch (error) {
          // No valid session or session expired
          console.log("verifySession: Session verification failed:", error);
          set({session: null, user: null, jwt: null, isVerifying: false});
          return false;
        }
      },
      
      async signIn(email, password, name) {
        try {
          // Delete any existing sessions first to prevent "session already exists" error
          try {
            await account.deleteSessions();
          } catch (e) {
            // Ignore errors if no sessions exist
          }

          // Create the account
          const user = await account.create({
            userId: ID.unique(),
            email,
            password,
            name
          });
          console.log("User created:", user);
          
          // Automatically log in the user after registration
          const session = await account.createEmailPasswordSession({email, password});
          const [userData, {jwt}] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT()
          ]);
          
          if(!userData.prefs?.reputation) { 
            await account.updatePrefs({reputation : 0} as any);
          }
          
          // Update store with session, user, and JWT
          set({session, user: userData, jwt});
          
          return {success : true}
        } catch (error) {
          return {
            success : false, 
            error : error instanceof AppwriteException ? error : null}
        }
      },
      
      async logIn(email, password) {
        try {
          // First, try to get existing session and verify it
          let existingSession = null;
          let currentUser = null;
          
          try {
            existingSession = await account.getSession({sessionId: "current"});
            currentUser = await account.get<UserPrefs>();
            
            // Check if session is still valid
            const now = new Date().getTime();
            const expiresAt = new Date(existingSession.expire).getTime();
            
            // If session is valid and user email matches, just update store
            if (expiresAt > now && currentUser.email === email) {
              const [user, {jwt}] = await Promise.all([
                account.get<UserPrefs>(),
                account.createJWT()
              ]);
              if(!user.prefs?.reputation) { 
                await account.updatePrefs({reputation : 0} as any);
              }
              set({session: existingSession, user, jwt});
              return {success : true};
            }
          } catch (e) {
            // No existing session or session invalid, continue to create new one
          }

          // Delete any existing sessions before creating a new one
          // This prevents "session already exists" error
          try {
            await account.deleteSessions();
          } catch (e) {
            // Ignore errors if no sessions exist
          }

          // Create new session
          const session = await account.createEmailPasswordSession({email, password});
          const [user, {jwt}] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT()
          ]);
          if(!user.prefs?.reputation) { 
            await account.updatePrefs({reputation : 0} as any);
          }
          set({session, user, jwt});
          return {success : true};
        } catch (error) {
          return {
            success : false,
            error : error instanceof AppwriteException ? error : null
          }
        }
      },

      async logOut() {
        try {
          // Delete all sessions from server
          await account.deleteSessions();
        } catch (error) {
          // Even if delete fails, continue to clear local state
          console.log("Error deleting sessions:", error);
        }
        
        // Always clear local state, even if server delete fails
        set({session : null, user : null, jwt : null, isVerifying: false});
        
        // Clear persisted state from localStorage
        // Do this synchronously to ensure it's cleared before redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-store');
        }
      },
    })),
    {
      name : "auth-store",
      onRehydrateStorage(){
        return (state,error) => {
          if (!error) {
            console.log("auth-store: rehydrated");
            state?.setHydrated();
          }
        }
      }
    }
  )
) 
export const getAuthStore = () => useAuthStore.getState();