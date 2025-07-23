/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Box, Heading, Select, Text, Button, Link } from "@chakra-ui/react"; // Import Button and Link
import React, { useState } from "react";
import { ChevronRightCircleIcon } from "@/components/Icons";
import NextLink from 'next/link'; // Import Next.js Link

const faqPageData = {
  faqHeading: [
    {
      id: "faq-heading",
      text: "Frequently Asked Questions",
      fontSize: "32px",
      fontWeight: "600",
      pt: "20px",
      pb: "40px",
    },
  ],
  faqCategory: [
    {
      id: "faq-category",
      text: "FAQ Category",
      fontSize: "14px",
      color: "#475569",
      mb: "10px",
      textAlign: "left",
    },
  ],
  selectOptions: [
    {
      id: "select-category",
      placeholder: "Select a category",
      defaultValue: "",
      size: "sm",
      borderRadius: "6px",
      options: [
        { value: "general", label: "General" },
        { value: "account-management", label: "Account Management" },
        { value: "activities", label: "Activities and Participation" },
        { value: "groups-events", label: "Groups and Events" },
        { value: "privacy-security", label: "Privacy and Security" },
        { value: "features", label: "Features and Notifications" },
        { value: "support", label: "Technical Support" },
      ],
    },
  ],
  faqContent: {
    general: [
      {
        question: "What is 99 Fitness Friends?",
        answer:
          "99 Fitness Friends is a social networking platform that connects fitness enthusiasts. The app helps users find fitness activities, events, or workout partners based on their interests and location. Whether you enjoy hiking, yoga, running, or strength training, you can find like-minded individuals to share your fitness journey with. Through our platform, you can create or join fitness activities, track your progress, and stay connected with a community that motivates and supports you.",
      },
      {
        question: "Who can join the platform?",
        answer:
          "Anyone with a passion for fitness can join 99 Fitness Friends. The platform is designed for all fitness levels—from beginners to advanced athletes. Whether you're starting your fitness journey or looking for specific sports or activities to enhance your skills, you’ll find a welcoming community. The only requirement is to maintain a respectful and supportive attitude toward other members.",
      },
    ],
    "account-management": [
      {
        question: "How do I create an account?",
        answer:
          "To create an account, download the 99 Fitness Friends app from the App Store or Google Play. Once installed, click on 'Sign Up' and provide your email, name, and a secure password. You can also sign up using social media accounts for a quick setup. After filling in the required details, verify your email, and you're all set to start exploring activities and connecting with other fitness enthusiasts.",
      },
      {
        question: "How do I delete my account?",
        answer: (
          <>
            To delete your account, go to your profile settings by clicking on the account icon in the top-right corner of the screen. Scroll down and find the 'Delete Account' option.  Alternatively, you can delete your account directly by clicking the button below. After confirming your decision, your account, along with all associated data, will be permanently deleted. Keep in mind that this action cannot be undone, and all activities, achievements, and connections will be lost.
            <Box mt={2}>
              <NextLink href="/profile/delete" passHref>
                <Button as="a" colorScheme="red" size="sm">
                  Delete Account
                </Button>
              </NextLink>
            </Box>
          </>
        ),
      },
    ],
    activities: [
      {
        question: "How do I create an activity post?",
        answer:
          "Creating an activity post is simple. Navigate to the 'Create Activity' button, fill in the activity type (e.g., yoga, hiking, cycling), provide details such as location, date, time, and a description of the activity. You can also upload media such as images or videos related to the event. Once everything is set, publish your post, and other users will be able to see and join your activity.",
      },
      {
        question: "What happens if I miss an activity?",
        answer:
          "If you miss an activity that you had signed up for, it will simply be marked as 'missed' in your activity log. There's no penalty for missing activities, but it's courteous to notify the activity creator or other participants if you won’t be attending. Consistently missing activities might affect your chances of being accepted into exclusive or limited-space events in the future.",
      },
    ],
    "groups-events": [
      {
        question: "How do I create a group?",
        answer:
          "To create a group, go to the 'Groups' section and click on the 'Create Group' button. Provide a name, description, and set the group rules. You can invite members directly or allow them to request to join. Groups can be public or private depending on your preferences. Once set up, you can start scheduling group activities, sending announcements, and chatting with group members in real-time.",
      },
      {
        question: "Can I set custom rules for my group?",
        answer:
          "Yes, as a group admin, you can set custom rules for your group. For instance, you can decide the meeting location, establish a code of conduct, or set punctuality expectations (such as allowing a 10-minute grace period for late arrivals). You can also define the maximum number of participants for each group activity. This flexibility helps in managing your group more efficiently.",
      },
    ],
    "privacy-security": [
      {
        question: "Is my profile information public?",
        answer:
          "By default, your profile information, such as your fitness interests and activity history, is public. This helps other users find and connect with you based on shared fitness goals. However, sensitive information like your email address and contact details will remain private. You can control what parts of your profile are visible to others by adjusting your privacy settings in the account settings section.",
      },
      {
        question: "How can I report inappropriate behavior?",
        answer:
          "If you come across inappropriate behavior or content, you can report it directly through the app. Navigate to the profile or post of the user in question and click the 'Report' button. You’ll be prompted to provide a reason for the report, and our moderation team will review it. We take user safety seriously, and actions like harassment, offensive content, or misuse of the platform can lead to suspension or permanent bans.",
      },
    ],
    features: [
      {
        question: "How do push notifications work?",
        answer:
          "Push notifications are used to keep you updated on activities you’re part of or events happening in your area. You’ll receive notifications for new messages in group chats, activity invitations, updates on upcoming events, and even reminders when it's time to check in for an activity. You can customize your notification preferences in the app’s settings if you prefer to receive fewer or more specific alerts.",
      },
      {
        question: "What is the “Nudge” feature?",
        answer:
          "The 'Nudge' feature is an automated system that encourages users to stay active. If you haven’t joined any activities or engaged with the community in a while, you’ll receive a gentle reminder (a 'nudge') to get back into action. It’s a fun way to stay motivated and connected, ensuring that you don’t miss out on fitness opportunities that match your interests and goals.",
      },
    ],
    support: [
      {
        question: "How do I reset my password?",
        answer:
          "If you need to reset your password, go to the login screen and click 'Forgot Password'. Enter the email associated with your account, and you’ll receive a password reset link. Follow the instructions in the email to set a new password. Be sure to choose a strong password to protect your account from unauthorized access.",
      },
      {
        question: "Why can’t I upload images or documents?",
        answer:
          "If you're experiencing issues with uploading images or documents, ensure that the files meet the app’s format and size requirements. Supported formats typically include JPEG, PNG, and PDF, and files must not exceed a certain size. If the problem persists, try updating your app to the latest version or contact our support team for assistance. They can help troubleshoot any technical issues you may encounter.",
      },
    ],
  },
};

const Accordion = ({ title, text }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Box
      p="20px"
      border={"1px solid #E2E8F0"}
      bgColor={"#FFF"}
      display={"flex"}
      flexDir={"column"}
      gap={"15px"}
      borderRadius={"12px"}
    >
      <Box display={"flex"} alignItems={"center"} justifyContent={"flex-start"} cursor={"pointer"} onClick={toggle}>
        <ChevronRightCircleIcon
          style={{ transform: isOpen ? "rotate(90deg)" : "" }}
          width="22px"
          height="22px"
          stroke="#1E293B"
        />
        <Text ml={"10px"} fontSize={"16px"} color={"#1E293B"} fontWeight={"500"}>
          {title}
        </Text>
      </Box>
      {isOpen && (
        <Box>
          <Text fontSize={"14px"} color={"#334155"} textAlign={"left"}>
            {text}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const Faq = () => {
  const [category, setCategory] = useState(""); // Default state is an empty string for all categories.

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const filteredFaqs =
    category === "" ?
      Object.values(faqPageData.faqContent).flat() // Show all questions if no category is selected
    : faqPageData.faqContent[category] || [];

  return (
    <Box pt={"40px"} pb={"120px"} px={{ base: "20px", md: "30px" }}>
      <Box>
        {faqPageData.faqHeading.map((item) => (
          <Heading
            key={item.id}
            textAlign={"center"}
            fontSize={item.fontSize}
            fontWeight={item.fontWeight}
            pt={item.pt}
            pb={item.pb}
          >
            {item.text}
          </Heading>
        ))}
      </Box>
      <Box w={"full"} maxWidth={"635px"} mx={"auto"} display={"flex"} flexDir={"column"} gap={"5px"}>
        <Box p="18px 20px" bgColor={"#FFF"} border={"1px solid #E2E8F0"} borderRadius={"12px"} w={"full"}>
          <Text
            mb={faqPageData.faqCategory[0].mb}
            color={faqPageData.faqCategory[0].color}
            fontSize={faqPageData.faqCategory[0].fontSize}
          >
            {faqPageData.faqCategory[0].text}
          </Text>
          <Select
            placeholder="Select a category"
            value={category}
            size={faqPageData.selectOptions[0].size}
            borderRadius={faqPageData.selectOptions[0].borderRadius}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option> {/* Add this option to show all */}
            {faqPageData.selectOptions[0].options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>

        {filteredFaqs.map((faq, index) => (
          <Accordion key={index} title={faq.question} text={faq.answer} />
        ))}
      </Box>
    </Box>
  );
};

export default Faq;