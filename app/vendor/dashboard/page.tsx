import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import VendorProfileBanner from "@/components/Vendor/VendorProfileBanner";
import UserProfileSalesTabs from "@/components/Vendor/UserProfileSalesTabs";
import { Box } from "@chakra-ui/react";

export default async function Sales({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;

  let userData = null;

  try {
    const res = await fetch(`${baseUrl}/api/user/me`, {
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    });

    if (res.status === 401) {
      redirect("/login");
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const errText = await res.text();
      console.error("Invalid JSON from /api/user/me:", errText);
      throw new Error("Invalid JSON in /api/user/me");
    }

    userData = await res.json();
  } catch (err) {
    console.error("Error fetching user/me:", err);
    redirect("/login"); // Or return a fallback page
  }

  const tabFromUrl = Array.isArray(searchParams?.tab)
    ? searchParams?.tab[0] ?? null
    : searchParams?.tab ?? null;

  const orderIdFromUrl = Array.isArray(searchParams?.orderId)
    ? searchParams?.orderId[0] ?? null
    : searchParams?.orderId ?? null;

  let initialProducts: any[] = [];

  try {
    const productsRes = await fetch(
      `${baseUrl}/api/products/active?limit=10&offset=0`,
      {
        cache: "no-store",
        headers: { cookie: cookieHeader },
      }
    );

    const contentType = productsRes.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const result = await productsRes.json();
      initialProducts = result.data || [];
    } else {
      const raw = await productsRes.text();
      console.warn("Non-JSON response from products API:", raw);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
  }

  return (
    <Box bg="#F8FAFC" maxWidth="1380px" mx="auto">
      <Box py="40px" bg="#F8FAFC" px={{ base: "10px", md: "30px" }}>
        <VendorProfileBanner userData={userData} />
        <UserProfileSalesTabs
          userData={userData}
          initialTab={tabFromUrl}
          initialOrderId={orderIdFromUrl}
          initialProducts={initialProducts}
        />
      </Box>
    </Box>
  );
}
