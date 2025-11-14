import { Suspense } from "react";
import Home from "./client";
import Loading from "@/components/loading";
import { headers } from "next/headers";

export default async function App() {
  return (
    <Suspense fallback={<Loading />}>
      {<Home />}
    </Suspense>
  );
}
