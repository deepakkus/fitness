// lib/refreshSession.ts
//debug, connect this-to token todo
import { signIn, getSession } from "next-auth/react";

export async function refreshSession() {
  // Attempt to get the current session
  const session = await getSession();

  if (!session) {
    // No session exists, redirect to login or handle accordingly
    throw new Error("No active session");
  }

  // Check if the access token has expired
  const tokenExpiration = session.expires ? new Date(session.expires) : null;
  const now = new Date();

  if (tokenExpiration && tokenExpiration > now) {
    // Token is still valid
    return session;
  }

  // Token has expired, attempt to refresh
  const refreshedSession = await signIn("credentials", {
    redirect: false,
    refreshToken: session.accessToken,
  });

  if (refreshedSession && refreshedSession.ok) {
    // Successfully refreshed session
    return getSession();
  } else {
    // Refresh token is invalid or expired
    throw new Error("Failed to refresh session");
  }
}
