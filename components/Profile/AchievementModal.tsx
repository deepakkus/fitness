// components/AchievementModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Select,
    Textarea,
    Input,
    useToast,
    Box,
    Spinner,
} from '@chakra-ui/react';
import axios from 'axios';

interface ActivityOption {
    id: number;
    title: string;
}

interface AchievementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose }) => {
    const [activities, setActivities] = useState<ActivityOption[]>([]);
    const [selectedActivityId, setSelectedActivityId] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);
    const toast = useToast();
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoadingActivities(true);
            axios.get('/api/activities/joined')
                .then(response => {
                    setActivities(response.data.activities);
                    setIsLoadingActivities(false);
                })
                .catch(error => {
                    console.error("Error fetching joined activities:", error);
                    toast({
                        title: 'Error fetching activities',
                        description: 'Failed to load activities. Please try again.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsLoadingActivities(false);
                    onClose(); // Optionally close modal on error
                });
        } else {
            // Reset form when modal closes
            setSelectedActivityId('');
            setDescription('');
            setImage(null);
        }
    }, [isOpen, onClose, toast]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!selectedActivityId || !description || !image) {
                toast({
                    title: 'Missing fields',
                    description: 'Please select an activity, provide a description, and upload an image.',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
                setIsSubmitting(false);
                return;
            }

            // 1. Create Achievement Record FIRST
            const createAchievementResponse = await axios.post('/api/achievements/create', {
                activityId: selectedActivityId,
                description: description,
            });

            if (createAchievementResponse.data.success) {
                const achievementId = createAchievementResponse.data.achievementId; // Get the new achievement ID

                // 2. THEN Upload Image, including achievementId
                const formData = new FormData();
                formData.append('bucket_name', 'achievements');
                formData.append('achievement_id', String(achievementId)); // Use the newly created achievementId
                formData.append('image', image);

                const imageUploadResponse = await axios.post('/api/images', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (imageUploadResponse.data.success) {
                    toast({
                        title: 'Achievement created.',
                        description: "Achievement has been successfully added.",
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    onClose(); // Close modal on success
                } else {
                    toast({
                        title: 'Image upload failed',
                        description: imageUploadResponse.data.error || 'Failed to upload image.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                toast({
                    title: 'Failed to create achievement',
                    description: createAchievementResponse.data.error || 'Something went wrong during achievement creation.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }


        } catch (error: any) {
            console.error("Error submitting achievement:", error);
            toast({
                title: 'Submission error',
                description: error.response?.data?.error || 'Failed to submit achievement. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent mx={4}>
                <ModalHeader
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    pb={4}
                >
                    Add New Achievement
                </ModalHeader>
                <ModalCloseButton />
                
                <ModalBody py={6}>
                    {isLoadingActivities ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <Spinner color="orange.500" />
                        </Box>
                    ) : (
                        <>
                            <FormControl mb={4}>
                                <FormLabel fontWeight="medium">Activity</FormLabel>
                                <Select
                                    placeholder="Select activity"
                                    value={selectedActivityId}
                                    onChange={(e) => setSelectedActivityId(e.target.value)}
                                    focusBorderColor="orange.500"
                                >
                                    {activities.map(activity => (
                                        <option key={activity.id} value={`${activity.id}`}>
                                            {activity.title}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel fontWeight="medium">Achievement Description</FormLabel>
                                <Textarea
                                    placeholder="Enter achievement description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    focusBorderColor="orange.500"
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="medium">Achievement Image</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    p={1}
                                    focusBorderColor="orange.500"
                                />
                            </FormControl>
                        </>
                    )}
                </ModalBody>

                <ModalFooter
                    borderTop="1px solid"
                    borderColor="gray.100"
                    pt={4}
                >
                    <Button 
                        variant="ghost" 
                        mr={3} 
                        onClick={onClose} 
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="orange"
                        onClick={handleSubmit} 
                        isLoading={isSubmitting}
                        loadingText="Adding..."
                    >
                        Add Achievement
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AchievementModal;