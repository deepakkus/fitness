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
//   useToast,
// } from "@chakra-ui/react";

// import axios from "axios";
// import { useRef, useState } from "react";
// import { useRouter } from "next/navigation"; // Use Next.js router

// import { EyeIcon, LeftArrowIcon } from "@/components/Icons";
// import { TopActivities } from "@/components/Card/TopActivities";
// import { signIn } from "next-auth/react"; 

// // Import your EyeIcon component or replace with an icon from Chakra UI

// export default function SignUp() {
//   // States
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   // Refs
//   const passwordRef = useRef<HTMLInputElement>(null);

//   // Toggle password visibility
//   const togglePassword = () => {
//     if (passwordRef.current) {
//       if (passwordRef.current.type === "text") {
//         passwordRef.current.type = "password";
//       } else {
//         passwordRef.current.type = "text";
//       }
//     }
//   };

//   // Initialize
//   const toast = useToast();
//   const router = useRouter();

//   const handleCreateAccount = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const passwordMinLength = 8;

//     if (!form.email || !emailRegex.test(form.email)) {
//       toast({
//         title: "Please enter a valid email address",
//         status: "error",
//       });
//       return;
//     }

//     if (!form.password || form.password.length < passwordMinLength) {
//       toast({
//         title: `Password must be at least ${passwordMinLength} characters long`,
//         status: "error",
//       });
//       return;
//     }

//     try {
//       const res = await axios.post("/api/signup", {
//         email: form.email,
//         password: form.password,
//       });

//       const { status, message } = res.data;

//       if (status === "error" || status === false) {
//         toast({
//           title: message,
//           status: "error",
//         });
//         return;
//       }

//       toast({
//         title: message,
//         status: "success",
//       });

//       // Log the user in after successful account creation
//       const loginRes = await signIn("credentials", {
//         redirect: false,
//         email: form.email,
//         password: form.password,
//       });

//       if (loginRes?.error) {
//         toast({
//           title: "Error",
//           description: loginRes.error,
//           status: "error",
//         });
//       } else {
//         // Redirect to profile setup
//         router.push("/profile/setup");
//       }
//     } catch (error: any) {
//       console.error(error);
//       const errorMessage = error.response?.data?.message || "An unexpected error occurred";
//       toast({
//         title: "Error",
//         description: errorMessage,
//         status: "error",
//       });
//     }
//   };

//   return (
//     <Box bg="#F8FAFC">
//       <SimpleGrid
//         columns={{ base: 1, md: 2 }}
//         gap={{ base: "64px", md: "64px", lg: "138px" }}
//         py="40px"
//         px={{ base: "22px", md: "128px" }}
//         justifyItems="center"
//         alignItems="center"
//       >
//         <Box
//           bg="#FFF"
//           border="1px solid #E2E8F0"
//           w="410px"
//           display="flex"
//           flexDirection="column"
//           borderRadius="10px"
//           py="40px"
//           px="32px"
//         >
//           <Button maxWidth={"fit-content"} mb={"27px"} onClick={() => router.push("/login")}>
//             <LeftArrowIcon />
//             <Text
//               fontSize={"16px"}
//               color={"#868E96"}
//               display={"flex"}
//               ml={"10px"}
//               alignItems={"center"}
//               justifyContent={"flex-start"}
//               gap={"12px"}
//             >
//               Back
//             </Text>
//           </Button>
//           <Text fontSize="22px" color="#334155" fontWeight="700" fontFamily="var(--font-mulish)">
//             Create Account
//           </Text>

//           <Box mt="14px">
//             <Text fontSize="14px" fontWeight="400" fontFamily="var(--font-mulish)" color="#475569">
//               Email
//             </Text>
//             <InputGroup size="lg" mt="9px">
//               <Input
//                 fontSize="16px"
//                 type="email"
//                 placeholder="Enter email address"
//                 borderRadius="3px"
//                 _placeholder={{ color: "#CED4DA" }}
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
//               />
//             </InputGroup>
//           </Box>

//           <Box mt="14px">
//             <Text fontSize="14px" fontWeight="400" fontFamily="var(--font-mulish)" color="#475569">
//               Set Password
//             </Text>
//             <InputGroup size="lg" mt="9px">
//               <Input
//                 fontSize="16px"
//                 type="password"
//                 ref={passwordRef}
//                 borderRadius="3px"
//                 placeholder="Enter password"
//                 _placeholder={{ color: "#CED4DA" }}
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//               />
//               <InputRightElement w="auto" px="11px" onClick={togglePassword}>
//                 {/* Replace with your EyeIcon component */}
//                 <EyeIcon width="20px" height="20px" stroke="#334155" />
//               </InputRightElement>
//             </InputGroup>
//           </Box>

//           {/* Password suggestions */}
//           <Box mt="14px">
//             <Text fontSize="14px" fontWeight="600" fontFamily="var(--font-mulish)" color="#475569">
//               Make your password strong by adding:
//             </Text>
//             <Box mt="10px">
//               <Text fontSize="13px" fontWeight="400" fontFamily="var(--font-mulish)" color="#f9690e">
//                 • Minimum 8 characters (letters & numbers)
//               </Text>
//               <Text fontSize="13px" fontWeight="400" fontFamily="var(--font-mulish)" color="#f9690e">
//                 • Minimum 1 special character (@ # $ % ! ^ & *)
//               </Text>
//             </Box>
//             <Box mt="21px">
//               <Checkbox size="md" colorScheme="orange" isChecked={true} isReadOnly>
//                 <Text fontSize="14px" color="#334155">
//                   Terms & Conditions
//                 </Text>
//               </Checkbox>
//             </Box>
//             <Box mt="23px">
//               <Button
//                 type="submit"
//                 colorScheme="orange"
//                 px={"114px"}
//                 py="12px"
//                 borderRadius={"3px"}
//                 w={"full"}
//                 onClick={handleCreateAccount}
//               >
//                 <Text fontSize={"16px"} fontWeight={"600"} fontFamily="var(--font-mulish)">
//                   Create Account
//                 </Text>
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//         <TopActivities />

//         {/* Optional: Add Top Posts and Events Section if needed */}
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
} from "@chakra-ui/react";
import axios from "axios";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, LeftArrowIcon } from "@/components/Icons";
import { TopActivities } from "@/components/Card/TopActivities";
import { signIn } from "next-auth/react";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "", // Add name field to the form state
    email: "",
    password: "",
  });
  const passwordRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const togglePassword = () => {
    if (passwordRef.current) {
      passwordRef.current.type = passwordRef.current.type === "text" ? "password" : "text";
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password } = form; // Destructure name from form
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordMinLength = 8;

    // Name Validation
    if (!name || name.trim() === "") {
      toast({
        title: "Please enter your name",
        status: "error",
      });
      return;
    }

    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Please enter a valid email address",
        status: "error",
      });
      return;
    }

    if (!password || password.length < passwordMinLength) {
      toast({
        title: `Password must be at least ${passwordMinLength} characters long`,
        status: "error",
      });
      return;
    }

    try {
      const res = await axios.post("/api/signup", {
        name: name.trim(), // Send name to the backend
        email: email,
        password: password,
      });

      const { status, message } = res.data;

      if (status === "error" || status === false) {
        toast({
          title: message,
          status: "error",
        });
        return;
      }

      toast({
        title: message,
        status: "success",
      });

      // Log the user in after successful account creation
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      if (loginRes?.error) {
        toast({
          title: "Error",
          description: loginRes.error,
          status: "error",
        });
      } else {
        // Redirect to profile setup
        router.push("/profile/setup");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
      });
    }
  };

  return (
    <Box
      bg="#F8FAFC"
      minH="100vh"
      px={{ base: "4", sm: "6", md: "8", lg: "16" }}
      py={{ base: "6", md: "10" }}
    >
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: "8", lg: "16" }}
        maxW="1400px"
        mx="auto"
        alignItems="start"
      >
        {/* Sign Up Form */}
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
          <Button
            maxW="fit-content"
            mb="6"
            onClick={() => router.push("/login")}
            variant="ghost"
            leftIcon={<LeftArrowIcon />}
          >
            <Text color="#868E96">Back</Text>
          </Button>

          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            color="#334155"
            fontWeight="700"
            fontFamily="var(--font-mulish)"
            mb="6"
          >
            Create Account
          </Text>

          <form onSubmit={handleCreateAccount}>
            {/* Name Field */}
            <Box mb="4">
              <Text mb="2" fontSize="sm" color="#475569">
                Name
              </Text>
              <InputGroup size={{ base: "md", md: "lg" }}>
                <Input
                  type="text" // Changed type to text
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} // Update name in form state
                  required
                />
              </InputGroup>
            </Box>

            <Box mb="4">
              <Text mb="2" fontSize="sm" color="#475569">
                Email
              </Text>
              <InputGroup size={{ base: "md", md: "lg" }}>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
                  required
                />
              </InputGroup>
            </Box>

            <Box mb="6">
              <Text mb="2" fontSize="sm" color="#475569">
                Set Password
              </Text>
              <InputGroup size={{ base: "md", md: "lg" }}>
                <Input
                  type="password"
                  ref={passwordRef}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <InputRightElement>
                  <Button size="sm" variant="ghost" onClick={togglePassword}>
                    <EyeIcon width="20px" height="20px" stroke="#334155" />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            <Box mb="6">
              <Text fontSize="sm" fontWeight="600" color="#475569" mb="3">
                Make your password strong by adding:
              </Text>
              <Text fontSize="xs" color="#f9690e" mb="2">
                • Minimum 8 characters (letters & numbers)
              </Text>
              <Text fontSize="xs" color="#f9690e">
                • Minimum 1 special character (@ # $ % ! ^ & *)
              </Text>
            </Box>

            <Checkbox
              size="md"
              colorScheme="orange"
              isChecked={true}
              isReadOnly
              mb="6"
            >
              <Text fontSize="sm" color="#334155">
                Terms & Conditions
              </Text>
            </Checkbox>

            <Button
              type="submit"
              colorScheme="orange"
              w="full"
              size="lg"
              borderRadius="3px"
            >
              <Text fontSize="md" fontWeight="600" fontFamily="var(--font-mulish)">
                Create Account
              </Text>
            </Button>
          </form>
        </Box>

        {/* Top Activities Section */}
        <Box w="full" maxW={{ base: "100%", md: "450px" }} mx="auto">
          <TopActivities />
        </Box>
      </SimpleGrid>
    </Box>
  );
}