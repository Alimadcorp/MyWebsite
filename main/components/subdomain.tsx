"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Github } from "lucide-react";

interface SubdomainProps {
  domainName: string;
  suffix?: string;
  visited?: boolean;
  live?: boolean;
  data?: {
    path: string;
    desc?: string;
    subtitle?: string;
    repo?: string;
  };
}

export default function Subdomain({
  domainName = "domain",
  suffix = "",
  visited = false,
  live = false,
  data = { path: "/" },
}: SubdomainProps) {
  const [isHovered, setIsHovered] = useState(false);

  function handleClick() {
    localStorage.setItem("visited_" + domainName, "true");
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-start gap-1 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 h-full w-full"
    >
      <div className="flex items-center justify-between w-full gap-2">
        <a
          href={`https://${domainName}${suffix}${data.path}`}
          target="_blank"
          onClick={handleClick}
          className={`cursor-pointer text-left text-lg transition-all duration-300 flex-1 truncate
            hover:text-cyan-600 dark:hover:text-cyan-400
            ${live
              ? "text-lime-600 dark:text-lime-400 font-bold"
              : visited
                ? "text-green-600 dark:text-green-400"
                : "text-black dark:text-white"
            }`}
        >
          <span className="font-semibold">{domainName}</span>
          <span className="opacity-40">{suffix}</span>
        </a>

        {data.repo && (
          <a
            href={data.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-black dark:hover:text-white"
            title="View Source Code"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>

      {data.path !== "/" && (
        <p className="text-[10px] text-orange-500/80 dark:text-orange-400/80 mt-1 italic font-mono">
          {data.path}
        </p>
      )}

      {data.desc && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-[200px]">
          {data.desc}
        </p>
      )}

      {data.subtitle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.95,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
          className="absolute -top-6 left-0 z-50 px-3 py-2 bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs rounded-lg shadow-xl backdrop-blur-md border border-white/20 dark:border-black/10 whitespace-nowrap pointer-events-none"
        >
          {data.subtitle}
        </motion.div>
      )}
    </div>
  );
}
