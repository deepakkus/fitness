// Tabs.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Tab, TabList, TabPanel, TabPanels, Text, Tabs } from "@chakra-ui/react";
import { AccountIcon, AchievementIcon, EventIcon, InfoIcon, ListIcon, PostIcon, SettingIcon } from "@/components/Icons";
import VendorProducts from "@/components/Product/VendorProducts";
import { Settings, UserAccount } from "@/components/Profile/Settings";
import { myData } from "@/app/profile/me/page";
import { useState } from 'react';
import { OrderProducts } from "../OrderProducts/OrderProducts";
import { Payment } from "../Payment/Payment";
import { VendorPayment } from "../Payment/VendorPayment";
//import  Delivery  from "../Delivery/Delivery";
import OrderIcon from "../Icons/OrderIcon";
import PaymentIcon from "../Icons/PaymentIcon";
import DeliveryIcon from "../Icons/DeliveryIcon";
import DeliveryChat from "../OrderProducts/DeliveryChat";


export function CustomTabList({ children }) {
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

export function CustomTab({ children, title }) {
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


export default function UserProfileSalesTabs({ userData, initialTab, initialOrderId, initialProducts }: { userData: myData | null, initialTab?: string | null, initialOrderId?: string | null, initialProducts: any[] }) {
  const [tabIndex, setTabIndex] = useState(() => {
    switch (initialTab) {
      case "delivery": return 3;
      case "payment": return 2;
      case "order": return 1;
      default: return 0;
    }
  });
  return (
    <Tabs position="relative" variant="unstyled" w="full" index={tabIndex} onChange={setTabIndex}>
      <CustomTabList>
        
        <CustomTab title={"Listing"}>
          <ListIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"Order"}>
          <OrderIcon width="20px" height="20px" />
        </CustomTab>
        <CustomTab title={"Payment"}>
          <PaymentIcon width="20px" height="20px" />
        </CustomTab>
        {/* <CustomTab title={"Vendor Payment"}>
          <PaymentIcon width="20px" height="20px" />
        </CustomTab> */}
         <CustomTab title={"Delivery"}>
          <DeliveryIcon width="20px" height="20px" />
        </CustomTab>
      </CustomTabList>

      <TabPanels>
       
         <TabPanel p={"0"} my={"14px"}>
          <VendorProducts userId={userData?.id} initialProducts={initialProducts} />
        </TabPanel>
        <TabPanel p={"0"} my={"14px"}>
          <OrderProducts userId={userData?.id} activeTabIndex={tabIndex} />        
        </TabPanel>
        <TabPanel p={"0"} my={"14px"}>
          <Payment userId={userData?.id} />        
        </TabPanel>
         {/* <TabPanel p={"0"} my={"14px"}>
          <VendorPayment userId={userData?.id} />        
        </TabPanel> */}
        <TabPanel p={"0"} my={"14px"}>
          <DeliveryChat type="vendor" initialOrderId={initialOrderId} />        
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

