//@/components/Profile/Settings.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  Box,
  Button,
  Input,
  Select,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  FormLabel,
  Grid,
  GridItem,
  useToast,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { myData } from "@/app/profile/me/page";
import Loading from "@/components/App/loading";
import { UserData } from "@/app/profile/me/page";

interface ValidationErrors {
  name?: string;
  email?: string;
  city?: string;
  zip?: string;
  age_group?: string;
  about_me?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordValidationErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Add these validation functions
const validateUserData = (data: typeof userDataForm): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Name validation
  if (!data.name?.trim()) {
    errors.name = "Name is required";
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.length > 50) {
    errors.name = "Name cannot exceed 50 characters";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // City validation
  if (!data.location?.trim()) {
    errors.city = "City is required";
  } else if (data.location.length > 100) {
    errors.city = "City name is too long";
  }

  // ZIP validation
  const zipRegex = /^\d{5}(-\d{4})?$/;
  const zip = data.location?.split("zip: ")[1];
  if (!zip) {
    errors.zip = "ZIP code is required";
  } else if (!zipRegex.test(zip)) {
    errors.zip = "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)";
  }

  // Age group validation
  if (!data.age_group) {
    errors.age_group = "Please select an age group";
  }

  // About me validation
  if (data.about_me && data.about_me.length > 500) {
    errors.about_me = "About me cannot exceed 500 characters";
  }

  return errors;
};

const validatePasswordForm = (data: typeof passwordForm): PasswordValidationErrors => {
  const errors: PasswordValidationErrors = {};
  
  // Old password validation
  if (!data.oldPassword) {
    errors.oldPassword = "Current password is required";
  }

  // New password validation
  if (!data.newPassword) {
    errors.newPassword = "New password is required";
  } else if (data.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.newPassword = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};


function CustomTab({ title }: { title: string }) {
  return (
    <Tab
      _selected={{
        color: "#F9690E",
        borderBottom: "2px solid #F9690E",
      }}
      color="gray.600"
      px={4}
      py={2}
    >
      {title}
    </Tab>
  );
}

export function UserAccount({ userData }: { userData: myData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PasswordValidationErrors>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Handler for password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler for changing password
  // const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setIsSubmitting(true);

  //   if (passwordForm.newPassword !== passwordForm.confirmPassword) {
  //     toast({
  //       title: "Error",
  //       description: "New passwords do not match.",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/update-password", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(passwordForm),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       toast({
  //         title: "Error",
  //         description: data.error || "An error occurred.",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     } else {
  //       toast({
  //         title: "Success",
  //         description: data.message || "Password updated successfully.",
  //         status: "success",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //       // Optionally reset the form
  //       setPasswordForm({
  //         oldPassword: "",
  //         newPassword: "",
  //         confirmPassword: "",
  //       });
  //       router.push("/profile/me");
  //     }
  //   } catch (error: any) {
  //     console.error("Network Error:", error);
  //     toast({
  //       title: "Network Error",
  //       description: error.message || "An unexpected error occurred",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validatePasswordForm(passwordForm);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "An error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Success",
          description: data.message || "Password updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Optionally reset the form
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        router.push("/profile/me");
      }
    } catch (error: any) {
      console.error("Network Error:", error);
      toast({
        title: "Network Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) return <Loading> ... </Loading>;

  return (
    <Box bg="white" w="full" border="1px solid #E2E8F0" borderRadius="12px" p={6}>
    <Tabs variant="unstyled" w="full">
      <TabList mb={6}>
        <CustomTab title="Account Auth" />
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          <form onSubmit={handleAuthSubmit}>
            <Grid templateColumns="150px 1fr" gap={6} alignItems="center">
              {/* ... (keep email input) ... */}
              
              <GridItem>
                <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                  Old Password
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
              </GridItem>
              <GridItem>
                <InputGroup size="md" maxW="300px">
                  <Input
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter old password"
                    size="md"
                    border="1px solid #CBD5E1"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordInputChange}
                    isInvalid={!!validationErrors.oldPassword}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      size="sm"
                      color="gray.500"
                      _hover={{ color: "#F9690E" }}
                    >
                      {showOldPassword ? 
                        <EyeOff size={18} /> : 
                        <Eye size={18} />
                      }
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {validationErrors.oldPassword && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.oldPassword}
                  </Text>
                )}
              </GridItem>

              <GridItem>
                <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                  New Password
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
              </GridItem>
              <GridItem>
                <InputGroup size="md" maxW="300px">
                  <Input
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    size="md"
                    border="1px solid #CBD5E1"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    isInvalid={!!validationErrors.newPassword}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      size="sm"
                      color="gray.500"
                      _hover={{ color: "#F9690E" }}
                    >
                      {showNewPassword ? 
                        <EyeOff size={18} /> : 
                        <Eye size={18} />
                      }
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {validationErrors.newPassword && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.newPassword}
                  </Text>
                )}
              </GridItem>

              <GridItem>
                <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                  Confirm Password
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
              </GridItem>
              <GridItem>
                <InputGroup size="md" maxW="300px">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    size="md"
                    border="1px solid #CBD5E1"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    isInvalid={!!validationErrors.confirmPassword}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      size="sm"
                      color="gray.500"
                      _hover={{ color: "#F9690E" }}
                    >
                      {showConfirmPassword ? 
                        <EyeOff size={18} /> : 
                        <Eye size={18} />
                      }
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {validationErrors.confirmPassword && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {validationErrors.confirmPassword}
                  </Text>
                )}
              </GridItem>
            </Grid>

            <Button
              size="md"
              mt={6}
              ml={"100px"}
              borderRadius="44px"
              bgColor="#f9690e"
              color="#fff"
              _hover={{ bgColor: "#DD6B20" }}
              type="submit"
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);
}

export function UserSettings({ userData }: { userData: myData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast(); 
  const [userDataForm, setUserDataForm] = useState({
    name: "",
    email: "",
    age_group: "",
    location: "",
    about_me: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});


  // Fetch user data when session is available
  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const res = await axios.get(`/api/user/${session.user.id}`);
        setUserDataForm(res.data);
      }
    };
    fetchData();
  }, [session]);

  // Single handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDataForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setIsSubmitting(true);
  //   try {
  //     await axios.put(`/api/user/${session?.user?.id}`, userData, {
  //       headers: {
  //         Authorization: `Bearer ${session?.accessToken}`,
  //       },
  //     });
  //     router.push("/profile/me");
  //   } catch (error) {
  //     setErrors({ general: "Failed to update profile" });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateUserData(userDataForm);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.put(`/api/user/${session?.user?.id}`, userData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      router.push("/profile/me");
    } catch (error) {
      setErrors({ general: "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`/api/user/${session?.user?.id}`, userData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      router.push("/profile/me");
    } catch (error) {
      setErrors({ general: "Failed to update profile" });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!userData) return <p>Loading...</p>;

  return (
    <Box bg="white" w="full" border="1px solid #E2E8F0" borderRadius="12px" p={6}>
      <Tabs variant="unstyled" w="full">
        <TabList mb={6}>
          <CustomTab title="User Info" />
          <CustomTab title="Change Password" />
        </TabList>
        <TabPanels>
          {/* User Info Tab */}
          <TabPanel p={0}>
            <form onSubmit={handleSubmit}>
              <Grid templateColumns="150px 1fr" gap={6} alignItems="center">
                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    Name
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.name}
                    maxW={"300px"}
                    placeholder="Enter your name"
                    border="1px solid #CBD5E1"
                    size="md"
                  />
                  {validationErrors.name && (
      <Text color="red.500" fontSize="sm" mt={1}>
        {validationErrors.name}
      </Text>
    )}
                </GridItem>

                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    Email
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.email}
                    maxW={"300px"}
                    placeholder="Enter your email"
                    isDisabled
                    size="md"
                    bg="gray.100"
                    border="1px solid #CBD5E1"
                  />
                  {validationErrors.email && (
      <Text color="red.500" fontSize="sm" mt={1}>
        {validationErrors.email}
      </Text>
    )}
                </GridItem>

                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    City
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="city"
                    value={`${`${userData.location}`.split("city: ")[1]}`.split(", zip")[0]}
                    onChange={handleInputChange}
                    maxW={"300px"}
                    placeholder="Enter your location"
                    size="md"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>
                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    Zip
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="zip"
                    value={`${userData.location}`.split("zip: ")[1]}
                    onChange={handleInputChange}
                    maxW={"300px"}
                    placeholder="Enter your location"
                    size="md"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>

                <GridItem>
  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
    Age Group
  </FormLabel>
</GridItem>
<GridItem>
  <Box>
    <Select
      name="age_group"
      value={userData.age_group}
      onChange={handleInputChange}
      maxW={"300px"}
      placeholder="Select Age Group"
      size="md"
      border="1px solid #CBD5E1"
      isInvalid={!!validationErrors.age_group}
      errorBorderColor="red.300"
      _invalid={{
        borderColor: "red.300",
        boxShadow: "0 0 0 1px #FC8181"
      }}
    >
      <option key={0} value={"age_13_18"}>{"13-18"}</option>
      <option key={1} value={"age_19_24"}>{"19-24"}</option>
      <option key={2} value={"age_25_30"}>{"25-30"}</option>
      <option key={3} value={"age_31_40"}>{"31-40"}</option>
      <option key={4} value={"age_41_50"}>{"41-50"}</option>
      <option key={5} value={"age_51_60"}>{"51-60"}</option>
    </Select>
    {validationErrors.age_group && (
      <Text color="red.500" fontSize="sm" mt={1}>
        {validationErrors.age_group}
      </Text>
    )}
  </Box>
</GridItem>

                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    About Me
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Textarea
                    name="about_me"
                    value={userData.about_me || ""}
                    onChange={handleInputChange}
                    maxW={"300px"}
                    placeholder="Tell us about yourself"
                    size="sm"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>
              </Grid>

              <Button
                type="submit"
                mt={6}
                colorScheme="orange"
                size="lg"
                width="full"
                maxW={"300px"}
                ml={"50px"}
                isLoading={isSubmitting}
                bg="#F9690E"
                _hover={{ bg: "#e55a0c" }}
              >
                Submit
              </Button>
            </form>
          </TabPanel>

          {/* Change Password Tab */}
          <TabPanel p={0}>
            <form onSubmit={handleAuthSubmit}>
              <Grid templateColumns="150px 1fr" gap={6} alignItems="center">
                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    Old Password
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="oldPassword"
                    type="password"
                    maxW={"300px"}
                    placeholder="Enter old password"
                    size="md"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>

                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    New Password
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="newPassword"
                    type="password"
                    maxW={"300px"}
                    placeholder="Enter new password"
                    size="md"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>

                <GridItem>
                  <FormLabel fontSize="md" fontWeight="bold" color="gray.600">
                    Confirm Password
                  </FormLabel>
                </GridItem>
                <GridItem>
                  <Input
                    name="confirmPassword"
                    type="password"
                    maxW={"300px"}
                    placeholder="Confirm new password"
                    size="md"
                    border="1px solid #CBD5E1"
                  />
                </GridItem>
              </Grid>

              <Button
                type="submit"
                mt={6}
                maxW={"300px"}
                colorScheme="orange"
                size="lg"
                width="full"
                bg="#F9690E"
                ml={"50px"}
                _hover={{ bg: "#e55a0c" }}
              >
                Change Password
              </Button>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}



export function Settings({ profileData }: { profileData: UserData }) {
  return (
    <Box bgColor={"#fff"} w={"full"} border={"1px solid #E2E8F0"} borderRadius={"12px"}>
      <Tabs position="relative" variant="unstyled" w="full">
        <TabList px={"10px"} borderBottom={"1px solid #E2E8F0"}>
          <CustomTab title={"Profile Info"} />
        </TabList>
        <TabIndicator
          _selected={{
            color: "#f9690e",
          }}
          mt="-2px"
          height="2px"
          bg={"#f9690e"}
          borderRadius="12px"
        />
        <TabPanels>
          <TabPanel
            p={{
              base: "30px",
              md: "45px 45px 0px 45px",
            }}
            m={0}
          >
            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"flex-start"}
              alignItems={"flex-start"}
              gap={"20px"}
              w="full"
            >
              <Box
                display={"flex"}
                flexDir={{
                  base: "column",
                  md: "row",
                }}
                alignItems={{
                  base: "flex-start",
                  md: "center",
                }}
                w={"full"}
              >
                <Text fontSize={"16px"} color={"#64748B"} w={"full"} maxW={"150px"}>
                  Name
                </Text>

                <Text fontSize={"16px"} color={"#475569"} display={"flex"} alignItems={"center"} gap={"5px"}>
                  {profileData.name}
                </Text>
              </Box>
              <Box
                display={"flex"}
                flexDir={{
                  base: "column",
                  md: "row",
                }}
                alignItems={{
                  base: "flex-start",
                  md: "center",
                }}
                w={"full"}
              >
                <Text fontSize={"16px"} color={"#64748B"} w={"full"} maxW={"150px"}>
                  Age
                </Text>

                <Text fontSize={"16px"} color={"#475569"} display={"flex"} alignItems={"center"} gap={"5px"}>
                  {profileData.age_group}
                </Text>
              </Box>

              <Box
                display={"flex"}
                flexDir={{
                  base: "column",
                  md: "row",
                }}
                mb={"20px"}
                alignItems={{
                  base: "flex-start",
                  md: "center",
                }}
                w={"full"}
              >
                <Text fontSize={"16px"} color={"#64748B"} w={"full"} maxW={"150px"}>
                  About me
                </Text>

                <Text
                  fontSize={"16px"}
                  color={"#475569"}
                  display={"flex"}
                  alignItems={"center"}
                  gap={"5px"}
                  maxW={"300px"}
                  flexWrap={"wrap"}
                >
                  {profileData.about_me}
                </Text>
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
