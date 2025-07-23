import { Heading as Title } from "@chakra-ui/react";

const Heading = ({ children, ...props }) => {
  return (
    <Title
      fontSize={"22px"}
      fontFamily={"var(--font-mulish)"}
      color={"#334155"}
      fontWeight={"700"}
      {...props}
    >
      {children}
    </Title>
  );
};

export default Heading;
