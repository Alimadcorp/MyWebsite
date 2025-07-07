"use client";

import LiveStatus from "@/components/live";
import { useEffect, useState, useRef, useCallback } from "react";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
const wordleCache = new Map();

async function fetchWordle(date) {
  const dateStr = formatDate(date);
  if (wordleCache.has(dateStr)) {
    return wordleCache.get(dateStr);
  }

  try {
    const res = await fetch(
      `https://proxy.alimad.xyz/api/proxy?url=https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const solution = json.solution?.toUpperCase?.() || null;
    wordleCache.set(dateStr, solution);
    return solution;
  } catch (error) {
    console.error("Failed to fetch Wordle:", error);
    return null;
  }
}

export default function Home() {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [words, setWords] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const lastTouchTime = useRef(0);

  const loadWordsForRange = useCallback(async (centerOffset) => {
    const today = new Date();
    const promises = [];
    const offsets = [];
    for (let i = -3; i <= 3; i++) {
      const offset = centerOffset + i;
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      promises.push(fetchWordle(date));
      offsets.push(offset);
    }

    const results = await Promise.all(promises);
    const newWords = {};

    results.forEach((word, index) => {
      const offset = offsets[index];
      newWords[offset] = word || "N/A";
    });

    setWords((prev) => ({ ...prev, ...newWords }));
  }, []);

  useEffect(() => {
    loadWordsForRange(currentOffset);
  }, [currentOffset, loadWordsForRange]);

  const handleScroll = useCallback(
    (direction) => {
      if (isAnimating) return;

      setIsAnimating(true);
      setCurrentOffset((prev) => prev + direction);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating]
  );

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (isAnimating) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      const deltaTime = Date.now() - lastTouchTime.current;
      const threshold = 30;
      if (deltaTime < 100) return;

      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          handleScroll(1);
        } else {
          handleScroll(-1);
        }
      }
    },
    [handleScroll, isAnimating]
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (isAnimating) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      handleScroll(direction);
    },
    [handleScroll, isAnimating]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (isAnimating) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScroll(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScroll(1);
      }
    },
    [handleScroll, isAnimating]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getDateForOffset = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };

  const shouldShowDate = (offset) => {
    return Math.abs(offset) >= 7;
  };

  const getRelativeLabel = (offset) => {
    if (offset === 0) return "";
    if (offset === -1) return "Yesterday";
    if (offset === 1) return "Tomorrow";
    if (offset >= 7 || offset <= -7) return "";
    if (offset < 0) return `${Math.abs(offset)} days ago`;
    return `${offset} days from now`;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans overflow-hidden select-none w-[100vw] h-[100vh]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      style={{ touchAction: "pan-y" }}
    >
      <div className="absolute top-4 text-gray-400 text-sm text-center">
        Scroll, swipe, or use arrow keys to navigate
      </div>
      <div className="flex flex-col items-center justify-center h-screen relative">
        <div
          className={`absolute text-gray-200 text-lg transition-all duration-300 ease-out ${
            isAnimating
              ? "transform -translate-y-4 opacity-0"
              : "transform translate-y-0 opacity-100"
          }`}
          style={{ top: "15%" }}
        >
          {words[currentOffset - 2] || ""}
        </div>
        <div
          className={`absolute text-gray-400 text-2xl transition-all duration-300 ease-out cursor-pointer hover:text-gray-600 ${
            isAnimating
              ? "transform -translate-y-8 opacity-50"
              : "transform translate-y-0 opacity-100"
          }`}
          style={{ top: "30%" }}
          onClick={() => handleScroll(-1)}
        >
          <div className="text-center">
            {words[currentOffset - 1] || "Loading..."}
          </div>
        </div>
        <div
          className={`absolute text-center transition-all duration-300 ease-out ${
            isAnimating ? "transform scale-105" : "transform scale-100"
          }`}
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div
            className={`text-6xl font-bold mb-2 transition-all duration-300 ease-out ${
              isAnimating
                ? "transform scale-110 text-blue-600"
                : "transform scale-100 text-black"
            }`}
          >
            {words[currentOffset] || "Loading..."}
          </div>
          <div
            className={`text-gray-500 text-lg transition-all duration-300 ${
              isAnimating ? "opacity-50" : "opacity-100"
            }`}
          >
            {getRelativeLabel(currentOffset)}
            {shouldShowDate(currentOffset) && (
              <div
                className={`text-gray-500 text-sm mb-2 transition-all duration-300 ${
                  isAnimating ? "opacity-50" : "opacity-100"
                }`}
              >
                {formatDisplayDate(getDateForOffset(currentOffset))}
              </div>
            )}
          </div>
        </div>
        <div
          className={`absolute text-gray-400 text-2xl transition-all duration-300 ease-out cursor-pointer hover:text-gray-600 ${
            isAnimating
              ? "transform translate-y-8 opacity-50"
              : "transform translate-y-0 opacity-100"
          }`}
          style={{ bottom: "30%" }}
          onClick={() => handleScroll(1)}
        >
          <div className="text-center">
            {words[currentOffset + 1] || "Loading..."}
          </div>
        </div>
        <div
          className={`absolute text-gray-200 text-lg transition-all duration-300 ease-out ${
            isAnimating
              ? "transform translate-y-4 opacity-0"
              : "transform translate-y-0 opacity-100"
          }`}
          style={{ bottom: "15%" }}
        >
          {words[currentOffset + 2] || ""}
        </div>
      </div>
      <LiveStatus/>
    </div>
  );
}
