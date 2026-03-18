"use client";
import LiveStatus from "@/components/live";
import Subdomain from "@/components/subdomain";
import subdomains from "@/data/subdomains";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { Sun, Moon, ArrowLeft } from "lucide-react";

type VisitedMap = Record<string, boolean>;
type LiveMap = Record<string, boolean>;

export default function Subdomains() {
  const Router = useRouter();
  const subs = useMemo(() => subdomains(), []);

  const [visitedMap, setVisitedMap] = useState<VisitedMap>({});
  const [liveMap, setLiveMap] = useState<LiveMap>({});
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    let cancelled = false;
    const baseURL = "https://live.alimad.co/visited?app=" + Object.keys(subs).join(",");
    fetch(baseURL)
      .then((res) => res.json())
      .then((remote: Record<string, number>) => {
        if (cancelled) return;
        const result: VisitedMap = {};
        const lives: LiveMap = {};
        for (const name of Object.keys(subs)) {
          const fromStorage = !!localStorage.getItem("visited_" + name);
          if (remote?.[name] === 2) {
            lives[name] = true;
            localStorage.setItem("visited_" + name, "true");
          }
          if (fromStorage || remote?.[name] !== 0) {
            result[name] = true;
          }
        }
        setVisitedMap(result);
        setLiveMap(lives);
      })
      .catch(() => {
        const fallback: VisitedMap = {};
        for (const name of Object.keys(subs)) {
          if (localStorage.getItem("visited_" + name)) fallback[name] = true;
        }
        setVisitedMap(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [subs]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  function renderSubdomain(name: string, i: number) {
    return (
      <motion.div
        key={name}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
      >
        <Subdomain
          domainName={name}
          suffix=".alimad.co"
          visited={!!visitedMap[name]}
          live={!!liveMap[name]}
          data={(subs as Record<string, any>)[name] || { path: "/" }}
        />
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-500 min-h-screen font-[family-name:var(--font-geist-sans)]" suppressHydrationWarning>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => Router.push("/")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Home</span>
          </button>

          <h1 className="text-lg font-bold">
            Subdomains
          </h1>

          <div className="flex items-center gap-4">
            <LiveStatus />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: 20, opacity: 0, rotate: 45 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -20, opacity: 0, rotate: -45 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.keys(subs).map(renderSubdomain)}
        </div>
      </main>

      <footer className="py-12 text-center text-sm text-gray-500 dark:text-gray-600 border-t border-gray-200 dark:border-gray-800 mt-20">
        <p>&copy; {new Date().getFullYear()} Alimadcorp. All rights reserved.</p>
      </footer>
    </div>
  );
}

