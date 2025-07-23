<table>
<tr>
<th>No</th>
<th>API Name</th>
<th>API Route</th>
<th>HTTP Method</th>
<th>Client-side Pages</th>
<th>Flutter Code</th>
</tr>

<tr>
<td>1</td>
<td>Get Activity Types</td>
<td>/api/activity-type</td>
<td>GET</td>
<td>app/event/create/page.tsx, app/posts/create/page.tsx, app/search/page.tsx</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<ActivityType>> fetchActivityTypes() async {
final response = await http.get(Uri.parse('http://localhost:3000/api/activity-type'));

if (response.statusCode == 200) {
final List<dynamic> data = jsonDecode(response.body);
return data.map((item) => ActivityType.fromJson(item)).toList();
} else {
throw Exception('Failed to load activity types');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>2</td>
<td>Get User Profile</td>
<td>/api/user/me</td>
<td>GET</td>
<td>Profile, Settings</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<UserProfile> fetchUserProfile(String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/user/me'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return UserProfile.fromJson(data);
} else {
throw Exception('Failed to load user profile');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>3</td>
<td>Join Activity</td>
<td>/api/activity_join/[activityId]</td>
<td>POST</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> joinActivity(String activityId, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/activity_join/$activityId'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to join activity');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>4</td>
<td>Get Public Activity Data</td>
<td>/api/public/activities/[activityId]</td>
<td>GET</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Activity> fetchActivityDetails(String activityId) async {
final response = await http.get(Uri.parse('http://localhost:3000/api/public/activities/$activityId'));

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return Activity.fromJson(data['data'][0]);
} else {
throw Exception('Failed to load activity details');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>5</td>
<td>Add Comment to Activity</td>
<td>/api/public/activities/[activityId]/comments</td>
<td>POST</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> addComment(String activityId, String comment, int rating, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/public/activities/$activityId/comments'),
headers: {
'Authorization': 'Bearer $jwtToken',
'Content-Type': 'application/json',
},
body: jsonEncode({'comment': comment, 'rating': rating}),
);

if (response.statusCode != 200) {
throw Exception('Failed to add comment');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>6</td>
<td>Get Like Count for Activity</td>
<td>/api/public/activities/[activityId]/like</td>
<td>GET</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<int> fetchLikeCount(String activityId) async {
final response = await http.get(Uri.parse('http://localhost:3000/api/public/activities/$activityId/like'));

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['count'];
} else {
throw Exception('Failed to fetch like count');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>7</td>
<td>Like or Unlike Activity</td>
<td>/api/public/activities/[activityId]/like</td>
<td>POST</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> toggleLikeActivity(String activityId, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/public/activities/$activityId/like'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to like/unlike activity');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>8</td>
<td>Create Event</td>
<td>/api/event/create</td>
<td>POST</td>
<td>Create Event</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> createEvent(Map<String, dynamic> eventData, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/event/create'),
headers: {
'Authorization': 'Bearer $jwtToken',
'Content-Type': 'application/json',
},
body: jsonEncode(eventData),
);

if (response.statusCode != 200) {
throw Exception('Failed to create event');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>9</td>
<td>Get User's Activity Groups</td>
<td>/api/messages/groups</td>
<td>GET</td>
<td>Messages Group View</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Group>> fetchUserGroups(String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/messages/groups'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['groups'].map<Group>((item) => Group.fromJson(item)).toList();
} else {
throw Exception('Failed to load groups');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>10</td>
<td>Get Messages by Group</td>
<td>/api/messages/groups/[activityId]</td>
<td>GET</td>
<td>Messages Group View</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Message>> fetchGroupMessages(String activityId, String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/messages/groups/$activityId'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['messages'].map<Message>((item) => Message.fromJson(item)).toList();
} else {
throw Exception('Failed to load messages');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>11</td>
<td>Send Message in Group</td>
<td>/api/messages/send</td>
<td>POST</td>
<td>Messages Group View</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> sendMessage(String activityId, String messageContent, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/messages/send'),
headers: {
'Authorization': 'Bearer $jwtToken',
'Content-Type': 'application/json',
},
body: jsonEncode({
'activity_id': activityId,
'messages': messageContent,
}),
);

if (response.statusCode != 200) {
throw Exception('Failed to send message');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>12</td>
<td>Upload Image</td>
<td>/api/images</td>
<td>POST</td>
<td>Multiple pages including image uploads</td>
<td>
<pre><code class="language-dart">
import 'package:dio/dio.dart';
import 'package:path/path.dart';

Future<void> uploadImage(File imageFile, String bucketName, String jwtToken, {String activityId, String messageId}) async {
Dio dio = Dio();
dio.options.headers['Authorization'] = 'Bearer $jwtToken';

FormData formData = FormData.fromMap({
'bucket_name': bucketName,

    if (activityId != null) 'activity_id': activityId,
    if (messageId != null) 'message_id': messageId,
    'image': await MultipartFile.fromFile(imageFile.path, filename: basename(imageFile.path)),

});

final response = await dio.post('http://localhost:3000/api/images', data: formData);

if (response.statusCode != 200) {
throw Exception('Failed to upload image');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>13</td>
<td>Get User by ID</td>
<td>/api/user/[id]</td>
<td>GET</td>
<td>Profile, Settings</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<UserProfile> fetchUserById(String userId, String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/user/$userId'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return UserProfile.fromJson(data);
} else {
throw Exception('Failed to fetch user data');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>14</td>
<td>Get User's Posts</td>
<td>/api/user/[userId]/posts</td>
<td>GET</td>
<td>Profile, Posts</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Post>> fetchUserPosts(String userId, String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/user/$userId/posts'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['posts'].map<Post>((item) => Post.fromJson(item)).toList();
} else {
throw Exception('Failed to fetch user posts');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>15</td>
<td>Get User's Events</td>
<td>/api/user/[userId]/events</td>
<td>GET</td>
<td>Profile, Events</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Event>> fetchUserEvents(String userId, String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/user/$userId/events'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['events'].map<Event>((item) => Event.fromJson(item)).toList();
} else {
throw Exception('Failed to fetch user events');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>16</td>
<td>Search Activities</td>
<td>/api/search</td>
<td>GET</td>
<td>Search</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Activity>> searchActivities(Map<String, String> filters) async {
final uri = Uri.http('localhost:3000', '/api/search', filters);

final response = await http.get(uri);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return (data['data'] as List)
.map((item) => Activity.fromJson(item))
.toList();
} else {
throw Exception('Failed to fetch activities');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>17</td>
<td>User Signup</td>
<td>/api/signup</td>
<td>POST</td>
<td>Signup</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> signupUser(String email, String password) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/signup'),
headers: {'Content-Type': 'application/json'},
body: jsonEncode({
'email': email,
'password': password,
}),
);

if (response.statusCode != 200) {
throw Exception('Failed to sign up');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>18</td>
<td>Update Profile</td>
<td>/api/profile</td>
<td>POST</td>
<td>Setup Profile</td>
<td>
<pre><code class="language-dart">
import 'package:dio/dio.dart';

Future<void> updateProfile(Map<String, dynamic> profileData, String jwtToken) async {
Dio dio = Dio();
dio.options.headers['Authorization'] = 'Bearer $jwtToken';

FormData formData = FormData.fromMap(profileData);

final response = await dio.post('http://localhost:3000/api/profile', data: formData);

if (response.statusCode != 200) {
throw Exception('Failed to update profile');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>19</td>
<td>Accept/Reject Activity Join Request</td>
<td>/api/activity_accept/[requestId]</td>
<td>POST</td>
<td>Requests</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> handleJoinRequest(String requestId, String action, String jwtToken) async {
final uri = Uri.parse('http://localhost:3000/api/activity_accept/$requestId?action=$action');
final response = await http.post(
uri,
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to process join request');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>20</td>
<td>Get Join Requests for User's Activity</td>
<td>/api/activity_requests</td>
<td>GET</td>
<td>Requests</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<JoinRequest>> fetchJoinRequests(String jwtToken) async {
final response = await http.get(
Uri.parse('http://localhost:3000/api/activity_requests'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['requests'].map<JoinRequest>((item) => JoinRequest.fromJson(item)).toList();
} else {
throw Exception('Failed to fetch join requests');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>21</td>
<td>Dislike Activity</td>
<td>/api/public/activities/[activityId]/dislike</td>
<td>POST</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> toggleDislikeActivity(String activityId, String jwtToken) async {
final response = await http.post(
Uri.parse('http://localhost:3000/api/public/activities/$activityId/dislike'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to dislike/undislike activity');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>22</td>
<td>Get Dislike Count</td>
<td>/api/public/activities/[activityId]/dislike</td>
<td>GET</td>
<td>Event Details, Post Details</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<int> fetchDislikeCount(String activityId) async {
final response = await http.get(Uri.parse('http://localhost:3000/api/public/activities/$activityId/dislike'));

if (response.statusCode == 200) {
final data = jsonDecode(response.body);
return data['count'];
} else {
throw Exception('Failed to fetch dislike count');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>23</td>
<td>Delete Event</td>
<td>/api/event/[id]</td>
<td>DELETE</td>
<td>Event Card</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> deleteEvent(String eventId, String jwtToken) async {
final response = await http.delete(
Uri.parse('http://localhost:3000/api/event/$eventId'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to delete event');
}
}

</code></pre>

</td>
</tr>

<tr>
<td>24</td>
<td>Delete Post</td>
<td>/api/post/[id]</td>
<td>DELETE</td>
<td>Post Card</td>
<td>
<pre><code class="language-dart">
import 'package:http/http.dart' as http;

Future<void> deletePost(String postId, String jwtToken) async {
final response = await http.delete(
Uri.parse('http://localhost:3000/api/post/$postId'),
headers: {'Authorization': 'Bearer $jwtToken'},
);

if (response.statusCode != 200) {
throw Exception('Failed to delete post');
}
}

</code></pre>

</td>
</tr

>

</table>
