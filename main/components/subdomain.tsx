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
      className="relative flex flex-col items-start gap-1 p-4 rounded-xl transition-all duration-300 h-full w-full"
    >
      <div className="flex items-center justify-between w-full gap-2">
        <a
          href={`https://${domainName}${suffix}${data.path}`}
          target="_blank"
          onClick={handleClick}
          className="cursor-pointer text-left text-lg transition-all duration-300 flex-1 truncate
            hover:text-accent dark:hover:text-accent"
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

      {false && data.path !== "/" && (
        <p className="text-[10px] text-orange-500/80 dark:text-orange-400/80 mt-1 italic font-mono">
          {data.path}
        </p>
      )}

      {false && data.desc && (
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
          transition={{ duration: 0.1 }}
          className="absolute -top-2 left-2 z-50 px-2 py-1 bg-transparent text-xs rounded-lg  whitespace-nowrap pointer-events-none text-shadow-md text-shadow-accent-light/20 dark:text-shadow-accent/20"
        >
          {data.subtitle}
        </motion.div>
      )}
    </div>
  );
}
