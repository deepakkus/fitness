/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Box, Button, FormControl, FormLabel, Input, Select, Text } from "@chakra-ui/react";
import { useState } from "react";
import styles from "@/app/polls/CreatePoll.module.css";
const createPollPageData = {
  heading: "Recent Polls",
  tabs: [
    { id: 0, label: "All Polls" },
    { id: 1, label: "Created by you" },
  ],
  allPollsText: [
    "The Public Opinion Pulse",
    "Surveying Sentiments: Your Voice Matters",
    "The Public Opinion Pulse",
    "The Public Opinion Pulse",
    "The Public Opinion Pulse",
  ],
  createdByYouText: "Hello world",
  buttons: [
    {
      label: "Cancel",
      size: "md",
      px: "44px",
      borderRadius: "3px",
      bgColor: "#fff",
      color: "#EF4444",
      colorScheme: null,
    },
    {
      label: "Submit",
      size: "md",
      px: "44px",
      borderRadius: "3px",
      bgColor: null,
      color: null,
      colorScheme: "orange",
    },
  ],
  formFields: [
    {
      label: "Start Date",
      type: "date",
      placeholder: "Enter sponsor start date",
      name: "sponsorStartDate",
    },
    {
      label: "Start Time",
      type: "date",
      placeholder: "Enter sponsor start date",
      name: "sponsorStartTime",
    },
    {
      label: "Poll Title",
      type: "text",
      placeholder: "Enter poll title",
      name: "pollTitle",
    },
  ],
  selectField: {
    label: "Post List:",
    name: "postList",
    placeholder: "Enter subject",
    options: [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ],
  },
};

const CreatePoll = () => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Box p="40px" display="flex" justifyContent={"flex-start"} gap="20px">
      <Box flex="1">
        <Text className={styles.heading}>Create Poll</Text>
        <Box
          p="30px"
          bgColor={"#FFF"}
          border={"1px solid #F1F5F9"}
          borderBottom={"none"}
          borderRadius={"12px"}
          borderBottomRadius={"0px"}
        >
          <FormControl display={"flex"} flexDir={"column"} gap="20px">
            <Box flex="1">
              <FormLabel color={"#475569"} fontSize={"14px"}>
                {createPollPageData.selectField.label}
              </FormLabel>
              <Select
                w={"full"}
                mt={"10px"}
                size={"md"}
                fontSize={"16px"}
                placeholder={createPollPageData.selectField.placeholder}
                border={"1px solid #CED4DA"}
                borderRadius={"3px"}
                color={"#CED4DA !important"}
                onChange={(e) => {
                  e.target.style.color = "#000";
                  // handleInputChange(e);
                }}
                name={createPollPageData.selectField.name}
              >
                {createPollPageData.selectField.options.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Box display={"flex"} gap="20px" w={"full"}>
              {createPollPageData.formFields.slice(0, 2).map((field, index) => (
                <Box flex="1" key={index}>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {field.label}
                  </FormLabel>
                  <Input
                    focusBorderColor="orange"
                    type={field.type}
                    placeholder={field.placeholder}
                    fontSize={"16px"}
                    color={"#CED4DA"}
                    onChange={(e) => {
                      e.target.style.color = "#000";
                      // handleInputChange(e);
                    }}
                    name={field.name}
                    borderRadius={"3px"}
                    // value={sponsorFormData[field.name]}
                  />
                </Box>
              ))}
            </Box>
            <Box flex="1">
              <FormLabel color={"#475569"} fontSize={"14px"}>
                {createPollPageData.formFields[2].label}
              </FormLabel>
              <Input
                focusBorderColor="orange"
                type={createPollPageData.formFields[2].type}
                placeholder={createPollPageData.formFields[2].placeholder}
                _placeholder={{ color: "#CED4DA !important" }}
                fontSize={"16px"}
                color={"#CED4DA"}
                onChange={(e) => {
                  e.target.style.color = "#000";
                  // handleInputChange(e);
                }}
                name={createPollPageData.formFields[2].name}
                borderRadius={"3px"}
                // value={sponsorFormData[createPollPageData.formFields[2].name]}
              />
            </Box>
            <Box display={"flex"} gap="20px" w={"full"}>
              {createPollPageData.formFields.slice(0, 2).map((option, index) => (
                <Box flex="1" key={index}>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {option.label}
                  </FormLabel>
                  <Input
                    focusBorderColor="orange"
                    type="text"
                    placeholder={option.placeholder}
                    _placeholder={{ color: "#CED4DA !important" }}
                    fontSize={"16px"}
                    color={"#CED4DA"}
                    onChange={(e) => {
                      e.target.style.color = "#000";
                      // handleInputChange(e);
                    }}
                    name={option.name}
                    borderRadius={"3px"}
                    // value={sponsorFormData[option.name]}
                  />
                </Box>
              ))}
            </Box>
            <Box display={"flex"} gap="20px" w={"full"}>
              {createPollPageData.formFields.map((option, index) => (
                <Box flex="1" key={index}>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {option.label}
                  </FormLabel>
                  <Input
                    focusBorderColor="orange"
                    type="text"
                    placeholder={option.placeholder}
                    _placeholder={{ color: "#CED4DA !important" }}
                    fontSize={"16px"}
                    color={"#CED4DA"}
                    onChange={(e) => {
                      e.target.style.color = "#000";
                      // handleInputChange(e);
                    }}
                    name={option.name}
                    borderRadius={"3px"}
                    // value={sponsorFormData[option.name]}
                  />
                </Box>
              ))}
            </Box>
          </FormControl>
          <Box
            pt="60px"
            display={"flex"}
            borderRadius={"12px"}
            borderTopRadius={"0px"}
            justifyContent={"space-between"}
            gap="20px"
          >
            {createPollPageData.buttons.map((button, index) => (
              <Button
                key={index}
                size={button.size}
                px={button.px}
                borderRadius={button.borderRadius}
                bgColor={button.bgColor}
                color={button.color}
                colorScheme={button.colorScheme}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
      <Box w="100%" maxWidth="560px">
        <Text className={styles.heading}>{createPollPageData.heading}</Text>
        <Box
          bg={"#FFF"}
          display={"flex"}
          flexFlow={{ base: "column", md: "row" }}
          gap={"10px"}
          pb={{ base: "10px", md: "0px" }}
          justifyContent={"flex-start"}
          alignItems={"center"}
          borderRadius={"12px"}
          borderBottomRadius={"0px"}
          pos={"relative"}
          overflow={"hidden"}
        >
          <Box display={"flex"}>
            {createPollPageData.tabs.map((tab) => (
              <Box
                as="button"
                px="26px"
                py="11px"
                borderBottom={"2px solid rgba(0,0,0,0)"}
                className={tabIndex == tab.id ? styles.activeTab : ""}
                onClick={() => setTabIndex(tab.id)}
                key={tab.id}
              >
                <Text fontSize={"14px"}>{tab.label}</Text>
              </Box>
            ))}
          </Box>
        </Box>
        {tabIndex == 0 && (
          <Box display="flex" flexDir={"column"} bgColor="#FFF">
            {createPollPageData.allPollsText.map((text, index) => (
              <Text className={styles.text} key={index}>
                {text}
              </Text>
            ))}
          </Box>
        )}
        {tabIndex == 1 && (
          <Box>
            <Text>{createPollPageData.createdByYouText}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CreatePoll;
