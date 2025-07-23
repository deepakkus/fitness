// // lib/auth.ts


// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { authenticateUser, refreshAccessToken, authenticateGoogleUser } from "@/lib/auth-utils";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "example@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials) return null;
//         const { email, password } = credentials;
//         try {
//           const { user, tokens, validity } = await authenticateUser(email, password);
//           return {
//             id: `${user.id}`,
//             email: user.email,
//             name: user.name,
//             tokens,
//             validity,
//           };
//         } catch (error) {
//           console.error("Authorization error:", error);
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 15 * 60, // 15 minutes
//   },
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       if (user && account) {
//         if (account.provider === "google" && profile) {
//           const { user: dbUser, tokens, validity } = await authenticateGoogleUser(profile);
//           token.user = dbUser;
//           token.accessToken = tokens.accessToken;
//           token.refreshToken = tokens.refreshToken;
//           token.validity = validity;
//         } else if (account.provider === "credentials") {
//           token.user = { id: `${user.id}`, email: user.email, name: `${user.name}` };
//           token.accessToken = user.tokens.accessToken;
//           token.refreshToken = user.tokens.refreshToken;
//           token.validity = user.validity;
//         }
//       } else if (token.validity) {
//         const now = Math.floor(Date.now() / 1000);
//         if (token.validity.validUntil > now) {
//           return token;
//         } else if (token.validity.refreshUntil > now) {
//           try {
//             const { accessToken, validUntil } = await refreshAccessToken(token.refreshToken);
//             token.accessToken = accessToken;
//             token.validity.validUntil = validUntil;
//           } catch (error) {
//             console.error("Error refreshing access token:", error);
//             token.error = "RefreshAccessTokenError";
//           }
//         } else {
//           token.error = "RefreshTokenExpired";
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token.user && session.user) {
//         session.user.id = `${token.user.id}`;
//         session.user.email = token.user.email;
//         session.user.name = token.user.name;
//         session.accessToken = token.accessToken;
//         session.error = token.error;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };




// // lib/auth.ts


// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { authenticateUser, refreshAccessToken, authenticateGoogleUser } from "@/lib/auth-utils";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "example@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials) return null;
//         const { email, password } = credentials;
//         try {
//           const authResult = await authenticateUser(email, password); // Get the full result
//           // console.log('CredentialsProvider authorize - authResult:', authResult); // Debug log

//           if (!authResult) return null; // Check if authResult is not null before destructuring
//           const { user, tokens, validity } = authResult; // Destructure here

//           // Check if account is soft-deleted *after* authentication
//           if (user.deleted_at) {
//             // console.log(`Login attempt for soft-deleted account: ${email}`);
//             return null; // Prevent login for soft-deleted account
//           }
//           return {
//             id: `${user.id}`,
//             email: user.email,
//             name: user.name,
//             tokens,
//             validity,
//           };
//         } catch (error) {
//           console.error("Authorization error:", error);
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 15 * 60, // 15 minutes
//   },
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       // console.log('jwt callback - entry - account:', account, 'user:', user, 'token (before modifications):', token); // Entry debug log

//       if (user && account) {
//         if (account.provider === "google" && profile) {
//           const authResult = await authenticateGoogleUser(profile); // Get full result from google auth
//           // console.log('jwt callback - google authResult:', authResult); // Debug log

//           if (!authResult) { // Check if authResult is not null
//              token.error = "GoogleAuthenticationFailed"; // Set an error if google auth failed
//              return token;
//           }

//           const { user: dbUser, tokens, validity } = authResult; // Destructure after checking authResult
//           // Check if Google account is soft-deleted *after* Google authentication
//           if (dbUser.deleted_at) {
//             // console.log(`Google login attempt for soft-deleted account: ${dbUser.email || 'unknown email'}`);
//             token.error = "AccountDeleted"; // Optionally set an error flag
//             return token; // Prevent login for soft-deleted Google account
//           }

//           token.user = dbUser;
//           token.accessToken = tokens.accessToken;
//           token.refreshToken = tokens.refreshToken;
//           token.validity = validity;
//         } else if (account.provider === "credentials") {
         

//           token.user = { id: `${user.id}`, email: user.email, name: `${user.name}` };
//           token.accessToken = user.tokens.accessToken;
//           token.refreshToken = user.tokens.refreshToken;
//           token.validity = user.validity; // <----- validity is used here


//         }
//       } else if (token.validity) { // <---- validity is used here - ERROR POINT

//         const now = Math.floor(Date.now() / 1000);
//         if (token.validity.validUntil > now) {
//           return token;
//         } else if (token.validity.refreshUntil > now) {
//           // console.log('jwt callback - token expired, attempting refresh'); // Debug log
//           try {
//             const { accessToken, validUntil } = await refreshAccessToken(token.refreshToken);
//             token.accessToken = accessToken;
//             token.validity.validUntil = validUntil;
//             // console.log('jwt callback - token refreshed - new validity:', token.validity); // Debug log
//           } catch (error) {
//             console.error("Error refreshing access token:", error);
//             token.error = "RefreshAccessTokenError";
//           }
//         } else {
//           token.error = "RefreshTokenExpired";
//           // console.log('jwt callback - refresh token expired'); // Debug log
//         }
//       }
//       // console.log('jwt callback - exit - token (final):', token); // Exit debug log
//       return token;
//     },
//     async session({ session, token }) {
//       if (token.user && session.user) {
//         session.user.id = `${token.user.id}`;
//         session.user.email = token.user.email;
//         session.user.name = token.user.name;
//         session.accessToken = token.accessToken;
//         session.error = token.error;
//       }
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };







// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authenticateUser, refreshAccessToken, authenticateGoogleUser } from "@/lib/auth-utils";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;
        try {
          const authResult = await authenticateUser(email, password);

          if (!authResult) return null;
          const { user, tokens, validity } = authResult;

          if (user.deleted_at) {
            return null;
          }

          return {
            id: `${user.id}`,
            email: user.email,
            name: user.name,
            tokens,
            validity,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && account) {
        if (account.provider === "google" && profile) {
          const authResult = await authenticateGoogleUser(profile);

          if (!authResult) {
            token.error = "GoogleAuthenticationFailed";
            return token;
          }

          const { user: dbUser, tokens, validity } = authResult;
          if (dbUser.deleted_at) {
            token.error = "AccountDeleted";
            return token;
          }

          token.user = dbUser;
          token.accessToken = tokens.accessToken;
          token.refreshToken = tokens.refreshToken;
          token.validity = validity; // Set the entire validity object
        } else if (account.provider === "credentials") {
          token.user = { id: `${user.id}`, email: user.email, name: `${user.name}` };
          token.accessToken = user.tokens.accessToken;
          token.refreshToken = user.tokens.refreshToken;
          token.validity = user.validity; // Set the entire validity object
        }
      } else if (token.validity) { // Check if validity exists
        const now = Math.floor(Date.now() / 1000);

        // Access validity properties safely using optional chaining:
        if (token.validity?.validUntil > now) {
          return token;
        } else if (token.validity?.refreshUntil > now) {
          try {
            const { accessToken, validUntil } = await refreshAccessToken(token.refreshToken);
            token.accessToken = accessToken;
            // IMPORTANT: Update the ENTIRE validity object, including refreshUntil
            token.validity = {
              validUntil: validUntil,
              refreshUntil: token.validity.refreshUntil, // Preserve the original refreshUntil
            };
          } catch (error) {
            console.error("Error refreshing access token:", error);
            token.error = "RefreshAccessTokenError";
          }
        } else {
          token.error = "RefreshTokenExpired";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user && session.user) {
        session.user.id = `${token.user.id}`;
        session.user.email = token.user.email;
        session.user.name = token.user.name;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};