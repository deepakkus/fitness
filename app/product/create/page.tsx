export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import loadClient  from "next/dynamic";

const CreateProductClient = loadClient (() => import("@/components/CreateProductClient"), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProductClient />
    </Suspense>
  );
}