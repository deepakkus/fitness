"use client";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Image,
  Input,
  ModalHeader,
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useSteps,
  useToast,
  Flex,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";

import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";

import axios from "axios";
import React, { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import { useRouter } from "next/navigation";
import { CloseIcon,  UploadIcon } from "@/components/Icons";
import InfoIcon from "@/components/Icons/InfoIcon";
import Loading from "@/components/App/loading";

import { useSession } from "next-auth/react";
import { UserData } from "@/app/profile/me/page";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CreatepostPagedata = {
  regulationsHeading: ["Gapp Post Creation Regulation"],
  regulations: [
    "1. All posts must be verified.",
    "2. No spam or promotional content allowed.",
    "3. Be respectful in your descriptions.",
    "4. Follow community guidelines.",
  ],
  formLabels: [
    "Post Title",
    "Post Sub-Title",
    "Category",
    "City",
    "Zip",
    "Start Date",
    "Start Time",
    "End Time",
    "Max Participants",
    "Rules",
    "Contact Info",
    "URL",
    "Post Description",
    "Upload Images (Up to 5)",
  ],
  placeholders: [
    "Enter Post Title",
    "Enter Post Sub-Title (optional)",
    "Category",
    "Enter City",
    "Enter Zip",
    "Enter Post Start Date",
    "12:00",
    "Enter Post End Time",
    "Max Participants",
    "Rules (optional)",
    "Contact Information",
    "Website or External Link (optional)",
    "Detailed Description",
    "Click to upload",
  ],
  uploadText: ["Click to upload", "Jpeg, jpg, png (max 5mb)"],
  heading: {
    text: "Create Post",
    fontSize: "22px",
    fontFamily: "var(--font-mulish)",
    color: "#334155",
    fontWeight: "700",
  },
};

const steps = [
  { title: "Required", description: "Post Details" },
  { title: "Optional", description: "Post Rules" },
  { title: "Preview", description: "Review Post" },
  { title: "Payment", description: "Payment" },
];

interface ValidationRules {
  [key: string]: any;
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  sub_title: {
    maxLength: number;
  };
  category: {
    required: boolean;
  };
  city: {
    required: boolean;
    pattern: RegExp;
  };
  zip: {
    required: boolean;
    pattern: RegExp;
  };
  start_date: {
    required: boolean;
    minDate: Date;
  };
  start_time: {
    required: boolean;
  };
  end_time: {
    required: boolean;
  };
  max_participants: {
    min: number;
    max: number;
  };
  description: {
    required: boolean;
    minLength: number;
  };
  contact_info: {
    pattern: RegExp;
  };
  url: {
    pattern: RegExp;
  };
  images: {
    maxSize: number; // in bytes
    allowedTypes: string[];
    maxCount: number;
    required: boolean; 
    minCount: number;
  };
}

const validationRules: ValidationRules = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100
  },
  sub_title: {
    maxLength: 150
  },
  category: {
    required: true
  },
  city: {
    required: true,
    pattern: /^[a-zA-Z\s-]+$/
  },
  zip: {
    required: true,
    pattern: /^[A-Za-z0-9\- ]{3,10}$/
  },
  start_date: {
    required: true,
    minDate: new Date()
  },
  start_time: {
    required: true
  },
  end_time: {
    required: true
  },
  max_participants: {
    min: 1,
    max: 10000
  },
  description: {
    required: true,
    minLength: 10
  },
  contact_info: {
    pattern: /^([0-9()-.\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
  },
  url: {
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
  },
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxCount: 5,
    required: true, 
    minCount: 1
  }
};

interface ValidationError {
  field: string;
  message: string;
}

const isValidTimeRange = (startTime: string, endTime: string) => {
  return endTime > startTime;
};

// Modified validation function that doesn't depend on external state
const validateField = (fieldName: keyof ValidationRules, value: any, context: { startTime?: string } = {}): ValidationError | null => {
  const rules = validationRules[fieldName];
  if (!rules) return null;

  switch (fieldName) {
    case 'title':
      if (rules.required && !value) {
        return { field: fieldName, message: 'Title is required' };
      }
      if (value.length < rules.minLength) {
        return { field: fieldName, message: `Title must be at least ${rules.minLength} characters` };
      }
      if (value.length > rules.maxLength) {
        return { field: fieldName, message: `Title must not exceed ${rules.maxLength} characters` };
      }
      break;

    case 'sub_title':
      if (value && value.length > rules.maxLength) {
        return { field: fieldName, message: `Sub-title must not exceed ${rules.maxLength} characters` };
      }
      break;

    case 'category':
      if (rules.required && !value) {
        return { field: fieldName, message: 'Please select a category' };
      }
      break;

    case 'city':
      if (rules.required && !value) {
        return { field: fieldName, message: 'City is required' };
      }
      if (value && !rules.pattern.test(value)) {
        return { field: fieldName, message: 'Please enter a valid city name' };
      }
      break;

    case 'zip':
      if (rules.required && !value) {
        return { field: fieldName, message: 'ZIP code is required' };
      }
      if (value && !rules.pattern.test(value)) {
        return { field: fieldName, message: 'Please enter a valid ZIP code' };
      }
      break;

    case 'start_date':
      if (rules.required && !value) {
        return { field: fieldName, message: 'Start date is required' };
      }
      if (new Date(value) < rules.minDate) {
        return { field: fieldName, message: 'Start date cannot be in the past' };
      }
      break;

    case 'start_time':
      if (rules.required && !value) {
        return { field: fieldName, message: 'Start time is required' };
      }
      break;

    case 'end_time':
      if (rules.required && !value) {
        return { field: fieldName, message: 'End time is required' };
      }
      if (context.startTime && !isValidTimeRange(context.startTime, value)) {
        return { field: fieldName, message: 'End time must be after start time' };
      }
      break;

    case 'max_participants':
      if (value) {
        const numValue = parseInt(value);
        if (numValue < rules.min) {
          return { field: fieldName, message: `Minimum participants allowed is ${rules.min}` };
        }
        if (numValue > rules.max) {
          return { field: fieldName, message: `Maximum participants allowed is ${rules.max}` };
        }
      }
      break;

    case 'description':
      if (rules.required && (!value || value === '<p><br></p>')) {
        return { field: fieldName, message: 'Description is required' };
      }
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      if (textContent.length < rules.minLength) {
        return { field: fieldName, message: `Description must be at least ${rules.minLength} characters` };
      }
      break;

    case 'contact_info':
      if (value && !rules.pattern.test(value)) {
        return { field: fieldName, message: 'Please enter a valid phone number or email' };
      }
      break;

    case 'url':
      if (value && !rules.pattern.test(value)) {
        return { field: fieldName, message: 'Please enter a valid URL' };
      }
      break;
  }

  return null;
};

function QuillOutput({ htmlContent, ...props }: { htmlContent: string; [key: string]: any }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} {...props} />;
}

// Add PaymentForm component for the payment step
const PaymentForm = ({
  nameOnCard,
  setNameOnCard,
  isProcessing,
  handlePayNow,
  handlePrevious,
  billingDetails,
  setBillingDetails
}: {
  nameOnCard: string;
  setNameOnCard: (val: string) => void;
  isProcessing: boolean;
  handlePayNow: (e: React.FormEvent) => void;
  handlePrevious: () => void;
  billingDetails: BillingDetails;
  setBillingDetails: (val: BillingDetails) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  return (
    <Box
      bg="#fff"
      borderRadius="16px"
      border="1px solid #F1F5F9"
      boxShadow="0 2px 8px rgba(0,0,0,0.04)"
      p={{ base: 6, md: 10 }}
      mb={6}
      maxW="900px"
      mx="auto"
    >
      <form>
        {/* Billing Details */}
        <Heading fontSize="lg" mb={4} color="#334155">Billing Details</Heading>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={6}>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder="First Name"
              value={billingDetails.firstName}
              onChange={e => setBillingDetails({ ...billingDetails, firstName: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder="Last Name"
              value={billingDetails.lastName}
              onChange={e => setBillingDetails({ ...billingDetails, lastName: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Email"
              value={billingDetails.email}
              onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              placeholder="Phone Number"
              value={billingDetails.phone}
              onChange={e => setBillingDetails({ ...billingDetails, phone: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>City</FormLabel>
            <Input
              placeholder="City"
              value={billingDetails.city}
              onChange={e => setBillingDetails({ ...billingDetails, city: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Zip</FormLabel>
            <Input
              placeholder="Zip"
              value={billingDetails.zip}
              onChange={e => setBillingDetails({ ...billingDetails, zip: e.target.value })}
            />
          </FormControl>
          <FormControl isRequired gridColumn={{ base: '1', md: '1 / span 2' }}>
            <FormLabel>Address</FormLabel>
            <Input
              placeholder="Address"
              value={billingDetails.address}
              onChange={e => setBillingDetails({ ...billingDetails, address: e.target.value })}
            />
          </FormControl>
        </Grid>
        {/* Card Details */}
        <FormControl mb={6} isRequired>
          <FormLabel fontWeight="bold">Name On Card</FormLabel>
          <Input placeholder="Enter Name On Card" size="lg" value={nameOnCard} onChange={e => setNameOnCard(e.target.value)} />
        </FormControl>
        <FormControl mb={6} isRequired>
          <FormLabel fontWeight="bold">Card Details</FormLabel>
          <Box p={3} border="1px solid #F1F5F9" borderRadius="6px" bg="#f9fafb">
            <CardElement options={{ style: { base: { fontSize: '16px', color: '#000' }, invalid: { color: '#fa755a' } } }} />
          </Box>
        </FormControl>
        <Flex justifyContent="flex-end" gap={4} mt={8}>
          <Button variant="outline" colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="button" onClick={handlePrevious}>
            Back
          </Button>
          <Button colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="button" onClick={handlePayNow} isLoading={isProcessing}>
            Pay Now
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

// Add BillingDetails type and state to CreatePost
interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  zip: string;
  address: string;
}

const CreatePost = () => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [nameOnCard, setNameOnCard] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const sponsoredBg = '/sponsoredPosts.png';
  const sponsoredBgImg = '/sponsoredPostsImg.png';
  const [modalType, setModalType] = useState<string | null>(null);
  const [hasSeenSponsoredModal, setHasSeenSponsoredModal] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    zip: '',
    address: '',
  });
  const [billingExists, setBillingExists] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const userRes = await axios.get(`/api/user/me`, {
            withCredentials: true,
          });

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

  useEffect(() => {
    // Fetch billing details for logged in user
    const fetchBillingDetails = async () => {
      try {
        const res = await axios.get('/api/billing-details', { withCredentials: true });
        if (res.data && res.data.data) {
          const b = res.data.data;
          setBillingDetails({
            firstName: b.first_name || '',
            lastName: b.last_name || '',
            email: b.email || '',
            phone: b.phone || '',
            city: b.city || '',
            zip: b.zip || '',
            address: b.address || '',
          });
          setBillingExists(true);
        } else {
          setBillingExists(false);
        }
      } catch (err) {
        setBillingExists(false);
      }
    };
    if (session) fetchBillingDetails();
  }, [session]);

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([
    {
      id: "0",
      name: "category",
    },
  ]); // Categories from the API
  // Update state for image handling to use the correct types
  const [postFormData, setPostFormData] = useState<{ [key: string]: any; title: string; sub_title: string; category: string; sub_category: string; city: string; zip: string; start_date: string; start_time: string; end_time: string; max_participants: string; is_sponsored: boolean; rules: string; contact_info: string; url: string; description: string; images: File[]; imagesLink: string[]; }>(
    {
      title: "",
      sub_title: "",
      category: "",
      sub_category: "",
      city: "",
      zip: "",
      start_date: new Date().toISOString().split("T")[0],
      start_time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      end_time: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      max_participants: "",
      is_sponsored: false,
      rules: "",
      contact_info: "",
      url: "",
      description: "",
      images: [] as File[],
      imagesLink: [] as string[],
    }
  );

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  // Fetch categories on page load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/activity-type`, {
          withCredentials: true,
        });

        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

// Modified handleInputChange function
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  if (name === 'is_sponsored') {
    const isSponsored = value === "1";
    setPostFormData((prevData) => ({
      ...prevData,
      is_sponsored: isSponsored,
    }));
    if (isSponsored && !hasSeenSponsoredModal) {
      setModalType("sponsored");
      onOpen();
      setHasSeenSponsoredModal(true);
    }
    if (!isSponsored) {
      setHasSeenSponsoredModal(false);
    }
  } else {
    setPostFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }


  
};

  // Image validation function
const validateImage = (file: File): ValidationError | null => {
  const rules = validationRules.images;

  if (!rules.allowedTypes.includes(file.type)) {
    return {
      field: 'images',
      message: 'Invalid file type. Only JPEG, JPG, and PNG files are allowed.'
    };
  }

  if (file.size > rules.maxSize) {
    return {
      field: 'images',
      message: 'File size exceeds 5MB limit.'
    };
  }

  return null;
};

  // Update the image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
  
    // Check number of images
    if (files.length + postFormData.images.length > validationRules.images.maxCount) {
      toast({
        title: `Maximum ${validationRules.images.maxCount} images allowed`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    // Validate each image
    for (const file of files) {
      const error = validateImage(file);
      if (error) {
        toast({
          title: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }
  
    // If all validations pass, update state
    const newImages = [...postFormData.images, ...files];
    const newImagesLink = [...newImages.map((file) => URL.createObjectURL(file))];
  
    setPostFormData((prevData) => ({
      ...prevData,
      images: newImages,
      imagesLink: newImagesLink,
    }));
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...postFormData.images];
    newImages.splice(index, 1);
    setPostFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);

  // View image in modal instead of opening a new tab
  const handleImageView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onOpen();
  };

  const handlePrevious = () => {
    setActiveStep(activeStep > 0 ? activeStep - 1 : 0);
  };
  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate all required fields for step 1
      const requiredFields: (keyof typeof postFormData)[] = ['title', 'category', 'city', 'zip', 'start_date', 'start_time', 'end_time', 'description'];
      const errors = requiredFields
        .map((field: keyof typeof postFormData) => validateField(field as keyof ValidationRules, postFormData[field]))
        .filter((error: ValidationError | null) => error !== null);
  
      if (errors.length > 0) {
        errors.forEach(error => {
          toast({
            title: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
        return;
      }
      
      // Additional time validation
      if (postFormData.end_time <= postFormData.start_time) {
        toast({
          title: 'End time must be after start time',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      setActiveStep(activeStep + 1);
    } else if (activeStep === 1) {

      if (postFormData.images.length < validationRules.images.minCount) {
        toast({
          title: 'At least one image is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Make contact_info required
      if (!postFormData.contact_info || !postFormData.contact_info.trim()) {
        toast({
          title: 'Contact information is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      // Validate contact information format
      if (!validationRules.contact_info.pattern.test(postFormData.contact_info)) {
        toast({
          title: 'Please enter a valid phone number or email address',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      // Validate other optional fields if they have values
      const optionalFieldsToValidate = ['url'];
      
      // Add URL to validation if it's not empty
      if (postFormData.url.trim()) {
        const urlError = validateField('url' as keyof ValidationRules, postFormData.url);
        if (urlError) {
          toast({
            title: urlError.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }
      
      // Validate images if any are uploaded
      if (postFormData.images.length > 0) {
        // Check each image against size and type constraints
        const imageErrors = postFormData.images
          .map(image => validateImage(image))
          .filter(error => error !== null);
          
        if (imageErrors.length > 0) {
          imageErrors.forEach(error => {
            toast({
              title: error.message,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          });
          return;
        }
      }
      
      // Validate rules length if provided
      if (postFormData.rules.trim().length > 0 && postFormData.rules.trim().length < 10) {
        toast({
          title: 'Rules must be at least 10 characters long if provided',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
      setActiveStep(activeStep + 1);
    } else if (activeStep === 2 || activeStep === 4) {

      if (postFormData.images.length < validationRules.images.minCount) {
        toast({
          title: 'At least one image is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      try {
        if (session) {
          toast({
            title: `Creating Post.. please wait..`,
            status: "loading",
            duration: 1000,
          });
          setIsProcessing(true);

          const headers: HeadersInit = {};

          if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
          }

          // Non-image data submission
          const body = {
            title: postFormData.title,
            sub_title: postFormData.sub_title,
            activity_type_id: postFormData.category,
            location: `city: ${postFormData.city}, zip: ${postFormData.zip}`,
            start_time: `${postFormData.start_date} ${postFormData.start_time}`,
            end_time: `${postFormData.start_date} ${postFormData.end_time}`,
            max_participants: postFormData.max_participants ? parseInt(postFormData.max_participants) : null,
            is_sponsored: postFormData.is_sponsored,
            rules: postFormData.rules,
            contact_info: postFormData.contact_info,
            url: postFormData.url,
            description: postFormData.description,
          };

          // Post non-image data to /api/post/create
          const postResponse = await axios.post(`/api/post/create`, body, {
            withCredentials: true,
          });

          const postData = postResponse.data;

          if (postData.post && postData.post.id) {
            const activity_id = postData.post.id;
            const imageFormData = new FormData();
            if (postFormData.images.length >= 1) {
              toast({
                title: `Uploading Images.. pls wait..`,
                status: "loading",
                duration: 5000,
              });
              if (postFormData.images.length === 1) {
                // Single image upload
                imageFormData.append("image", postFormData.images[0]);
              } else {
                // Multiple images upload
                postFormData.images.forEach((image) => {
                  imageFormData.append("imagelist", image); // Use "imagelist" key for multiple files
                });
              }
              imageFormData.append("bucket_name", "activities");
              imageFormData.append("activity_id", activity_id);

              try {
                const imgResponse = await fetch("/api/images", {
                  method: "POST",
                  body: imageFormData,
                  headers,
                });
                if (!imgResponse.ok) {
                  throw new Error(`Image upload failed`);
                }
               
              } catch (error) {
                console.error("Error uploading image", error);
                toast({
                  title: `Uploading Images.. failed..`,
                  status: "error",
                });
                router.refresh();
              }
              
            }
            if(activeStep === 4){
                const paymentBody = {
                  postId: activity_id
               };
              const paymentResponse = await axios.post(`/api/payment/create`, paymentBody, {
              withCredentials: true,
              });
            }
            
            toast({
              title: `Post Created Successfully`,
              status: "success",
            });
            setShowPaymentForm(true); // Show payment form after post creation
            // router.push(`/posts/${activity_id}`); // Do this after payment
            router.push(`/posts/${activity_id}`);
          } else {
            toast({
              title: "Error creating Post",
              status: "error",
            });
            router.refresh();
          }
        }
        setIsProcessing(false);
      } catch (error) {
        setIsProcessing(false);

        console.error("Error submitting post", error);
        toast({
          title: "Error submitting post",
          status: "error",
        });
      }
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    setIsProcessing(true);

    // Save billing details if not already saved
    if (!billingExists) {
      try {
        await axios.post('/api/billing-details', {
          firstName: billingDetails.firstName,
          lastName: billingDetails.lastName,
          emailAddress: billingDetails.email,
          phoneNumber: billingDetails.phone,
          city: billingDetails.city,
          zip: billingDetails.zip,
          address: billingDetails.address,
        }, { withCredentials: true });
        setBillingExists(true);
      } catch (err) {
        toast({ title: 'Failed to save billing details', status: 'error' });
        setIsProcessing(false);
        return;
      }
    }

    const cart = [{ id: 'post', name: 'Sponsored', price: 5.00 }];

    try {
        // 1. Call backend to create PaymentIntent
        const res = await axios.post('/api/stripe/list-payment', {
          name: nameOnCard,
          cart
        });
        const { clientSecret } = res.data;
    
        // 2. Confirm payment and attach card details
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement!,
            billing_details: { name: nameOnCard }
          }
        });
    
        if (confirmError) {
          toast({ title: confirmError.message || 'Payment failed', status: 'error' });
        } else if (paymentIntent?.status === 'succeeded') {
          //const orderRes = await axios.post('/api/order-details', { cart });
          toast({ title: 'Payment successful!', status: 'success' });
          //router.push('/vendor/dashboard');
          setActiveStep(activeStep + 1);
        }
      } catch (err: any) {
        toast({ title: err.message || 'Payment failed', status: 'error' });
      } finally {
        setIsProcessing(false);
      }
    
    // Payment logic here
  };

 const handleSponsoredDisplayClick = () => {
  
  setModalType("display");
  onOpen();
};
  const handleCancel = () => {
    setActiveStep(0);
  };

  const [minDate, setMinDate] = useState('');

useEffect(() => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; 
  setMinDate(formattedDate);
}, []);

  return (
    <Box
      p={{
        base: "20px 10px",
        md: "30px",
        lg: "40px",
      }}
    >
      <Heading mb="20px" fontSize={"22px"} fontFamily={"var(--font-mulish)"} color={"#334155"} fontWeight={"700"}>
        Create Post
      </Heading>
      <Box
        w="full"
        gap="40px"
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
        justifyContent={"center"}
        alignItems={{
          base: "center",
          md: "flex-start",
        }}
      >
        <Box flex="1" w={"full"}>
          <Stepper
            index={activeStep}
            colorScheme="orange"
            bgColor={"white"}
            mb="20px"
            p="20px"
            borderRadius={"12px"}
            border={"1px solid #F1F5F9"}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box
              p="20px"
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
            >
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                {/* Title */}
                <Box>
                <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[0]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={CreatepostPagedata.placeholders[0]}
                    onChange={handleInputChange}
                    value={postFormData.title}
                    name="title"
                    borderRadius={"3px"}
                  />
                </Box>

                {/* Sub Title */}
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[1]}
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={CreatepostPagedata.placeholders[1]}
                    onChange={handleInputChange}
                    value={postFormData.sub_title}
                    name="sub_title"
                    borderRadius={"3px"}
                  />
                </Box>

                {/* Category */}
                <Box>
                <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[2]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    placeholder="Select Category"
                    value={postFormData.category}
                    name="category"
                    onChange={(e) => handleInputChange(e)}
                  >
                    {categories.map((cat) => (
                      <option key={cat?.id} value={cat?.id}>
                        {cat?.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* zip & city */}
                <Box display={"flex"} gap="20px">
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                      {CreatepostPagedata.formLabels[3]}
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="text"
                      placeholder={CreatepostPagedata.placeholders[3]}
                      onChange={handleInputChange}
                      value={postFormData.city}
                      name="city"
                      borderRadius={"3px"}
                    />
                  </Box>
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                      {CreatepostPagedata.formLabels[4]}
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="text"
                      placeholder={CreatepostPagedata.placeholders[4]}
                      onChange={handleInputChange}
                      value={postFormData.zip}
                      name="zip"
                      borderRadius={"3px"}
                    />
                  </Box>
                </Box>
                {/* Start Date & Time */}
                <Box display={"flex"} gap="20px">
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                      {CreatepostPagedata.formLabels[5]}
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="date"
                      onChange={handleInputChange}
                      value={postFormData.start_date}
                      name="start_date"
                      borderRadius={"3px"}
                      min={minDate}
                    />
                  </Box>
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                      {CreatepostPagedata.formLabels[6]}
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="time"
                      onChange={handleInputChange}
                      value={postFormData.start_time}
                      name="start_time"
                      borderRadius={"3px"}
                    />
                  </Box>
                </Box>

                {/* End Time */}
                <Box>
                <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[7]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="time"
                    onChange={handleInputChange}
                    value={postFormData.end_time}
                    name="end_time"
                    borderRadius={"3px"}
                  />
                </Box>

                {/* Max Participants */}
               

                <Box display={"flex"} gap="20px">
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[8]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="number"
                    placeholder={CreatepostPagedata.placeholders[8]}
                    onChange={handleInputChange}
                    value={postFormData.max_participants}
                    name="max_participants"
                    borderRadius={"3px"}
                  />
                  </Box>
                  <Box flex="1">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {`Sponsord Post?`}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    placeholder="Select"
                    value={postFormData.is_sponsored ? "1" : "0"}
                    name="is_sponsored"
                    onChange={handleInputChange}
                  >
                    <option key={`1`} value={1}>
                      Yes
                    </option>
                    <option key={`0`} value={0}>
                      No
                    </option>
                  </Select>
                  <Button
                        variant="link"
                        onClick={handleSponsoredDisplayClick}                        
                        color="#F9690E"
                        _hover={{ color: "gray.500" }}
                        rightIcon={<InfoIcon width="18px" height="18px" />}
                        mt={3}
                        fontSize={"15px"}
                        iconSpacing="3px"
                        alignItems="center"
                      >
                         Sponsored Post Display
                        
                      </Button>
                      <Modal isOpen={isOpen} onClose={onClose}>
                      <ModalOverlay />
                      <ModalContent
                        // bgSize="cover"
                        // bgPosition="center"
                        color="#fff"
                        maxW={modalType === "display" ? "90%" : "90%"}
                        h={modalType === "display" ? "80%" : "90%"}
                      >
                       
                        <ModalCloseButton
                          color="#F9690E"
                          w="40px"
                          h="40px"
                          fontSize="20px"
                        />
                        <ModalBody>
                          {modalType === "sponsored" ? (
                            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} w={"100%"} h={"100%"} flexDirection={'column'}>
                              <Image
                                src={'/sponsoricon.png'}
                                alt='Sponsord Post'
                                mb={6}
                              />
                              <Text fontSize={{base:"5px",sm:"10px",md:"10px",lg:"22px"}} fontWeight="500" color={'#000'} as={'h1'} align={"center"}>
                                Sponsored posts remain active for <Text as={"span"} color={'#F9690E'}>30 Days</Text> and require one-time payment of <Text as={"span"} color={'#F9690E'}>$2</Text>.
                                Once payment is completed, your post will be displayed as a Sponsored post on the homepage, as shown below
                              </Text>
                              <Image
                                // boxSize='100%'
                                w={"100%"}
                                h={"340px"}
                                objectFit='cover'
                                objectPosition="center"
                                src={sponsoredBgImg}
                                alt='Sponsord Post'
                                mt={6}
                              />
                            </Box>
                          ) : (
                            <Box p={6}>
                             <Text fontSize={{base:"5px",sm:"10px",md:"10px",lg:"22px"}} fontWeight="500" color={'#000'} as={'h1'} align={"center"}>
                                Sponsored posts remain active for <Text as={"span"} color={'#F9690E'}>30 Days</Text> and require one-time payment of <Text as={"span"} color={'#F9690E'}>$2</Text>.
                                Once payment is completed, your post will be displayed as a Sponsored post on the homepage, as shown below
                              </Text>
                              <Text fontSize={{base:"15px",sm:"18px",md:"20px",lg:"32px"}} fontWeight="bold" mb={4} color={'#F9690E'} as={'h2'}>
                                You need to simply select "Yes" from the Sponsored Post dropdown and pay $2 for this.
                              </Text>
                              <Image
                                // boxSize='100%'
                                w={"100%"}
                                h={"340px"}
                                objectFit='cover'
                                objectPosition="center"
                                src={sponsoredBg}
                                alt='Sponsord Post'
                              />

                            </Box>
                          )}
                          
                        </ModalBody>
                      </ModalContent>
                    </Modal>
                  </Box>
                </Box> 
                {/* Description */}
                <Box pos="relative">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[12]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <ReactQuill
                    theme="snow"
                    style={{ height: "150px" }}
                    value={postFormData.description}
                    onChange={(value) => setPostFormData((prevData) => ({ ...prevData, description: value }))}
                  />
                </Box>
              </FormControl>
            </Box>
          )}

          {/* Optional Fields */}
          {activeStep === 1 && (
            <Box p="20px" bgColor={"#FFF"} border={"1px solid #F1F5F9"} borderRadius={"12px"}>
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Rules
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={"Rules (optional)"}
                    onChange={handleInputChange}
                    value={postFormData.rules}
                    name="rules"
                    borderRadius={"3px"}
                  />
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[10]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={CreatepostPagedata.placeholders[10]}
                    onChange={handleInputChange}
                    value={postFormData.contact_info}
                    name="contact_info"
                    borderRadius={"3px"}
                  />
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[11]}
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={CreatepostPagedata.placeholders[11]}
                    onChange={handleInputChange}
                    value={postFormData.url}
                    name="url"
                    borderRadius={"3px"}
                  />
                </Box>
                {/* Image Upload */}
                <Box mb={"80px"} mt="40px">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    {CreatepostPagedata.formLabels[13]}
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Box
                    display={"flex"}
                    flexDir={"column"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    gap="10px"
                    bgColor={"#FFF"}
                    p={"22px"}
                    w={"full"}
                    pos={"relative"}
                    border={"1px dashed #CBD5E1"}
                    borderRadius={"3px"}
                  >
                    <UploadIcon stroke="#475569" width="22px" height="22px" />
                    <Text color={"#334155"} fontWeight={"500"}>
                      {CreatepostPagedata.uploadText[0]}
                    </Text>
                    <Text fontSize={"13px"} color={"#94A3B8"}>
                      {CreatepostPagedata.uploadText[1]}
                    </Text>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg, image/jpg, image/png"
                      position={"absolute"}
                      w={"full"}
                      h={"full"}
                      top={"0"}
                      left={"0"}
                      opacity={"0"}
                      onChange={handleImageUpload}
                      multiple
                      zIndex={"100"}
                    />
                  </Box>
                </Box>
                {/* Uploaded Images */}

                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalCloseButton color={"white"} p={5} />
                    <ModalBody p={4} display="flex" justifyContent="center" alignItems="center">
                      <Image src={selectedImage || ""} alt="preview" width="150%" height="auto" borderRadius="10px" />
                    </ModalBody>
                  </ModalContent>
                </Modal>

                <Box display={"flex"} flexDir={"column"} gap="10px">
                  {postFormData.images.map((image, index) => (
                    <Box
                      key={index}
                      display={"flex"}
                      justifyContent={"space-between"}
                      gap="10px"
                      bgColor={"#FFF"}
                      p={"10px"}
                      border={"1px solid #CBD5E1"}
                      borderRadius={"6px"}
                    >
                      <Text>{image?.name}</Text>
                      <Box display={"flex"} gap="10px">
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={() => handleImageView(URL.createObjectURL(image))} // Use modal for preview
                          variant="link"
                        >
                          View
                        </Button>
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={() => handleImageDelete(index)}
                          variant="link"
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>

                
              </FormControl>
            </Box>
          )}

          {/* Review Step */}
          {activeStep === 2 && (
            <Box display={"flex"} flexDir={"column"} gap="20px" w="full">
              <Box
                display={"flex"}
                flexDir={{
                  base: "column",
                  md: "row",
                }}
                bgColor="#FFF"
                border={"1px solid #E2E8F0"}
                borderRadius={"12px"}
                borderBottomRadius={"0px"}
                overflow={"hidden"}
              >
                {/* Main Content - Post Review */}
                <Box w={"full"}>
                  <Box
                    position={"relative"}
                    px={{ base: "20px", md: "30px" }}
                    borderBottom={"1px solid #E2E8F0"}
                    flex={"1"}
                  >
                    {/* Title and Subtitle */}
                    <Heading size={"lg"} fontWeight={"700"} color="#334155" mt={"32px"}>
                      {postFormData.title}
                    </Heading>
                    <Text fontSize={"18px"} color="#94A3B8" maxWidth={"600px"} fontWeight={"500"} mt={"8px"}>
                      {postFormData.sub_title}
                    </Text>

                    {/* User Information */}
                    <Box display={"flex"} justifyContent={"space-between"} mt={"38px"} pb={"20px"}>
                      <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="11px">
                        {/* Profile Picture */}
                        <Image
                          src={userData?.profile_pic}
                          w={"48px"}
                          h={"48px"}
                          borderRadius={"50%"}
                          objectFit={"cover"}
                        />
                        <Box display={"flex"} flexDir={"column"}>
                          <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
                            By {userData?.name}
                          </Text>
                          <Text fontSize={"14px"} color="#94A3B8">
                            {postFormData.category} / {postFormData.sub_category}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                 {/* Display Images */}
<Grid
  templateColumns={{
    base: "repeat(auto-fit, minmax(100px, 1fr))",
    md: "repeat(auto-fit, minmax(250px, 1fr))",
  }}
  gap="10px"
  mt="20px"
  mx="20px"
  py="10px"
>
  {postFormData.images.map((image, index) => (
    <GridItem key={index}>
      <Image
        src={URL.createObjectURL(image)}
        alt={`image-${index}`}
        width="100%"
        height="250px"
        objectFit="cover"
        borderRadius="8px"
      />
    </GridItem>
  ))}
</Grid>

                  {/* Post Description */}
                  <Box
                    py={"30px"}
                    maxWidth="745px"
                    px={{ base: "20px", md: "30px" }}
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <QuillOutput
                      htmlContent={postFormData.description}
                      style={{
                        color: "#64748B",
                        fontSize: "16px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    />
                  </Box>
                </Box>

                {/* Sidebar - Post Details */}
                <Box w={"full"} maxWidth={"350px"} bgColor={"#FFF"} borderLeft={"1px solid #E2E8F0"}>
                  <Text
                    fontSize={"18px"}
                    fontWeight={"700"}
                    borderBottom={"1px solid #E2E8F0"}
                    color="#0F172A"
                    px="20px"
                    py={"10px"}
                  >
                    Post Details
                  </Text>

                  {/* Location and Timing */}
                  <Box
                    px="20px"
                    py={"10px"}
                    borderBottom={"1px solid #E2E8F0"}
                    display={"flex"}
                    flexDir={"column"}
                    gap={"15px"}
                  >
                    <Box>
                    <Text fontSize={"14px"} color="#0F172A" mb={"5px"} fontWeight="bold">
  Location:
</Text>
                      <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                      {postFormData.city}, {postFormData.zip}  
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
                        Start Time:
                      </Text>
                      <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                        {postFormData.start_time}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
                        End Time:
                      </Text>
                      <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                        {postFormData.end_time}
                      </Text>
                    </Box>
                  </Box>

                  {/* Rules Section */}
                  <Text
                    fontSize={"16px"}
                    fontWeight={"600"}
                    borderBottom={"1px solid #E2E8F0"}
                    color="#475569"
                    px="20px"
                    py={"10px"}
                  >
                    Rules:
                  </Text>
                  <Box
                    px="20px"
                    py={"10px"}
                    borderBottom={"1px solid #E2E8F0"}
                    display={"flex"}
                    flexDir={"column"}
                    gap={"15px"}
                  >
                    {postFormData.rules.trim() === "" ? (
    <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
        No rules added yet.
    </Text>
) : (
    postFormData.rules.split("\n").map((rule, index) => (
        <Text key={index} fontSize={"14px"} color="#334155" mb={"5px"}>
            {rule}
        </Text>
    ))
)}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <PaymentForm
              nameOnCard={nameOnCard}
              setNameOnCard={setNameOnCard}
              isProcessing={isProcessing}
              handlePayNow={handlePayNow}
              handlePrevious={handlePrevious}
              billingDetails={billingDetails}
              setBillingDetails={setBillingDetails}
            />
          )}

          {/* Action Bar */}
          {activeStep !== 3 && (
            <Box
              display={"flex"}
              marginTop={"20px"}
              justifyContent={"space-between"}
              p="20px"
              bgColor="#FFF"
              borderTop="1px solid #E2E8F0"
            >
              <Box
                display={"flex"}
                flexDirection="column"
                justifyContent={"space-between"}
                p="20px"
                bgColor="#FFF"
                w="full"
                borderTop="1px solid #E2E8F0"
              >
                <Box display="flex" alignItems="center" gap="16px" justifyContent="space-between">
                  {activeStep > 0 ? (
                    <Button size="md" paddingX="44px" borderRadius="3px" color="F9690E" onClick={handlePrevious}>
                      Back
                    </Button>
                  ) : (
                    <Button color="#F9690E" size="md" paddingX="44px" borderRadius="3px" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                  {/* On preview step: if not sponsored, show Create Post and save post; if sponsored, show Next and go to payment */}
                  {activeStep === 2 && !postFormData.is_sponsored ? (
                    <Button color="#F9690E" onClick={handleNext} disabled={isProcessing}>
                      Create Post
                    </Button>
                  ) : activeStep === 2 && postFormData.is_sponsored ? (
                    <Button color="#F9690E" onClick={() => setActiveStep(3)} disabled={isProcessing}>
                      Next
                    </Button>
                  ) : 
                  activeStep === 4 && postFormData.is_sponsored ? (
                    <Button colorScheme="orange" onClick={handleNext} disabled={isProcessing}>
                      Create Post
                    </Button>
                  ) : (
                    <Button color="#F9690E" onClick={handleNext} disabled={isProcessing}>
                      {activeStep === 3 ? "Create Post" : "Next"}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        <Box
          w="full"
          maxWidth={"390px"}
          p={{
            base: "20px",
            md: "0px",
          }}
          display={activeStep == 2 ? "none" : "block"}
        >
          {CreatepostPagedata.regulationsHeading.map((heading, index) => (
            <Text key={index} color="#64748B" fontSize={"18px"} fontWeight={"600"} pb="25px">
              {heading}
            </Text>
          ))}
          <Box display={"flex"} flexDir={"column"} gap="20px">
            {CreatepostPagedata.regulations.map((regulation, index) => (
              <Text key={index} color="#64748B" fontSize={"16px"}>
                {regulation}
              </Text>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CreatePostWrapped = () => (
  <Elements stripe={stripePromise}>
    <CreatePost />
  </Elements>
);

export default CreatePostWrapped;


