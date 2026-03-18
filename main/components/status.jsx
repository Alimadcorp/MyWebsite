"use client";
import { useEffect, useState } from "react";
import { SiDiscord, SiSlack } from "@icons-pack/react-simple-icons";
import { motion, AnimatePresence } from "framer-motion";
import StatusDot from "./statusdot";

export default function Status() {
  const [data, setData] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status?meta=true");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div className="flex gap-2 items-center opacity-50 animate-pulse">
      <div className="w-20 h-7 bg-white/10 rounded-full" />
      <div className="w-20 h-7 bg-white/10 rounded-full" />
    </div>
  );

  const discordActivity = data.meta?.discord?.activities?.find(a => a.type !== 4) || data.meta?.discord?.activities?.[0];
  const slackStatus = (data.meta?.slack?.status_emoji ? data.meta?.slack?.status_emoji + " " : "") + (data.meta?.slack?.status_text || "");

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <StatusPill
        platform="Discord"
        icon={<SiDiscord className="w-3.5 h-3.5" />}
        status={data.discord}
        activity={discordActivity && (discordActivity.emoji ? discordActivity.emoji + " " : "") + (discordActivity.name === "Custom Status" ? discordActivity.state : discordActivity.name)}
        avatar={data.meta?.discord?.avatar}
        brandColor="#5865F2"
      />
      <StatusPill
        platform="Slack"
        icon={<SiSlack className="w-3.5 h-3.5" />}
        status={data.slack}
        activity={slackStatus}
        avatar={data.meta?.slack?.avatar}
        brandColor="#4A154B"
      />
    </div>
  );
}

function StatusPill({ platform, icon, status, activity, avatar, brandColor }) {
  const isOnline = status !== "offline";
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-1.5 pr-3 rounded-full backdrop-blur-md border border-white/10 transition-all hover:bg-white/5 active:scale-95 group relative`}
      style={{ backgroundColor: isOnline ? `${brandColor}15` : "rgba(255,255,255,0.05)" }}
    >
      <div className="relative">
        <div className="w-7 h-7 rounded-full bg-white/5 overflow-hidden flex items-center justify-center border border-white/10">
          {avatar ? (
            <img src={avatar} alt={platform} className="w-full h-full object-cover" />
          ) : (
            <div style={{ color: brandColor }}>{icon}</div>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 z-10 scale-90">
          <StatusDot status={status} size={14} />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5 font-bold tracking-tighter text-[9px] uppercase opacity-60">
          {icon}
          {platform}
        </div>
        {isOnline && activity && (
          <div className="text-[10px] font-medium truncate max-w-[100px] mt-0.5 opacity-90 group-hover:max-w-[150px] transition-all">
            {activity}
          </div>
        )}
        {(!isOnline || !activity) && (
          <div className="text-[10px] font-medium opacity-50 mt-0.5 capitalize">
            {status}
          </div>
        )}
      </div>
    </motion.div>
  );
}
