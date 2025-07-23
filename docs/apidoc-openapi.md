Below is the comprehensive API documentation that maps client-side pages to the API routes they interact with. Each section corresponds to a client-side `page.tsx` file and includes the API calls made from that page, the sequence of calls, parameters, whether the route is protected or public, sample code to call the API via fetch/Postman, and OpenAPI documentation snippets.

---

## Table of Contents

1. [app/page.tsx](#app-pagetsx)
2. [app/event/[id]/page.tsx](#app-eventidpagetsx)
3. [app/event/create/page.tsx](#app-eventcreatepagetsx)
4. [app/messages/page.tsx](#app-messagespagetsx)
5. [app/posts/[id]/page.tsx](#app-postsidpagetsx)
6. [app/posts/create/page.tsx](#app-postscreatepagetsx)
7. [app/profile/[id]/page.tsx](#app-profileidpagetsx)
8. [app/profile/me/page.tsx](#app-profilemepagetsx)
9. [app/profile/setup/page.tsx](#app-profilesetuppagetsx)
10. [app/requests/page.tsx](#app-requestspagetsx)
11. [app/search/page.tsx](#app-searchpagetsx)
12. [app/signup/page.tsx](#app-signuppagetsx)
13. [components/Profile/Settings.tsx](#componentsprofilesettingstsx)
14. [components/Card/eventCard.tsx](#componentscardeventcardtsx)
15. [components/Card/postCard.tsx](#componentscardpostcardtsx)
16. [components/Header/Navbar.tsx](#componentsheadernavbartsx)
17. [components/Profile/Banner.tsx](#componentsprofilebannertsx)
18. [components/Profile/Events.tsx](#componentsprofileeventstsx)
19. [components/Profile/Posts.tsx](#componentsprofilepoststsx)

---

### app/page.tsx

**Description:**

- The home page of the application. It displays activity types and associated activities.

**APIs Called:**

1. **GET `/api/user/{id}`**

   - **Purpose:** Fetch user data based on user ID.
   - **When Called:** On page load to get user-specific data.
   - **Protected:** Yes (requires authentication).
   - **Parameters:**
     - **Path Parameter:** `id` (User ID from session)
   - **Sample Code:**

     ```javascript
     axios.get(`/api/user/${session.user?.id}`, {
       withCredentials: true,
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/user/{id}:
       get:
         summary: Get User by ID
         security:
           - bearerAuth: []
         parameters:
           - in: path
             name: id
             required: true
             schema:
               type: string
         responses:
           "200":
             description: User data retrieved successfully
           "401":
             description: Unauthorized
     ```

2. **GET `/api/activity-type`**

   - **Purpose:** Fetch all activity types.
   - **When Called:** On page load to display available activity types.
   - **Protected:** Yes (requires authentication).
   - **Parameters:** None
   - **Sample Code:**

     ```javascript
     axios.get(`/api/activity-type`, {
       withCredentials: true,
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/activity-type:
       get:
         summary: Get Activity Types
         security:
           - bearerAuth: []
         responses:
           "200":
             description: Activity types retrieved successfully
           "401":
             description: Unauthorized
     ```

3. **GET `/api/activities/{activityTypeId}`**

   - **Purpose:** Fetch activities for a specific activity type.
   - **When Called:** After fetching activity types, to display activities under each type.
   - **Protected:** No (public route).
   - **Parameters:**
     - **Path Parameter:** `activityTypeId`
   - **Sample Code:**

     ```javascript
     axios.get(`/api/activities/${type.id}`);
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/activities/{activityTypeId}:
       get:
         summary: Get Activities by Type
         parameters:
           - in: path
             name: activityTypeId
             required: true
             schema:
               type: string
         responses:
           "200":
             description: Activities retrieved successfully
           "404":
             description: Activity type not found
     ```

**Sequence of Calls:**

1. Fetch user data to personalize the experience.
2. Fetch all activity types.
3. For each activity type, fetch associated activities.

**Sample Fetch/Postman Request:**

- **GET `/api/user/{id}`**

  ```javascript
  fetch(`/api/user/${userId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: "Bearer your_access_token",
    },
  });
  ```

- **GET `/api/activity-type`**

  ```javascript
  fetch("/api/activity-type", {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: "Bearer your_access_token",
    },
  });
  ```

- **GET `/api/activities/{activityTypeId}`**

  ```javascript
  fetch(`/api/activities/${activityTypeId}`, {
    method: "GET",
  });
  ```

---

### app/event/[id]/page.tsx

**Description:**

- Displays detailed information about a specific event, including comments, likes, and the ability to join.

**APIs Called:**

1. **GET `/api/user/me`**

   - **Purpose:** Fetch current user's data.
   - **When Called:** On page load.
   - **Protected:** Yes
   - **Parameters:** None
   - **Sample Code:**

     ```javascript
     axios.get(`/api/user/me`, {
       withCredentials: true,
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/user/me:
       get:
         summary: Get Current User Data
         security:
           - bearerAuth: []
         responses:
           "200":
             description: User data retrieved successfully
           "401":
             description: Unauthorized
     ```

2. **GET `/api/public/activities/{activityId}`**

   - **Purpose:** Fetch event details.
   - **When Called:** On page load.
   - **Protected:** No
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.get(`/api/public/activities/${id}`);
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/public/activities/{activityId}:
       get:
         summary: Get Public Activity Data
         parameters:
           - in: path
             name: activityId
             required: true
             schema:
               type: string
         responses:
           "200":
             description: Activity data retrieved successfully
           "404":
             description: Activity not found
     ```

3. **POST `/api/activity_join/{activityId}`**

   - **Purpose:** Send a join request for the event.
   - **When Called:** When the user clicks the "Join" button.
   - **Protected:** Yes
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.post(
       `/api/activity_join/${id}`,
       {},
       {
         withCredentials: true,
       }
     );
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/activity_join/{activityId}:
       post:
         summary: Join Activity
         security:
           - bearerAuth: []
         parameters:
           - in: path
             name: activityId
             required: true
             schema:
               type: string
         responses:
           "200":
             description: Join request sent successfully
           "400":
             description: Bad request
           "401":
             description: Unauthorized
     ```

4. **POST `/api/public/activities/{activityId}/comments`**

   - **Purpose:** Add a comment and rating to the event.
   - **When Called:** When the user submits a comment.
   - **Protected:** Yes
   - **Parameters:**
     - **Path Parameter:** `activityId`
     - **Body (JSON):** `comment`, `rating`
   - **Sample Code:**

     ```javascript
     axios.post(
       `/api/public/activities/${id}/comments`,
       {
         comment: newCommentData.comment,
         rating: newCommentData.rating,
       },
       {
         withCredentials: true,
       }
     );
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/public/activities/{activityId}/comments:
       post:
         summary: Add Comment
         security:
           - bearerAuth: []
         parameters:
           - in: path
             name: activityId
             required: true
             schema:
               type: string
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   comment:
                     type: string
                   rating:
                     type: integer
         responses:
           "200":
             description: Comment added successfully
           "400":
             description: Missing parameters
           "401":
             description: Unauthorized
     ```

5. **GET `/api/public/activities/{activityId}/like`**

   - **Purpose:** Get the like count for the event.
   - **When Called:** On page load and after liking.
   - **Protected:** No
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.get(`/api/public/activities/${eventData?.id}/like`, {
       withCredentials: true,
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/public/activities/{activityId}/like:
       get:
         summary: Get Like Count
         parameters:
           - in: path
             name: activityId
             required: true
             schema:
               type: string
         responses:
           "200":
             description: Like count retrieved successfully
           "400":
             description: Missing activityId
     ```

6. **POST `/api/public/activities/{activityId}/like`**

   - **Purpose:** Like or unlike the event.
   - **When Called:** When the user clicks the "Like" button.
   - **Protected:** Yes
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.post(
       `/api/public/activities/${eventData?.id}/like`,
       {},
       {
         withCredentials: true,
       }
     );
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/public/activities/{activityId}/like:
       post:
         summary: Like Activity
         security:
           - bearerAuth: []
         parameters:
           - in: path
             name: activityId
             required: true
             schema:
               type: string
         responses:
           "200":
             description: Like action successful
           "400":
             description: Missing activityId
           "401":
             description: Unauthorized
     ```

7. **GET `/api/public/activities/{activityId}/dislike`**

   - **Purpose:** Get the dislike count for the event.
   - **When Called:** On page load and after disliking.
   - **Protected:** No
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.get(`/api/public/activities/${eventData?.id}/dislike`, {
       withCredentials: true,
     });
     ```

8. **POST `/api/public/activities/{activityId}/dislike`**

   - **Purpose:** Dislike or undislike the event.
   - **When Called:** When the user clicks the "Dislike" button.
   - **Protected:** Yes
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.post(
       `/api/public/activities/${eventData?.id}/dislike`,
       {},
       {
         withCredentials: true,
       }
     );
     ```

**Sequence of Calls:**

1. Fetch current user's data.
2. Fetch event details.
3. Fetch like and dislike counts.
4. User interactions (join, comment, like, dislike) trigger respective API calls.

**Sample Fetch/Postman Request:**

- **POST `/api/activity_join/{activityId}`**

  ```javascript
  fetch(`/api/activity_join/${activityId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: "Bearer your_access_token",
    },
  });
  ```

- **POST `/api/public/activities/{activityId}/comments`**

  ```javascript
  fetch(`/api/public/activities/${activityId}/comments`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your_access_token",
    },
    body: JSON.stringify({
      comment: "Great event!",
      rating: 5,
    }),
  });
  ```

---

### app/event/create/page.tsx

**Description:**

- Allows users to create a new event with details and images.

**APIs Called:**

1. **GET `/api/user/me`**

   - **Purpose:** Fetch current user's data.
   - **When Called:** On page load.
   - **Protected:** Yes
   - **Sample Code:**

     ```javascript
     axios.get(`/api/user/me`, {
       withCredentials: true,
     });
     ```

2. **GET `/api/activity-type`**

   - **Purpose:** Fetch available activity types.
   - **When Called:** On page load to populate dropdowns.
   - **Protected:** Yes
   - **Sample Code:**

     ```javascript
     axios.get(`/api/activity-type`, {
       withCredentials: true,
     });
     ```

3. **POST `/api/event/create`**

   - **Purpose:** Create a new event.
   - **When Called:** When the user submits the event creation form.
   - **Protected:** Yes
   - **Parameters:**
     - **Body (JSON):** Event details (`title`, `sub_title`, `activity_type_id`, etc.)
   - **Sample Code:**

     ```javascript
     axios.post(`/api/event/create`, body, {
       withCredentials: true,
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/event/create:
       post:
         summary: Create Event
         security:
           - bearerAuth: []
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 $ref: "#/components/schemas/EventCreation"
         responses:
           "201":
             description: Event created successfully
           "400":
             description: Validation error
           "401":
             description: Unauthorized
     ```

4. **POST `/api/images`**

   - **Purpose:** Upload images associated with the event.
   - **When Called:** After the event is created.
   - **Protected:** Yes
   - **Parameters:**
     - **FormData:** `image` or `imagelist`, `bucket_name`, `activity_id`
   - **Sample Code:**

     ```javascript
     fetch("/api/images", {
       method: "POST",
       body: imageFormData,
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
     });
     ```

   - **OpenAPI Specification:**

     ```yaml
     /api/images:
       post:
         summary: Upload Images
         security:
           - bearerAuth: []
         requestBody:
           required: true
           content:
             multipart/form-data:
               schema:
                 type: object
                 properties:
                   image:
                     type: string
                     format: binary
                   imagelist:
                     type: array
                     items:
                       type: string
                       format: binary
                   bucket_name:
                     type: string
                   activity_id:
                     type: string
         responses:
           "200":
             description: Images uploaded successfully
           "400":
             description: Bad request
           "401":
             description: Unauthorized
     ```

**Sequence of Calls:**

1. Fetch user data and activity types on page load.
2. Upon form submission, create the event.
3. If images are included, upload them using the event ID returned from event creation.

**Sample Fetch/Postman Request:**

- **POST `/api/event/create`**

  ```javascript
  fetch("/api/event/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your_access_token",
    },
    body: JSON.stringify({
      title: "My Event",
      sub_title: "An amazing event",
      activity_type_id: "type_id",
      location: "City, ZIP",
      start_time: "2023-10-10 10:00:00",
      end_time: "2023-10-10 12:00:00",
      rules: "Be nice",
      contact_info: "Contact me at...",
      url: "https://example.com",
      description: "Event description",
    }),
  });
  ```

- **POST `/api/images`**

  ```javascript
  const formData = new FormData();
  formData.append("image", file); // For single image
  formData.append("imagelist", fileList); // For multiple images
  formData.append("bucket_name", "activities");
  formData.append("activity_id", "event_id");

  fetch("/api/images", {
    method: "POST",
    headers: {
      Authorization: "Bearer your_access_token",
    },
    body: formData,
  });
  ```

---

### app/messages/page.tsx

**Description:**

- Displays messaging interface for activities the user is part of.

**APIs Called:**

1. **GET `/api/user/me`**

   - **Purpose:** Fetch current user's data.
   - **When Called:** On page load.
   - **Protected:** Yes

2. **GET `/api/messages/groups`**

   - **Purpose:** Fetch groups (activities) the user can message in.
   - **When Called:** On page load.
   - **Protected:** Yes
   - **Sample Code:**

     ```javascript
     axios.get(`/api/messages/groups`, {
       withCredentials: true,
     });
     ```

3. **GET `/api/messages/groups/{activityId}`**

   - **Purpose:** Fetch messages for a specific group.
   - **When Called:** When a group is selected.
   - **Protected:** Yes
   - **Parameters:**
     - **Path Parameter:** `activityId`
   - **Sample Code:**

     ```javascript
     axios.get(`/api/messages/groups/${selectedActivityId}`, {
       withCredentials: true,
     });
     ```

4. **POST `/api/messages/send`**

   - **Purpose:** Send a message in a group.
   - **When Called:** When the user sends a message.
   - **Protected:** Yes
   - **Parameters:**
     - **Body (JSON):** `activity_id`, `messages`
   - **Sample Code:**

     ```javascript
     axios.post(`/api/messages/send`, body, {
       withCredentials: true,
     });
     ```

5. **POST `/api/images`**

   - **Purpose:** Upload images in messages.
   - **When Called:** When sending images in messages.
   - **Protected:** Yes

**Sequence of Calls:**

1. Fetch user data and groups on page load.
2. Fetch messages when a group is selected.
3. Send messages and upload images as needed.

---

### app/posts/[id]/page.tsx

**Description:**

- Displays a specific post, including comments, likes, and options to join.

**APIs Called:**

Similar to `app/event/[id]/page.tsx`, but for posts.

---

### app/posts/create/page.tsx

**Description:**

- Allows users to create a new post.

**APIs Called:**

Similar to `app/event/create/page.tsx`, but uses `/api/post/create` instead of `/api/event/create`.

---

### app/profile/[id]/page.tsx

**Description:**

- Displays another user's profile, including their posts and events.

**APIs Called:**

1. **GET `/api/user/{id}`**

   - **Purpose:** Fetch user data for the profile being viewed.
   - **Parameters:**
     - **Path Parameter:** `id`
   - **Protected:** No

2. **GET `/api/user/{id}/posts`**

   - **Purpose:** Fetch posts created by the user.
   - **Protected:** Yes

3. **GET `/api/user/{id}/events`**

   - **Purpose:** Fetch events created by the user.
   - **Protected:** Yes

---

### app/profile/me/page.tsx

**Description:**

- Displays the current user's profile.

**APIs Called:**

1. **GET `/api/user/me`**

   - Fetches current user's data.

---

### app/profile/setup/page.tsx

**Description:**

- Allows the user to set up or update their profile.

**APIs Called:**

1. **GET `/api/user/me`**

   - Fetches current user's data.

2. **POST `/api/images`**

   - Uploads profile picture.

3. **POST `/api/profile`**

   - Updates profile information.

**Sample Fetch/Postman Request for Updating Profile:**

```javascript
const formData = new FormData();
formData.append("username", "new_username");
formData.append("name", "Full Name");
formData.append("location", "City, ZIP");
formData.append("age_group", "25-30");
formData.append("about_me", "About me...");
formData.append("profile_pic", "profile_pic_url");

fetch("/api/profile", {
  method: "POST",
  headers: {
    Authorization: "Bearer your_access_token",
  },
  body: formData,
});
```

---

### app/requests/page.tsx

**Description:**

- Displays join requests related to the user's activities.

**APIs Called:**

1. **GET `/api/user/me`**

   - Fetches current user's data.

2. **GET `/api/activity_requests`**

   - Fetches pending, voting, accepted requests.

3. **POST `/api/vote/{requestId}`**

   - Votes on a join request.

4. **POST `/api/activity_accept/{requestId}`**

   - Accepts or rejects a join request.

---

### app/search/page.tsx

**Description:**

- Allows users to search for activities.

**APIs Called:**

1. **GET `/api/user/me`**

2. **GET `/api/activity-type`**

3. **GET `/api/search`**

   - Fetches activities based on search criteria.

---

### app/signup/page.tsx

**Description:**

- User signup page.

**APIs Called:**

1. **POST `/api/signup`**

   - Registers a new user.

**Sample Fetch/Postman Request:**

```javascript
fetch("/api/signup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
```

---

### components/Profile/Settings.tsx

**Description:**

- Allows the user to update settings like changing password.

**APIs Called:**

1. **POST `/api/change-password`**

   - Updates the user's password.

---

### components/Card/eventCard.tsx

**Description:**

- Displays event cards with options to delete.

**APIs Called:**

1. **DELETE `/api/event/{id}`**

   - Deletes an event.

---

### components/Card/postCard.tsx

**Description:**

- Displays post cards with options to delete.

**APIs Called:**

1. **DELETE `/api/post/{id}`**

   - Deletes a post.

---

### components/Header/Navbar.tsx

**Description:**

- Displays the navigation bar with notifications.

**APIs Called:**

1. **GET `/api/activity_notifications`**

   - Fetches notifications for the user.

---

### components/Profile/Banner.tsx

**Description:**

- Displays the profile banner with follow functionality.

**APIs Called:**

1. **POST `/api/user_follow/{followeeId}`**

   - Follows a user.

---

### components/Profile/Events.tsx

**Description:**

- Displays the current user's events.

**APIs Called:**

1. **GET `/api/event`**

   - Fetches events created by the user.

---

### components/Profile/Posts.tsx

**Description:**

- Displays the current user's posts.

**APIs Called:**

1. **GET `/api/post`**

   - Fetches posts created by the user.

---

## Conclusion

This comprehensive API documentation maps each client-side page to the API routes it interacts with, providing details on the purpose, when the API is called, parameters, protection status, sample code, and OpenAPI specifications. This should aid in understanding the flow of data and how client-side actions correspond to server-side operations.

---

**Note:** Replace `your_access_token` with the actual token obtained during authentication when making protected API calls. The OpenAPI specifications are partial and intended to provide a general idea; they should be expanded with full request and response schemas for complete documentation.
