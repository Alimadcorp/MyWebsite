import { Suspense } from "react";
import Home from "./client";
import Loading from "@/components/loading";
import { headers } from "next/headers";

export default async function App() {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

  return (
    <Suspense fallback={<Loading />}>
      <Home IP={ip} />
    </Suspense>
  );
}