// "use client";
// import React, { useState } from "react";
// import {
//   Box,
//   Heading,
//   Text,
//   Input,
//   Button,
//   FormControl,
//   FormLabel,
//   useDisclosure,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Alert,
//   AlertIcon,
//   useToast,
// } from "@chakra-ui/react";

// const DeleteAccountPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { isOpen, onOpen, onClose } = useDisclosure(); // For the confirmation modal
//   const toast = useToast(); //For displaying success or error messages.

//   const handleDeleteAccount = async () => {
//     onOpen();
//     // In the real production scenario, you need to send request to backend to delete account.
//     // setIsLoading(true);
//     // setError(""); // Clear any previous errors

//     // try {
//     //   // Simulate an API call to delete the account
//     //   // Replace this with your actual API endpoint
//     //   const response = await fetch('/api/delete-account', {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify({ email, password }),
//     //   });

//     //   if (!response.ok) {
//     //     const data = await response.json(); // Assuming the API returns an error message in JSON
//     //     setError(data.message || 'An error occurred while deleting the account.');
//     //     toast({
//     //         title: "Error",
//     //         description: data.message || "An error occurred while deleting the account.",
//     //         status: "error",
//     //         duration: 5000,
//     //         isClosable: true,
//     //       })
//     //   } else {
//     //     // Account deletion successful
//     //     // Redirect to the home page or a logout page
//     //     window.location.href = '/'; // Redirect to homepage (adjust as needed)
//     //     toast({
//     //         title: "Account Deleted",
//     //         description: "Your account has been successfully deleted.",
//     //         status: "success",
//     //         duration: 5000,
//     //         isClosable: true,
//     //       })
//     //   }
//     // } catch (e: any) {
//     //   setError(e.message || 'An unexpected error occurred.');
//     //   toast({
//     //         title: "Error",
//     //         description: e.message || "An unexpected error occurred.",
//     //         status: "error",
//     //         duration: 5000,
//     //         isClosable: true,
//     //       })

//     // } finally {
//     //   setIsLoading(false);
//     // }
//   };

//   const confirmDelete = async () => {
//     // Simulate an API call to delete the account
//     setIsLoading(true);
//     setError(""); // Clear any previous errors

//     try {
//       // Simulate an API call to delete the account
//       // Replace this with your actual API endpoint
//       const response = await fetch('/api/delete-account', {
//         method: 'POST', // <--- Make sure this is here and correct
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
//       console.log("response", response)

//       if (!response.ok) {
//         const data = await response.json(); // Assuming the API returns an error message in JSON
//         setError(data.message || 'An error occurred while deleting the account.');
//         toast({
//             title: "Error",
//             description: data.message || "An error occurred while deleting the account.",
//             status: "error",
//             duration: 5000,
//             isClosable: true,
//           })
//       } else {
//         // Account deletion successful
//         // Redirect to the home page or a logout page
//         window.location.href = '/'; // Redirect to homepage (adjust as needed)
//         toast({
//             title: "Account Deleted",
//             description: "Your account has been successfully deleted.",
//             status: "success",
//             duration: 5000,
//             isClosable: true,
//           })
//       }
//     } catch (e: any) {
//         console.log("erroris", e)
//       setError(e.message || 'An unexpected error occurred.');
//       toast({
//             title: "Error",
//             description: e.message || "An unexpected error occurred.",
//             status: "error",
//             duration: 5000,
//             isClosable: true,
//           })

//     } finally {
//       setIsLoading(false);
//       onClose();
//     }
//   };

//   return (
//     <Box p={4} maxWidth="500px" mx="auto">
//       <Heading as="h2" size="lg" mb={4}>
//         Delete Account
//       </Heading>

//       <Box bg="red.50" p={4} borderRadius="md" mb={4}>
//         <Text fontWeight="bold" color="red.600">
//           Important Disclaimer
//         </Text>
//         <Text fontSize="sm" color="red.700">
//           Deleting your account is a permanent action. All your data, activities, and connections will be permanently
//           removed. This action cannot be undone. Please proceed with caution.
//         </Text>
//       </Box>

//       {error && (
//         <Alert status="error" mb={4}>
//           <AlertIcon />
//           {error}
//         </Alert>
//       )}

//       <FormControl mb={4}>
//         <FormLabel>Email address</FormLabel>
//         <Input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Your email"
//         />
//       </FormControl>

//       <FormControl mb={4}>
//         <FormLabel>Password</FormLabel>
//         <Input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Your password"
//         />
//       </FormControl>

//       <Button
//         colorScheme="red"
//         onClick={handleDeleteAccount}
//         isLoading={isLoading}
//         width="100%"
//         mb={4}
//       >
//         Delete Account
//       </Button>

//       {/* Confirmation Modal */}
//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Confirm Account Deletion</ModalHeader>
//           <ModalBody>
//             <Text>Are you sure you want to permanently delete your account?</Text>
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="gray" mr={3} onClick={onClose}>
//               Cancel
//             </Button>
//             <Button colorScheme="red" isLoading={isLoading} onClick={confirmDelete}>
//               Confirm Delete
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeleteAccountPage;





// "use client";
// import React, { useState } from "react";
// import {
//   Box,
//   Heading,
//   Text,
//   Input,
//   Button,
//   FormControl,
//   FormLabel,
//   useDisclosure,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Alert,
//   AlertIcon,
//   useToast,
// } from "@chakra-ui/react";
// import { signOut } from 'next-auth/react'; // Import signOut
// import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// const DeleteAccountPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();
//   const router = useRouter(); // Initialize useRouter


//   const handleDeleteAccount = () => {
//     onOpen();
//   };

//   const confirmDelete = async () => {
//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await fetch('/api/delete-account', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         setError(data.message || 'An error occurred while deleting the account.');
//         toast({
//           title: "Error",
//           description: data.message || "An error occurred while deleting the account.",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//         });
//       } else {
//         const data = await response.json(); // Parse the JSON response here
//         toast({
//           title: "Account Deleted",
//           description: "Your account has been successfully deleted.",
//           status: "success",
//           duration: 5000,
//           isClosable: true,
//         });

//         if (data.logout) { // Check for the logout flag in the response
//           signOut({ redirect: false }).then(() => { // Sign out client-side
//             router.push('/'); // Redirect to homepage after logout
//           });
//         } else {
//           // Handle cases where logout might not be intended (though in this flow, it should always be true)
//           router.push('/'); // Or handle redirection as needed if logout: false for some reason
//         }
//       }
//     } catch (e: any) {
//       setError(e.message || 'An unexpected error occurred.');
//       toast({
//         title: "Error",
//         description: e.message || "An unexpected error occurred.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     } finally {
//       setIsLoading(false);
//       onClose();
//     }
//   };

//   return (
//     <Box p={4} maxWidth="500px" mx="auto">
//       <Heading as="h2" size="lg" mb={4}>
//         Delete Account
//       </Heading>

//       <Box bg="red.50" p={4} borderRadius="md" mb={4}>
//         <Text fontWeight="bold" color="red.600">
//           Important Disclaimer
//         </Text>
//         <Text fontSize="sm" color="red.700">
//           Deleting your account is a permanent action. All your data, activities, and connections will be permanently
//           removed. This action cannot be undone. Please proceed with caution.
//         </Text>
//       </Box>

//       {error && (
//         <Alert status="error" mb={4}>
//           <AlertIcon />
//           {error}
//         </Alert>
//       )}

//       <FormControl mb={4}>
//         <FormLabel>Email address</FormLabel>
//         <Input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Your email"
//         />
//       </FormControl>

//       <FormControl mb={4}>
//         <FormLabel>Password</FormLabel>
//         <Input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Your password"
//         />
//       </FormControl>

//       <Button
//         colorScheme="red"
//         onClick={handleDeleteAccount}
//         isLoading={isLoading}
//         width="100%"
//         mb={4}
//       >
//         Delete Account
//       </Button>

//       {/* Confirmation Modal */}
//       <Modal isOpen={isOpen} onClose={onClose}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Confirm Account Deletion</ModalHeader>
//           <ModalBody>
//             <Text>Are you sure you want to permanently delete your account?</Text>
//           </ModalBody>
//           <ModalFooter>
//             <Button colorScheme="gray" mr={3} onClick={onClose}>
//               Cancel
//             </Button>
//             <Button colorScheme="red" isLoading={isLoading} onClick={confirmDelete}>
//               Confirm Delete
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default DeleteAccountPage;








"use client";
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  useToast,
  CheckboxGroup,
  Checkbox,
  Textarea,
} from "@chakra-ui/react";
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const DeleteAccountPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const [deletionReasons, setDeletionReasons] = useState<string[]>([]); // State for selected reasons
  const [otherReasonText, setOtherReasonText] = useState(""); // State for "Other" reason text
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false); // State to show/hide "Other" textarea

  // Define deletion reasons enum (as strings in frontend)
  const reasonsEnum = [
    "Not enough fitness activities",
    "Privacy concerns",
    "App is too complex",
    "Poor user experience",
    "Lack of community interaction",
    "Other", // "Other" option
  ];


  const handleDeleteAccount = () => {
    onOpen();
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setError("");

    // Prepare reasons array to send to backend
    let reasonsToSend = deletionReasons;
    if (showOtherReasonInput && otherReasonText.trim()) {
      reasonsToSend = [...reasonsToSend, `Other: ${otherReasonText.trim()}`]; // Add "Other" text if provided
    }


    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, reasons: reasonsToSend, comments: otherReasonText.trim() }), // Send reasons and comments
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'An error occurred while deleting the account.');
        toast({
          title: "Error",
          description: data.message || "An error occurred while deleting the account.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        if (data.logout) {
          signOut({ redirect: false }).then(() => {
            router.push('/');
          });
        } else {
          router.push('/');
        }
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      toast({
        title: "Error",
        description: e.message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleReasonChange = (values: string[]) => {
    setDeletionReasons(values);
    setShowOtherReasonInput(values.includes("Other")); // Show textarea if "Other" is selected
  };


  return (
    <Box p={4} maxWidth="500px" mx="auto">
      <Heading as="h2" size="lg" mb={4}>
        Delete Account
      </Heading>

      <Box bg="red.50" p={4} borderRadius="md" mb={4}>
        <Text fontWeight="bold" color="red.600">
          Important Disclaimer
        </Text>
        <Text fontSize="sm" color="red.700">
          Deleting your account is a permanent action. All your data, activities, and connections will be permanently
          removed. This action cannot be undone. Please proceed with caution.
        </Text>
      </Box>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <FormControl mb={4}>
        <FormLabel>Email address</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </FormControl>

      {/* ** New Survey Section ** */}
      <FormControl mb={4}>
        <FormLabel>Reason for Deletion (Optional)</FormLabel>
        <CheckboxGroup onChange={handleReasonChange}>
          {reasonsEnum.map((reason, index) => (
            <Checkbox key={index} value={reason} mb={1} mr={2}>
              {reason}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </FormControl>

      {/* ** "Other" Reason Textarea (Conditional) ** */}
      {showOtherReasonInput && (
        <FormControl mb={4}>
          <FormLabel>Please specify your reason (Other)</FormLabel>
          <Textarea
            placeholder="Enter your reason here"
            value={otherReasonText}
            onChange={(e) => setOtherReasonText(e.target.value)}
          />
        </FormControl>
      )}


      <Button
        colorScheme="red"
        onClick={handleDeleteAccount}
        isLoading={isLoading}
        width="100%"
        mb={4}
      >
        Delete Account
      </Button>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Account Deletion</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to permanently delete your account?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" isLoading={isLoading} onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DeleteAccountPage;