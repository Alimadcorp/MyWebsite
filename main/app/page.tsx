"use client";
import { Lightbulb, Send } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [panel, setPanel] = useState(false);
  async function uploadIdea() {
    const idea = (document.getElementById("ideaForm") as HTMLTextAreaElement)?.value.trim();
    const daButton = document.getElementById("ideaSubmit") as HTMLButtonElement;
    if (!idea) return;
    daButton.innerHTML = "Submitting...";
    daButton.disabled = true;
    await fetch(`https://madlog.vercel.app/api/log?channel=plzgiveideasss&text=${encodeURIComponent(idea)}&status=IDEA&country=idea`);
    setPanel(false);
    daButton.disabled = false;
  }
  return (
    
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start sm:text-left font-[family-name:var(--font-geist-mono)] text-center">
        <center>
          <p className="text-xl/6">
            Hello, World!
          </p>
          <p className="m-10">
            This is Alimad Co's website!
          </p>
          <p className="text-gray-500">
            What should I add here...
          </p></center>
        {panel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 font-[family-name:var(--font-geist-sans)]">
            <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-3 text-lg font-bold"
                onClick={() => setPanel(false)}
              >
                ✕
              </button>
              <h2 className="text-2xl mb-4 font-semibold font-[family-name:var(--font-geist-sans)]">Give your idea</h2>
              <textarea
                className="font-[family-name:var(--font-geist-sans)] w-full min-h-50 p-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 resize-vertical outline-none focus:outline-amber-50 focus:outline-2"
                placeholder="Type your idea here..."
                id="ideaForm"
              />
              <button
                className="mt-4 w-full flex items-center justify-center disabled:bg-gray-800 bg-black text-white dark:bg-white dark:text-black py-2 rounded-md hover:opacity-80 transition cursor-pointer"
                onClick={uploadIdea}
                id="ideaSubmit"
              >
                <Send className="w-12"></Send>
                Upload to the checklist
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <button
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer"
          onClick={() => setPanel(true)}
        >
          <Lightbulb>
          </Lightbulb>
          Give an idea
        </button>
      </footer>
    </div>
  );
}
