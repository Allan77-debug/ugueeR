import React, { createContext, type PropsWithChildren, use } from "react";
import { useStorageState } from "./useStorageState";
import axios from "axios";
import * as Burnt from "burnt";

interface SignInCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<{
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  session?: {
    token: string;
    uid: number;
  } | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext
      value={{
        signIn: async ({ email, password }: SignInCredentials) => {
          try {
            const response = await axios.post<{
              token: string;
              uid: number;
            }>("http://192.168.56.1:8000/api/users/login/", {
              institutional_mail: email,
              upassword: password,
            });

            console.log("Sign-in response:", response.data);

            const { token, uid } = response.data;
            if (token) {
              console.log("Access token received:", token);
              setSession({
                token,
                uid,
              });
            } else {
              throw new Error("No access token received");
            }
          } catch (error) {
            const errorMessage =
              axios.isAxiosError(error) && error.response?.data?.detail
                ? error.response.data.detail
                : "An unexpected error occurred during sign-in.";

            Burnt.alert({
              title: "Sign-In Failed",
              message: errorMessage,
              preset: "error",
            });

            console.error("Sign-in error:", error);
            // Ensure session is cleared on failure
            setSession(null);
            // Re-throw the error to be caught by the caller if needed
            throw error;
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext>
  );
}
