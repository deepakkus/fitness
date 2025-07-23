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
    Text,
    VStack,
    HStack,
    Flex,
    Radio,
    RadioGroup,
    Divider,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";



export function VendorPayment() {

    //useSteps hook
    const { data: session, status } = useSession();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter();
    const defaultImage = "/placeholder.png";
    const [method, setMethod] = useState("creditCard");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);



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

    // Event handlers
    const handleNext = async () => {
        router.push(`/product/257`);
        router.refresh();
        //console.log("Hi, there!!!");
    }

    //const handlePayment = ;
    return (
        <Box p={{ base: "20px 10px", md: "30px", lg: "40px" }}>

            <Box
                w="full"
                gap={{ base: "10px", md: "30px", lg: "40px" }}
                display={"flex"}
                flexDir={{ base: "column", md: "row" }}
                justifyContent={"center"}
                alignItems={"flex-start"}
            >
                <Box flex="1" w={"full"} order={{base:2,md:1}}>
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

                        <Box>
                            {/* Payment Method */}
                            <Text mb={2} fontWeight="500" color={"#000"} fontSize={"20px"}>
                                Payment For Manage List<span style={{ color: "red" }}>*</span>
                            </Text>
                            <RadioGroup onChange={setMethod} value={method}>
                                <VStack align="flex-start" spacing={4}>
                                    {/* <HStack>
                                        <Radio value="netBanking" colorScheme="orange" size="lg" />
                                        <HStack>
                                            <Image
                                                src={defaultImage}
                                                boxSize="20px"
                                            />
                                            <Text color={"#475569"} fontSize={"16px"}>Net Banking</Text>
                                        </HStack>
                                    </HStack> */}
                                    <HStack>
                                        <Radio value="creditCard" colorScheme="orange" size="lg" />
                                        <HStack>
                                            <Image
                                                src={defaultImage}
                                                boxSize="20px"
                                            />
                                            <Text color={"#475569"} fontSize={"16px"}>Credit Card</Text>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </RadioGroup>

                            {/* Conditional Content */}
                            {method === "netBanking" && (
                                <Text mt={4} color="red.500" fontWeight="medium">
                                    Currently Not Available for this Payment Method
                                </Text>
                            )}

                            {method === "creditCard" && (
                                <FormControl display="flex" flexDir="column" gap="20px" mt={6}>
                                    <Box>
                                        <FormLabel color="#475569" fontSize="14px">
                                            Name On Card<span style={{ color: "red" }}>*</span>
                                        </FormLabel>
                                        <Input
                                            focusBorderColor="#F9690E"
                                            type="text"
                                            placeholder="Enter Name On Card"
                                            fontSize="16px"
                                            name="nameOnCard"
                                            borderRadius="3px"
                                        />
                                    </Box>
                                    <Box>
                                        <FormLabel color="#475569" fontSize="14px">
                                            Card Number<span style={{ color: "red" }}>*</span>
                                        </FormLabel>
                                        <Input
                                            focusBorderColor="#F9690E"
                                            type="text"
                                            placeholder="Enter Card Number"
                                            fontSize="16px"
                                            name="cardNumber"
                                            borderRadius="3px"
                                        />
                                    </Box>
                                    <Box>
                                        <Box display="flex" gap="20px" flexDir={{ base: "column", lg: "row" }}>
                                            <Box flex="1">
                                                <FormLabel color="#475569" fontSize="14px">
                                                    Expiration Date<span style={{ color: "red" }}>*</span>
                                                </FormLabel>
                                                <Input
                                                    focusBorderColor="#F9690E"
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    name="expirationDate"
                                                    borderRadius="3px"
                                                />
                                            </Box>
                                            <Box flex="1">
                                                <FormLabel color="#475569" fontSize="14px">
                                                    CVV<span style={{ color: "red" }}>*</span>
                                                </FormLabel>
                                                <Input
                                                    focusBorderColor="#F9690E"
                                                    type="text"
                                                    placeholder="CVV"
                                                    name="cvv"
                                                    borderRadius="3px"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </FormControl>
                            )}
                        </Box>
                    </Box>


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
                        <Text color={'#F9690E'} fontSize={"40px"} mt={"-10px"} fontWeight={"600"}>
                            $5.00
                        </Text>
                        <Button
                            size="md"
                            px="44px"
                            borderRadius="3px"
                            colorScheme="orange"
                            disabled={isProcessing}
                            //onClick={handlePayment}
                        >

                            Payment
                        </Button>

                    </Box>
                </Box>

                <Box
                    w="full"
                    maxWidth={{base:"full",md:"390px"}}
                    p={{
                        base: "20px",
                        md: "30px",
                    }}
                    bgColor={"#FFF"}
                    border={"1px solid #F1F5F9"}
                    borderBottom={"none"}
                    borderRadius={"12px"}
                    borderBottomRadius={"0px"}
                    order={{base:1,md:2}}
                >
                    {/* Order Summary */}
                    <Box>
                        <Text color={"#000"} fontWeight="600" mb={2} fontSize={"18px"}>
                            Price Details
                        </Text>
                        <VStack align="stretch" spacing={2} fontSize="sm">
                            <HStack justify="space-between">
                                <Text color={"#475569"} fontSize={"14px"}>Subtotal</Text>
                                <Text color={"#475569"} fontSize={"14px"}>
                                    $5.00
                                </Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text color={"#475569"} fontSize={"14px"}>Shipping</Text>
                                <Text color={"#475569"} fontSize={"14px"}>Free</Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text color={"#475569"} fontSize={"14px"}>Total before tax</Text>
                                <Text color={"#475569"} fontSize={"14px"}>
                                    $5.00
                                </Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text color={"#475569"} fontSize={"14px"}>Estimated tax to be collected</Text>
                                <Text color={"#475569"} fontSize={"14px"}>$0.00</Text>
                            </HStack>
                        </VStack>
                        <Divider my={3} />
                        <HStack justify="space-between" fontWeight="bold">
                            <Text color={"#475569"} fontSize={"14px"}>Order Total</Text>
                            <Text color={"#475569"} fontSize={"14px"}>
                                $5.00
                            </Text>
                        </HStack>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
