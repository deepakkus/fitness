// app/providers.tsx

import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import Footer from "@/components/Footer/Footer"; // Adjust import paths
import Navbar from "@/components/Header/Navbar";
import "@fontsource/mulish";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning={true}>
      <ChakraProvider
        theme={extendTheme({
          fonts: {
            text: `mulish`,
          },
        })}
        toastOptions={{
          defaultOptions: {
            position: "top-right",
            duration: 2000,
            isClosable: true,
          },
        }}
      >
        {/* ClientProvider handles useEffect logic */}
        <Flex direction="column" minH="100vh" backgroundColor={"#f8fafc"} fontFamily={"var(--font-mulish)"}>
          <Navbar />
          <Box flex="1" id="root">
            {children}
          </Box>
          <Footer />
        </Flex>
      </ChakraProvider>
    </div>
  );
}
