"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Input,
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
  Grid,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import { CloseIcon, LeftArrowIcon, UploadIcon } from "@/components/Icons";
import InfoIcon from "@/components/Icons/InfoIcon";
import Heading from "@/components/App/heading";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
// import stripe from "stripe";
// import { UserData } from "@/app/profile/me/page";


// Validation rules interface for event creation
// interface EventValidationRules {
//   title: {
//     required: boolean;
//     minLength: number;
//     maxLength: number;
//   };
//   sub_title: {
//     maxLength: number;
//   };
//   category: {
//     required: boolean;
//   };
//   city: {
//     required: boolean;
//     pattern: RegExp;
//   };
//   zip: {
//     required: boolean;
//     pattern: RegExp;
//   };
//   start_date: {
//     required: boolean;
//     minDate: Date;
//   };
//   start_time: {
//     required: boolean;
//   };
//   end_time: {
//     required: boolean;
//   };
//   description: {
//     required: boolean;
//     minLength: number;
//   };
//   contact_info: {
//     required: boolean;
//     pattern: RegExp;
//   };
//   url: {
//     pattern: RegExp;
//   };
//   images: {
//     maxSize: number;
//     allowedTypes: string[];
//     maxCount: number;
//     required: boolean;
//     minCount: number;
//   };
//   rules: {
//     maxCount: number;
//     minLength: number;
//     maxLength: number;
//   };
// }



// const eventValidationRules: EventValidationRules = {
//   title: {
//     required: true,
//     minLength: 5,
//     maxLength: 100
//   },
//   sub_title: {
//     maxLength: 150
//   },
//   category: {
//     required: true
//   },
//   city: {
//     required: true,
//     pattern: /^[a-zA-Z\s-]+$/
//   },
//   zip: {
//     required: true,
//     pattern: /^[A-Za-z0-9\- ]{3,10}$/
//   },
//   start_date: {
//     required: true,
//     minDate: new Date()
//   },
//   start_time: {
//     required: true
//   },
//   end_time: {
//     required: true
//   },
//   description: {
//     required: true,
//     minLength: 10
//   },
//   contact_info: {
//     required: true,
//     pattern: /^([0-9()-.\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/
//   },
//   url: {
//     pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
//   },
//   images: {
//     maxSize: 5 * 1024 * 1024, // 5MB
//     allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
//     maxCount: 5,
//     required: true,
//     minCount: 1
//   },
//   rules: {
//     maxCount: 5,
//     minLength: 10,
//     maxLength: 500
//   }
// };

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface EventFormData {
  title: string;
  sub_title: string;
  category: string;
  city: string;
  zip: string;
  start_date: string;
  start_time: string;
  end_time: string;
  description: string;
  contact_info: string;
  url: string;
  images: File[];
  imagesLink: string[];
  rules: string[];
  rule: string;
  is_sponsored: boolean;
}

const QuillOutput = ({ htmlContent, ...props }: { htmlContent: string, [key: string]: any }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} {...props} />;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  zip: string;
  address: string;
}

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
          {/* <Button variant="outline" colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="button" onClick={handlePrevious}>
            Back
          </Button> */}
          <Button colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="button" onClick={handlePayNow} isLoading={isProcessing}>
            Pay Now
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

function CreateEvent() {
  const sponsoredBg = '/sponsoredPosts.png';
  const sponsoredBgImg = '/sponsoredPostsImg.png';
  const [slider, setSlider] = useState(0);
  const [modalType, setModalType] = useState<string | null>(null);
  const [hasSeenSponsoredModal, setHasSeenSponsoredModal] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: "",
    sub_title: "",
    category: "",
    city: "",
    zip: "",
    start_date: new Date().toISOString().split("T")[0],
    description: "",
    images: [] as File[], // Ensure images are an array of File objects
    imagesLink: [] as string[], // For preview URLs
    contact_info: "",
    url: "",
    rules: [] as string[],
    rule: "",
    is_sponsored: false,
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
  });

  //useSteps hook
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const stripe = useStripe();
  const elements = useElements();
 // const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

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


  // Time validation helper
// const isValidTimeRange = (startTime: string, endTime: string): boolean => {
//   return endTime > startTime;
// };

// Main validation function
// const validateEventField = (
//   fieldName: string, 
//   value: any, 
//   context?: { 
//     startTime?: string;
//     rules?: string[];
//   } = {}
// ): ValidationError | null => {
//   const rules = eventValidationRules[fieldName];
//   if (!rules) return null;

//   switch (fieldName) {
//     case 'title':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'Title is required' };
//       }
//       if (value.length < rules.minLength) {
//         return { field: fieldName, message: `Title must be at least ${rules.minLength} characters` };
//       }
//       if (value.length > rules.maxLength) {
//         return { field: fieldName, message: `Title must not exceed ${rules.maxLength} characters` };
//       }
//       break;

//     case 'sub_title':
//       if (value && value.length > rules.maxLength) {
//         return { field: fieldName, message: `Sub-title must not exceed ${rules.maxLength} characters` };
//       }
//       break;

//     case 'category':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'Please select a category' };
//       }
//       break;

//     case 'city':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'City is required' };
//       }
//       if (value && !rules.pattern.test(value)) {
//         return { field: fieldName, message: 'Please enter a valid city name' };
//       }
//       break;

//     case 'zip':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'ZIP code is required' };
//       }
//       if (value && !rules.pattern.test(value)) {
//         return { field: fieldName, message: 'Please enter a valid ZIP code' };
//       }
//       break;

//     case 'start_date':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'Start date is required' };
//       }
//       if (new Date(value) < rules.minDate) {
//         return { field: fieldName, message: 'Start date cannot be in the past' };
//       }
//       break;

//     case 'start_time':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'Start time is required' };
//       }
//       break;

//     case 'end_time':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'End time is required' };
//       }
//       if (context.startTime && !isValidTimeRange(context.startTime, value)) {
//         return { field: fieldName, message: 'End time must be after start time' };
//       }
//       break;

//     case 'description':
//       if (rules.required && (!value || value === '<p><br></p>')) {
//         return { field: fieldName, message: 'Description is required' };
//       }
//       const textContent = value.replace(/<[^>]*>/g, '').trim();
//       if (textContent.length < rules.minLength) {
//         return { field: fieldName, message: `Description must be at least ${rules.minLength} characters` };
//       }
//       break;

//     case 'contact_info':
//       if (rules.required && !value) {
//         return { field: fieldName, message: 'Contact information is required' };
//       }
//       if (value && !rules.pattern.test(value)) {
//         return { field: fieldName, message: 'Please enter a valid phone number or email' };
//       }
//       break;

//     case 'url':
//       if (value && !rules.pattern.test(value)) {
//         return { field: fieldName, message: 'Please enter a valid URL' };
//       }
//       break;

//     case 'rules':
//       if (context.rules && context.rules.length > rules.maxCount) {
//         return { field: fieldName, message: `Maximum ${rules.maxCount} rules allowed` };
//       }
//       if (value && value.length < rules.minLength) {
//         return { field: fieldName, message: `Each rule must be at least ${rules.minLength} characters` };
//       }
//       if (value && value.length > rules.maxLength) {
//         return { field: fieldName, message: `Each rule must not exceed ${rules.maxLength} characters` };
//       }
//       break;
//   }

//   return null;
// };





useEffect(() => {
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }
}, [status, router, pathname]);

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
          await axios.get(`/api/user/me`, {
            withCredentials: true,
          });

        }
      } catch (error) {
        console.error(error);
      } finally {
        // setIsLoading(false);
        
      }
    };

    fetchData();
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

  useEffect(() => {
    // Fetch billing details for logged in user
    const fetchBillingDetails = async () => {
      try {
        console.log("Fetching billing details for event creation...");
        console.log("Session data:", session);
        
        const res = await axios.get('/api/billing-details', { withCredentials: true });
        console.log("Billing details response:", res.data);
        
        if (res.data && res.data.data) {
          const b = res.data.data;
          console.log("Billing data received:", b);
          
          const billingData = {
            firstName: b.first_name || '',
            lastName: b.last_name || '',
            email: b.email || '',
            phone: b.phone || '',
            city: b.city || '',
            zip: b.zip || '',
            address: b.address || '',
          };
          
          console.log("Setting billing details:", billingData);
          setBillingDetails(billingData);
          setBillingExists(true);
        } else {
          console.log("No billing details found in API response, using session data");
          // Fallback to session data if no billing details exist
          if (session?.user) {
            const fallbackData = {
              firstName: session.user.name?.split(' ')[0] || '',
              lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
              email: session.user.email || '',
              phone: '',
              city: '',
              zip: '',
              address: '',
            };
            console.log("Using fallback billing data:", fallbackData);
            setBillingDetails(fallbackData);
          }
          setBillingExists(false);
        }
      } catch (error) {
        console.error("Error fetching billing details:", error);
        // Fallback to session data on error
        if (session?.user) {
          const fallbackData = {
            firstName: session.user.name?.split(' ')[0] || '',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            phone: '',
            city: '',
            zip: '',
            address: '',
          };
          console.log("Using fallback billing data on error:", fallbackData);
          setBillingDetails(fallbackData);
        }
        setBillingExists(false);
      }
    };
    if (session) fetchBillingDetails();
    }, [session]);
  

  
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: eventFormData.is_sponsored ? 4 : 3,
  });


  // Enhanced validation function with better error handling
const validateEventForm = (formData: EventFormData, activeStep: number): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Step 0 validations (Required Details)
  if (activeStep === 0) {
    // Title validation
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (formData.title.length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    } else if (formData.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must not exceed 100 characters' });
    }

    // Category validation
    if (!formData.category) {
      errors.push({ field: 'category', message: 'Please select a category' });
    }

    // Location validation
    if (!formData.city.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.city)) {
      errors.push({ field: 'city', message: 'City name can only contain letters, spaces, and hyphens' });
    }

    if (!formData.zip.trim()) {
      errors.push({ field: 'zip', message: 'ZIP code is required' });
    } else if (!/^[A-Za-z0-9\- ]{3,10}$/.test(formData.zip)) {
      errors.push({ field: 'zip', message: 'Please enter a valid ZIP code' });
    }

    // Date and time validation
    const currentDate = new Date();
    const selectedDate = new Date(formData.start_date);
    
    if (!formData.start_date) {
      errors.push({ field: 'start_date', message: 'Start date is required' });
    } 
    // else if (selectedDate < currentDate) {
    //   errors.push({ field: 'start_date', message: 'Start date cannot be in the past' });
    // }

    if (!formData.start_time) {
      errors.push({ field: 'start_time', message: 'Start time is required' });
    }

    if (!formData.end_time) {
      errors.push({ field: 'end_time', message: 'End time is required' });
    } else if (formData.end_time <= formData.start_time) {
      errors.push({ field: 'end_time', message: 'End time must be after start time' });
    }

    // Description validation
    const strippedDescription = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!strippedDescription || strippedDescription === '') {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (strippedDescription.length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    }

    // Image validation
    if (formData.images.length === 0) {
      errors.push({ field: 'images', message: 'At least one image is required' });
    } else if (formData.images.length > 5) {
      errors.push({ field: 'images', message: 'Maximum 5 images allowed' });
    }
  }

   // Step 1 validations (Optional Details)
   if (activeStep === 1) {
    // URL validation (optional)
    if (formData.url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.url)) {
      errors.push({ field: 'url', message: 'Please enter a valid URL' });
    }

    // Contact information validation
    if (!formData.contact_info.trim()) {
      errors.push({ field: 'contact_info', message: 'Contact information is required' });
    } else if (!/^([0-9()-.\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(formData.contact_info.trim())) {
      errors.push({ field: 'contact_info', message: 'Please enter a valid phone number or email' });
    }

    // Rules validation
    if (formData.rules.length > 5) {
      errors.push({ field: 'rules', message: 'Maximum 5 rules allowed' });
    }
    // formData.rules.forEach((rule, index) => {
    //   if (rule.length < 10) {
    //     errors.push({ field: 'rules', message: `Rule ${index + 1} must be at least 10 characters` });
    //   }
    //   if (rule.length > 500) {
    //     errors.push({ field: 'rules', message: `Rule ${index + 1} must not exceed 500 characters` });
    //   }
    // });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};



// Image validation helper
const validateImage = (file: File): ValidationError | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedTypes.includes(file.type)) {
    return {
      field: 'images',
      message: 'Invalid file type. Only JPEG, JPG, and PNG files are allowed.'
    };
  }

  if (file.size > maxSize) {
    return {
      field: 'images',
      message: `File ${file.name} is too large. Maximum size is 5MB.`
    };
  }

  return null;
};
  //handler functions

  const handleInputDescriptionChange = (value: string) => {
    setEventFormData((prevData) => ({
      ...prevData,
      description: value,
    }));
  };
  const handleInputContactInfoChange = (value: string) => {
    setEventFormData((prevData) => ({
      ...prevData,
      contact_info: value,
    }));
  };

  const handleRuleChange = () => {
    if (eventFormData.rule === "") {
      alert("Please enter a rule");
      return;
    }

    if (eventFormData.rules.length < 5) {
      setEventFormData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, eventFormData.rule],
        rule: "",
      }));
    } else {
      alert("You can add maximum 5 rules");
    }
  };
  const handleRuleDelete = (index: number) => {
    const rules = [...eventFormData.rules];
    rules.splice(index, 1);
    setEventFormData((prevData) => ({
      ...prevData,

      rules: [...rules],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'is_sponsored') {
    const isSponsored = value === "1";
    setEventFormData((prevData) => ({
      ...prevData,
      is_sponsored: isSponsored,
    }));
    if (isSponsored && !hasSeenSponsoredModal) {
      setModalType("sponsored");
      onSponsoredModalOpen();
      setHasSeenSponsoredModal(true);
    }
    if (!isSponsored) {
      setHasSeenSponsoredModal(false);
    }
  } else {
    setEventFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }
    //setEventFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for the field being changed
    setValidationErrors((prev) => prev.filter(error => error.field !== name));
  };

  // Update the image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    for (const file of files) {
      const error = validateImage(file);
      if (error) {
        toast({
          title: "Image Error",
          description: error.message,
          status: "error",
          duration: 3000,
        });
        return;
      }
    }

    // Update form data with valid images
    const newImages = [...eventFormData.images, ...files];
    const newImagesLink = [...eventFormData.imagesLink, ...files.map(file => URL.createObjectURL(file))];

    setEventFormData(prev => ({
      ...prev,
      images: newImages,
      imagesLink: newImagesLink
    }));
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...eventFormData.images];
    newImages.splice(index, 1);
    setEventFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onClose: onImageModalClose } = useDisclosure();
  const { isOpen: isSponsoredModalOpen, onOpen: onSponsoredModalOpen, onClose: onSponsoredModalClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [minDate, setMinDate] = useState('');

  // View image in modal instead of opening a new tab
  const handleImageView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageModalOpen();
  };

  // Add billing/payment state
  const [nameOnCard, setNameOnCard] = useState("");
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
  
  // Initialize billing details with session data immediately
  useEffect(() => {
    if (session?.user) {
      console.log("Initializing billing details with session data:", session.user);
      const initialBillingData = {
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        email: session.user.email || '',
        phone: '',
        city: '',
        zip: '',
        address: '',
      };
      console.log("Setting initial billing data:", initialBillingData);
      setBillingDetails(initialBillingData);
    }
  }, [session]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Event handlers
  const handleNext = async () => {
    const validation = validateEventForm(eventFormData, activeStep);
    
    if (!validation.isValid) {
  
      // Show toast with first error
      toast({
        title: "Validation Error",
        description: validation.errors[0].message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
  
      // Update validation errors state
      setValidationErrors(validation.errors);
      return;
    }
  
    // Clear previous validation errors
    setValidationErrors([]);
  
    if (activeStep < 2) {
      if (activeStep === 1 && eventFormData.rule.trim() !== "") {
        setEventFormData(prevData => ({
          ...prevData,
          rules: [...prevData.rules, prevData.rule],
          rule: "", 
        }));
      }

      setActiveStep(activeStep + 1);
    } else {
      if (activeStep === 2 && eventFormData.is_sponsored) {
        setActiveStep(3); // Go to payment step
        return;
      }
      if ((activeStep === 4 && eventFormData.is_sponsored) || (activeStep === 2 && !eventFormData.is_sponsored)) {
          await createEventAndUploadImages();
      }
      //await createEventAndUploadImages();
    }
  };

  const createEventAndUploadImages = async () => {
    try {
      setIsProcessing(true);
      if (session) {
        toast({
          title: `Creating Event.. pls wait..`,
          status: "loading",
          duration: 2000,
        });
        const headers: HeadersInit = {};

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        // Non-image data submission
        const body = {
          title: eventFormData.title,
          sub_title: eventFormData.sub_title,
          activity_type_id: eventFormData.category,
          location: `city: ${eventFormData.city}, zip: ${eventFormData.zip}`,
          start_time: `${eventFormData.start_date} ${eventFormData.start_time}`,
          end_time: `${eventFormData.start_date} ${eventFormData.end_time}`,
          rules: eventFormData.rules.join("/n"),
          contact_info: eventFormData.contact_info,
          url: eventFormData.url,
          description: eventFormData.description,
          is_sponsored: eventFormData.is_sponsored,
        };

        // Post non-image data to /api/post/create
        const eventResponse = await axios.post(`/api/event/create`, body, {
          withCredentials: true,
        });

        const eventData = eventResponse.data;

        if (eventData.event && eventData.event.id) {
          const activity_id = eventData.event.id;

          // Upload each image using FormData

          const imageFormData = new FormData();
          if (eventFormData.images.length >= 1) {
            toast({
              title: `Uploading Images.. pls wait..`,
              status: "loading",
              duration: 5000,
            });
            if (eventFormData.images.length === 1) {
              // Single image upload
              imageFormData.append("image", eventFormData.images[0]);
            } else {
              // Multiple images upload
              eventFormData.images.forEach((image) => {
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
              if (imgResponse.ok) {
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
          if(activeStep === 4)
          {
              const paymentBody = {
              postId: activity_id
            };
            const paymentResponse = await axios.post(`/api/payment/create`, paymentBody, {
            withCredentials: true,
             });
          }
          
          toast({
            title: `Event Created Successfully`,
            status: "success",
          });
          router.push(`/event/${activity_id}`);
        } else {
          toast({
            title: "Error creating event",
            status: "error",
          });
          router.refresh();
        }
      }
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      console.error("Error submitting event", error);
      toast({
        title: "Error submitting event",
        status: "error",
      });
    }
    finally{
      setIsProcessing(false);
    }
  }

  const handleSponsoredDisplayClick = () => {
  
  setModalType("display");
  onSponsoredModalOpen();
};
  const handleCancel = () => {
    setActiveStep(0);
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

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

    const cart = [{ id: 'event_sponsorship', name: 'Sponsored Event', price: 2.00 }];

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
            card: cardElement,
            billing_details: { name: nameOnCard }
          }
        });
    
        if (confirmError) {
          toast({ title: confirmError.message || 'Payment failed', status: 'error' });
        } else if (paymentIntent?.status === 'succeeded') {
          toast({ title: 'Payment successful! Creating event...', status: 'success' });
          //await createEventAndUploadImages();
          setActiveStep(activeStep + 1);
        }
      } catch (err: any) {
        toast({ title: err.message || 'Payment failed', status: 'error' });
      } finally {
        setIsProcessing(false);
      }
  };


useEffect(() => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; 
  setMinDate(formattedDate);
}, []);


  return (
    <Box p={{ base: "20px 10px", md: "30px", lg: "40px" }}>
      <Heading mb="20px">Create Event</Heading>
      <Box
        w="full"
        gap="40px"
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"center"}
        alignItems={"flex-start"}
      >
        <Box flex="1" w={"full"}>
          <Stepper
            index={activeStep}
            colorScheme="orange"
            bgColor={"#FFF"}
            mb="20px"
            p="20px"
            borderRadius={"12px"}
            border={"1px solid #F1F5F9"}
          >
            <Step key={0}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Required`}</StepTitle>
                <StepDescription>{`Event Details`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
            <Step key={1}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Optional`}</StepTitle>
                <StepDescription>{`Event Rules`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
            <Step key={2}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Preview`}</StepTitle>
                <StepDescription>{`Preview Event`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
            {eventFormData.is_sponsored && (
              <Step key={3}>
                <StepIndicator>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{`Payment`}</StepTitle>
                  <StepDescription>{`Payment`}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            )}
          </Stepper>

          {activeStep === 0 && (
            <Box
              p={{
                base: "20px",
                md: "30px",
              }}
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderBottom={"none"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
            >
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Event Title
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="orange"
                    type="text"
                    placeholder="Enter event title"
                    fontSize={"16px"}
                    _placeholder={{ color: "#CED4DA" }}
                    onChange={handleInputChange}
                    value={eventFormData.title}
                    isInvalid={validationErrors.some(error => error.field === 'title')}
                    errorBorderColor="red.300"
                    name="title"
                    borderRadius={"3px"}
                  />
                  {validationErrors
  .filter(error => error.field === 'title')
  .map((error, index) => (
    <Text key={index} color="red.500" fontSize="sm">
      {error.message}
    </Text>
  ))}
                </Box>

                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Event Sub-Title
                  </FormLabel>
                  <Input
                    focusBorderColor="orange"
                    type="text"
                    placeholder="Enter event sub-title (optional)"
                    fontSize={"16px"}
                    _placeholder={{ color: "#CED4DA" }}
                    onChange={handleInputChange}
                    value={eventFormData.sub_title}
                    name="sub_title"
                    borderRadius={"3px"}
                  />
                </Box>

                {/* Category */}
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Category
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    placeholder="Select Category"
                    value={eventFormData.category}
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
                      City
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="text"
                      placeholder="Enter City"
                      onChange={handleInputChange}
                      value={eventFormData.city}
                      name="city"
                      borderRadius={"3px"}
                    />
                  </Box>
                  <Box flex="1">
                    <FormLabel color={"#475569"} fontSize={"14px"}>
                      Zip
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="text"
                      placeholder="Enter Zip"
                      onChange={handleInputChange}
                      value={eventFormData.zip}
                      name="zip"
                      borderRadius={"3px"}
                    />
                  </Box>
                </Box>
                {/* Start Date & Time */}
                <Box display={"flex"} gap="20px">
                  <Box flex="1">
                    <FormLabel color={"#475569"} fontSize={"14px"}>
                      Start Date
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="date"
                      onChange={handleInputChange}
                      value={eventFormData.start_date}
                      name="start_date"
                      borderRadius={"3px"}
                      min={minDate}
                      
                    />
                  </Box>
                  <Box flex="1">
                    <FormLabel color={"#475569"} fontSize={"14px"}>
                      Start Time
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="time"
                      onChange={handleInputChange}
                      value={eventFormData.start_time}
                      name="start_time"
                      borderRadius={"3px"}
                    />
                  </Box>
                </Box>

                
                <Box display={"flex"} gap="20px">
                    {/* End Time */}
                  <Box flex="1">
                    <FormLabel color={"#475569"} fontSize={"14px"}>
                      End Time
                      <span style={{ color: 'red' }}>*</span>
                    </FormLabel>
                    <Input
                      focusBorderColor="#F9690E"
                      type="time"
                      onChange={handleInputChange}
                      value={eventFormData.end_time}
                      name="end_time"
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
                    value={eventFormData.is_sponsored ? "1" : "0"}
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
                     <Modal isOpen={isSponsoredModalOpen} onClose={onSponsoredModalClose}>
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
                                              onClick={onSponsoredModalClose}
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
                                                    On the Create Post page, simply select "Yes" from the Sponsored Post dropdown to mark your post as sponsored.
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

                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Event Description
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <ReactQuill
                    theme="snow"
                    className="box-border leading-[1.42] h-full text-left whitespace-pre-wrap outline-none break-words antialiased"
                    style={{
                      height: "150px",
                      tabSize: 4,
                      MozTabSize: 4,
                      wordWrap: "break-word",
                      WebkitFontSmoothing: "antialiased",
                    }}
                    value={eventFormData.description}
                    onChange={(value) => handleInputDescriptionChange(value)}
                  />
                </Box>

                <Box mb={"80px"} mt="40px">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Upload Images (Upto 5)
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
                      Click to upload
                    </Text>
                    <Text fontSize={"13px"} color={"#94A3B8"}>
                      Jpeg, jpg, png (max 5mb)
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

                <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalCloseButton color={"white"} p={5} />
                    <ModalBody p={4} display="flex" justifyContent="center" alignItems="center">
                      <Image src={selectedImage || ""} alt="preview" width="150%" height="auto" borderRadius="10px" />
                    </ModalBody>
                  </ModalContent>
                </Modal>
                <Box display={"flex"} flexDir={"column"} gap="10px">
                  {eventFormData.images.map((image, index) => (
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
          {activeStep === 1 && (
            <Box
              p="30px"
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderBottom={"none"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
              display={"flex"}
              flexDir={"column"}
              gap={"20px"}
            >
              <Box>
                <FormLabel color={"#475569"} fontSize={"14px"}>
                  Event URL
                </FormLabel>
                <Input
                  focusBorderColor="orange"
                  type="text"
                  placeholder="https://www.myeventurl.com (optional)"
                  fontSize={"16px"}
                  _placeholder={{ color: "#CED4DA" }}
                  onChange={handleInputChange}
                  name="url"
                  borderRadius={"3px"}
                />
              </Box>
              <Box>
                <FormLabel color={"#475569"} fontSize={"14px"}>
                  Contact Information
                  <span style={{ color: 'red' }}>*</span>
                </FormLabel>
                <Input
  focusBorderColor="orange"
  type="text"
  placeholder="Enter phone number or email"
  fontSize={"16px"}
  _placeholder={{ color: "#CED4DA" }}
  onChange={handleInputChange}
  value={eventFormData.contact_info}
  name="contact_info"
  borderRadius={"3px"}
/>
              </Box>

              <Box mt="5px">
                <FormLabel color={"#475569"} fontSize={"14px"}>
                  Add Up to 5 Rules
                </FormLabel>
                <Input
                  focusBorderColor="orange"
                  type="text"
                  placeholder="Add Rules (this should be expandable input box) (optional)"
                  fontSize={"14px"}
                  _placeholder={{ color: "#CED4DA" }}
                  bgColor={"#F1F5F9"}
                  value={eventFormData.rule}
                  onChange={handleInputChange}
                  name="rule"
                  borderRadius={"7px"}
                />
                <Button
                  my="20px"
                  p="10px"
                  borderRadius={"8px"}
                  colorScheme="orange"
                  color="#FFF"
                  fontSize={"13px"}
                  onClick={handleRuleChange}
                >
                  Add more rules
                </Button>
                <Box display={"flex"} flexDir={"column"} alignItems={"center"} justifyContent={"center"} gap="10px">
                  {eventFormData.rules.map((rule, index) => {
                    return (
                      <Box
                        key={index}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        gap="10px"
                        w={"full"}
                        p="10px"
                        bgColor="#F1F5F9"
                        borderRadius="6px"
                      >
                        <Text textAlign={"left"} color="#334155" fontWeight={"500"}>
                          {rule}
                        </Text>
                        <CloseIcon
                          onClick={() => handleRuleDelete(index)}
                          width="25px"
                          height="25px"
                          stroke="#000"
                          style={{ cursor: "pointer" }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}

{activeStep === 2 && (
            <Box display={"flex"} flexDir={"column"} gap="20px" w="full">
              <Box borderRadius="10px" overflow={"hidden"}>
                <Box pos={"relative"} w={"100%"}>
                  {/* Conditionally render the carousel based on the number of images */}
                  {eventFormData.images.length > 1 ? (
                    <>
                      {eventFormData.images.map((image, index) => (
                        <Box
                          display={slider === index ? "block" : "none"}
                          pos={"relative"}
                          key={index}
                          width={"100%"}
                          height="auto"
                          objectFit={"cover"}
                        >
                          <Image
                            src={`${URL.createObjectURL(image)}`}
                            w="full"
                            h="full"
                            maxH="400px"
                            objectFit="cover"
                            alt={`Image ${index + 1}`}
                          />
                          {/* This is the block you need to change, to customize the caption */}
                        </Box>
                      ))}
                      <Box pos={"absolute"} top={"45%"} left={"1%"} zIndex={1}>
                        <Box
                          as="button"
                          onClick={() => {
                            if (slider > 0) setSlider(slider - 1);
                          }}
                          w="50px"
                          h="50px"
                          bg="#fff"
                          borderRadius={"50%"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          <LeftArrowIcon width="20px" height="20px" color="#000" />
                        </Box>
                      </Box>
                      <Box pos={"absolute"} top={"45%"} right={"1%"} zIndex={1}>
                        <Box
                          as="button"
                          onClick={() => {
                            if (slider < eventFormData.images.length - 1) setSlider(slider + 1);
                          }}
                          w="50px"
                          h="50px"
                          bg="#fff"
                          borderRadius={"50%"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          <LeftArrowIcon style={{ transform: "rotateY(180deg)" }} width="20px" height="20px" color="#000" />
                        </Box>
                      </Box>
                    </>
                  ) : eventFormData.images.length === 1 ? (
                    // Render single image without carousel
                    <Box width={"100%"} height="auto" objectFit={"cover"}>
                      <Image
                        src={`${URL.createObjectURL(eventFormData.images[0])}`}
                        w="full"
                        h="full"
                        maxH="400px"
                        objectFit="cover"
                        alt="Image"
                      />
                    </Box>
                  ) : null} {/* Render nothing if no images */}
                  <Box
                    p="20px"
                    pt="40px"
                    mt="-20px"
                    bgColor="#FFF"
                    border="1px solid #E2E8F0"
                    borderRadius="10px"
                    zIndex={2}
                  >
                    <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="11px">
                      <Box display={"flex"} flexDir={"column"}>
                        <Text fontSize="20px" fontWeight="600" color="#334155">
                          {eventFormData.title}
                        </Text>
                        <Text fontSize="16px" color="#94A3B8" mt="5px">
                          {eventFormData.category &&
                            categories.length > 0 &&
                            `Event:
                            ${
                              categories.find((category) => category.id === parseInt(eventFormData.category))?.name ||
                              "Category not Selected"
                            }
                            `}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box display={"flex"} flexDir={{ base: "column", md: "row" }} w={"100%"} gap="20px">
                <Box
                  flex="1"
                  borderRadius="10px"
                  overflow={"hidden"}
                  border="1px solid #E2E8F0"
                  p="20px 25px"
                  maxWidth="745px"
                  bgColor="#FFF"
                >
                  <Text mb="20px" color="#000000" fontWeight="700">
                    Contact Information
                  </Text>
                  <QuillOutput
                    htmlContent={eventFormData.contact_info}
                    style={{
                      color: "#64748B",
                      textAlign: "left",
                      marginBottom: "20px",
                      borderRadius: "10px",
                    }}
                  />
                  <Text mb="20px" color="#000000" fontWeight="700">
                    About Event
                  </Text>
                  <Box
                    py={"30px"}
                    maxWidth="745px"
                    px={{ base: "20px", md: "30px" }}
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <QuillOutput
                      htmlContent={eventFormData.description}
                      style={{
                        color: "#64748B",
                        fontSize: "16px",
                        textAlign: "left",
                        width: "100%",
                      }}
                    />
                  </Box>
                </Box>
                <Box
                  w={{
                    base: "full",
                    md: "300px",
                  }}
                  display={"flex"}
                  flexDir={"column"}
                  gap="20px"
                >
                  <Box>
                  <Text fontSize={"14px"} color="#000" fontWeight="bold" mb={"5px"}>
  Location:
</Text>
                    <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                    {eventFormData.city}, {eventFormData.zip}
                    </Text>
                  </Box>

                  <Box p="20px" borderRadius="10px" bgColor="#FFF" border="1px solid #E2E8F0">
                    <Text mb="10px" color="#000000" fontWeight="700">
                      Rules
                    </Text>
                    <Box
                      display={"flex"}
                      alignItems={"flex-start"}
                      justifyContent={"flex-start"}
                      flexDir={"column"}
                      gap="11px"
                    >
                      {eventFormData.rules.length === 0 ? (
        <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
            No rules added yet.
        </Text>
    ) : (
        eventFormData?.rules.map((rule, index) => (
            <Text key={index} fontSize="14px" color="#334155">
                {rule}
            </Text>
        ))
    )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          {activeStep === 3 && eventFormData.is_sponsored && (
  <PaymentForm
    nameOnCard={nameOnCard}
    setNameOnCard={setNameOnCard}
    isProcessing={isProcessing}
    handlePayNow={handlePayNow}
    handlePrevious={() => setActiveStep(2)}
    billingDetails={billingDetails}
    setBillingDetails={setBillingDetails}
  />
)}
          <Box
            mt="10px"
            display="flex"
            bgColor="#fff"
            p="30px"
            border="1px solid #F1F5F9"
            borderRadius="12px"
            borderTopRadius="0px"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="20px"
          >
            <Button
              size="md"
              px="44px"
              borderRadius="3px"
              variant="outline"
              colorScheme="orange"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Box display={"flex"} flexWrap={"wrap"} gap="10px">
              {activeStep === 0 ? null : (
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => {
                    if (activeStep === 0) {
                      return;
                    }
                    setActiveStep(activeStep - 1);
                  }}
                >
                  Back
                </Button>
              )}
              {activeStep === 2 && eventFormData.is_sponsored ? (
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  colorScheme="orange"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  Next
                </Button>
              ) : activeStep === 3 && eventFormData.is_sponsored ? null : (
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  colorScheme="orange"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  {((activeStep === 4) || (activeStep === 2 && !eventFormData.is_sponsored)) ? "Create Event" : "Next"}
                </Button>
              )}
            </Box>
          </Box>
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
          <Text color="#64748B" fontSize="18px" fontWeight="600" pb="25px">
            Gapp Event Creation Regulations
          </Text>
          <Box display={"flex"} flexDir={"column"} gap="20px">
            {[
              "All events must be verified.",
              "No spam or promotional content allowed.",
              "Be respectful in your descriptions.",
              "Follow community guidelines.",
            ].map((item, index) => (
              <Text key={index} color="#64748B" fontSize="16px">
                {index + 1}. {item}
              </Text>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const CreateEventWrapped = () => (
  <Elements stripe={stripePromise}>
    <CreateEvent />
  </Elements>
);

export default CreateEventWrapped;

