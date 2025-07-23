import {
  Box,
  Button,
  Flex,
  Image,
  Select,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import Eventsimg from "./Events.svg";
import GridImage from "./Grid.svg";
import GridImage2 from "./Grid2.svg";
import Iacheived from "./Iacheived.svg";
import Postsimg from "./Posts.svg";
import SettingsImage from "./Settings.svg";
//import Calenderevent from "@/components/ /Calenderevent";
import Card from "@/components/Card/CardItem";

const Tabitem = () => {
  const [listStyle, setlistStyle] = useState(false);

  return (
    <Tabs m="40px" mt="-40px" colorScheme="orange">
      <TabList
        p="5px"
        boxShadow={"rgba(0, 0, 0, 0.24) 0px 2px 8px"}
        borderRadius={"0px 0px 10px 10px"}
        justifyContent={{ base: "space-between", lg: "left" }}
      >
        <Tab display={"flex"} gap={"6px"} fontSize={{ base: "10px", lg: "16px" }}>
          <Image src={Postsimg} h={{ lg: "20px", base: "10px" }} w={{ lg: "20px", base: "10px" }} />
          <Text>Posts</Text>
        </Tab>
        <Tab display={"flex"} gap={"6px"} fontSize={{ base: "10px", lg: "16px" }}>
          <Image src={Eventsimg} h={{ lg: "20px", base: "10px" }} w={{ lg: "20px", base: "10px" }} />
          <Text>Events</Text>
        </Tab>
        <Tab display={"flex"} gap={"6px"} fontSize={{ base: "10px", lg: "16px" }}>
          <Image src={Iacheived} h={{ lg: "20px", base: "10px" }} w={{ lg: "20px", base: "10px" }} />
          <Text>I Acheived</Text>
        </Tab>
        <Tab display={"flex"} gap={"6px"} fontSize={{ base: "10px", lg: "16px" }}>
          <Image src={SettingsImage} h={{ lg: "20px", base: "10px" }} w={{ lg: "20px", base: "10px" }} />
          <Text>Posts</Text>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {/* strip */}
          <Flex
            display={{ base: "none", lg: "flex" }}
            mt="-10px"
            h={{ lg: "40px", base: "30px" }}
            justifyContent={"space-between"}
            alignItems={"center"}
            p={{ lg: "30px", base: "20px" }}
            boxShadow={"rgba(0, 0, 0, 0.24) 0px 2px 8px"}
            borderRadius={"10px"}
          >
            <Box>
              <Text fontSize={{ base: "10px", lg: "16px" }} color={"gray.500"}>
                Showing 1-24 of 270 results
              </Text>
            </Box>
            <Flex gap={"10px"}>
              <Select
                focusBorderColor="orange"
                placeholder="Sort"
                w={{ base: "100px", lg: "200px" }}
                h={{ base: "30px", lg: "40px" }}
                m={"auto"}
              >
                <option value="option1">All</option>
                <option value="option2">Ascending</option>
                <option value="option3">Descending</option>
              </Select>
              <Flex justifyContent={"center"} alignItems={"center"} gap={"10px"}>
                <Text>Grid</Text>
                <Button bg={"none"} onClick={() => setlistStyle(false)}>
                  <Image src={GridImage} />
                </Button>
                <Button bg={"none"} onClick={() => setlistStyle(true)}>
                  <Image src={GridImage2} />
                </Button>
              </Flex>
            </Flex>
          </Flex>
          {/* Card */}
          <SimpleGrid columns={listStyle ? 1 : { base: 1, md: 2, lg: 4 }} gap={6}>
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
            <Card
              listStyle={listStyle}
              imageUrl={
                "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
            />
          </SimpleGrid>
        </TabPanel>
        <TabPanel>
          <Calenderevent />
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
        <TabPanel>
          <p>four!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Tabitem;
