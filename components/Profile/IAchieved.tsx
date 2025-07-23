

// IAchieved.tsx
"use client";
import { Box, Select, SimpleGrid, Text, Spinner, Center } from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { GridIcon, ListIcon } from "@/components/Icons";
import CardItem from "../Card/CardItem";
import AchievementModal from "./AchievementModal";

interface Achievement {
    id: string;
    activityName: string;
    description: string;
    imageUrl: string | null;
    time: string;
}

const ITEMS_PER_PAGE = 12; // Number of items to load per page

export function IAhcieved({ userId }: { userId: string | undefined }) {
    const [view, setView] = useState("grid");
    const [tabIndex] = useState(0); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const observer = useRef<IntersectionObserver>();
    const lastAchievementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const fetchAchievements = async (pageNumber: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = userId 
                ? `/api/achievements/${userId}?page=${pageNumber}&limit=${ITEMS_PER_PAGE}` 
                : `/api/achievements?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.achievements.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
            
            setAchievements(prev => pageNumber === 1 ? data.achievements : [...prev, ...data.achievements]);
        } catch (e: any) {
            console.error("Fetch achievements failed:", e);
            setError("Failed to load achievements.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements(page);
    }, [page]);

    return (
        <Box>
            <Box
                pos={"relative"}
                bg={"#FFF"}
                py="10px"
                px={"10px"}
                mb="14px"
                display={"flex"}
                flexFlow={{ base: "column", md: "row" }}
                gap={"10px"}
                justifyContent={"space-between"}
                alignItems={"center"}
                borderRadius={"12px"}
                border={"1px solid #E2E8F0"}
            >
                <Box display="flex" alignItems="center" gap="16px">
                    <Text color="#94A3B8" fontSize="14px">Sort by</Text>
                    <Select
                        w="fit-content"
                        variant={"outline"}
                        outline={"1.3px solid #CBD5E1"}
                        size={"sm"}
                        color={"#94A3B8"}
                        fontSize="14px"
                        borderRadius="8px"
                        defaultValue={"All"}
                    >
                        <option value="All">All</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </Select>
                </Box>

                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"8px"}>
                        <Text fontSize={"12px"} textTransform={"capitalize"}>
                            {view}
                        </Text>
                        <Box display={"flex"} gap={"10px"} px="7px" py="5px" border="1px solid #E2E8F0" borderRadius="8px">
                            <GridIcon
                                onClick={() => setView("grid")}
                                className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
                                width="20px"
                                height="20px"
                                fill={view === "grid" ? "#f9690e" : "#CBD5E1"}
                            />
                            <ListIcon
                                onClick={() => setView("list")}
                                className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
                                width="20px"
                                height="20px"
                                fill={view === "list" ? "#f9690e" : "#CBD5E1"}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <AchievementModal isOpen={isModalOpen} onClose={handleCloseModal} />

            {error ? (
                <Center py={6} color="red.500">
                    {error}
                </Center>
            ) : achievements.length === 0 && !isLoading ? (
                <Center py={6}>
                    <Text fontSize="lg" color="gray.600">
                        No achievements added yet.
                    </Text>
                </Center>
            ) : tabIndex == 0 && (
                <SimpleGrid
                    columns={{
                        base: 1,
                        md: view == "list" ? 1 : 2,
                        lg: view == "list" ? 1 : 4,
                    }}
                    gap={{ base: "16px", lg: "8px", xl: "16px" }}
                >
                    {achievements.map((achievement, index) => (
                        <Box
                            key={achievement.id}
                            ref={index === achievements.length - 1 ? lastAchievementRef : undefined}
                        >
                            <CardItem
                                type={"achievedPost"}
                                view={view}
                                data={{
                                    ...achievement,
                                    title: achievement.title,
                                }}
                            />
                        </Box>
                    ))}
                </SimpleGrid>
            )}
            {tabIndex == 1 && (
                <SimpleGrid
                    columns={{
                        base: 1,
                        md: view == "list" ? 1 : 2,
                        lg: view == "list" ? 1 : 4,
                    }}
                    gap={{ base: "16px", lg: "8px", xl: "16px" }}
                >
                    {achievements.map((achievement, index) => (
                        <Box
                            key={achievement.id}
                            ref={index === achievements.length - 1 ? lastAchievementRef : undefined}
                        >
                            <CardItem
                                view={view}
                                type={"achievedEvent"}
                                data={{
                                    ...achievement,
                                    title: achievement.activityName,
                                }}
                            />
                        </Box>
                    ))}
                </SimpleGrid>
            )}
            {isLoading && (
                <Center py={4}>
                    <Spinner size="md" />
                </Center>
            )}
        </Box>
    );
}