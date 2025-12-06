"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  const phrases = [
    "Loading...",
    "Gathering HTML...",
    "Gathering random chunks of javascript...",
    "Eating cookies...",
    "Saturating HTML...",
    "Gathering CSS...",
    "Adding text...",
    "Taping everything together...",
    "Oh no the tape got wet...",
    "Getting more duct tape...",
    "Taping things back again...",
    "Finishing up...",
    "Oh gosh this is taking time...",
    "Waiting...",
    "Waiting...",
    "Waiting more...",
    "Waiting even more...",
    "Still waiting...",
    "Still waiting...",
    "...",
    "GOSH HOW LONG DOES IT TAKE...",
    "Bro check ur internet connection...",
    "I bet the wifi might be down...",
    "Make sure there's no cats crawling up there around it...",
    "Ok did you make sure?",
    "Aight I'll retry loading...",
    "Reloading..."
  ];

  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 2000);
    const timer = setInterval(() => setSeconds((s) => s + 1), 1);
    return () => {
      clearInterval(phraseTimer);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black font-mono text-center relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,200,255,0.05)_6px,transparent_500px)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_300px,rgba(0,0,0,1)_1000px)]"></div>

      <h1
        key={phrases[index]}
        className="text-xl sm:text-2xl font-semibold tracking-wide select-none bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent animate-fade z-10"
      >
        {phrases[index]}
      </h1>

      <p className="mt-4 text-gray-400 text-sm z-10">
        <span className="text-gray-200">{/*(seconds/1009).toPrecision(7)*/}Go Brrrr</span>
      </p>

      <style jsx>{`
        @keyframes fade {
          0%, 100% { opacity: 0; transform: translateY(3px); }
          20%, 95% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade {
          animation: fade 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
