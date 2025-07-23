import { Box, Flex, Spinner } from "@chakra-ui/react";

const Loading = ({ children = undefined }: { children?: any | undefined }) => {
  return (
    <Box bg="transparent" maxW={"1380px"} mx={"auto"}>
      <Flex
        flexDir={"row"}
        justifyContent={"center"}
        alignItems={"center"}
        gap={"1em"}
        py={"40px"}
        bg="transparent"
        textAlign={"center"}
        fontSize={"1em"}
        px={{ base: "10px", md: "30px" }}
      >
        <Spinner /> {children}
      </Flex>
    </Box>
  );
};

export default Loading;
