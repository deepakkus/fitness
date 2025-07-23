// contact-us/page.tsx
"use client";
import { Box, Button, FormControl, Heading, Image, Input, Select, Text, Textarea, useToast } from "@chakra-ui/react";
import React, { ChangeEvent, useState, useEffect } from "react"; // Import useEffect
import { UploadIcon } from "@/components/Icons";
import { z } from "zod";

const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim() // Trim whitespace from both ends
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

  relatedHelp: z.string().min(1, "Please select a help option"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(50, "Email cannot exceed 50 characters"),

  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),

  message: z
    .string()
    .trim() // Trim whitespace from both ends
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message cannot exceed 1000 characters"),

  images: z.array(z.instanceof(File)).max(5, "Maximum 5 files allowed"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

type FormErrors = {
  [K in keyof ContactFormData]?: string;
};

const ContactPageData = {
  locationData: {
    heading: "Location",
    details: [
      { label: "Phone number", value: "(907) 220-9019" },
      { label: "Street", value: "2417 Tongass Ave #111" },
      { label: "City", value: "Ketchikan" },
      { label: "State", value: "Alaska (AK)" },
      { label: "Zipcode", value: "99901" },
      { label: "Country", value: "USA" },
      {
        label: "Address",
        value: "2417 Tongass Ave #111, Ketchikan, Alaska 99901, USA",
      },
    ],
  },
  buttonLabels: {
    submitButton: "Submit",
  },
  attachments: {
    title: "Attachments (up to 5)",
    chooseDocument: "Choose Document",
    deleteButton: "Delete",
  },
  messageSection: {
    typeMessage: "Type Message",
    placeholder: "Enter Message",
  },
  phoneNumberSection: {
    label: "Phone Number",
    placeholder: "Enter Phone Number",
  },
  emailSection: {
    label: "Email Address",
    placeholder: "Enter email address",
  },
  fullNameSection: {
    label: "Full Name",
    placeholder: "Enter full name",
  },
  labels: {
    fullName: "Full Name",
    relatedHelp: "Related help",
    contactUs: "Contact Us",
  },
  placeholders: {
    fullName: "Enter full name",
    relatedHelp: "Choose related help",
  },
  options: {
    relatedHelp: [
      { value: "report_activity", label: "Report an Activity/Event" },
      { value: "posting_issue", label: "Issue with Posting an Activity/Event" },
      { value: "joining_issue", label: "Issue with Joining an Activity/Event" },
      { value: "account_issue", label: "Account Issues" },
      { value: "technical_issue", label: "Technical Issue/Website Bug" },
      { value: "feature_request", label: "Feature Request/Suggestion" },
      { value: "general_inquiry", label: "General Inquiry" },
      { value: "privacy_concerns", label: "Privacy Concerns" },
      { value: "terms_of_service", label: "Terms of Service Inquiry" },
    ],
  },
};
const { locationData } = ContactPageData;

const ContactUs = () => {
  const [formData, setFormData] = React.useState<ContactFormData>({
    images: [],
    relatedHelp: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const toast = useToast();

  const validateField = (name: keyof ContactFormData, value: any) => {
    try {
      const fieldSchema = contactFormSchema.pick({ [name]: true });
      fieldSchema.parse({ [name]: value });
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0].message
        }));
      }
    }
  };

  const validateAllFields = () => {
    try {
      const trimmedFormData = {
            ...formData,
            fullName: formData.fullName.trim(),
            message: formData.message.trim(),
      }
      contactFormSchema.parse(trimmedFormData);
      setErrors({});
      setIsFormValid(true);

    } catch (error) {
      setIsFormValid(false)
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
           newErrors[err.path[0] as keyof ContactFormData] = err.message;
        });
          setErrors(newErrors);

      }
    }
  }

  useEffect(() => {
    const isFormTouched = Object.values(formData).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value; 
    });

    if (isFormTouched) {
      validateAllFields();
    } else {

      setErrors({});
      setIsFormValid(false);
    }
  }, [formData]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const invalidFiles = files.filter(file =>
      !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: "Only JPEG, JPG and PNG files are allowed"
      }));
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: "Files must not exceed 5MB"
      }));
      return;
    }

    if (formData.images.length + files.length <= 5) {
      const newImages = [...formData.images, ...files];
      setFormData(prev => ({ ...prev, images: newImages }));
      validateField('images', newImages);
    } else {
      setErrors(prev => ({
        ...prev,
        images: "Maximum 5 files allowed"
      }));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // No need to validate each field individually on change anymore,
    // `useEffect` will handle re-validation of the entire form.
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    validateAllFields(); // Ensure validation happens before submission check

    if (!isFormValid) {
      setIsSubmitting(false);
      toast({
        title: 'Please fill in the required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('relatedHelp', formData.relatedHelp);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('message', formData.message);

      formData.images.forEach(image => {
        formDataToSend.append('images', image); // Append File objects directly
      });

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setFormData({
          images: [],
          relatedHelp: "",
          fullName: "",
          email: "",
          phoneNumber: "",
          message: "",
        });
        setErrors({}); // Clear previous errors
        setIsFormValid(false)
        toast({
          title: 'Form submitted successfully!',
          description: 'We will get back to you soon.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

      } else {
        const errorData = await response.json();
        toast({
          title: 'Submission failed',
          description: errorData.message || 'An error occurred while submitting the form. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        // Handle errors (you might want to set an error state to show a message to the user)
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Handle errors (you might want to set an error state to show a message to the user)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageDelete = (index: number) => {
    const images = [...formData.images];
    images.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      images: images,
    }));
  };

  return (
    <Box
      display={"flex"}
      flexDir={{ base: "column", md: "row" }}
      gap={{ base: "40px", md: "60px" }}
      alignItems={"center"}
      py={"40px"}
      px={{ base: "20px", md: "30px" }}
      justifyContent="space-evenly"
    >
      <FormControl
        p="30px"
        borderRadius={"6px"}
        bgColor={"#FFFFFF"}
        border={"1px solid #F1F5F9"}
        w={"full"}
        maxWidth={"500px"}
        isInvalid={Object.keys(errors).length > 0}
      >
        <Text fontSize={"22px"} color="#334155" fontWeight={"700"} fontFamily="var(--font-mulish)">
          {ContactPageData.labels.contactUs}
        </Text>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.labels.fullName}
            <span style={{ color: 'red' }}>*</span>
          </Text>
          <Input
            mt={"10px"}
            fontSize={"16px"}
            type={"text"}
            placeholder={ContactPageData.placeholders.fullName}
            borderRadius={"3px"}
            _placeholder={{ color: "#CED4DA" }}
            onChange={handleInputChange}
            name="fullName"
            value={formData.fullName}
            isInvalid={!!errors.fullName}
            errorBorderColor="red.300"
          />
           {errors.fullName && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.fullName}
            </Text>
          )}
        </Box>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.labels.relatedHelp}
            <span style={{ color: 'red' }}>*</span>
          </Text>
          <Select
            mt={"10px"}
            size={"md"}
            name="relatedHelp"
            placeholder={ContactPageData.placeholders.relatedHelp}
            onChange={handleInputChange}
            value={formData.relatedHelp}
            border={"1px solid #CED4DA"}
            borderRadius={"3px"}
            color={formData.relatedHelp ? "#334155" : "#CED4DA !important"}
            isInvalid={!!errors.relatedHelp}
            errorBorderColor="red.300"
            sx={{
              '& option': { // Target all 'option' elements within this Select
                color: '#334155', // Set the color to black (or your desired black color)
              },
            }}
          >
            {ContactPageData.options.relatedHelp.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.relatedHelp && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.relatedHelp}
            </Text>
          )}
        </Box>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.emailSection.label}
            <span style={{ color: 'red' }}>*</span>
          </Text>
          <Input
            mt={"10px"}
            fontSize={"16px"}
            type={"email"}
            placeholder={ContactPageData.emailSection.placeholder}
            borderRadius={"3px"}
            _placeholder={{ color: "#CED4DA" }}
            onChange={handleInputChange}
            name="email"
            value={formData.email}
            isInvalid={!!errors.email}
            errorBorderColor="red.300"
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.email}
            </Text>
          )}
        </Box>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.phoneNumberSection.label}
            <span style={{ color: 'red' }}>*</span>
          </Text>
          <Input
            mt={"10px"}
            fontSize={"16px"}
            type={"number"}
            placeholder={ContactPageData.phoneNumberSection.placeholder}
            borderRadius={"3px"}
            _placeholder={{ color: "#CED4DA" }}
            onChange={handleInputChange}
            name="phoneNumber"
            value={formData.phoneNumber}
            isInvalid={!!errors.phoneNumber}
            errorBorderColor="red.300"
          />
          {errors.phoneNumber && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.phoneNumber}
            </Text>
          )}
        </Box>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.messageSection.typeMessage}
            <span style={{ color: 'red' }}>*</span>
          </Text>
          <Textarea
            mt={"10px"}
            fontSize={"16px"}
            h={"125px"}
            placeholder={ContactPageData.messageSection.placeholder}
            borderRadius={"3px"}
            _placeholder={{ color: "#CED4DA" }}
            onChange={handleInputChange}
            name="message"
            value={formData.message}
            isInvalid={!!errors.message}
            errorBorderColor="red.300"
          />
          {errors.message && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.message}
            </Text>
          )}
        </Box>
        <Box mt={"14px"}>
          <Text fontSize={"14px"} fontWeight={"400"} fontFamily="var(--font-mulish)" color="#475569">
            {ContactPageData.attachments.title}
          </Text>
          <Box
            mt={"10px"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            gap="10px"
            bgColor={"#F1F5F9"}
            p={"18px 22px"}
            w={"full"}
            pos={"relative"}
            border={errors.images ? "1px solid red" : "none"}
            borderRadius="3px"
          >
            <UploadIcon stroke="#475569" width="22px" height="22px" />
            <Text fontFamily={"var(--font-inter)"} color={"#6B7280"} fontWeight={"600"} pos={"relative"}>
              {ContactPageData.attachments.chooseDocument}
            </Text>
            <Input
              id="image-upload"
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              multiple
              position={"absolute"}
              top={"0"}
              left={"0"}
              opacity={"0"}
              onChange={handleImageUpload}
              zIndex={"3"}
            />
          </Box>
          {errors.images && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.images}
            </Text>
          )}
          <Box
            mt={"10px"}
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            gap="10px"
          >
            {formData.images.map((image, index) => {
              return (
                <Box
                  key={index}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  gap="10px"
                  bgColor={"#FFF"}
                  p={"10px"}
                  w={"full"}
                  pos={"relative"}
                  border={"1px solid #CBD5E1"}
                  borderRadius={"6px"}
                >
                  <Box display={"flex"} alignItems={"center"} gap="10px">
                    <Image
                      src={"/placeholder.avif"}
                      py={"18px"}
                      alt="picUpload"
                      w={"75px"}
                      h={"75px"}
                      objectFit={"cover"}
                      borderRadius={"3px"}
                      border={"1px solid #CBD5E1"}
                    />
                    <Text color={"#334155"} fontWeight={"500"}>
                      {`image.name`}
                    </Text>
                  </Box>
                  <Button onClick={() => handleImageDelete(index)} variant="link" colorScheme="red" px="20px">
                    {ContactPageData.attachments.deleteButton}
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box mt="28px">
          <Button
            size="md"
            w="full"
            onClick={handleSubmit}
            colorScheme="orange"
            isLoading={isSubmitting}
            loadingText="Submitting"
            isDisabled={!isFormValid || isSubmitting} // Disable button when form is invalid or submitting
          >
            {ContactPageData.buttonLabels.submitButton}
          </Button>
        </Box>
      </FormControl>
      <Box
        py="40px"
        px="50px"
        bgColor={"#FFF"}
        border="1px solid #F1F5F9"
        display={"flex"}
        flexDir={"column"}
        gap={"10px"}
        w={"full"}
        maxWidth={"460px"}
      >
        <Heading fontSize={"20px"} color="#334155" fontWeight={"700"}>
          {locationData.heading}
        </Heading>
        {locationData.details.map((item, index) => (
          <Text key={index} fontSize={"14px"} color="#475569" fontWeight={"400"}>
            {item.label}: {item.value}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default ContactUs;