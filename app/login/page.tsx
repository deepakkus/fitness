// // app/login/page.tsx
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import {
//   Box,
//   Button,
//   Checkbox,
//   Input,
//   InputGroup,
//   InputRightElement,
//   SimpleGrid,
//   Text,
//   Image,
//   useToast,
// } from "@chakra-ui/react";
// import { useRef, useState, useEffect } from "react";
// import Link from "next/link";
// import { EyeIcon } from "@/components/Icons";
// import { TopActivities } from "@/components/Card/TopActivities";
// import { useRouter } from "next/navigation";
// import { signIn, useSession } from "next-auth/react";

// export default function SignIn() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [userInfo, setUserInfo] = useState({ email: "", password: "" });

//   // by adarsh
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);
//   // by adarsh

//   const passwordRef = useRef<HTMLInputElement>(null);
//   const toast = useToast();
//   const router = useRouter();
//   const { data: session } = useSession();
//   useEffect(() => {
//     if (session) {
//       router.push("/profile/me");
//     }
//   }, [session, router]);

//   const togglePassword = () => {
//     if (passwordRef.current?.type === "text") {
//       passwordRef.current.type = "password";
//     } else if (passwordRef.current) {
//       passwordRef.current.type = "text";
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const res = await signIn("credentials", {
//         redirect: false,
//         email: userInfo.email,
//         password: userInfo.password,
//       });

//       if (res?.error) {
//         toast({
//           title: "Error",
//           description: res.error,
//           status: "error",
//         });
//       } else {
//         toast({
//           title: "Success",
//           description: "Logged in successfully",
//           status: "success",
//         });
//         router.push("/profile/me");
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "An unexpected error occurred",
//         status: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       setIsGoogleLoading(true);
//       const result = await signIn("google", {
//         redirect: false,
//         callbackUrl: "/profile/me",
//       });
      
//       if (result?.error) {
//         toast({
//           title: "Error",
//           description: "Google sign-in failed",
//           status: "error",
//         });
//       }
//       // Successful sign-in will trigger the useEffect hook above
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to connect with Google",
//         status: "error",
//       });
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };


//   if (session) {
//     return null; // or a loading spinner
//   }

//   return (
//     <Box display={"flex"} flexWrap={"wrap"} maxH={"80vh"}>
//       <SimpleGrid
//         columns={{ base: 1, md: 2 }}
//         gap={{ base: "64px", md: "64px", lg: "138px" }}
//         py={"20px"}
//         px={{ base: "22px", md: "128px" }}
//         justifyItems="center"
//       >
//         <Box
//           bg={"#FFF"}
//           border={"1px solid #E2E8F0"}
//           w={"410px"}
//           display={"flex"}
//           maxH={"70vh"}
//           flexDirection={"column"}
//           borderRadius={"10px"}
//           py={"20px"}
//           px={"32px"}
//         >
//           <Box>
//             <Text fontSize={"22px"} color="#334155" fontWeight={"700"} fontFamily="var(--font-mulish)">
//               Hello Again!
//             </Text>
//           </Box>
//           <form onSubmit={handleSubmit}>
//             <Box mt={"14px"}>
//               <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
//                 Email ( admin@example.com )
//               </Text>
//               <InputGroup size="lg" mt="9px">
//                 <Input
//                   fontSize={"16px"}
//                   type={"email"}
//                   placeholder={"Enter email address"}
//                   borderRadius={"3px"}
//                   _placeholder={{ color: "#CED4DA" }}
//                   name="email"
//                   required
//                   value={userInfo.email}
//                   onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
//                 />
//               </InputGroup>
//             </Box>
//             <Box mt={"14px"}>
//               <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
//                 <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
//                   Password ( admin@1234 )
//                 </Text>
//                 <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
//                   <Link href="/update-password">Forgot Password?</Link>
//                 </Text>
//               </Box>
//               <InputGroup size="lg" mt="9px">
//                 <Input
//                   fontSize={"16px"}
//                   type={"password"}
//                   ref={passwordRef}
//                   borderRadius={"3px"}
//                   placeholder={"Enter password"}
//                   _placeholder={{ color: "#CED4DA" }}
//                   name="password"
//                   required
//                   value={userInfo.password}
//                   onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
//                 />
//                 <InputRightElement w="auto" px="11px" onClick={togglePassword}>
//                   <EyeIcon width="20px" height="20px" stroke="#334155" />
//                 </InputRightElement>
//               </InputGroup>
//             </Box>
//             <Box mt={"25px"}>
//               <Box display="flex" justifyContent="space-between" alignItems="center">
//                 <Checkbox size="md" colorScheme="orange" defaultChecked>
//                   <Text fontSize={"13px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#94A3B8">
//                     Remember me
//                   </Text>
//                 </Checkbox>
//                 <Box>
//                   <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
//                     <Link href="#">Verify Account</Link>
//                   </Text>
//                 </Box>
//               </Box>

//               <Box mt="21px">
//                 <Button
//                   type="submit"
//                   colorScheme="orange"
//                   px={"114px"}
//                   py="12px"
//                   borderRadius={"3px"}
//                   w={"full"}
//                   isLoading={isSubmitting}
//                 >
//                   <Text fontSize={"16px"} fontWeight={"600"} fontFamily="var(--font-mulish)">
//                     Login
//                   </Text>
//                 </Button>
//               </Box>
//               <Box mt="21px" textAlign={"center"}>
//                 <Text
//                   mt="21px"
//                   fontSize="16px"
//                   color="#334155"
//                   lineHeight="20px"
//                   alignItems="center"
//                   fontWeight={"700"}
//                 >
//                   OR
//                 </Text>
//               </Box>
//               {/* <Box mt="21px" justifyItems="center">
//             <Button
//               px="16px"
//               py="8px"
//               display="flex"
//               alignItems="center"
//               gap="8px"
//               border="1px solid"
//               borderColor="#cbd5e1"
//               borderRadius="lg"
//               color="#475569"
//               w="full"
//               isLoading={isGoogleLoading}
//               _hover={{
//                 borderColor: "#94a3b8",
//                 color: "#0f172a",
//                 boxShadow: "md",
//               }}
//               transition="all 0.15s ease-in-out"
//               onClick={handleGoogleSignIn}
//             >
//               <Image
//                 src="/google-auth.avif"
//                 alt="Google logo"
//                 boxSize="24px"
//                 loading="lazy"
//               />
//               <Text fontSize="md" fontWeight="normal">
//                 Continue with Google
//               </Text>
//             </Button>
//           </Box> */}
//             </Box>
//           </form>
//           <Box mt="25px" textAlign={"center"}>
//             Don&apos;t have account?
//             <Text color={"#f9690e"} ml={"5px"} as="span">
//               <Link href="/signup">Create Account</Link>
//             </Text>
//           </Box>
//         </Box>
//         <TopActivities />
//       </SimpleGrid>
//     </Box>
//   );
// }




"use client";

import {
  Box,
  Button,
  Checkbox,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  useToast,
  Container,
  Flex,
  Spinner, // Import the Spinner component for the fallback
  Image, // Import Image component
} from "@chakra-ui/react";
import { useRef, useState, useEffect, Suspense } from "react"; // Import Suspense
import Link from "next/link";
import { EyeIcon } from "@/components/Icons";
import { TopActivities } from "@/components/Card/TopActivities";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

// Create a separate component to use useSearchParams
function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const passwordRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile/me";

  // Google Login State - ADDED
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // ADDED

  useEffect(() => {
    if (session) {
      router.push(callbackUrl || "/profile/me");
    }
  }, [session, router, callbackUrl]); // Add callbackUrl to the dependency array

  const togglePassword = () => {
    if (passwordRef.current) {
      passwordRef.current.type = passwordRef.current.type === "text" ? "password" : "text";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: userInfo.email,
        password: userInfo.password,
        callbackUrl: callbackUrl,
      });

      if (res?.error) {
        toast({
          title: "Error",
          description: res.error,
          status: "error",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully",
          status: "success",
        });
        router.push(callbackUrl || "/profile/me");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        status: "error",
      });
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Google Sign-in Handler - ADDED
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: callbackUrl, // Use callbackUrl here as well
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: "Google sign-in failed",
          status: "error",
        });
      }
      // Successful sign-in will trigger the useEffect hook above
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect with Google : ${error}`,
        status: "error",
      });
      // console.log(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };


  if (session) {
    return null;
  }

  return (
    <Box
      w="full"
      maxW={{ base: "100%", md: "450px" }}
      mx="auto"
      bg="white"
      borderRadius="10px"
      border="1px solid #E2E8F0"
      p={{ base: "4", sm: "6", md: "8" }}
      boxShadow="sm"
    >
      <Text
        fontSize={{ base: "xl", md: "2xl" }}
        color="#334155"
        fontWeight="700"
        fontFamily="var(--font-mulish)"
        mb="6"
      >
        Hello Again!
      </Text>

      <form onSubmit={handleSubmit}>
        <Box mb="4">
          <Text mb="2" fontSize="sm" color="#475569">
            Email ( admin@example.com )
          </Text>
          <InputGroup size={{ base: "md", md: "lg" }}>
            <Input
              type="email"
              placeholder="Enter email address"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              required
            />
          </InputGroup>
        </Box>

        <Box mb="6">
          <Flex justify="space-between" align="center" mb="2">
            <Text fontSize="sm" color="#475569">
              Password ( admin@1234 )
            </Text>
            <Link href="/update-password">
              <Text fontSize="sm" color="#475569" _hover={{ color: "#f9690e" }}>
                Forgot Password?
              </Text>
            </Link>
          </Flex>
          <InputGroup size={{ base: "md", md: "lg" }}>
            <Input
              type="password"
              ref={passwordRef}
              placeholder="Enter password"
              value={userInfo.password}
              onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
              required
            />
            <InputRightElement>
              <Button size="sm" variant="ghost" onClick={togglePassword}>
                <EyeIcon width="20px" height="20px" stroke="#334155" />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>

        <Flex justify="space-between" align="center" mb="6">
          <Checkbox size="md" colorScheme="orange" defaultChecked>
            <Text fontSize="sm" color="#94A3B8">
              Remember me
            </Text>
          </Checkbox>
          {/* <Link href="#">
            <Text fontSize="sm" color="#475569" _hover={{ color: "#f9690e" }}>
              Verify Account
            </Text>
          </Link> */}
        </Flex>

        <Button
          type="submit"
          colorScheme="orange"
          w="full"
          size="lg"
          isLoading={isSubmitting}
          mb="6"
        >
          Login
        </Button>

        <Box textAlign="center" mb="6">
          <Text fontSize="md" fontWeight="700" color="#334155">
            OR
          </Text>
        </Box>

        {/* Google Login Button - ADDED */}
        <Box mt="4" mb="6" justifyItems="center">
            <Button
              px="16px"
              py="8px"
              display="flex"
              alignItems="center"
              gap="8px"
              border="1px solid"
              borderColor="#cbd5e1"
              borderRadius="lg"
              color="#475569"
              w="full"
              isLoading={isGoogleLoading}
              _hover={{
                borderColor: "#94a3b8",
                color: "#0f172a",
                boxShadow: "md",
              }}
              transition="all 0.15s ease-in-out"
              onClick={handleGoogleSignIn}
            >
              <Image
                src="/google-auth.avif"
                alt="Google logo"
                boxSize="24px"
                loading="lazy"
              />
              <Text fontSize="md" fontWeight="normal">
                Continue with Google
              </Text>
            </Button>
          </Box>
        {/* Google Login Button - ADDED */}


        <Box textAlign="center">
          <Text fontSize="md" color="#475569">
            Don't have account?{" "}
            <Link href="/signup">
              <Text as="span" color="#f9690e" _hover={{ textDecoration: "underline" }}>
                Create Account
              </Text>
            </Link>
          </Text>
        </Box>
      </form>
    </Box>
  );
}

export default function SignIn() {
  return (
    <Box
      minH="100vh"
      bg="#F8FAFC"
      py={{ base: "6", md: "10" }}
      px={{ base: "4", sm: "6", md: "8" }}
    >
      <Container maxW="1400px">
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={{ base: "8", lg: "16" }}
          alignItems="start"
        >
          <Suspense fallback={<Flex justifyContent="center"><Spinner /></Flex>}>
            <LoginForm />
          </Suspense>
          <Box w="full" maxW={{ base: "100%", md: "450px" }} mx="auto">
            <TopActivities />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}