Certainly! Below is a properly formatted markdown version of the API routes and corresponding Flutter code. For each API, I've included the route, method, client-side pages where it's used, and the Flutter code snippet. Comments are added to explain the purpose of each code snippet.

---

## API Routes and Corresponding Flutter Code

### 1. Get Activity Types

- **API Route:** `/api/activity-type`
- **Method:** GET
- **Used in Pages:**
  - `app/event/create/page.tsx`
  - `app/posts/create/page.tsx`
  - `app/search/page.tsx`

```dart
// Fetching activity types when the page loads
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<ActivityType>> fetchActivityTypes() async {
  final response = await http.get(Uri.parse('https://your-api-url.com/api/activity-type'));

  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((item) => ActivityType.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load activity types');
  }
}
```

**Comment:** Fetches activity types when the page loads.

---

### 2. Get User Profile

- **API Route:** `/api/user/me`
- **Method:** GET
- **Used in Pages:** Multiple pages including profile and settings

```dart
// Fetching the user's profile data
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<UserProfile> fetchUserProfile(String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/user/me'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return UserProfile.fromJson(data);
  } else {
    throw Exception('Failed to load user profile');
  }
}
```

**Comment:** Fetches the user's profile data for authenticated pages.

---

### 3. Join Activity

- **API Route:** `/api/activity_join/[activityId]`
- **Method:** POST
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Sending a join request to an activity
import 'package:http/http.dart' as http;

Future<void> joinActivity(String activityId, String jwtToken) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/activity_join/$activityId'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Successfully joined the activity
  } else {
    throw Exception('Failed to join activity');
  }
}
```

**Comment:** Sends a join request to an activity.

---

### 4. Get Public Activity Data

- **API Route:** `/api/public/activities/[activityId]`
- **Method:** GET
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Fetching activity details when the page loads
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Activity> fetchActivityDetails(String activityId) async {
  final response = await http.get(Uri.parse('https://your-api-url.com/api/public/activities/$activityId'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return Activity.fromJson(data['data'][0]);
  } else {
    throw Exception('Failed to load activity details');
  }
}
```

**Comment:** Fetches activity details when the page loads.

---

### 5. Add Comment to Activity

- **API Route:** `/api/public/activities/[activityId]/comments`
- **Method:** POST
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Adding a comment to an activity
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> addComment(
  String activityId,
  String comment,
  int rating,
  String jwtToken,
) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/public/activities/$activityId/comments'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'comment': comment,
      'rating': rating,
    }),
  );

  if (response.statusCode == 200) {
    // Comment added successfully
  } else {
    throw Exception('Failed to add comment');
  }
}
```

**Comment:** Adds a comment to an activity.

---

### 6. Get Like Count for Activity

- **API Route:** `/api/public/activities/[activityId]/like`
- **Method:** GET
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Fetching like count of an activity
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<int> fetchLikeCount(String activityId) async {
  final response = await http.get(Uri.parse('https://your-api-url.com/api/public/activities/$activityId/like'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['count'];
  } else {
    throw Exception('Failed to fetch like count');
  }
}
```

**Comment:** Fetches the like count of an activity.

---

### 7. Like or Unlike Activity

- **API Route:** `/api/public/activities/[activityId]/like`
- **Method:** POST
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Liking or unliking an activity
import 'package:http/http.dart' as http;

Future<void> toggleLikeActivity(String activityId, String jwtToken) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/public/activities/$activityId/like'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Like toggled successfully
  } else {
    throw Exception('Failed to like/unlike activity');
  }
}
```

**Comment:** Toggles like status on an activity.

---

### 8. Create Event

- **API Route:** `/api/event/create`
- **Method:** POST
- **Used in Pages:** `app/event/create/page.tsx`

```dart
// Creating a new event
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> createEvent(Map<String, dynamic> eventData, String jwtToken) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/event/create'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'Content-Type': 'application/json',
    },
    body: jsonEncode(eventData),
  );

  if (response.statusCode == 200) {
    // Event created successfully
  } else {
    throw Exception('Failed to create event');
  }
}
```

**Comment:** Creates a new event with the provided data.

---

### 9. Get User's Activity Groups

- **API Route:** `/api/messages/groups`
- **Method:** GET
- **Used in Pages:** `app/messages/page.tsx`

```dart
// Fetching user's activity groups
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Group>> fetchUserGroups(String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/messages/groups'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['groups'] as List)
        .map((item) => Group.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to load groups');
  }
}
```

**Comment:** Fetches the list of activity groups the user is part of.

---

### 10. Get Messages by Group

- **API Route:** `/api/messages/groups/[activityId]`
- **Method:** GET
- **Used in Pages:** `app/messages/page.tsx`

```dart
// Fetching messages for a specific group
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Message>> fetchGroupMessages(
  String activityId,
  String jwtToken,
) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/messages/groups/$activityId'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['messages'] as List)
        .map((item) => Message.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to load messages');
  }
}
```

**Comment:** Fetches messages for a specific activity group.

---

### 11. Send Message in Group

- **API Route:** `/api/messages/send`
- **Method:** POST
- **Used in Pages:** `app/messages/page.tsx`

```dart
// Sending a message in a group
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> sendMessage(
  String activityId,
  String messageContent,
  String jwtToken,
) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/messages/send'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'activity_id': activityId,
      'messages': messageContent,
    }),
  );

  if (response.statusCode == 200) {
    // Message sent successfully
  } else {
    throw Exception('Failed to send message');
  }
}
```

**Comment:** Sends a message in a specific activity group.

---

### 12. Upload Image

- **API Route:** `/api/images`
- **Method:** POST
- **Used in Pages:** Multiple pages including image uploads

```dart
// Uploading an image
import 'package:dio/dio.dart';
import 'package:path/path.dart';

Future<void> uploadImage(
  File imageFile,
  String bucketName,
  String jwtToken, {
  String? activityId,
  String? messageId,
}) async {
  Dio dio = Dio();
  dio.options.headers['Authorization'] = 'Bearer $jwtToken';

  FormData formData = FormData.fromMap({
    'bucket_name': bucketName,
    if (activityId != null) 'activity_id': activityId,
    if (messageId != null) 'message_id': messageId,
    'image': await MultipartFile.fromFile(
      imageFile.path,
      filename: basename(imageFile.path),
    ),
  });

  final response = await dio.post(
    'https://your-api-url.com/api/images',
    data: formData,
  );

  if (response.statusCode == 200) {
    // Image uploaded successfully
  } else {
    throw Exception('Failed to upload image');
  }
}
```

**Comment:** Uploads images for activities, messages, or profiles using multipart/form-data.

---

### 13. Get User by ID

- **API Route:** `/api/user/[id]`
- **Method:** GET
- **Used in Pages:**
  - `app/profile/[id]/page.tsx`
  - `components/Profile/Settings.tsx`
  - `components/Profile/Posts.tsx`

```dart
// Fetching a user by ID
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<UserProfile> fetchUserById(String userId, String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/user/$userId'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return UserProfile.fromJson(data);
  } else {
    throw Exception('Failed to fetch user data');
  }
}
```

**Comment:** Fetches user data by user ID.

---

### 14. Get User's Posts

- **API Route:** `/api/user/[userId]/posts`
- **Method:** GET
- **Used in Pages:** `app/profile/[id]/page.tsx`

```dart
// Fetching a user's posts
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Post>> fetchUserPosts(String userId, String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/user/$userId/posts'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['posts'] as List)
        .map((item) => Post.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to fetch user posts');
  }
}
```

**Comment:** Fetches posts created by a specific user.

---

### 15. Get User's Events

- **API Route:** `/api/user/[userId]/events`
- **Method:** GET
- **Used in Pages:** `app/profile/[id]/page.tsx`

```dart
// Fetching a user's events
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Event>> fetchUserEvents(String userId, String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/user/$userId/events'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['events'] as List)
        .map((item) => Event.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to fetch user events');
  }
}
```

**Comment:** Fetches events created by a specific user.

---

### 16. Search Activities

- **API Route:** `/api/search`
- **Method:** GET
- **Used in Pages:** `app/search/page.tsx`

```dart
// Searching for activities
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Activity>> searchActivities(Map<String, String> filters) async {
  final uri = Uri.https('your-api-url.com', '/api/search', filters);
  final response = await http.get(uri);

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['data'] as List)
        .map((item) => Activity.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to search activities');
  }
}
```

**Comment:** Searches for activities based on filters like title, date, category, etc.

---

### 17. User Signup

- **API Route:** `/api/signup`
- **Method:** POST
- **Used in Pages:** `app/signup/page.tsx`

```dart
// Signing up a new user
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> signupUser(String email, String password) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/signup'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    // Signup successful
  } else {
    throw Exception('Failed to sign up');
  }
}
```

**Comment:** Registers a new user with email and password.

---

### 18. Update Profile

- **API Route:** `/api/profile`
- **Method:** POST
- **Used in Pages:** `app/profile/setup/page.tsx`

```dart
// Updating user profile
import 'package:dio/dio.dart';

Future<void> updateProfile(
  Map<String, dynamic> profileData,
  String jwtToken,
) async {
  Dio dio = Dio();
  dio.options.headers['Authorization'] = 'Bearer $jwtToken';

  FormData formData = FormData.fromMap(profileData);

  final response = await dio.post(
    'https://your-api-url.com/api/profile',
    data: formData,
  );

  if (response.statusCode == 200) {
    // Profile updated successfully
  } else {
    throw Exception('Failed to update profile');
  }
}
```

**Comment:** Updates the user's profile information. Uses multipart/form-data if including profile picture.

---

### 19. Accept/Reject Activity Join Request

- **API Route:** `/api/activity_accept/[requestId]`
- **Method:** POST
- **Used in Pages:** `app/requests/page.tsx`

```dart
// Accepting or rejecting a join request
import 'package:http/http.dart' as http;

Future<void> handleJoinRequest(
  String requestId,
  String action,
  String jwtToken,
) async {
  final uri = Uri.parse(
    'https://your-api-url.com/api/activity_accept/$requestId?action=$action',
  );
  final response = await http.post(
    uri,
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Action successful
  } else {
    throw Exception('Failed to process join request');
  }
}
```

**Comment:** Accepts or rejects a join request based on the action (`'accept'` or `'reject'`).

---

### 20. Get Join Requests for User's Activity

- **API Route:** `/api/activity_requests`
- **Method:** GET
- **Used in Pages:** `app/requests/page.tsx`

```dart
// Fetching join requests for user's activities
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<JoinRequest>> fetchJoinRequests(String jwtToken) async {
  final response = await http.get(
    Uri.parse('https://your-api-url.com/api/activity_requests'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return (data['requests'] as List)
        .map((item) => JoinRequest.fromJson(item))
        .toList();
  } else {
    throw Exception('Failed to fetch join requests');
  }
}
```

**Comment:** Retrieves join requests for activities the user manages.

---

### 21. Dislike Activity

- **API Route:** `/api/public/activities/[activityId]/dislike`
- **Method:** POST
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Disliking or undisliking an activity
import 'package:http/http.dart' as http;

Future<void> toggleDislikeActivity(String activityId, String jwtToken) async {
  final response = await http.post(
    Uri.parse('https://your-api-url.com/api/public/activities/$activityId/dislike'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Dislike toggled successfully
  } else {
    throw Exception('Failed to dislike/undislike activity');
  }
}
```

**Comment:** Toggles dislike status on an activity.

---

### 22. Get Dislike Count

- **API Route:** `/api/public/activities/[activityId]/dislike`
- **Method:** GET
- **Used in Pages:**
  - `app/event/[id]/page.tsx`
  - `app/posts/[id]/page.tsx`

```dart
// Fetching dislike count of an activity
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<int> fetchDislikeCount(String activityId) async {
  final response = await http.get(Uri.parse('https://your-api-url.com/api/public/activities/$activityId/dislike'));

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['count'];
  } else {
    throw Exception('Failed to fetch dislike count');
  }
}
```

**Comment:** Fetches the dislike count of an activity.

---

### 23. Delete Event

- **API Route:** `/api/event/[id]`
- **Method:** DELETE
- **Used in Pages:**
  - `components/Card/eventCard.tsx`
  - `components/Card/eventCardPrivate.tsx`

```dart
// Deleting an event
import 'package:http/http.dart' as http;

Future<void> deleteEvent(String eventId, String jwtToken) async {
  final response = await http.delete(
    Uri.parse('https://your-api-url.com/api/event/$eventId'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Event deleted successfully
  } else {
    throw Exception('Failed to delete event');
  }
}
```

**Comment:** Deletes a specific event managed by the user.

---

### 24. Delete Post

- **API Route:** `/api/post/[id]`
- **Method:** DELETE
- **Used in Pages:**
  - `components/Card/postCard.tsx`
  - `components/Card/postCardPrivate.tsx`

```dart
// Deleting a post
import 'package:http/http.dart' as http;

Future<void> deletePost(String postId, String jwtToken) async {
  final response = await http.delete(
    Uri.parse('https://your-api-url.com/api/post/$postId'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
    },
  );

  if (response.statusCode == 200) {
    // Post deleted successfully
  } else {
    throw Exception('Failed to delete post');
  }
}
```

**Comment:** Deletes a specific post created by the user.

---

**Note:** Replace `'https://your-api-url.com'` with your actual API base URL. Ensure that you have defined the data models (e.g., `ActivityType`, `UserProfile`, `Activity`, `Message`, `Group`, `Post`, `Event`, `JoinRequest`) with appropriate `fromJson` factory constructors to parse JSON responses.

**Libraries Used:**

- [`http`](https://pub.dev/packages/http) package for making HTTP requests
- [`dio`](https://pub.dev/packages/dio) package for advanced HTTP requests and handling multipart/form-data
- [`path`](https://pub.dev/packages/path) package for manipulating file paths when uploading files

**Handling JWT Tokens:**

- Store the JWT token securely upon user authentication.
- Include the token in the `Authorization` header for protected routes.
- Example:

  ```dart
  headers: {
    'Authorization': 'Bearer $jwtToken',
  }
  ```

**Handling Multipart/Form-Data:**

- Use the `dio` package for handling file uploads with multipart/form-data.
- Example:

  ```dart
  FormData formData = FormData.fromMap({
    'key': 'value',
    'file': await MultipartFile.fromFile(
      file.path,
      filename: basename(file.path),
    ),
  });
  ```

**Comments:**

- Each code snippet includes a comment explaining its purpose, such as fetching data when the page loads, sending a request, or uploading an image.

**Usage:**

- Replace placeholder URLs and parameters with actual values.
- Ensure error handling is appropriate for your application's needs.
- Test each API call thoroughly to confirm correct behavior.

---

Feel free to let me know if you need further assistance or modifications!
