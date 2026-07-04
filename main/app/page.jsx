import { Suspense } from "react";
import Loading from "@/components/loading";
import Home from "./client";

async function deployment() {
    return {};
    return {
      id: d.uid,
      source: d.source,
      state: d.state == "READY" ? "Build" : toTitleCase(d.state),
      time: d.ready ? new Date(d.ready) : new Date(d.createdAt),
      duration: d.ready && d.buildingAt
        ? (d.ready - d.buildingAt) / 1000 + "s"
        : null,

      commit: d.meta?.gitCommitMessage || null,
      sha: d.meta?.gitCommitSha || null
    };
}

export default async function App() {
  const dpl = await deployment();
  return (
    <Suspense fallback={<Loading />}>
      <Home deployment={dpl} font={"font-sans"} />
    </Suspense>
  );
}
