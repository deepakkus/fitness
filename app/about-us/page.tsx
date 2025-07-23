// import { Box, Container, Heading, Text } from "@chakra-ui/react";
// import clsx from "clsx";

// interface QuillOutputProps {
//   htmlContent: string;
//   [key: string]: any;
// }

// function QuillOutput({ htmlContent, ...props }: QuillOutputProps) {
//   return (
//     <Box
//       fontSize={{ base: "14px", md: "16px" }}
//       fontWeight="300"
//       color="gray.700"
//       textAlign={{ base: "left", md: "justify" }}
//       dangerouslySetInnerHTML={{ __html: htmlContent }}
//       {...props}
//       sx={{
//         // Base container styles
//         "& > *": {
//           maxWidth: "100%",
//         },
//         // Making images responsive
//         "& img": {
//           maxWidth: "100%",
//           height: "auto",
//         },
//         // Responsive font sizes for headings
//         "& h1": {
//           fontSize: { base: "1.5em", md: "2em" },
//           fontWeight: "bold",
//           color: "black",
//           mb: "0.5em",
//         },
//         "& h2": {
//           fontSize: { base: "1.25em", md: "1.5em" },
//           fontWeight: "bold",
//           color: "black",
//           mb: "0.5em",
//         },
//         "& h3": {
//           fontSize: { base: "1.1em", md: "1.17em" },
//           fontWeight: "bold",
//           color: "black",
//           mb: "0.5em",
//         },
//         "& h4": {
//           fontSize: "1em",
//           fontWeight: "bold",
//           color: "black",
//           mb: "0.5em",
//         },
//         "& h5": {
//           fontSize: "0.83em",
//           fontWeight: "bold",
//           mb: "0.5em",
//         },
//         "& h6": {
//           fontSize: "0.67em",
//           fontWeight: "bold",
//           mb: "0.5em",
//         },
//         // Responsive spacing and layout
//         "& p": {
//           mb: { base: 3, md: 4 },
//           lineHeight: { base: 1.6, md: 1.8 },
//         },
//         // List styling
//         "& ul, & ol": {
//           pl: { base: 4, md: 6 },
//           mb: { base: 3, md: 4 },
//         },
//         "& li": {
//           mb: 2,
//         },
//         // Blockquote styling
//         "& blockquote": {
//           borderLeftWidth: "4px",
//           borderLeftColor: "gray.200",
//           pl: 4,
//           py: 2,
//           my: { base: 3, md: 4 },
//         },
//         // Table responsiveness
//         "& table": {
//           width: "100%",
//           overflowX: "auto",
//           display: "block",
//           whiteSpace: "nowrap",
//           mb: { base: 3, md: 4 },
//         },
//         "& td, & th": {
//           p: 2,
//           borderWidth: "1px",
//           fontSize: { base: "14px", md: "16px" },
//         },
//       }}
//     />
//   );
// }

// const AboutUs = () => {
//   return (
//     <Container
//       maxW="container.md"
//       px={{ base: 4, md: 6 }}
//       py={{ base: 6, md: 10 }}
//     >
//       <Box>
//         <Heading
//           as="h1"
//           fontSize={{ base: "24px", md: "28px" }}
//           fontWeight="600"
//           color="gray.900"
//           mb={{ base: 6, md: 8 }}
//         >
//           About us
//         </Heading>
        
//         <QuillOutput
//           htmlContent='<p><strong>About 99 Fitness Friends</strong></p>
// <p>Welcome to 99 Fitness Friends, the ultimate platform designed to connect fitness enthusiasts from all walks of life! Whether you&#39;re a seasoned athlete, a weekend warrior, or someone just starting their fitness journey, 99 Fitness Friends provides a supportive and engaging community where users can find and join activities, share their fitness milestones, and connect with others who share their passion for health and wellness.</p>
// <p><strong>Our Mission</strong><br>At 99 Fitness Friends, we believe in the power of community to inspire and motivate individuals to achieve their fitness goals. Our platform is designed to bring people together, encourage active lifestyles, and foster a sense of belonging through shared fitness experiences.</p>
// <p><strong>What We Offer</strong><br>We offer a comprehensive range of features that help our users connect and engage in a variety of fitness activities. Here s a glimpse of what 99 Fitness Friends can do for you:</p>
// <ul>
// <li><strong>Clean and User-Friendly Interface</strong>: Enjoy a simple and visually appealing design that makes it easy to navigate and interact with the platform.</li>
// <li><strong>Activity Posts and Responses</strong>: Create and respond to activity posts, share text, images, documents, and even links to external videos or audio content.</li>
// <li><strong>Advanced Search Functionality</strong>: Find activities, users, and groups based on categories, keywords, locations, and even calendar availability.</li>
// <li><strong>Public User Profiles</strong>: Showcase your fitness interests, skills, and goals in a publicly viewable profile, helping you find like-minded fitness friends.</li>
// <li><strong>Real-Time Group Chat</strong>: Communicate with your group in real-time, share files, and stay connected with push notifications for new messages.</li>
// <li><strong>Rolling Group Acceptance</strong>: Participate in groups using our fair and randomized voting system to ensure an inclusive and transparent process for activity participants.</li>
// <li><strong>Personal and Group Calendars</strong>: Seamlessly schedule activities with visual calendar overlaps to find the perfect time for your group events.</li>
// <li><strong>Peer-to-Peer Verification</strong>: Build trust and safety within the community with optional identity verification during in-person meetings.</li>
// <li><strong>User Dashboards and Achievements</strong>: Track your activity history, group participation, and showcase your fitness achievements in your profile s dedicated "I Achieved" section.</li>
// <li><strong>Social Media Integration</strong>: Share your fitness milestones and activity invitations with your social media contacts to expand your fitness circle.</li>
// </ul>
// <p><strong>Community and Engagement</strong><br>99 Fitness Friends is more than just an app; it s a thriving community where users motivate and support one another. With our automated "nudge" functionality, we keep you engaged with friendly reminders to stay active and connected. From fitness achievements to group chats, you ll always have a reason to keep moving forward!</p>
// <p><strong>Join Us</strong><br>Ready to take your fitness journey to the next level? Sign up today and become part of a community that s as passionate about fitness as you are. Find activities, meet new friends, and share your progress as we all strive to become the best versions of ourselves—together.</p>
// <p>At 99 Fitness Friends, we re not just about fitness; we re about building friendships and creating lasting connections. Let&#39;s get moving, together!</p>
// <p><strong>Stay Active. Stay Connected. Stay Fit.</strong></p>'
//         />
//       </Box>
//     </Container>
//   );
// };

// export default AboutUs;




import { Box, Container, Heading } from "@chakra-ui/react";

interface QuillOutputProps {
  htmlContent: string;
  [key: string]: any;
}

function QuillOutput({ htmlContent, ...props }: QuillOutputProps) {
  return (
    <Box
      fontSize={{ base: "14px", md: "16px" }}
      fontWeight="300"
      color="gray.700"
      textAlign={{ base: "left", md: "justify" }}
      pb={{ base: 20, md: 8 }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      {...props}
      sx={{
        // Base container styles
        "& > *": {
          maxWidth: "100%",
        },
        // Making images responsive
        "& img": {
          maxWidth: "100%",
          height: "auto",
        },
        // Responsive font sizes for headings
        "& h1": {
          fontSize: { base: "1.5em", md: "2em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h2": {
          fontSize: { base: "1.25em", md: "1.5em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h3": {
          fontSize: { base: "1.1em", md: "1.17em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h4": {
          fontSize: "1em",
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h5": {
          fontSize: "0.83em",
          fontWeight: "bold",
          mb: "0.5em",
        },
        "& h6": {
          fontSize: "0.67em",
          fontWeight: "bold",
          mb: "0.5em",
        },
        // Responsive spacing and layout
        "& p": {
          mb: { base: 3, md: 4 },
          lineHeight: { base: 1.6, md: 1.8 },
        },
        // List styling
        "& ul, & ol": {
          pl: { base: 4, md: 6 },
          mb: { base: 3, md: 4 },
        },
        "& li": {
          mb: 2,
        },
        // Blockquote styling
        "& blockquote": {
          borderLeftWidth: "4px",
          borderLeftColor: "gray.200",
          pl: 4,
          py: 2,
          my: { base: 3, md: 4 },
        },
        // Table responsiveness
        "& table": {
          width: "100%",
          overflowX: "auto",
          display: "block",
          whiteSpace: "nowrap",
          mb: { base: 3, md: 4 },
        },
        "& td, & th": {
          p: 2,
          borderWidth: "1px",
          fontSize: { base: "14px", md: "16px" },
        },
      }}
    />
  );
}

const AboutUs = () => {
  return (
    <Container
      maxW="container.md"
      px={{ base: 6, md: 6 }}
      py={{ base: 8, md: 10 }}
    >
      <Box>
        <Heading
          as="h1"
          fontSize={{ base: "24px", md: "28px" }}
          fontWeight="600"
          color="gray.900"
          mb={{ base: 6, md: 8 }}
        >
          About us
        </Heading>
        
        <QuillOutput
  htmlContent={`<p><strong>About 99 Fitness Friends</strong></p>
<p>Welcome to 99 Fitness Friends, the ultimate platform designed to connect fitness enthusiasts from all walks of life! Whether you're a seasoned athlete, a weekend warrior, or someone just starting their fitness journey, 99 Fitness Friends provides a supportive and engaging community where users can find and join activities, share their fitness milestones, and connect with others who share their passion for health and wellness.</p>
<p><strong>Our Mission</strong><br>At 99 Fitness Friends, we believe in the power of community to inspire and motivate individuals to achieve their fitness goals. Our platform is designed to bring people together, encourage active lifestyles, and foster a sense of belonging through shared fitness experiences.</p>
<p><strong>What We Offer</strong><br>We offer a comprehensive range of features that help our users connect and engage in a variety of fitness activities. Here's a glimpse of what 99 Fitness Friends can do for you:</p>
<ul>
<li><strong>Clean and User-Friendly Interface</strong>: Enjoy a simple and visually appealing design that makes it easy to navigate and interact with the platform.</li>
<li><strong>Activity Posts and Responses</strong>: Create and respond to activity posts, share text, images, documents, and even links to external videos or audio content.</li>
<li><strong>Advanced Search Functionality</strong>: Find activities, users, and groups based on categories, keywords, locations, and even calendar availability.</li>
<li><strong>Public User Profiles</strong>: Showcase your fitness interests, skills, and goals in a publicly viewable profile, helping you find like-minded fitness friends.</li>
<li><strong>Real-Time Group Chat</strong>: Communicate with your group in real-time, share files, and stay connected with push notifications for new messages.</li>
<li><strong>Rolling Group Acceptance</strong>: Participate in groups using our fair and randomized voting system to ensure an inclusive and transparent process for activity participants.</li>
<li><strong>Personal and Group Calendars</strong>: Seamlessly schedule activities with visual calendar overlaps to find the perfect time for your group events.</li>
<li><strong>Peer-to-Peer Verification</strong>: Build trust and safety within the community with optional identity verification during in-person meetings.</li>
<li><strong>User Dashboards and Achievements</strong>: Track your activity history, group participation, and showcase your fitness achievements in your profile's dedicated "I Achieved" section.</li>
<li><strong>Social Media Integration</strong>: Share your fitness milestones and activity invitations with your social media contacts to expand your fitness circle.</li>
</ul>
<p><strong>Community and Engagement</strong><br>99 Fitness Friends is more than just an app; it's a thriving community where users motivate and support one another. With our automated "nudge" functionality, we keep you engaged with friendly reminders to stay active and connected. From fitness achievements to group chats, you'll always have a reason to keep moving forward!</p>
<p><strong>Join Us</strong><br>Ready to take your fitness journey to the next level? Sign up today and become part of a community that's as passionate about fitness as you are. Find activities, meet new friends, and share your progress as we all strive to become the best versions of ourselves—together.</p>
<p>At 99 Fitness Friends, we're not just about fitness; we're about building friendships and creating lasting connections. Let's get moving, together!</p>
<p><strong>Stay Active. Stay Connected. Stay Fit.</strong></p>`}
/>
      </Box>
    </Container>
  );
};

export default AboutUs;