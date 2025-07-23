import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma"; // Ensure Prisma is set up correctly
import logger from "@/lib/logger";


export async function GET(request: NextRequest, { params }: { params: { activityId: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.user || !token.user.id) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  //  const user_id = BigInt(3);
  const user_id = BigInt(token.user.id); // Get the current user's ID from the token
  const { activityId } = params; // Get the activityId from the route parameters
  const activityIdBigInt = BigInt(activityId); // Convert activityId to BigInt if necessary

  try {
    // Step 1: Check if the user is part of the activity
    const isMember = await prisma.activity_members.findFirst({
      where: {
        activity_id: activityIdBigInt,
        user_id: user_id,
      },
    });

    if (!isMember) {
      // If the user is not part of this activity, return a 403 Forbidden error
      return NextResponse.json({ error: "Forbidden: You are not a member of this activity" }, { status: 403 });
    }

    // Obtain base URL for constructing image URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Step 2: Fetch verified members
    const verifiedMembers = await prisma.activity_members.findMany({
      where: { activity_id: activityIdBigInt },
      include: {
        users_activity_members_user_idTousers: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        created_at: "desc", // Sort by the created_at date (latest first)
      },
    });

    const verifiedList = verifiedMembers.map((member) => ({
      id: member.users_activity_members_user_idTousers.id,
      name: member.users_activity_members_user_idTousers.name,
      profile_pic:
        member.users_activity_members_user_idTousers.profile_picture ?
          `${baseUrl}/api/images/${member.users_activity_members_user_idTousers.profile_picture}`
        : null,
      created_at: member.created_at, // Include created_at date
    }));

    // Step 3: Fetch unverified users (pending join requests)
    const unverifiedRequests = await prisma.activity_join_requests.findMany({
      where: {
        activity_id: activityIdBigInt,
        status: { not: "accepted" }, // Only get requests that are not accepted
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        created_at: "desc", // Sort by the created_at date (latest first)
      },
    });

    const unverifiedList = unverifiedRequests.map((request) => ({
      id: request.users.id,
      name: request.users.name,
      profile_pic: request.users.profile_picture ? `${baseUrl}/api/images/${request.users.profile_picture}` : null,
      created_at: request.created_at, // Include created_at date
      status: request.status, // Include the status of the request
    }));

    // Step 4: Return both verified and unverified users in the proper structure
    return NextResponse.json({
      verified: {
        count: verifiedList.length,
        items: verifiedList,
      },
      unverified: {
        count: unverifiedList.length,
        items: unverifiedList,
      },
    });
  } catch (error) {
    logger.error(`Error fetching members and join requests:${error}`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
/*
openapi: 3.0.0
info:
  title: Activity Members API
  description: API to fetch verified and unverified members of an activity.
  version: 1.0.0
  contact:
    name: API Support
    url: https://example.com/support
    email: support@example.com

servers:
  - url: https://example.com/api
    description: Main API server

paths:
  /messages/groups/{activityId}/members:
    get:
      summary: Get verified and unverified members of an activity
      description: Fetch the list of verified and unverified members for a specific activity, ordered by the date of joining or requesting.
      parameters:
        - name: activityId
          in: path
          required: true
          description: The ID of the activity.
          schema:
            type: string
      responses:
        '200':
          description: Successfully fetched members.
          content:
            application/json:
              schema:
                type: object
                properties:
                  verified:
                    type: object
                    properties:
                      count:
                        type: integer
                        description: The number of verified members.
                      items:
                        type: array
                        items:
                          type: object
                          properties:
                            id:
                              type: string
                              description: The user's ID.
                            name:
                              type: string
                              description: The user's name.
                            profile_pic:
                              type: string
                              format: uri
                              description: The URL of the user's profile picture.
                            created_at:
                              type: string
                              format: date-time
                              description: The date when the user joined the activity.
                  unverified:
                    type: object
                    properties:
                      count:
                        type: integer
                        description: The number of unverified members.
                      items:
                        type: array
                        items:
                          type: object
                          properties:
                            id:
                              type: string
                              description: The user's ID.
                            name:
                              type: string
                              description: The user's name.
                            profile_pic:
                              type: string
                              format: uri
                              description: The URL of the user's profile picture.
                            created_at:
                              type: string
                              format: date-time
                              description: The date when the user requested to join the activity.
                            status:
                              type: string
                              description: The current status of the user's join request.
                              enum:
                                - pending
                                - rejected
                                - other_statuses
        '401':
          description: Unauthorized access. The user is not authenticated.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Unauthorized access
        '403':
          description: Forbidden. The user is not part of the activity.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Forbidden: You are not a member of this activity
        '500':
          description: Internal server error.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: Internal Server Error

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
*/
