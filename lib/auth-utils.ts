// // lib/auth-utils.ts

// import { prisma } from "@/lib/prisma";
// import { compare } from "bcrypt";
// import { randomBytes } from "crypto";
// import { encode, decode } from "next-auth/jwt";
// import { Profile } from "next-auth";
// import { users } from "@prisma/client";

// const JWT_SECRET = process.env.NEXTAUTH_SECRET!;


// // Generate tokens for a user
// async function generateTokens(user: users) {
//   const accessToken = await encode({
//     token: {
//       user: { id: `${user.id}`, email: user.email, name: user.name },
//       validity: { validUntil: Math.floor(Date.now() / 1000) + 15 * 60 },
//     },
//     secret: JWT_SECRET,
//     maxAge: 15 * 60,
//   });

//   const refreshToken = await encode({
//     token: {
//       user: { id: `${user.id}` },
//       validity: { refreshUntil: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 },
//     },
//     secret: JWT_SECRET,
//     maxAge: 7 * 24 * 60 * 60,
//   });

//   return {
//     accessToken,
//     refreshToken,
//     validity: {
//       validUntil: Math.floor(Date.now() / 1000) + 15 * 60,
//       refreshUntil: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
//     },
//   };
// }

// // Authenticate user credentials and generate tokens
// export async function authenticateUser(email: string, password: string) {
//   const user = await prisma.users.findUnique({ where: { email } });
//   if (!user || !user.password) throw new Error("Invalid credentials");

//   const isValidPassword = await compare(password, user.password);
//   if (!isValidPassword) throw new Error("Invalid credentials");

//   const { accessToken, refreshToken, validity } = await generateTokens(user);

//   return {
//     user: { id: `${user.id}`, email: `${user.email}`, name: user.name },
//     tokens: { accessToken, refreshToken },
//     validity,
//   };
// }

// // Refresh access token using refresh token
// export async function refreshAccessToken(refreshToken: string) {
//   const decodedToken = await decode({ token: refreshToken, secret: JWT_SECRET });
//   if (!decodedToken || !decodedToken.user.id) throw new Error("Invalid refresh token");

//   const user = await prisma.users.findUnique({ where: { id: parseInt(decodedToken.user.id) } });
//   if (!user) throw new Error("User not found");

//   const newAccessToken = await encode({
//     token: { user: { id: `${user.id}`, email: user.email, name: `${user.name}` } },
//     secret: JWT_SECRET,
//     maxAge: 15 * 60,
//   });

//   const now = Math.floor(Date.now() / 1000);
//   return {
//     accessToken: newAccessToken,
//     validUntil: now + 15 * 60,
//   };
// }



// // Authenticate Google user and generate tokens
// export async function authenticateGoogleUser(profile: Profile) {
//   const randomPassword = randomBytes(16).toString("hex");
  
//   try {
//     const user = await prisma.users.upsert({
//       where: { 
//         email: profile.email ?? '' 
//       },
//       update: { 
//         name: profile.name ?? '',
//         // Only update profile picture if it's provided and different
//         ...(profile.image ? { profile_picture: profile.image } : {})
//       },
//       create: {
//         email: profile.email ?? '',
//         name: profile.name ?? '',
//         profile_picture: profile.image ?? null, // Make it nullable
//         password: randomPassword,
//       },
//     });

//     const { accessToken, refreshToken, validity } = await generateTokens(user);
//     return {
//       user: { 
//         id: `${user.id}`, 
//         email: user.email, 
//         name: user.name ?? '' 
//       },
//       tokens: { accessToken, refreshToken },
//       validity,
//     };
//   } catch (error) {
//     console.error('Error in authenticateGoogleUser:', error);
//     throw error;
//   }
// }




// // lib/auth-utils.ts


// import { prisma } from "@/lib/prisma";
// import { compare } from "bcrypt";
// import { randomBytes } from "crypto";
// import { encode, decode } from "next-auth/jwt";
// import { Profile } from "next-auth";
// import { users } from "@prisma/client";

// const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

// const ACCESS_TOKEN_DURATION = 30 * 24 * 60 * 60; // 1 month in seconds
// const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds


// // Generate tokens for a user
// async function generateTokens(user: users) {
//   const validity = {
//     validUntil: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_DURATION,
//     refreshUntil: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_DURATION,
//   };
//   // console.log('generateTokens - validity:', validity); // Debug log

//   const accessToken = await encode({
//     token: {
//       user: { id: `${user.id}`, email: user.email, name: user.name, deleted_at: user.deleted_at }, // Include deleted_at
//       validity: validity, // Pass validity object here
//     },
//     secret: JWT_SECRET,
//     maxAge: ACCESS_TOKEN_DURATION,
//   });

//   const refreshToken = await encode({
//     token: {
//       user: { id: `${user.id}` },
//       validity: validity, // Also pass validity here (though less relevant for refresh token itself)
//     },
//     secret: JWT_SECRET,
//     maxAge: REFRESH_TOKEN_DURATION,
//   });

//   return {
//     accessToken,
//     refreshToken,
//     validity: validity,
//   };
// }

// // Authenticate user credentials and generate tokens
// export async function authenticateUser(email: string, password: string) {
//   const user = await prisma.users.findUnique({
//     where: { email },
//     select: { // Select deleted_at here
//       id: true,
//       email: true,
//       name: true,
//       password: true,
//       deleted_at: true, // <---- Select deleted_at
//     }
//   });
//   if (!user || !user.password) throw new Error("Invalid credentials");

//   const isValidPassword = await compare(password, user.password);
//   if (!isValidPassword) throw new Error("Invalid credentials");

//   const tokensAndValidity = await generateTokens(user); // Get the object with tokens and validity
//   const { accessToken, refreshToken, validity } = tokensAndValidity; // Destructure it

//   // console.log('authenticateUser - tokensAndValidity:', tokensAndValidity); // Debug log

//   return {
//     user: { id: `${user.id}`, email: `${user.email}`, name: user.name, deleted_at: user.deleted_at }, // Include deleted_at in returned user
//     tokens: { accessToken, refreshToken },
//     validity: validity, // Return validity here
//   };
// }

// // Refresh access token using refresh token
// export async function refreshAccessToken(refreshToken: string) {
//   const decodedToken = await decode({ token: refreshToken, secret: JWT_SECRET });
//   if (!decodedToken || !decodedToken.user.id) throw new Error("Invalid refresh token");

//   const user = await prisma.users.findUnique({
//     where: { id: parseInt(decodedToken.user.id) },
//     select: { // Select deleted_at even for refresh token (though less critical here)
//       id: true,
//       email: true,
//       name: true,
//       deleted_at: true,
//     }
//   });
//   if (!user) throw new Error("User not found");

//   const newAccessToken = await encode({
//     token: { user: { id: `${user.id}`, email: user.email, name: `${user.name}`, deleted_at: user.deleted_at } }, // Include deleted_at in token
//     secret: JWT_SECRET,
//     maxAge: 15 * 60,
//   });

//   const now = Math.floor(Date.now() / 1000);
//   return {
//     accessToken: newAccessToken,
//     validUntil: now + 15 * 60,
//   };
// }


// // Authenticate Google user and generate tokens
// export async function authenticateGoogleUser(profile: Profile) {
//   const randomPassword = randomBytes(16).toString("hex");

//   try {
//     const user = await prisma.users.upsert({
//       where: {
//         email: profile.email ?? ''
//       },
//       update: {
//         name: profile.name ?? '',
//         // Only update profile picture if it's provided and different
//         ...(profile.image ? { profile_picture: profile.image } : {})
//       },
//       create: {
//         email: profile.email ?? '',
//         name: profile.name ?? '',
//         profile_picture: profile.image ?? null, // Make it nullable
//         password: randomPassword,
//       },
//       select: { // <---- Select deleted_at in upsert
//         id: true,
//         email: true,
//         name: true,
//         deleted_at: true, // <---- Select deleted_at in upsert
//       }
//     });

//     const tokensAndValidity = await generateTokens(user); // Get tokens and validity here
//     const { accessToken, refreshToken, validity } = tokensAndValidity; // Destructure

//     return {
//       user: {
//         id: `${user.id}`,
//         email: user.email,
//         name: user.name ?? '',
//         deleted_at: user.deleted_at // Include deleted_at in returned user
//       },
//       tokens: { accessToken, refreshToken },
//       validity: validity, // Return validity here
//     };
//   } catch (error) {
//     console.error('Error in authenticateGoogleUser:', error);
//     throw error;
//   }
// }




// lib/auth-utils.ts
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { randomBytes } from "crypto";
import { encode, decode } from "next-auth/jwt";
import { Profile } from "next-auth";
import { users } from "@prisma/client";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

const ACCESS_TOKEN_DURATION = 30 * 24 * 60 * 60; // 1 month in seconds
const REFRESH_TOKEN_DURATION = 31 * 24 * 60 * 60; // 31 days in seconds


// Generate tokens for a user
async function generateTokens(user: users) {
  const validity = {
    validUntil: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_DURATION,
    refreshUntil: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_DURATION,
  };

  const accessToken = await encode({
    token: {
      user: { id: `${user.id}`, email: user.email, name: user.name, deleted_at: user.deleted_at }, // Include deleted_at
      validity: validity, // Pass validity object here
    },
    secret: JWT_SECRET,
    maxAge: ACCESS_TOKEN_DURATION,
  });

  const refreshToken = await encode({
    token: {
      user: { id: `${user.id}` },
      validity: validity, // Also pass validity here (though less relevant for refresh token itself)
    },
    secret: JWT_SECRET,
    maxAge: REFRESH_TOKEN_DURATION,
  });

  return {
    accessToken,
    refreshToken,
    validity: validity,
  };
}

// Authenticate user credentials and generate tokens
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { // Select deleted_at here
      id: true,
      email: true,
      name: true,
      password: true,
      deleted_at: true, // <---- Correctly select deleted_at
    }
  });
  if (!user || !user.password) throw new Error("Invalid credentials");

  const isValidPassword = await compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  const tokensAndValidity = await generateTokens(user); // Get the object with tokens and validity
  const { accessToken, refreshToken, validity } = tokensAndValidity; // Destructure it

  return {
    user: { id: `${user.id}`, email: `${user.email}`, name: user.name, deleted_at: user.deleted_at }, // Include deleted_at in returned user
    tokens: { accessToken, refreshToken },
    validity: validity, // Return validity here
  };
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string) {
  const decodedToken = await decode({ token: refreshToken, secret: JWT_SECRET });
  if (!decodedToken || !decodedToken.user.id) throw new Error("Invalid refresh token");

  const user = await prisma.users.findUnique({
    where: { id: parseInt(decodedToken.user.id) },
    select: { // Select deleted_at even for refresh token (though less critical here)
      id: true,
      email: true,
      name: true,
      deleted_at: true,
    }
  });
  if (!user) throw new Error("User not found");

  const newAccessToken = await encode({
    token: { user: { id: `${user.id}`, email: user.email, name: `${user.name}`, deleted_at: user.deleted_at } }, // Include deleted_at in token
    secret: JWT_SECRET,
    maxAge: 15 * 60,
  });

  const now = Math.floor(Date.now() / 1000);
  return {
    accessToken: newAccessToken,
    validUntil: now + 15 * 60,
  };
}


// Authenticate Google user and generate tokens
export async function authenticateGoogleUser(profile: Profile) {
  const randomPassword = randomBytes(16).toString("hex");

  try {
    const user = await prisma.users.upsert({
      where: {
        email: profile.email ?? ''
      },
      update: {
        name: profile.name ?? '',
        // Only update profile picture if it's provided and different
        ...(profile.image ? { profile_picture: profile.image } : {})
      },
      create: {
        email: profile.email ?? '',
        name: profile.name ?? '',
        profile_picture: profile.image ?? null, // Make it nullable
        password: randomPassword,
      },
      select: { // <---- Select deleted_at in upsert
        id: true,
        email: true,
        name: true,
        deleted_at: true, // <---- Select deleted_at in upsert
      }
    });

    const tokensAndValidity = await generateTokens(user); // Get tokens and validity here
    const { accessToken, refreshToken, validity } = tokensAndValidity; // Destructure

    return {
      user: {
        id: `${user.id}`,
        email: user.email,
        name: user.name ?? '',
        deleted_at: user.deleted_at // Include deleted_at in returned user
      },
      tokens: { accessToken, refreshToken },
      validity: validity, // Return validity here
    };
  } catch (error) {
    console.error('Error in authenticateGoogleUser:', error);
    throw error;
  }
}