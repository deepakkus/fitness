# README

## Table of Contents

1. [Introduction](#introduction)
2. [Setup Instructions](#setup-instructions)
3. [Running the Application](#running-the-application)
   - [Development Mode](#development-mode)
   - [Production Mode](#production-mode)
4. [Authentication and Authorization](#authentication-and-authorization)
5. [API Endpoints](#api-endpoints)
   - [API Endpoints and Client-side Pages](#api-endpoints-and-client-side-pages)
6. [Additional Notes](#additional-notes)
7. [Conclusion](#conclusion)

---

## Introduction

This project is a web application built using **Next.js** and **Prisma**. It includes both server-side API endpoints and client-side pages that interact with these APIs. The application uses **NextAuth.js** for authentication, incorporating JWT tokens for securing API endpoints.

This README provides instructions on setting up and running the application in both development and production modes. It also details the authentication mechanism, the API endpoints used, and their corresponding client-side pages.

---

## Setup Instructions

Before running the application, ensure you have the following installed:

- **Node.js** (version 14 or above)
- **npm** or **pnpm** (pnpm is recommended)
- **PostgreSQL** (or your preferred database)

### Installing Dependencies

Use `pnpm` (recommended) or `npm` to install the necessary packages.

Using **pnpm**:

```bash
pnpm install
```

Using **npm**:

```bash
npm install
```

### Generating Prisma Client

After installing the packages, generate the Prisma client, which is essential for database interactions.

```bash
npx prisma generate
```

This command reads the `prisma/schema.prisma` file and generates the Prisma client based on the schema.

**Note:** If there are changes to the database schema, you may need to update your Prisma client:

```bash
npx prisma db pull
npx prisma generate
```

---

## Running the Application

### Development Mode

To run the application in development mode:

1. **Install Packages:** (If not already done)

   ```bash
   pnpm install
   ```

2. **Generate Prisma Client:** (If not already done)

   ```bash
   npx prisma generate
   ```

3. **Start the Development Server:**

   ```bash
   pnpm dev
   ```

   Or using **npm**:

   ```bash
   npm run dev
   ```

The application will start at `http://localhost:3000` by default.

### Production Mode

To run the application in production mode:

1. **Install Packages and Generate Prisma Client:** (If not already done)

   ```bash
   pnpm install
   npx prisma generate
   ```

2. **Build the Application:**

   ```bash
   pnpm build
   ```

   Or using **npm**:

   ```bash
   npm run build
   ```

3. **Start the Production Server:**

   ```bash
   pnpm start
   ```

   Or using **npm**:

   ```bash
   npm run start
   ```

---

## Authentication and Authorization

The application uses **NextAuth.js** for authentication, supporting both email/password credentials and OAuth providers like Google.

### JWT Tokens

Upon successful authentication, the server issues JWT tokens:

- **Access Token:** Used for authenticated API requests. Valid for **15 minutes**.
- **Refresh Token:** Used to obtain a new access token when the current one expires. Valid for **7 days**.

Tokens are signed using the `NEXTAUTH_SECRET` environment variable.

### NextAuth Configuration

The authentication logic is defined in `lib/auth.ts` and `lib/auth-utils.ts`.

- **Providers:**
  - **Credentials Provider:** For email/password authentication.
  - **Google Provider:** For OAuth authentication.
- **Token Handling:**
  - Tokens are refreshed automatically when expired, using the refresh token.
  - Errors during token refresh are handled appropriately, prompting re-authentication if necessary.

---

## API Endpoints

Below is a list of API endpoints used in the application, along with the client-side pages that reference them. Only APIs that are actually used in the client-side code are included.

### API Endpoints and Client-side Pages

| No  | API Name                                  | API Route                                      | HTTP Method | Client-side Pages                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------- | ---------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Get Activity Types**                    | `/api/activity-type`                           | GET         | - `app/event/create/page.tsx`<br>- `app/posts/create/page.tsx`<br>- `app/search/page.tsx`                                                                                                                                                                                                                                    |
| 2   | **Get User Profile**                      | `/api/user/me`                                 | GET         | - `app/event/create/page.tsx`<br>- `app/messages/page.tsx`<br>- `app/posts/[id]/page.tsx`<br>- `app/posts/create/page.tsx`<br>- `app/profile/me/page.tsx`<br>- `app/profile/setup/page.tsx`<br>- `app/requests/page.tsx`<br>- `app/search/page.tsx`<br>- `components/Profile/Events.tsx`<br>- `components/Profile/Posts.tsx` |
| 3   | **Join Activity**                         | `/api/activity_join/[activityId]`              | POST        | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 4   | **Get Public Activity Data**              | `/api/public/activities/[activityId]`          | GET         | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 5   | **Add Comment to Activity**               | `/api/public/activities/[activityId]/comments` | POST        | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 6   | **Get Like Count for Activity**           | `/api/public/activities/[activityId]/like`     | GET         | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 7   | **Like or Unlike Activity**               | `/api/public/activities/[activityId]/like`     | POST        | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 8   | **Create Event**                          | `/api/event/create`                            | POST        | - `app/event/create/page.tsx`                                                                                                                                                                                                                                                                                                |
| 9   | **Get User's Activity Groups**            | `/api/messages/groups`                         | GET         | - `app/messages/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 10  | **Get Messages by Group**                 | `/api/messages/groups/[activityId]`            | GET         | - `app/messages/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 11  | **Send Message in Group**                 | `/api/messages/send`                           | POST        | - `app/messages/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 12  | **Upload Image**                          | `/api/images`                                  | POST        | - `app/event/create/page.tsx`<br>- `app/posts/create/page.tsx`<br>- `app/profile/setup/page.tsx`<br>- `app/messages/page.tsx`                                                                                                                                                                                                |
| 13  | **Get User by ID**                        | `/api/user/[id]`                               | GET         | - `app/profile/[id]/page.tsx`<br>- `components/Profile/Settings.tsx`<br>- `components/Profile/Posts.tsx`                                                                                                                                                                                                                     |
| 14  | **Get User's Posts**                      | `/api/user/[userId]/posts`                     | GET         | - `app/profile/[id]/page.tsx`                                                                                                                                                                                                                                                                                                |
| 15  | **Get User's Events**                     | `/api/user/[userId]/events`                    | GET         | - `app/profile/[id]/page.tsx`                                                                                                                                                                                                                                                                                                |
| 16  | **Search Activities**                     | `/api/search`                                  | GET         | - `app/search/page.tsx`                                                                                                                                                                                                                                                                                                      |
| 17  | **User Signup**                           | `/api/signup`                                  | POST        | - `app/signup/page.tsx`                                                                                                                                                                                                                                                                                                      |
| 18  | **Socket Initialization**                 | `/api/socket`                                  | GET         | - `app/socket.tsx`                                                                                                                                                                                                                                                                                                           |
| 19  | **Update Profile**                        | `/api/profile`                                 | POST        | - `app/profile/setup/page.tsx`                                                                                                                                                                                                                                                                                               |
| 20  | **Send OTP for Password Reset**           | `/api/forget-password`                         | POST        | - `app/forget-password/page.tsx`                                                                                                                                                                                                                                                                                             |
| 21  | **Get Activity Notifications**            | `/api/activity_notifications`                  | GET         | - `components/Header/Navbar.tsx`                                                                                                                                                                                                                                                                                             |
| 22  | **Follow User**                           | `/api/user_follow/[followeeId]`                | POST        | - `components/Profile/Banner.tsx`                                                                                                                                                                                                                                                                                            |
| 23  | **Get User's Events (Authenticated)**     | `/api/event`                                   | GET         | - `components/Profile/Events.tsx`                                                                                                                                                                                                                                                                                            |
| 24  | **Get User's Posts (Authenticated)**      | `/api/post`                                    | GET         | - `components/Profile/Posts.tsx`                                                                                                                                                                                                                                                                                             |
| 25  | **Update User Data**                      | `/api/user/[id]`                               | PUT         | - `components/Profile/Settings.tsx`                                                                                                                                                                                                                                                                                          |
| 26  | **Vote on Join Request**                  | `/api/vote/[requestId]`                        | POST        | - `app/requests/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 27  | **Delete Event**                          | `/api/event/[id]`                              | DELETE      | - `components/Card/eventCard.tsx`<br>- `components/Card/eventCardPrivate.tsx`                                                                                                                                                                                                                                                |
| 28  | **Delete Post**                           | `/api/post/[id]`                               | DELETE      | - `components/Card/postCard.tsx`<br>- `components/Card/postCardPrivate.tsx`                                                                                                                                                                                                                                                  |
| 29  | **Get Top Activities**                    | `/api/public/activities/top`                   | GET         | - `components/Card/TopActivities.tsx`                                                                                                                                                                                                                                                                                        |
| 30  | **Change Password**                       | `/api/change-password`                         | POST        | - `components/Profile/Settings.tsx`                                                                                                                                                                                                                                                                                          |
| 31  | **Accept/Reject Activity Join Request**   | `/api/activity_accept/[requestId]`             | POST        | - `app/requests/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 32  | **Get Join Requests for User's Activity** | `/api/activity_requests`                       | GET         | - `app/requests/page.tsx`                                                                                                                                                                                                                                                                                                    |
| 33  | **Dislike Activity**                      | `/api/public/activities/[activityId]/dislike`  | POST        | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |
| 34  | **Get Dislike Count**                     | `/api/public/activities/[activityId]/dislike`  | GET         | - `app/event/[id]/page.tsx`<br>- `app/posts/[id]/page.tsx`                                                                                                                                                                                                                                                                   |

**Note:** Only APIs referenced in the client-side code are included.

---

## Additional Notes

### Environment Variables

Ensure the following environment variables are set in your `.env` file:

- **Database URL:** `DB_URL` (used by Prisma)
- **NextAuth Secret:** `NEXTAUTH_SECRET` (used to sign JWT tokens)
- **Google OAuth Credentials (if using Google authentication):**
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### Socket.io Configuration

- The application uses **Socket.io** for real-time functionalities.
- The Socket.io URL is specified in `app/socket.tsx`.
- Consider moving the Socket.io URL to an environment variable for flexibility.

### Secure Token Storage

- **Access Tokens** and **Refresh Tokens** should be securely stored on the client-side.
- Use secure storage mechanisms provided by the platform (e.g., `localStorage` or `sessionStorage` in web browsers, secure storage in mobile apps).

### Handling Token Expiration

- The client-side code should handle token expiration and refresh tokens when necessary.
- If an API request fails due to an expired token, the client should attempt to refresh the token and retry the request.

### Prisma ORM

- **Prisma** is used for database interactions.
- After any changes to the database schema, run:

  ```bash
  npx prisma generate
  ```

- If you make changes to the database directly:

  ```bash
  npx prisma db pull
  npx prisma generate
  ```

---

## Conclusion

This README provides essential information to set up and run the application, including details about authentication and the API endpoints used. By following these instructions, developers can effectively work with the application and understand how the client-side pages interact with the backend APIs.

For any further assistance or questions, please refer to the documentation or reach out to the development team.

---

**Note for Mobile Developers (Flutter Integration):**

- When building the mobile application (e.g., in Flutter), ensure that API calls include the necessary JWT tokens in the `Authorization` header.
- Example of setting the `Authorization` header in Flutter:

  ```dart
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/protected-endpoint'),
    headers: {
      'Authorization': 'Bearer your_access_token',
      'Content-Type': 'application/json',
    },
  );
  ```

- Handle token refresh logic by detecting `401 Unauthorized` responses and using the refresh token to obtain a new access token.

---

**Important:**

- **Security Considerations:**

  - Do not expose sensitive information in the client-side code.
  - Ensure that environment variables and secrets are not committed to version control.
  - Use HTTPS for all API calls to secure data in transit.

- **Best Practices:**
  - Validate all user inputs on both client-side and server-side.
  - Implement error handling and provide meaningful feedback to users.
  - Keep dependencies updated to incorporate security patches and new features.

---

**Additional Resources:**

- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **NextAuth.js Documentation:** [https://next-auth.js.org/](https://next-auth.js.org/)
- **Prisma Documentation:** [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
- **Flutter HTTP Package:** [https://pub.dev/packages/http](https://pub.dev/packages/http)
- **JWT Introduction:** [https://jwt.io/introduction/](https://jwt.io/introduction/)

---

**Contact Information:**

For questions or support, please contact the development team at [email@example.com](mailto:email@example.com).

---

# End of README

---

I hope this README provides clear instructions and helpful information for setting up and working with the application. If you have any further questions or need additional details, feel free to reach out!
