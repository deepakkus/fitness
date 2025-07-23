"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Input,
  Select,
  Text,
  Textarea,
  useToast,
  Skeleton,
  FormErrorMessage
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import styles from "./ProfileSetup.module.css";

interface UserData {
  id: string;
  name: string;
  profile_pic: string;
  location: string;
  about_me?: string | null;
  age_group: string | null;
  email: string;
  Profile?: { bio: string | null };
  count: {
    Followers: number;
    Following: number;
    Post: number;
    Events: number;
  };
}

// Define the shape of our form
interface FormState {
    profileImage: string;
    fullName: string;
    ageGroup: string;
    cityName: string;
    zipCode: string;
    aboutYourself: string;
}

// Define the shape of our errors object, each key correspond to form field
interface FormErrors {
  fullName?: string;
  ageGroup?: string;
  cityName?: string;
  zipCode?: string;
}


export default function ProfileSetup() {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<string | ArrayBuffer | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    // Use our interfaces

  const [form, setForm] = useState<FormState>({
    profileImage: "",
    fullName: "",
    ageGroup: "",
    cityName: "",
    zipCode: "",
    aboutYourself: "",
  });
  // Create state for errors
    const [errors, setErrors] = useState<FormErrors>({});
  const toast = useToast();

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          setIsLoading(true);
          const userRes = await axios.get(`/api/user/me`, { withCredentials: true });
          setUserData(userRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const extractCity = (location: string) => {
    if (!location) return "";
    let cityPart = location.split("city: ")[1];

    let city = cityPart ? cityPart.split(", zip")[0] : "";
    return city ? city : "";
  };

  const extractZip = (location: string) => {
    if (!location) return "";

    let zip = location.split("zip: ")[1];
    return zip ? zip : "";
  };

  useEffect(() => {
      // When userData is available, populate the form state
    if (userData) {
      setForm({
        profileImage: "",
        fullName: userData.name || "",
        ageGroup: userData.age_group || "",
        cityName: extractCity(userData.location),
        zipCode: extractZip(userData.location),
        aboutYourself: userData.about_me || "",
      });
    }
  }, [userData]);

 

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Only jpeg, png, jpg files are allowed", status: "error" });
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: "File too large", description: "File size should be less than 1MB", status: "error" });
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      setForm({ ...form, profileImage: file.name });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
      // Update state and clear errors for changed field
    setForm({ ...form, [name]: value });
      setErrors({...errors, [name]: undefined})
  };


  const validateForm = (): boolean => {
      const newErrors: FormErrors = {};
    // Validate each field
      if (!form.fullName.trim()) {
          newErrors.fullName = "Name is required";
      }
      if (!form.ageGroup) {
          newErrors.ageGroup = "Age group is required";
      }
      if (!form.cityName.trim()) {
        newErrors.cityName = "City is required";
      }
      if (!form.zipCode.trim()) {
          newErrors.zipCode = "Zip code is required";
      }
      //Set errors or return true if validation passed
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      //Validate form before submitting
      if (!validateForm()) {
          toast({ title: "Please fill all required fields.", status: "error" });
          return;
      }
    try {
      setIsSubmitting(true);
      toast({ title: "Submitting...", description: "Profile being setup...", status: "loading" });
  
      if (session) {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
  
        // Handle profile picture upload if there's a file
        if (file) {
          const imageFormData = new FormData();
          imageFormData.append("image", file);
          imageFormData.append("bucket_name", "profiles");
  
          const imgResponse = await fetch("/api/images", {
            method: "POST",
            body: imageFormData,
            headers,
          });
  
          if (!imgResponse.ok) {
            const imgError = await imgResponse.json();
            toast({
              title: "Image Upload Error",
              description: imgError.error || "Failed to upload image",
              status: "error",
              isClosable: true,
            });
            setIsSubmitting(false);
            return;
          }
  
          toast({ title: "Profile Pic Updated", status: "success", isClosable: true });
        }
  
        // Profile update
        const formData = new FormData();
        formData.append("username", session.user?.email?.split("@")[0] || "");
        formData.append("name", form.fullName || "");  // Always send name, even if empty
        
        if (form.cityName || form.zipCode) {
          formData.append("location", `city: ${form.cityName}, zip: ${form.zipCode}`);
        }
        if (form.ageGroup) {
          formData.append("age_group", form.ageGroup);
        }
        if (form.aboutYourself) {
          formData.append("about_me", form.aboutYourself);
        }
  
        const profileResponse = await fetch("/api/profile", {
          method: "POST",
          body: formData,
          headers,
        });
  
        const responseData = await profileResponse.json();
  
        if (profileResponse.ok) {
          toast({ title: "Profile updated successfully", status: "success" });
          router.push("/profile/me");
        } else {
          throw new Error(responseData.error || "Failed to update profile");
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({ 
        title: "Error updating profile", 
        description: error.message || "An unexpected error occurred", 
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p="40px" display="flex" justifyContent={"center"} className="font-mulish">
      <Box maxW={"850px"} w={"full"}>
        {isLoading ?
          <Skeleton height="400px" />
        : <form onSubmit={handleSubmit}>
            <Box className={styles.profileSetup}>
              {!form.fullName && (
                <>
                  <Text className={styles.heading}>{"Let's set up your profile"}</Text>
                  <Text className={styles.subHeading}>
                    {
                      "Tell us more about yourself so we can provide you a personalized experience tailored to your needs and preferences."
                    }
                  </Text>
                </>
              )}

<Box display={"flex"} flexDir={"column"} gap="20px">
  <Box className={styles.flex} gap={"1em"}>
    <Box
      position="relative"
      w="150px"
      h="150px"
      borderRadius="50%"
      overflow="hidden"
      _hover={{
        cursor: "pointer",
        opacity: 0.8,
      }}
      onClick={() => document.getElementById("profileImageInput")?.click()}
    >
      {profileImage ? (
        <Image
          src={profileImage as string}
          w="150px"
          h="150px"
          objectFit={"cover"}
          id="profileImage"
          alt="profileImage"
          borderRadius="50%"
        />
      ) : userData?.profile_pic ? (
        <Image
          src={userData.profile_pic}
          w="150px"
          h="150px"
          objectFit={"cover"}
          alt="profilePic"
          borderRadius="50%"
        />
      ) : (
        <Box
          w="150px"
          h="150px"
          bgColor="#cecece"
          borderRadius="50%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="1.5em" color="#000">
            {"+"}
          </Text>
        </Box>
      )}
    </Box>

    <FormControl className={styles.flexCol} justifyContent={"center"}>
      {/* Single hidden input for file selection */}
      <Input
        id="profileImageInput"
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        display="none"
        onChange={handleImageChange}
      />
      
      <Button
        pos={"relative"}
        justifyContent={"center"}
        className={styles.uploadButton}
        variant={"outline"}
        onClick={() => document.getElementById("profileImageInput")?.click()}
      >
        {form.profileImage ? `Upload Image` : `Edit Profile Pic`}
      </Button>
      
      <Text mt="20px" className={styles.text}>
        {".png, jpeg, jpg files up to 1MB. Recommended size is 256×256px."}
      </Text>
    </FormControl>
  </Box>

                <Box display={"flex"} gap="20px" w={"full"}>
                  <Box flex="1">
                    <FormControl isInvalid={!!errors.fullName}>
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Full Name
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#f9690e"
                        type="text"
                        value={form.fullName}
                        placeholder="Enter full name"
                        fontSize={"16px"}
                        color="#000"
                        _placeholder={{ color: "#CED4DA" }}
                        name="fullName"
                        border={"1px solid #CBD5E1"}
                        borderRadius={"3px"}
                        onChange={handleInputChange}
                      />
                      <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box flex="1">
                    <FormControl isInvalid={!!errors.ageGroup}>
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Age Group
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Select
                        focusBorderColor="#f9690e"
                        w={"full"}
                        mt={"10px"}
                        size={"md"}
                        value={form.ageGroup}
                        fontSize={"16px"}
                        placeholder="Select Age Group"
                        _placeholder={{ color: "#CED4DA" }}
                        border={"1px solid #CED4DA"}
                        borderRadius={"3px"}
                        color="#000"
                        name="ageGroup"
                        onChange={handleInputChange}
                      >
                        <option value="age_13_18">13-18</option>
                        <option value="age_19_24">19-24</option>
                        <option value="age_25_30">25-30</option>
                        <option value="age_31_40">31-40</option>
                        <option value="age_41_50">41-50</option>
                        <option value="age_51_60">51-60</option>
                      </Select>
                        <FormErrorMessage>{errors.ageGroup}</FormErrorMessage>
                    </FormControl>
                  </Box>
                </Box>

                <Box display={"flex"} gap="20px" w={"full"}>
                  <Box flex="1">
                    <FormControl isInvalid={!!errors.cityName}>
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        City Name
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#f9690e"
                        type="text"
                        value={form.cityName}
                        placeholder="Enter City Name"
                        fontSize={"16px"}
                        color="#000"
                        _placeholder={{ color: "#CED4DA" }}
                        name="cityName"
                        borderRadius={"3px"}
                        onChange={handleInputChange}
                      />
                         <FormErrorMessage>{errors.cityName}</FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box flex="1">
                    <FormControl isInvalid={!!errors.zipCode}>
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Zip Code
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#f9690e"
                        type="text"
                        value={form.zipCode}
                        placeholder="Enter Zip Code"
                        fontSize={"16px"}
                        color="#000"
                        _placeholder={{ color: "#CED4DA" }}
                        name="zipCode"
                        borderRadius={"3px"}
                        onChange={handleInputChange}
                      />
                           <FormErrorMessage>{errors.zipCode}</FormErrorMessage>
                    </FormControl>
                  </Box>
                </Box>

                <Box flex="1">
                  <FormControl>
                    <FormLabel color={"#475569"} fontSize={"14px"}>
                      About Yourself
                    </FormLabel>
                    <Textarea
                      height="150px"
                      focusBorderColor="#f9690e"
                      value={form.aboutYourself}
                      placeholder="Write About Yourself"
                      fontSize="16px"
                      color="#000"
                      _placeholder={{ color: "#CED4DA" }}
                      name="aboutYourself"
                      onChange={handleInputChange}
                      borderRadius="3px"
                    />
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box p="30px" display={"flex"} justifyContent={"space-between"} gap="20px" bgColor={"#FFF"}>
              <Button
                size="md"
                px="44px"
                borderRadius="3px"
                bgColor="#fff"
                color="#EF4444"
                onClick={() => router.push("/profile/me")}
              >
                Cancel
              </Button>
              <Button
                size="md"
                px="44px"
                borderRadius="44px"
                bgColor="#f9690e"
                color="#fff"
                _hover={{ bgColor: "#DD6B20" }}
                type="submit"
                isLoading={isSubmitting}
              >
                Update Profile
              </Button>
            </Box>
          </form>
        }
      </Box>
    </Box>

  );
}