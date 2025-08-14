"use client";
import {
  Box,
  Button,
  Grid,
  GridItem,
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
  VStack,
  HStack,
  Flex,
  Icon,
  OrderedList,
  ListItem,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import { CloseIcon, LeftArrowIcon, UploadIcon } from "@/components/Icons";
import Heading from "@/components/App/heading";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";


interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Update FormData interface
interface BackendDoc {
  name: string;
  mediaId: string;
}
interface FormData {
  title: string;
  description: string;
  price: string;
  images: File[];
  imagesLink: { url: string; name: string }[];
  videos: File[];
  videosLink: string[];
  pdfs: File[];
  pdfsLink: BackendDoc[];
  documents: File[];
  docsLink: BackendDoc[];
}

// Fix linter errors for implicit any types
const QuillOutput = ({ htmlContent, ...props }: { htmlContent: string; [key: string]: any }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} {...props} />;
};

export default function CreateProduct() {
  
  const [productFormData, setProductFormData] = useState<FormData>({
    title: "",
    description: "",
    images: [] as File[],
    imagesLink: [] as { url: string; name: string }[],
    videos: [] as File[],
    videosLink: [] as string[],
    pdfs: [] as File[],
    pdfsLink: [] as BackendDoc[],
    price: "",
    documents: [] as File[],
    docsLink: [] as BackendDoc[],
  });

  //useSteps hook
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const searchParams = useSearchParams();
  const productId = searchParams.get("id");


  // --- SAFE useEffect for accessToken from session ---
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  // --- SAFE useEffect for fetching user data ---
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

  // --- SAFE useEffect for fetching product data when editing ---
  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${productId}`);
        const data = res.data?.data?.[0];
        console.log("Product data loaded:", {
          name: data?.name,
          pdfs: data?.pdfs,
          documents: data?.documents,
          pdfsLink: Array.isArray(data?.pdfs) ? data.pdfs.map((pdf: { name: string, mediaId: string }) => ({ name: pdf.name, mediaId: pdf.mediaId })) : [],
          docsLink: Array.isArray(data?.documents) ? data.documents.map((doc: { name: string, mediaId: string }) => ({ name: doc.name, mediaId: doc.mediaId })) : []
        });
        
        if (data && isMounted) {
          setProductFormData((prev) => ({
            ...prev,
            title: data.name || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            imagesLink: Array.isArray(data.images)
              ? data.images.map((img: { url: string, name: string }) => ({ url: img.url, name: img.name }))
              : [],
            videosLink: Array.isArray(data.videos) ? data.videos.map((vid: { url: string }) => vid.url) : [],
            pdfsLink: Array.isArray(data.pdfs) ? data.pdfs.map((pdf: { name: string, mediaId: string }) => ({ name: pdf.name, mediaId: pdf.mediaId })) : [],
            docsLink: Array.isArray(data.documents) ? data.documents.map((doc: { name: string, mediaId: string }) => ({ name: doc.name, mediaId: doc.mediaId })) : [],
          }));
          if (Array.isArray(data.course_materials)) {
            setWebsiteLinks(data.course_materials.map((mat: { name: string }) => mat.name));
          }
        }
      } catch (err) {
        toast({
          title: "Error loading product",
          description: "Could not fetch product details for editing.",
          status: "error",
        });
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [productId, toast]);


  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: 3,
  });


  // Enhanced validation function with better error handling
  const validateEventForm = (formData: FormData, activeStep: number): ValidationResult => {
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

      // Description validation
      const strippedDescription = formData.description.replace(/<[^>]*>/g, '').trim();
      if (!strippedDescription || strippedDescription === '') {
        errors.push({ field: 'description', message: 'Description is required' });
      } else if (strippedDescription.length < 10) {
        errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
      }

      // Image validation
      const totalImages = (formData.images?.length || 0) + (formData.imagesLink?.length || 0);
      if (totalImages === 0) {
        errors.push({ field: 'images', message: 'At least one image is required' });
      } else if (totalImages > 5) {
        errors.push({ field: 'images', message: 'Maximum 5 images allowed' });
      }
    }

    // Step 1 validations (Optional Details)
    if (activeStep === 1) {

      
      // Price validation
      if (!formData.price.trim()) {
        errors.push({ field: 'price', message: 'Price is required' });
      } else if (!/^([0-9()-.\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(formData.price.trim())) {
        errors.push({ field: 'price', message: 'Please enter a valid price' });
      }


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
    setProductFormData((prevData) => ({
      ...prevData,
      description: value,
    }));
  };
  const handleInputContactInfoChange = (value: string) => {
    setProductFormData((prevData) => ({
      ...prevData,
      price: value,
    }));
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ ...prev, [name]: value }));

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
    // Only update images, not imagesLink
    const newImages = [...productFormData.images, ...files];
    setProductFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...productFormData.images];
    newImages.splice(index, 1);
    setProductFormData((prevData) => ({
      ...prevData,
      images: newImages,
    }));
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [minDate, setMinDate] = useState('');

  // View image in modal instead of opening a new tab
  const handleImageView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onOpen();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) =>{
      console.log('video upload');
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      // Validate each file
      // for (const file of files) {
      //   const error = validateImage(file);
      //   if (error) {
      //     toast({
      //       title: "Video Error",
      //       description: error.message,
      //       status: "error",
      //       duration: 3000,
      //     });
      //     return;
      //   }
      // }

      const newVideos = [...productFormData.videos, ...files];
      const newVideosLink = [...productFormData.videosLink, ...files.map(file => URL.createObjectURL(file))];
      setProductFormData(prev => ({
      ...prev,
      videos: newVideos,
      videosLink: newVideosLink
     }));
  };


    const VideoUploaderHandleDelete = (index: number) => {
    // const VideoUploaderUpdated = [...VideoUploaderFiles];
    // VideoUploaderUpdated.splice(index, 1);
    // setVideoUploaderFiles(VideoUploaderUpdated);

    const newVideos = [...productFormData.videos];
    const newLinks = [...productFormData.videosLink];
    URL.revokeObjectURL(newLinks[index]);  
    newVideos.splice(index, 1);
    newLinks.splice(index, 1);
    setProductFormData((prevData) => ({
      ...prevData,
      videos: newVideos,
      videosLink: newLinks
    }));
  };

  const VideoUploaderHandleView = (file: File) => {
    const VideoUploaderUrl = URL.createObjectURL(file);
    window.open(VideoUploaderUrl, "_blank");
  };

   const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Only add to local pdfs list to avoid duplicate rendering; backend links remain in pdfsLink
    setProductFormData(prev => ({
      ...prev,
      pdfs: [...prev.pdfs, ...files],
    }));
  };

  // 1. Update handleDocumentspload to only store files in state, not upload
  const handleDocumentspload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProductFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
      docsLink: [
        ...prev.docsLink,
        ...files.map(file => ({ name: file.name, mediaId: `local-${file.name}-${Date.now()}` }))
      ],
    }));
  };

  // Event handlers
  const handleNext = async () => {
    if (linkInput.trim()) {
      // If there's a pending link, add it and then submit after state updates
      pendingSubmitRef.current = () => handleNext();
      handleAddLink(() => {
        // This callback will be called after websiteLinks is updated
        if (pendingSubmitRef.current) {
          const fn = pendingSubmitRef.current;
          pendingSubmitRef.current = null;
          fn();
        }
      });
      return;
    }
    const validation = validateEventForm(productFormData, activeStep);

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
      //   if (activeStep === 1 && eventFormData.rule.trim() !== "") {
      //     setEventFormData(prevData => ({
      //       ...prevData,
      //       rules: [...prevData.rules, prevData.rule],
      //       rule: "", 
      //     }));
      //   }

      setActiveStep(activeStep + 1);
    } else {
      try {
        setIsProcessing(true);
        if (session) {
          toast({
            title: `Creating Product.. pls wait..`,
            status: "loading",
            duration: 2000,
          });
          const headers: HeadersInit = {};

          if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
          }

          const body = {
            name: productFormData.title,
            price: parseFloat(productFormData.price),
            description: productFormData.description,
            websiteLinks: websiteLinks,
          };

          // Log the payload being sent
          console.log("Submitting product (create/edit) payload:", body);

          let productData, product_id;

          // Before product POST/PUT
          console.log("Documents before product upload:", productFormData.documents);
          if (productId) {
            // EDIT MODE: Update product
            const putRes = await axios.put(`/api/products/${productId}`, body, {
              withCredentials: true,
              headers,
            });
            productData = putRes.data;
            product_id = productId;
          } else {
            // CREATE MODE: Create product
            const postRes = await axios.post(`/api/products/create`, body, {
              withCredentials: true,
              headers,
            });
            productData = postRes.data;
            product_id = productData.product && productData.product.id;
          }
          if (product_id) {
            //   // Upload each image using FormData
            const imageFormData = new FormData();
            const videoFormData = new FormData();
            const pdfFormData = new FormData();
            if (productFormData.images.length >= 1) {
              toast({
                title: `Uploading Images.. pls wait..`,
                status: "loading",
                duration: 5000,
              });
              if (productFormData.images.length === 1) {
                // Single image upload
                imageFormData.append("image", productFormData.images[0]);
              } else {
                // Multiple images upload
                productFormData.images.forEach((image) => {
                  imageFormData.append("imagelist", image); // Use "imagelist" key for multiple files
                });
              }
              // Debug: log FormData keys
              console.log("FormData keys:", Array.from(imageFormData.keys()));
              imageFormData.append("bucket_name", "products");
              imageFormData.append("product_id", product_id);
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
                  let updatedProductRes;
                  if (accessToken) {
                    updatedProductRes = await axios.get(`/api/products/${product_id}`, { withCredentials: true, headers: { "Authorization": `Bearer ${accessToken}` } });
                  } else {
                    updatedProductRes = await axios.get(`/api/products/${product_id}`, { withCredentials: true });
                  }
                  const updatedProduct = updatedProductRes.data.product;
                  setProductFormData(prev => ({
                    ...prev,
                    images: [],
                    imagesLink: (updatedProduct && Array.isArray(updatedProduct.images)) ? updatedProduct.images : [],
                  }));
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
            //Process video upload
            if (productFormData.videos.length >= 1){
                toast({
                  title: `Uploading Videos.. pls wait..`,
                  status: "loading",
                  duration: 5000,
                });
                 if (productFormData.videos.length === 1) {
                    // Single video upload
                    videoFormData.append("video", productFormData.videos[0]);
                    } else {
                    // Multiple images upload
                      productFormData.videos.forEach((video) => {
                      videoFormData.append("videolist", video); // Use "videolist" key for multiple files
                    });
                }
              videoFormData.append("bucket_name", "products");
              videoFormData.append("product_id", product_id);
              try {
                const videoResponse = await fetch("/api/images", {
                  method: "POST",
                  body: videoFormData,
                  headers,
                });
                if (!videoResponse.ok) {
                  throw new Error(`Video upload failed`);
                }
                if (videoResponse.ok) {
                }
              } catch (error) {
                console.error("Error uploading video", error);
                toast({
                  title: `Uploading Videos.. failed..`,
                  status: "error",
                });
                router.refresh();
              }
            } 
            if(!productId) 
            {
              console.log('new prod--'+productFormData.documents.length);
            }
            //process pdf upload
               if (productFormData.pdfs.length >= 1){
                toast({
                  title: `Uploading Pdfs.. pls wait..`,
                  status: "loading",
                  duration: 5000,
                });
                 if (productFormData.pdfs.length === 1) {
                    // Single video upload
                    pdfFormData.append("pdf", productFormData.pdfs[0]);
                    } else {
                    // Multiple images upload
                      productFormData.pdfs.forEach((pdf) => {
                      pdfFormData.append("pdflist", pdf); // Use "videolist" key for multiple files
                    });
                }
              pdfFormData.append("bucket_name", "products");
              pdfFormData.append("product_id", product_id);
              try {
                const pdfResponse = await fetch("/api/images", {
                  method: "POST",
                  body: pdfFormData,
                  headers,
                });
                if (!pdfResponse.ok) {
                  throw new Error(`Video upload failed`);
                }
                if (pdfResponse.ok) {
                }
              } catch (error) {
                console.error("Error uploading pdf", error);
                toast({
                  title: `Uploading Pdfs.. failed..`,
                  status: "error",
                });
                router.refresh();
              }
            }
            // Upload documents (txt/doc/docx)
            if (productFormData.documents.length > 0) {
              console.log("Uploading documents:", productFormData.documents);
            } else {
              console.log("No documents to upload.");
            }
            if (productFormData.documents.length > 0) {
              for (const doc of productFormData.documents) {
                const docFormData = new FormData();
                docFormData.append("file", doc);
                // Only set Authorization header, do NOT set Content-Type
                const docHeaders = accessToken ? { "Authorization": `Bearer ${accessToken}` } : {};
                try {
                  let fetchOptions: RequestInit = {
                    method: "POST",
                    body: docFormData,
                  };
                  if (accessToken) {
                    fetchOptions = {
                      ...fetchOptions,
                      headers: { "Authorization": `Bearer ${accessToken}` },
                    };
                  }
                  const response = await fetch(`/api/products/${product_id}/documents`, fetchOptions);
                  const data = await response.json();
                  if (response.ok && data && data.mediaId) {
                    if (data.name && data.name !== doc.name) {
                      toast({
                        title: "File Renamed",
                        description: `Your file was saved as ${data.name} to avoid duplicates.`,
                        status: "info",
                        duration: 5000,
                        isClosable: true,
                      });
                    } else {
                      toast({
                        title: "Document Uploaded",
                        description: `${doc.name} uploaded successfully.`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                    }
                  } else if (data && data.error) {
                    toast({
                      title: "Upload Error",
                      description: data.error,
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                    });
                  }
                } catch (err) {
                  toast({
                    title: "Error uploading document",
                    status: "error",
                  });
                }
              }
            }
            toast({
              title: productId ? `Product Updated Successfully` : `Product Created Successfully`,
              status: "success",
            });
            router.push(`/product/${product_id}`);
          }
          else {
            toast({
              title: "Error creating product",
              status: "error",
            });
            router.refresh();
          }
        }
        setIsProcessing(false);
      } catch (error) {
        setIsProcessing(false);
        
        console.error("Error submitting product", error);
        toast({
          title: "Error submitting product",
          status: "error",
        });
      }
      finally {
        setIsProcessing(false);
      }
      
      //router.push(`/product/1`);
    }
  };

  const handleCancel = () => {
    setActiveStep(0);
  };

  //  Video
  const [VideoUploaderFiles, setVideoUploaderFiles] = useState<File[]>([]);
  const VideoUploaderToast = useToast();
  const VideoUploaderMaxFiles = 90;

  const VideoUploaderHandleFiles = (files: File[]) => {
    const VideoUploaderNewFiles = Array.from(files);
    if (
      VideoUploaderFiles.length + VideoUploaderNewFiles.length >
      VideoUploaderMaxFiles
    ) {
      VideoUploaderToast({
        title: `Maximum ${VideoUploaderMaxFiles} files allowed.`,
        status: "warning",
      });
      return;
    }
    
    setVideoUploaderFiles((prev: File[]) => [...prev, ...VideoUploaderNewFiles]);
    

  };

  const VideoUploaderHandleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    VideoUploaderHandleFiles(Array.from(e.target.files || []));
    // 👇 Reset input value so same file can be re-selected
    e.target.value = "";
  };
  


  // Websile Link Upload
  const [linkInput, setLinkInput] = useState("");
  const [websiteLinks, setWebsiteLinks] = useState<string[]>([]);
  const maxLinks = 90;
  const pendingSubmitRef = useRef<null | (() => void)>(null);

  const handleAddLink = (cb?: () => void) => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;

    if (websiteLinks.length >= maxLinks) {
      toast({
        title: `Maximum ${maxLinks} links allowed.`,
        status: "warning",
      });
      return;
    }

    setWebsiteLinks((prev) => {
      const updated = [...prev, trimmed];
      if (cb) cb();
      return updated;
    });
    setLinkInput("");
  };

  const handleDeleteLink = async (index: number) => {
    const updated = [...websiteLinks];
    const [removed] = updated.splice(index, 1);
    setWebsiteLinks(updated);
    // If editing, also delete from backend
    if (productId && removed) {
      try {
        await axios.delete(`/api/products/${productId}/course-materials`, {
          data: { name: removed },
          withCredentials: true,
        });
      } catch (err) {
        toast({
          title: "Error deleting course material from server",
          status: "error",
        });
      }
    }
  };
 
   // PDF

  const [PdfUploaderFiles, setPdfUploaderFiles] = useState<File[]>([]);
  const PdfUploaderMaxFiles = 90;

  const PdfUploaderHandleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check for duplicates
    const newFiles = files.filter((newFile) => {
      return !PdfUploaderFiles.some(
        (existingFile) =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
      );
    });

    if (newFiles.length === 0) {
      toast({
        title: "Duplicate File",
        description: "This file has already been uploaded.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setPdfUploaderFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset input so same file can be selected again later
    e.target.value = "";
  };

  const PdfUploaderHandleView = (file: File) => {
    window.open(URL.createObjectURL(file));
  };
  const DocumentUploaderHandleView = (file: File) => {
    window.open(URL.createObjectURL(file));
  };
  const PdfUploaderHandleDelete = (index: number) => {
   setProductFormData((prev: FormData) => {
    const newPdfs = [...prev.pdfs];
    const newPdfsLink = [...prev.pdfsLink];
    newPdfs.splice(index, 1);        // remove the file
    newPdfsLink.splice(index, 1);    // remove its preview link
    return {
      ...prev,
      pdfs: newPdfs,
      pdfsLink: newPdfsLink,
    };
  });
};

const DocumentUploaderHandleDelete = (index: number) => {
   setProductFormData((prev: FormData) => {
    const newDocuments = [...prev.documents];
    const newDocsLink = [...prev.docsLink];
    newDocuments.splice(index, 1);        // remove the file
    newDocsLink.splice(index, 1);    // remove its preview link
    return {
      ...prev,
      documents: newDocuments,
      docsLink: newDocsLink,
    };
  });
};
  // Include your full handlers and all state management from the original code here...

  // Update handleImageLinkDelete to use name
  const handleImageLinkDelete = async (index: number) => {
    const image = productFormData.imagesLink[index];
    if (!productId || !image || !image.name) {
      toast({ title: "Image not found", status: "error" });
      return;
    }
    // Ensure the name matches the DB (with 'products/' prefix)
    const imageName = image.name.startsWith('products/') ? image.name : `products/${image.name}`;

    try {
      const response = await axios.delete(`/api/products/${productId}/images`, {
        data: { name: imageName },
        withCredentials: true,
      });
      if (response.data?.error) {
        toast({ title: "Error deleting image", description: response.data.error, status: "error" });
        return;
      }
      setProductFormData((prev) => {
        const newLinks = [...prev.imagesLink];
        newLinks.splice(index, 1);
        return { ...prev, imagesLink: newLinks };
      });
      toast({ title: "Image deleted", status: "success" });
    } catch (err) {
      toast({ title: "Error deleting image", status: "error" });
    }
  };

  return (
    <Box p={{ base: "20px 10px", md: "30px", lg: "40px" }}>
      <Heading mb="20px">Create Product</Heading>
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
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Information`}</StepTitle>
                <StepDescription>{`Product Details`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
            <Step key={1}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Materials`}</StepTitle>
                <StepDescription>{`Course Materials`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
            <Step key={2}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Preview`}</StepTitle>
                <StepDescription>{`Preview Product`}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          </Stepper>
          {activeStep === 0 && (
            <Box
              p={{ base: "20px", md: "30px" }}
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderBottom={"none"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
            >
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Product Title
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder="Enter product title"
                    fontSize={"16px"}
                    _placeholder={{ color: "#CED4DA" }}
                    onChange={handleInputChange}
                    value={productFormData.title}
                    isInvalid={validationErrors.some((error) => error.field === "title")}
                    errorBorderColor="red.300"
                    name="title"
                    borderRadius={"3px"}
                  />
                  {validationErrors
                    .filter((error) => error.field === "title")
                    .map((error, index) => (
                      <Text key={index} color="red.500" fontSize="sm">
                        {error.message}
                      </Text>
                    ))}
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Product Description
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <ReactQuill
                    theme="snow"
                    className="box-border leading-[1.42] h-full text-left whitespace-pre-wrap outline-none break-words antialiased"
                    style={{ height: "150px", tabSize: 4, MozTabSize: 4, wordWrap: "break-word", WebkitFontSmoothing: "antialiased" }}
                    value={productFormData.description}
                    onChange={handleInputDescriptionChange}
                  />
                </Box>
                <Box mt="50px">
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Price
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder="Enter price"
                    fontSize={"16px"}
                    _placeholder={{ color: "#CED4DA" }}
                    onChange={handleInputChange}
                    value={productFormData.price}
                    name="price"
                    borderRadius={"3px"}
                  />
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Upload Product Images (Upto 5)*
                  </FormLabel>
                  <Box
                    display="flex"
                    flexDir="column"
                    gap="10px"
                    border="1px dashed #CBD5E1"
                    borderRadius="3px"
                    p="22px"
                    alignItems="center"
                    justifyContent="center"
                    bg="#FFF"
                    minH="120px"
                    position="relative"
                    mb="10px"
                  >
                    <UploadIcon stroke="#475569" width="22px" height="22px" />
                    <Text color="#334155" fontWeight="500">Click to upload</Text>
                    <Text fontSize="13px" color="#94A3B8">Jpeg, jpg, png (max 5mb)</Text>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      position="absolute"
                      w="full"
                      h="full"
                      top="0"
                      left="0"
                      opacity="0"
                      onChange={handleImageUpload}
                      zIndex="100"
                      cursor="pointer"
                    />
                  </Box>
                  {/* Show previews of new images */}
                  {productFormData.images.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap="10px" mb="10px">
                      {productFormData.images.map((image, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap="10px" border="1px solid #CBD5E1" borderRadius="6px" p="5px">
                          <Image src={URL.createObjectURL(image)} boxSize="60px" objectFit="cover" borderRadius="4px" />
                          <Button size="sm" colorScheme="red" onClick={() => handleImageDelete(idx)}>Delete</Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {/* Show backend images */}
                  {productFormData.imagesLink.filter(img => img.url && img.name).length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap="10px">
                      {productFormData.imagesLink
                        .map((image, idx) => ({ image, idx }))
                        .filter(({ image }) => image.url && image.name)
                        .map(({ image, idx }) => (
                          <Box key={idx} display="flex" alignItems="center" gap="10px" border="1px solid #CBD5E1" borderRadius="6px" p="5px">
                            <Image src={image.url} boxSize="60px" objectFit="cover" borderRadius="4px" />
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleImageLinkDelete(idx)}
                            >
                              Delete
                            </Button>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalCloseButton color={"white"} p={5} />
                    <ModalBody p={4} display="flex" justifyContent="center" alignItems="center">
                      <Image src={selectedImage || ""} alt="preview" width="150%" height="auto" borderRadius="10px" />
                    </ModalBody>
                  </ModalContent>
                </Modal>
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
                  Course Materials Videos (Optional)
                  {/* Course Materials Videos (Up to {VideoUploaderMaxFiles}) */}
                  {/* <span style={{ color: "red" }}>*</span> */}
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
                    MP4, MOV, AVI (Max 100MB each)
                  </Text>
                  <Input
                    id="VideoUploaderInput"
                    type="file"
                    accept="video/*"
                    position={"absolute"}
                    w={"full"}
                    h={"full"}
                    top={"0"}
                    left={"0"}
                    opacity={"0"}
                    onChange={handleVideoUpload}
                    multiple
                    // hidden
                    zIndex={"100"}
                  />
                </Box>
              </Box>
              <Box display={"flex"} flexDir={"column"} gap="10px">
                {productFormData.videos.map((file, index) => (
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
                    <Text noOfLines={1}>{file.name}</Text>
                    <Box display={"flex"} gap="10px">
                      <Button
                        size="md"
                        paddingX="44px"
                        borderRadius="3px"
                        colorScheme="#F9690E"
                        onClick={() => VideoUploaderHandleView(file)}
                        variant="link"
                      >
                        View
                      </Button>
                      <Button
                        size="md"
                        paddingX="44px"
                        borderRadius="3px"
                        colorScheme="#F9690E"
                        onClick={() => VideoUploaderHandleDelete(index)}
                        variant="link"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
                {/* PDF File START*/}
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Course Materials PDFs (Optional)
                    {/* Course Materials PDFs (Up to {VideoUploaderMaxFiles}) */}
                    {/* <span style={{ color: "red" }}>*</span> */}
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
                      PDF (Max 100MB each)
                    </Text>
                    <Input
                      id="PdfUploaderInput"
                      type="file"
                      accept=".pdf"
                      position={"absolute"}
                      w={"full"}
                      h={"full"}
                      top={"0"}
                      left={"0"}
                      opacity={"0"}
                      onChange={handlePdfUpload}
                      multiple
                      // hidden
                      zIndex={"100"}
                    />
                  </Box>
                </Box>
                <Box display={"flex"} flexDir={"column"} gap="10px">
                  {/* Unified list: backend pdfsLink first, then new pdfs */}
                  {productFormData.pdfsLink && productFormData.pdfsLink.map((pdf, idx) => (
                    <Box
                      key={pdf.mediaId || idx}
                      display={"flex"}
                      justifyContent={"space-between"}
                      gap="10px"
                      bgColor={"#FFF"}
                      p={"10px"}
                      border={"1px solid #CBD5E1"}
                      borderRadius={"6px"}
                    >
                      <Text noOfLines={1}>{pdf.name}</Text>
                      <Box display={"flex"} gap="10px">
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={() => window.open(`/api/products/${productId}/media/${pdf.mediaId}/pdf`, '_blank')}
                          variant="link"
                        >
                          View
                        </Button>
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={async () => {
                            // Backend delete
                            try {
                              await axios.delete(`/api/products/${productId}/documents`, {
                                data: { mediaId: pdf.mediaId },
                                withCredentials: true,
                              });
                              setProductFormData(prev => ({
                                ...prev,
                                pdfsLink: prev.pdfsLink.filter((p, i) => i !== idx),
                              }));
                            } catch (err) {
                              toast({ title: 'Error deleting PDF', status: 'error' });
                            }
                          }}
                          variant="link"
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                  {productFormData.pdfs && productFormData.pdfs.map((file, index) => (
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
                      <Text noOfLines={1}>{file.name}</Text>
                      <Box display={"flex"} gap="10px">
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={() => PdfUploaderHandleView(file)}
                          variant="link"
                        >
                          View
                        </Button>
                        <Button
                          size="md"
                          paddingX="44px"
                          borderRadius="3px"
                          colorScheme="#F9690E"
                          onClick={() => PdfUploaderHandleDelete(index)}
                          variant="link"
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
                {/* PDF File END*/}  
                
                {/**Course Materials Documents/text/ */}
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Course Materials Documents (Optional)
                    {/* Course Materials PDFs (Up to {VideoUploaderMaxFiles}) */}
                    {/* <span style={{ color: "red" }}>*</span> */}
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
                      txt/doc (Max 100MB each)
                    </Text>
                    
                    <Input
                      id="docUploaderInput"
                      type="file"
                      accept=".txt,.doc,.docx"
                      position={"absolute"}
                      w={"full"}
                      h={"full"}
                      top={"0"}
                      left={"0"}
                      opacity={"0"}
                      onChange={handleDocumentspload}
                      multiple
                      // hidden
                      zIndex={"100"}
                    />
                  </Box>
                </Box>
                <Box display={"flex"} flexDir={"column"} gap="10px">
                  {/* Unified list: combine backend and local documents, filter duplicates by name */}
                  {(() => {
                    // Create a map to filter out duplicate names, prefer backend
                    const seen = new Set();
                    const unifiedDocs = [
                      ...(productFormData.docsLink || []),
                      ...(productFormData.documents || []).map((file, idx) => ({ name: file.name, mediaId: `local-${file.name}-${idx}` })),
                    ].filter(doc => {
                      if (!doc.name || seen.has(doc.name)) return false;
                      seen.add(doc.name);
                      return true;
                    });
                    return unifiedDocs.map((doc, idx) => (
                      <Box
                        key={doc.mediaId || idx}
                        display={"flex"}
                        justifyContent={"space-between"}
                        gap="10px"
                        bgColor={"#FFF"}
                        p={"10px"}
                        border={"1px solid #CBD5E1"}
                        borderRadius={"6px"}
                      >
                        <Text noOfLines={1}>{doc.name}</Text>
                        <Box display={"flex"} gap="10px">
                          <Button
                            size="md"
                            paddingX="44px"
                            borderRadius="3px"
                            colorScheme="#F9690E"
                            onClick={() => {
                              if (doc.mediaId.startsWith('local-')) {
                                // Local file, find index in documents
                                const localIdx = productFormData.documents.findIndex(f => f.name === doc.name);
                                if (localIdx !== -1) DocumentUploaderHandleView(productFormData.documents[localIdx]);
                              } else {
                                window.open(`/api/products/${productId}/media/${doc.mediaId}/document`, '_blank');
                              }
                            }}
                            variant="link"
                          >
                            View
                          </Button>
                          <Button
                            size="md"
                            paddingX="44px"
                            borderRadius="3px"
                            colorScheme="#F9690E"
                            onClick={async () => {
                              if (doc.mediaId.startsWith('local-')) {
                                // Local file, remove from state
                                const localIdx = productFormData.documents.findIndex(f => f.name === doc.name);
                                if (localIdx !== -1) DocumentUploaderHandleDelete(localIdx);
                              } else {
                                try {
                                  await axios.delete(`/api/products/${productId}/documents`, {
                                    data: { mediaId: doc.mediaId },
                                    withCredentials: true,
                                  });
                                  setProductFormData(prev => ({
                                    ...prev,
                                    docsLink: prev.docsLink.filter((d) => d.mediaId !== doc.mediaId),
                                  }));
                                } catch (err) {
                                  toast({ title: 'Error deleting document', status: 'error' });
                                }
                              }
                            }}
                            variant="link"
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    ));
                  })()}
                </Box>  

                
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Course Materials URL
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder="https://www.coursematerialsurl.com"
                    fontSize={"16px"}
                    _placeholder={{ color: "#CED4DA" }}
                    borderRadius={"3px"}
                    value={linkInput}
                    name="material_name"
                    onChange={(e) => setLinkInput(e.target.value)}
                    isDisabled={websiteLinks.length >= maxLinks}
                  />
                  <Button
                    my="20px"
                    p="10px"
                    borderRadius={"8px"}
                    colorScheme="orange"
                    color="#FFF"
                    fontSize={"13px"}
                    onClick={() => handleAddLink()}
                    isDisabled={
                      !linkInput.trim() || websiteLinks.length >= maxLinks
                    }
                  >
                    Add more links
                  </Button>
                  <Box display={"flex"} flexDir={"column"} alignItems={"center"} justifyContent={"center"} gap="10px">
                    {websiteLinks.map((link, index) => {
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
                            {link}
                          </Text>

                          <CloseIcon
                            onClick={() => handleDeleteLink(index)}
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
                      {/* Product Title  */}
                      <Text
                        fontSize={"30px"}
                        fontWeight={"700"}
                        color="#334155"
                        mt={"20px"}
                        mb={"20px"}
                      >
                        {productFormData.title}
                      </Text>
                    </Box>
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
                      {/* Uploaded images */}
                      {productFormData.images.map((image, index) => (
                        <GridItem key={`uploaded-${index}`}>
                          <Image
                            src={`${URL.createObjectURL(image)}`}
                            alt={`Image ${index + 1}`}
                            width="100%"
                            height="250px"
                            objectFit="cover"
                            borderRadius="8px"
                          />
                        </GridItem>
                      ))}
                      {/* Backend images */}
                      {productFormData.imagesLink.map((image, index) => (
                        <GridItem key={`link-${index}`}>
                          <Image
                            src={image.url}
                            alt={`Image ${index + 1}`}
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
                      pt={"20px"}
                      // pb={"10px"}
                      // maxWidth="745px"
                      px={{ base: "20px", md: "30px" }}
                      // mx="20px"
                      display={"flex"}
                      justifyContent={"center"}
                      mb={"15px"}
                    >
                      <QuillOutput
                        htmlContent={productFormData.description}
                        style={{
                          color: "#64748B",
                          fontSize: "16px",
                          textAlign: "left",
                          width: "100%",
                        }}
                      />
                    </Box>

                    {/* Video  */}
                    {Array.isArray(productFormData?.videos) && productFormData.videos.length > 0 &&(
                      <>
                        <Box
                      pt={"20px"}
                      pb={"40px"}
                      // maxWidth="745px"
                      px={{ base: "20px", md: "30px" }}
                    // mx="20px"
                    // display={"flex"}
                    // justifyContent={"center"}
                    >
                      <Text
                        fontSize={"30px"}
                        fontWeight={"700"}
                        // borderBottom={"1px solid #E2E8F0"}
                        color="#0F172A"
                      // px="20px"
                      // py={"10px"}

                      >
                        Course Materials Videos
                      </Text>
                      <Flex wrap="wrap" gap={4}>
                        {productFormData.videos.map((video, index) => (
                          <Box
                            key={index}
                            as="video"
                            src={URL.createObjectURL(video)}
                            controls
                            width="48%"
                            borderRadius="md"
                            boxShadow="md"
                            my={"20px"}
                          />
                        ))}
                      </Flex>
                    </Box>
                      </>
                    )}
                    
                  </Box>

                  {/* Sidebar - Post Details */}
                  <Box
                    w={"full"}
                    maxWidth={"350px"}
                    bgColor={"#FFF"}
                    borderLeft={"1px solid #E2E8F0"}
                  >

                    <Box
                      px="20px"
                      py={"10px"}
                      borderBottom={"1px solid #E2E8F0"}
                      display={"flex"}
                      flexDir={"column"}
                      gap={"15px"}
                    >
                      <Flex color="#0F172A" fontSize="20px" fontWeight="700" alignItems="center">
                        <Text>Price:</Text>
                        <Text color="#F9690E" ml="2" fontSize="35px">${parseFloat(productFormData.price).toFixed(2)}</Text>
                      </Flex>
                    </Box>
                    {websiteLinks.length > 0 &&(
                        <><Text
                      fontSize={"18px"}
                      fontWeight={"700"}
                      // borderBottom={"1px solid #E2E8F0"}
                      color="#0F172A"
                      px="20px"
                      py={"10px"}

                    >
                      Course Materials URL
                    </Text>
                    <OrderedList spacing={2} px={"20px"}>
                      {websiteLinks.map((link, index) => (
                        <ListItem key={index}>
                          <Link
                            href={link}
                            color="blue.500"
                            isExternal
                            wordBreak="break-all"
                          >
                            {link}
                          </Link>
                        </ListItem>
                      ))}
                    </OrderedList>
                    </>
                    )}
                    
                    {(Array.isArray(productFormData?.pdfs) && productFormData.pdfs.length > 0) || 
                     (Array.isArray(productFormData?.pdfsLink) && productFormData.pdfsLink.length > 0) &&(
                      console.log("Rendering PDF section:", {
                        pdfs: productFormData?.pdfs?.length || 0,
                        pdfsLink: productFormData?.pdfsLink?.length || 0,
                        pdfsLinkData: productFormData?.pdfsLink
                      }),
                        <>
                           <Text
                      fontSize={"18px"}
                      fontWeight={"700"}
                      // borderBottom={"1px solid #E2E8F0"}
                      color="#0F172A"
                      px="20px"
                      py={"10px"}

                    >
                      Course Materials PDF
                    </Text>
                    <OrderedList spacing={2} px={"20px"}>
                      {/* Show backend PDFs first */}
                      {Array.isArray(productFormData?.pdfsLink) && productFormData.pdfsLink.map((pdf, index) => (
                        <ListItem key={`backend-pdf-${index}`}>
                          <Link
                            href={`/api/products/${productId}/media/${pdf.mediaId}/pdf`}
                            color="blue.500"
                            isExternal
                            wordBreak="break-all"
                          >
                            {pdf.name}
                          </Link>
                        </ListItem>
                      ))}
                      {/* Show new PDFs */}
                      {Array.isArray(productFormData?.pdfs) && productFormData.pdfs.map((file, index) => (
                        <ListItem key={`new-pdf-${index}`}>
                          <Link
                            href={URL.createObjectURL(file)}
                            download={file.name}
                            color="blue.500"
                            isExternal
                            wordBreak="break-all"
                          >
                            {file.name}
                          </Link>
                        </ListItem>
                      ))}
                    </OrderedList>
                        </>
                    )}
                    {(Array.isArray(productFormData?.documents) && productFormData.documents.length > 0) || 
                     (Array.isArray(productFormData?.docsLink) && productFormData.docsLink.length > 0) &&(
                      console.log("Rendering Documents section:", {
                        documents: productFormData?.documents?.length || 0,
                        docsLink: productFormData?.docsLink?.length || 0,
                        docsLinkData: productFormData?.docsLink
                      }),
                      <>
                           <Text
                      fontSize={"18px"}
                      fontWeight={"700"}
                      // borderBottom={"1px solid #E2E8F0"}
                      color="#0F172A"
                      px="20px"
                      py={"10px"}
                    >
                      Course Materials Documents
                    </Text>
                    <OrderedList spacing={2} px={"20px"}>
                      {/* Show backend documents first */}
                      {Array.isArray(productFormData?.docsLink) && productFormData.docsLink.map((doc, index) => (
                        <ListItem key={`backend-doc-${index}`}>
                          <Link
                            href={`/api/products/${productId}/media/${doc.mediaId}/document`}
                            color="blue.500"
                            isExternal
                            wordBreak="break-all"
                          >
                            {doc.name}
                          </Link>
                        </ListItem>
                      ))}
                      {/* Show new documents */}
                      {Array.isArray(productFormData?.documents) && productFormData.documents.map((file, index) => (
                        <ListItem key={`new-doc-${index}`}>
                          <Link
                            href={URL.createObjectURL(file)}
                            download={file.name}
                            color="blue.500"
                            isExternal
                            wordBreak="break-all"
                          >
                            {file.name}
                          </Link>
                        </ListItem>
                      ))}
                    </OrderedList>
                      </>
                    )}
                   
                  </Box>
                </Box>
              </Box>
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
                      if (activeStep == 0) {
                        return;
                      }
                      setActiveStep(activeStep - 1);
                    }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  colorScheme="orange"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  {activeStep === 0 && "Next"}
                  {activeStep === 1 && "Preview Product"}
                  {activeStep === 2 && "Create Product"}
                </Button>
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
            Gapp Product Creation Regulations
          </Text>
          <Box display={"flex"} flexDir={"column"} gap="20px">
            {[
              "All product must be verified.",
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

