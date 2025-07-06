"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquareText,
  Terminal,
  UserPlus,
  UserMinus,
  Megaphone,
  Info,
} from "lucide-react";

const _CHAT_WS_URL = "wss://6869eb3407fb21bb520d5500.manager.minehut.com/socket";
const CHAT_WS_URL = "wss://68693aafaf750c7827eadad9.manager.minehut.com/socket";

const SEC_PROTOCOL = [
  process.env.AUTH_KEY,
  "35f85402-ce0a-468c-9a30-4c8ddfc299ab",
  "645c4884-6a40-4e36-a7eb-a42c75d509f8",
];
export default function OldChatConsole() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  const getRandomUsername = () => {
    const words1 = [
      "silly",
      "angry",
      "shiny",
      "clever",
      "dark",
      "happy",
      "lazy",
    ];
    const words2 = [
      "panda",
      "banana",
      "wizard",
      "ninja",
      "robot",
      "otter",
      "alien",
    ];
    const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
    return `${r(words1)}-${r(words2)}`;
  };

  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("chat-username");
    if (saved) setUsername(saved);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(CHAT_WS_URL, SEC_PROTOCOL);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setMessages([]);
      socket.send(JSON.stringify({ type: "console:getscrollback" }));
    });

    socket.addEventListener("message", (event) => {
      try {
        const parsed = JSON.parse(event.data);

        const isAllowedMsg = (m) => {
          if (!m.startsWith("[") || !m.includes("INFO]:")) return false;
          return true;
        };

        if (parsed.type === "console:std" && parsed.data?.msg) {
          const msg = parsed.data.msg;
          if (isAllowedMsg(msg)) setMessages((prev) => [...prev, msg]);
        }

        if (
          parsed.type === "console:scrollback" &&
          Array.isArray(parsed.data)
        ) {
          const filtered = parsed.data
            .map((entry) => entry.data?.msg)
            .filter((msg) => msg && isAllowedMsg(msg));
          setMessages(filtered);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message", err);
      }
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket closed");
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendSay = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current) return;

    const command = {
      type: "console:cmd",
      data: {
        command: `say [${username}]: ${trimmed}`,
      },
    };

    socketRef.current.send(JSON.stringify(command));
    setInput("");
  };

  const renderMessage = (msg, idx) => {
    const timestamp = msg.slice(0, 10).replace(/^\[/, "");
    const raw = msg.slice(msg.indexOf("]:") + 2).trim();
    let content = raw.replace(
      /\[Not Secure\] \[Server\] \[([^\]]+)\]:/,
      (m, u) => (u === username ? "You:" : `$[GULI]${u}:`)
    );

    let icon = <Terminal className="w-4 h-4 text-gray-400" />;
    let style = "text-gray-300";

    if (content.startsWith("<")) {
      icon = <MessageSquareText className="w-4 h-4 text-blue-400" />;
      style = "text-blue-300";
    } else if (content.startsWith("You:")) {
      icon = <Megaphone className="w-4 h-4 text-yellow-400" />;
      style = "text-yellow-300 font-semibold";
    } else if (content.startsWith("$[GULI]")) {
      content = content.replace(/^\$\[GULI\]/, "");
      icon = <Megaphone className="w-4 h-4 text-yellow-400" />;
      style = "text-yellow-300 font-semibold";
    } else if (content.includes("joined the game")) {
      icon = <UserPlus className="w-4 h-4 text-green-400" />;
      style = "text-green-300";
    } else if (content.includes("left the game")) {
      icon = <UserMinus className="w-4 h-4 text-red-400" />;
      style = "text-red-300";
    } else {
      return <></>;
    }

    return (
      <div
        key={idx}
        className={`flex items-start gap-2 text-sm font-mono ${style}`}
      >
        {icon}
        <span className="whitespace-pre-wrap">
          <span className="text-white/30 mr-1">{timestamp}</span>
          {content}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-xl">
      <h2 className="text-white text-xl font-semibold mb-3">Chat</h2>
      {!username && (
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 h-72 text-white">
          <h2 className="text-white text-xl font-semibold">
            Choose a username
          </h2>
          <input
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter a username"
            className="w-full bg-black/70 text-white px-4 py-2 rounded-lg border border-white/10 focus:outline-none"
          />
          <button
            onClick={() => {
              const name = tempUsername.trim() || getRandomUsername();
              setUsername(name);
              localStorage.setItem("chat-username", name);
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Start Chat
          </button>
        </div>
      )}
      <section className={!username && "hidden"}>
        <div
          ref={scrollRef}
          className="h-72 overflow-y-auto bg-black/60 p-4 rounded-lg border border-white/10 text-white space-y-1"
        >
          {messages.map(renderMessage)}
        </div>

        <div className="flex mt-4 space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendSay()}
            placeholder="Type a message..."
            className="flex-1 bg-black/70 text-white px-4 py-2 rounded-lg border border-white/10 focus:outline-none"
            maxLength={200}
          />
          <button
            onClick={sendSay}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
