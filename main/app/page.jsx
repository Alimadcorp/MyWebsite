import { Suspense } from "react";
import Loading from "@/components/loading";
import { headers } from "next/headers";
import Home from "./client";

function relativeDate() {
  const now = new Date();
  const day = now.toLocaleString("en-US", { day: "2-digit", timeZone: "Asia/Karachi" });
  const month = now.toLocaleString("en-US", { month: "2-digit", timeZone: "Asia/Karachi" });
  return day === "15" && month === "06";
};

async function getLatestProdDeployment() {
  try {
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
  catch (e) {
    console.log(e);
    return null;
  }
}

export default async function App() {
  const headerList = await headers();
  const dpl = await getLatestProdDeployment();
  const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

  return (
    <Suspense fallback={<Loading />}>
      <Home IP={ip} deployment={dpl} font={relativeDate() ? "font-hand" : "font-sans"} themeColor={relativeDate() ? "purple" : "cyan"}/>
    </Suspense>
  );
}