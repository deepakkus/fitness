export const dynamic = "force-dynamic"; 
import { Suspense } from "react";
import CreateProduct  from "./page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateProduct />
    </Suspense>
  );
}