"use client";

import { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  VStack, 
  useToast,
  Image,
  Text
} from '@chakra-ui/react';

export default function SliderUploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImage(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !image) {
      toast({
        title: 'Error',
        description: 'Title and image are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (category) formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      formData.append('image', image);
      
      const response = await fetch('/api/sliders', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status) {
        toast({
          title: 'Success',
          description: 'Slider added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setTitle('');
        setDescription('');
        setCategory('');
        setSubcategory('');
        setImage(null);
        setImagePreview(null);
      } else {
        throw new Error(result.message || 'Failed to add slider');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add slider',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter slider title"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter slider description"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Input 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category (optional)"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Subcategory</FormLabel>
            <Input 
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="Enter subcategory (optional)"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Image</FormLabel>
            <Input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              p={1}
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Upload an image for the slider (required)
            </Text>
          </FormControl>
          
          {imagePreview && (
            <Box mt={2} borderWidth="1px" borderRadius="md" overflow="hidden">
              <Image 
                src={imagePreview} 
                alt="Preview" 
                maxH="200px" 
                mx="auto"
              />
            </Box>
          )}
          
          <Button 
            type="submit" 
            colorScheme="green" 
            isLoading={isLoading}
            mt={4}
          >
            Upload Slider
          </Button>
        </VStack>
      </form>
    </Box>
  );
}