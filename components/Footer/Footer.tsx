import { Box, Container, Flex, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

const Footer = () => {
  const textColor = "#475569"; // Define a consistent color

  return (
    <Box px="5px" py="2px" bg="#fff" borderTop="1px solid #E2E8F0" w="100%">
      <Container maxW="1xl" py={4}>
        {/* First Row */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "center" }}
        >
          {/* Left side navigation */}
          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={{ base: 3, sm: 8 }}
            align={{ base: "center", sm: "center" }}
            mb={{ base: 4, md: 0 }}
          >
            <Link href="/about-us">
              <Text color={textColor} fontSize="14px" fontWeight="500">About</Text>
            </Link>
            <Link href="/privacy">
              <Text color={textColor} fontSize="14px" fontWeight="500">Privacy</Text>
            </Link>
            <Link href="/terms">
              <Text color={textColor} fontSize="14px" fontWeight="500">Terms</Text>
            </Link>
            <Link href="/faq">
              <Text color={textColor} fontSize="14px" fontWeight="500">FAQ</Text>
            </Link>
            <Link href="/contact-us">
              <Text color={textColor} fontSize="14px" fontWeight="500">Contact Us</Text>
            </Link>
          </Stack>

          {/* Version number */}
          <Text
  fontWeight="500"
  fontSize="14px"
  color={textColor}
  mt={{ base: 2, md: 0 }}
>
  {process.env.NEXT_PUBLIC_VERSION ? `Version ${process.env.NEXT_PUBLIC_VERSION}` : null}
</Text>
        </Flex>

        {/* Second Row */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "center" }}
          mt={0}
        >
          {/* Copyright text */}
          <Text
            fontWeight="500"
            color={textColor}
            mb={{ base: 2, md: 0 }}
          >
            © Copyrights {new Date().getFullYear()} GAPP
          </Text>

          {/* Developer credit */}
   {/* Developer credit */}
   <Link href="https://cyberforttech.com/" target="_blank" rel="noopener noreferrer">
    <Text
      fontWeight="500"
      color={textColor}
    >
      Developed by{' '}
      <Text
        as="span" // Use span to apply inline styles without affecting the block nature
        fontWeight="500"
        color={textColor}
        borderBottom="1px solid" // Adjust the thickness (e.g., 1px, 0.5px)
        display="inline-block" // Keep it inline
      >
        Cyber Fort Technologies
      </Text>
    </Text>
  </Link>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;