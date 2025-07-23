/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Box,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  useToast, // Import the useToast hook
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { EyeIcon, LeftArrowIcon } from "@/components/Icons";
import { TopActivities } from "@/components/Card/TopActivities";
import { useRouter } from "next/navigation";

export default function ForgetPassword() {
  const router = useRouter();

  const passwordRef = useRef(null);
  const toast = useToast(); // Initialize toast
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [password, setPassword] = useState("");

  // Toggle password visibility
  const togglePassword = () => {
    if (passwordRef.current.type === "text") {
      passwordRef.current.type = "password";
    } else {
      passwordRef.current.type = "text";
    }
  };

  // Function to handle sending OTP
  const handleSendOtp = async () => {
    try {
      // API call to send OTP
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsOtpSent(true); // Show OTP input
        toast({
          title: "OTP Sent.",
          description: "Please check your email for the OTP.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to send OTP.");
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to handle password reset
  const handlePasswordReset = async () => {
    try {
      // API call to reset password
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      if (response.ok) {
        toast({
          title: "Password Reset Successful.",
          description: "You can now log in with your new password.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        throw new Error("Failed to reset password.");
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        gap={{ base: "64px", md: "64px", lg: "138px" }}
        py={"40px"}
        px={{ base: "22px", md: "128px" }}
        justifyItems="center"
      >
        <Box
          bg={"#FFF"}
          border={"1px solid #E2E8F0"}
          w={"410px"}
          maxH={"70vh"}
          display={"flex"}
          flexDirection={"column"}
          borderRadius={"6px"}
          py={"34px"}
          px={"32px"}
        >
          <Button maxWidth={"fit-content"} mb={"27px"} onClick={() => router.push("/login")}>
            <LeftArrowIcon />
            <Text
              fontSize={"16px"}
              color={"#868E96"}
              display={"flex"}
              ml={"10px"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              gap={"12px"}
            >
              Back
            </Text>
          </Button>
          <Box>
            <Text fontSize={"22px"} color="#334155" fontWeight={"700"} fontFamily="var(--font-mulish)">
              Forgot Password
            </Text>
          </Box>
          <Box mt={"14px"}>
            <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
              Email
            </Text>
            <InputGroup size="lg" mt="9px">
              <Input
                fontSize={"16px"}
                type={"email"}
                placeholder={"Enter email address"}
                borderRadius={"3px"}
                _placeholder={{ color: "#CED4DA", fontSize: "16px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputRightElement
                w="auto"
                bg="#F1F5F9"
                border="1px solid #CBD5E1"
                px="11px"
                borderRightRadius={"3px"}
                cursor={"pointer"}
                role="group"
                color="#94A3B8"
                _hover={{ bg: "#f9690e", color: "#fff" }}
                onClick={handleSendOtp}
              >
                <Text
                  display="inline-block"
                  fontSize={"16px"}
                  fontWeight={"400"}
                  fontFamily="var(--font-mulish)"
                  wordBreak="keep-all"
                >
                  Send OTP
                </Text>
              </InputRightElement>
            </InputGroup>
          </Box>

          {isOtpSent && (
            <>
              <Box mt={"14px"}>
                <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
                  OTP
                </Text>
                <InputGroup size="lg" mt="9px">
                  <Input
                    fontSize={"16px"}
                    type={"number"}
                    borderRadius={"3px"}
                    placeholder={"Enter OTP"}
                    _placeholder={{ color: "#CED4DA", fontSize: "16px" }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </InputGroup>
              </Box>
              <Box mt={"14px"}>
                <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
                  Set Password
                </Text>
                <InputGroup size="lg" mt="9px">
                  <Input
                    fontSize={"16px"}
                    type={"password"}
                    ref={passwordRef}
                    borderRadius={"3px"}
                    placeholder={"Enter password"}
                    _placeholder={{ color: "#CED4DA", fontSize: "16px" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement w="auto" px="11px" onClick={togglePassword}>
                    <EyeIcon width="20px" height="20px" stroke="#334155" />
                  </InputRightElement>
                </InputGroup>
              </Box>
              <Box mt={"23px"}>
                <Button
                  bgColor={"#f9690e"}
                  color={"#fff"}
                  _hover={{ bgColor: "#DD6B20" }}
                  px={"114px"}
                  py="12px"
                  borderRadius={"3px"}
                  onClick={handlePasswordReset}
                >
                  <Text fontSize={"16px"} fontWeight={"600"} fontFamily="var(--font-mulish)">
                    Reset Password
                  </Text>
                </Button>
              </Box>
            </>
          )}
        </Box>
        <TopActivities />
      </SimpleGrid>
    </Box>
  );
}
