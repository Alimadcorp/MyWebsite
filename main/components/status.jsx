"use client";
import { useEffect, useState } from "react";
import { SiDiscord, SiSlack } from "@icons-pack/react-simple-icons";;

export default function Status() {
  const [status, setStatus] = useState({ discord: "offline", slack: "offline" });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const json = await res.json();
      setStatus(json);
    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const getColor = s => {
    switch (s) {
      case "online":
      case "active":
        return "bg-green-500";
      case "idle":
      case "away":
        return "bg-yellow-400";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg backdrop-blur-md border border-white/20 transition`}
        style={{ backgroundColor: status.discord === "online" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)" }}
      >
        <SiDiscord className="w-4 h-4" />
        <span>Discord</span>
        <span className={`w-2 h-2 rounded-full ${getColor(status.discord)}`} />
      </div>

      <div
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg backdrop-blur-md border border-white/20 transition`}
        style={{ backgroundColor: status.slack === "online" ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)" }}
      >
        <SiSlack className="w-4 h-4" />
        <span>Slack</span>
        <span className={`w-2 h-2 rounded-full ${getColor(status.slack)}`} />
      </div>
    </div>
  );
}
