// Tabs.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Tab, TabList, TabPanel, TabPanels, Text, Tabs } from "@chakra-ui/react";
import { AccountIcon, AchievementIcon, EventIcon, InfoIcon, ListIcon, PostIcon, SettingIcon } from "@/components/Icons";
import { IAhcieved } from "@/components/Profile/IAchieved";
import { UserActivities } from "@/components/Profile/UserActivities"; // Import UserActivities
import { VendorProducts } from "@/components/Product/VendorProducts";
import { Settings, UserAccount } from "@/components/Profile/Settings";
import { myData } from "@/app/profile/me/page";
import ProfileSetup from "@/app/profile/setup/page";
import { useState } from 'react';
import DeliveryChat from "../OrderProducts/DeliveryChat";
import PaymentPostsTable from "@/components/Payment/PaymentPostsTable";




export function CustomTabList({ children }: { children: React.ReactNode }) {
  return (
    <TabList
      bg={"#FFF"}
      borderBottomRadius={"12px"}
      border={"1px solid #E2E8F0"}
      borderTop={"none"}
      px={"10px"}
      flexWrap={"wrap"}
      justifyContent={{ base: "center", md: "flex-start" }}
    >
      {children}
    </TabList>
  );
}

export function CustomTab({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <Tab
      _selected={{
        color: "#f9690e",
        stroke: "#f9690e",
        borderBottom: "2px solid #f9690e",
      }}
      stroke="#64748B"
      color={"#64748B"}
      px={{ base: "10px", md: "33px" }}
      py={{ base: "10px", md: "20px" }}
    >
      {children}
      <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
        {title}
      </Text>
    </Tab>
  );
}


export function UserProfileTabs({ userData }: { userData: myData | null }) {
  return (
    <Tabs position="relative" variant="unstyled" w="full">
      <CustomTabList>
        <CustomTab title={"Activities"}>
          <PostIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"My Achievments"}>
          <AchievementIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"Settings"}>
          <SettingIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"Account"}>
          <AccountIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"Payment"}>
          <PostIcon width="20px" height="20px" />
        </CustomTab>
      </CustomTabList>

      <TabPanels>
        <TabPanel p={"0"} my={"14px"}>
          <UserActivities userId={userData?.id ?? ""} />
        </TabPanel>
        <TabPanel p="0" my={"14px"}>
          <IAhcieved />
        </TabPanel>
        <TabPanel p="0" my={"14px"}>
          <ProfileSetup />
          {/*userData && <UserSettings userData={userData} />*/}
        </TabPanel>
        <TabPanel p="0" my={"14px"}>
          {userData && <UserAccount userData={userData} />}
        </TabPanel>
        <TabPanel p="0" my={"14px"}>
          <PaymentPostsTable />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

