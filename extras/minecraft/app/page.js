"use client";
import ChatConsole from "@/components/chat";
import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Server,
  Zap,
  Crown,
  Gamepad2,
  Sword,
  Shield,
} from "lucide-react";
export default function Page() {
  const [currentImage, setCurrentImage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [imageCount] = useState(0);

  const serverIP = "alimad.minehut.gg";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev >= imageCount ? 1 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [imageCount]);

  const [serverStatus, setServerStatus] = useState(null);
  const [playersOnline, setPlayersOnline] = useState(null);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${serverIP}`);
        const data = await res.json();

        setServerStatus(
          data.online && data.players?.online <= 10 ? "Online" : "Offline"
        );
        setPlayersOnline(data.players?.online ?? 0);
      } catch (err) {
        console.error("Failed to fetch server status", err);
        setServerStatus("Unknown");
        setPlayersOnline(null);
      }
    };

    fetchServerStatus();

    const interval = setInterval(fetchServerStatus, 10000);
    return () => clearInterval(interval);
  }, [serverIP]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(serverIP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900 dark:bg-black">
      <div className="absolute inset-0">
        {[...Array(imageCount)].map((_, index) => (
          <div
            key={index + 1}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentImage === index + 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={`/carousel/${index + 1}.png`}
              alt={`Minecraft Server Screenshot ${index + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-green-900/70 dark:from-purple-950/80 dark:via-blue-950/60 dark:to-green-950/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      <div className="absolute top-20 left-20 animate-bounce">
        <Sword className="w-8 h-8 text-red-400/60" />
      </div>
      <div className="absolute top-32 right-32 animate-pulse">
        <Shield className="w-10 h-10 text-blue-400/60" />
      </div>
      <div className="absolute bottom-32 left-16 animate-bounce delay-1000">
        <Crown className="w-12 h-12 text-yellow-400/60" />
      </div>
      <div className="absolute bottom-20 right-20 animate-pulse delay-500">
        <Gamepad2 className="w-9 h-9 text-green-400/60" />
      </div>
      <div
        className={
          "relative z-10 grid grid-cols-2 gap-8 h-full items-center justify-center px-8 py-16" +
          (serverStatus == "Online" ? "md:grid-cols-2" : "md:grid-cols-1")
        }
      >
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              MineMad
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              Alimad's Minecraft Server
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
            <div className="flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-emerald-400 mr-3" />
              <span className="text-white/80 text-lg font-medium">
                Server IP
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <code className="text-2xl md:text-3xl font-mono text-white bg-black/40 px-6 py-3 rounded-lg border border-emerald-500/30">
                {serverIP}
              </code>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {copied && (
              <p className="text-emerald-400 text-center mt-3 animate-fade-in">
                Copied to clipboard!
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Performance
              </h3>
              <p className="text-white/70 text-sm">
                High-performance server with minimal lag and maximum fun
              </p>
            </div>

            <a
              href="slack://user?team=T0266FRGM&id=U08LQFRBL6S"
              target="_blank"
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center"
            >
              <Server className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Server Status
              </h3>
              <p className="text-white/70 text-sm">
                {serverStatus === "Online"
                  ? `🟢 Online, ${playersOnline} player${
                      playersOnline === 1 ? "" : "s"
                    }`
                  : serverStatus === "Offline"
                  ? "🔴 Offline"
                  : "⚪ Checking..."}
              </p>
            </a>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Crown className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Uptime</h3>
              <p className="text-white/70 text-sm">
                Awesome uptime of only four hours per day coz I broke
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Java Edition • Version 1.7.2–1.21.7 • Not so much of an uptime :(
            </p>
          </div>
        </div>
        {serverStatus == "Online" && (
          <div className="flex items-center justify-center">
            <ChatConsole />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}
