export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store"; 

import { Suspense } from "react";
import dynamic from "next/dynamic";


const CreateProduct = dynamic(() => import("./page"), { ssr: false });
export default function CreateProductWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProduct />
    </Suspense>
  );
}