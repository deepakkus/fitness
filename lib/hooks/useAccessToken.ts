// hooks/useAccessToken.ts

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { refreshSession } from "@/lib/refreshSession";

export function useAccessToken() {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else if (status === "authenticated") {
      // Attempt to refresh the session
      refreshSession()
        .then((newSession) => {
          setAccessToken(newSession?.accessToken as string);
        })
        .catch((error) => {
          console.error("Failed to refresh session:", error);
          signIn(); // Redirect to login if unable to refresh
        });
    }
  }, [session, status]);

  return accessToken;
}
