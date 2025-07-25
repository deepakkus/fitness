import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import VendorProfileBanner from "@/components/Vendor/VendorProfileBanner";
import UserProfileSalesTabs from "@/components/Vendor/UserProfileSalesTabs";
import { Box, Container } from "@chakra-ui/react";

export default async function Sales({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Forward cookies for authentication
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;
  
  const res = await fetch(`${baseUrl}/api/user/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (res.status === 401) {
    redirect("/login");
  }

  const userData = await res.json();
  const tabFromUrl = Array.isArray(searchParams?.tab)
    ? searchParams?.tab[0] ?? null
    : searchParams?.tab ?? null;
  const orderIdFromUrl = Array.isArray(searchParams?.orderId)
    ? searchParams?.orderId[0] ?? null
    : searchParams?.orderId ?? null;

  // Fetch initial products (first page)
  const productsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/active?limit=10&offset=0`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  const initialProducts = (await productsRes.json()).data || [];

  return (
    <Box bg="#F8FAFC" maxWidth={"1380px"} mx={"auto"}>
      <Box py={"40px"} bg="#F8FAFC" px={{ base: "10px", md: "30px" }}>
        <VendorProfileBanner userData={userData} />
          <UserProfileSalesTabs userData={userData} initialTab={tabFromUrl} initialOrderId={orderIdFromUrl} initialProducts={initialProducts} />
      </Box>
    </Box>
  );
}
