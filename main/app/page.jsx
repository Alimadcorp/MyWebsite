import { Suspense } from "react";
import Home from "./client";
import Loading from "@/components/loading";
import { headers } from "next/headers";

async function getLatestProdDeployment() {
  const res = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=prj_YBqlNQa8nDQ97qAsOMnaHrctkLTI&target=production&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VC_TOKEN}`,
      }
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const d = data.deployments?.[0];
  if (!d) return null;

  function toTitleCase(str) {
    return str.toLowerCase().replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

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
  const headerList = await headers();
  const dpl = await getLatestProdDeployment();
  const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

  return (
    <Suspense fallback={<Loading />}>
      <Home IP={ip} deployment={dpl} />
    </Suspense>
  );
}