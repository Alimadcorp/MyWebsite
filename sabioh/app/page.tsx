"use client";
import LiveStatus from "@/components/live";
import { Lightbulb, Send, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Hiii
export default function Home() {
  const [panel, setPanel] = useState(false);
  const [myIdea, setMyIdea] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const Router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setDarkMode(false);
    else setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function uploadIdea() {
    const idea = (document.getElementById("ideaForm") as HTMLTextAreaElement)?.value.trim();
    const daButton = document.getElementById("ideaSubmit") as HTMLButtonElement;
    if (!idea) return;
    daButton.innerHTML = "Submitting...";
    daButton.disabled = true;
    await fetch(`https://madlog.vercel.app/api/log?channel=plzgiveideasss-sabio&text=${encodeURIComponent(idea)}&status=IDEA&country=idea`);
    setPanel(false);
    setMyIdea(idea);
    daButton.disabled = false;
  }

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white grid p-0 m-0 grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" suppressHydrationWarning>
      <header className="absolute top-0 w-full h-11 p-0 m-0 bg-gray-200/30 dark:bg-gray-600/30 backdrop-blur-2xl text-center">
        <nav className="flex gap-3 left-4 absolute">
          <a href="https://beta.clatter.work" target="_blank" className="hover:bg-gray-300 dark:hover:bg-gray-500 border-2 border-gray-400 dark:border-gray-500 transition-all p-1 mt-1 pl-2 pr-2 rounded-sm">
            Clatter
          </a>
        </nav>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 items-center">
          <LiveStatus />
        </div>
      </header>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start sm:text-left font-[family-name:var(--font-geist-mono)] text-center">
        <center>
          <p className="text-xl/6">Hello, World!</p>
          <p className="m-10">This is Sabio{"'"}s website!</p>
          {myIdea ? (
            <p className="text-gray-500">One "{myIdea}" coming up!</p>
          ) : (
            <p className="text-gray-500">What else should Sabio add here...</p>
          )}
        </center>

        {panel && (
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-[family-name:var(--font-geist-sans)]">
            <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
              <button className="absolute top-2 right-3 text-lg font-bold" onClick={() => setPanel(false)}>✕</button>
              <h2 className="text-2xl mb-4 font-semibold">Give your idea</h2>
              <textarea
                className="w-full min-h-50 p-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 resize-vertical outline-none focus:outline-amber-50 focus:outline-2"
                placeholder="Type your idea here... Nothing freaio-"
                id="ideaForm"
              />
              <button
                className="mt-4 w-full flex items-center justify-center disabled:bg-gray-300 dark:disabled:bg-gray-800 bg-black text-white dark:bg-white dark:text-black py-2 rounded-md hover:opacity-80 transition cursor-pointer"
                onClick={uploadIdea}
                id="ideaSubmit"
              >
                <Send className="w-12" />
                Upload to the checklist
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <button className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer" onClick={() => setPanel(true)}>
          <Lightbulb />
          Give an idea
        </button>
      </footer>
    </div>
  );
}
