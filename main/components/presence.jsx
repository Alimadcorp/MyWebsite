"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import DeviceMonitor from "@/components/pc";
import StatusDot from "@/components/statusdot"

const statusColor = (s) => ({
  online: "dark:bg-green-500 bg-green-500",
  idle: "dark:bg-yellow-500 bg-yellow-500",
  dnd: "dark:bg-red-500 bg-red-500",
  offline: "dark:bg-gray-500 bg-gray-800"
}[s] || "bg-gray-500")

const titleCase = (str) => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : "";

function Emojix({ text, emoji }) {
  if (!text && !emoji) return null

  const renderEmojiJSX = (text) => {
    if (!text) return null
    const parts = text.split(/(:[a-zA-Z0-9_+-]+:)/g)
    return parts.map((part, i) => {
      const match = part.match(/^:([a-zA-Z0-9_+-]+):$/)
      if (match) {
        return (
          <img
            key={i}
            src={`https://e.alimad.co/${match[1]}`}
            className="w-5 h-5 inline-block object-contain align-middle"
            alt={match[1]}
          />
        )
      }
      return part
    })
  }

  return (
    <div className="flex items-center gap-2 p-3 mt-3 rounded-xl dark:bg-white/5 bg-black/5">
      {emoji && <span className="leading-none flex items-center justify-center">{renderEmojiJSX(emoji)}</span>}
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}

export default function StatusViewer() {
  const [data, setData] = useState(null)
  const [deviceData, setDeviceData] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const [deviceOffline, setDeviceOffline] = useState(true)
  const [screenshot, setScreenshot] = useState(null);
  const [scrMax, setScrMax] = useState(false);
  const [already, setAlready] = useState(false);
  const [spec, setSpec] = useState(0);
  const [openApps, setOpenApps] = useState({
    "slack": false,
    "discord": false,
    "whatsapp.root": false,
    "code": false,
    "chrome": false,
    "windowsterminal": false
  })
  const [appIcon, setAppIcon] = useState("");
  const wsRef = useRef(null)
  const timeoutRef = useRef(null)
  const [log, setLog] = useState("");
  const bufferRef = useRef(new Uint8Array(1024));
  const bufferLenRef = useRef(0);
  const indexRef = useRef(0);
  const maxChar = 200;

  const addLog = (data) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    if (bufferLenRef.current + bytes.length > bufferRef.current.length) {
      const newBuffer = new Uint8Array((bufferLenRef.current + bytes.length) * 2);
      newBuffer.set(bufferRef.current.slice(0, bufferLenRef.current));
      bufferRef.current = newBuffer;
    }
    bufferRef.current.set(bytes, bufferLenRef.current);
    bufferLenRef.current += bytes.length;
  };
  useEffect(() => {
    const decoder = new TextDecoder();
    const interval = setInterval(() => {
      if (indexRef.current < bufferLenRef.current) {
        const nextChar = decoder.decode(bufferRef.current.slice(indexRef.current, indexRef.current + 1));
        indexRef.current++;
        setLog((prev) => {
          let newLog = prev + nextChar;
          if (newLog.length > maxChar) newLog = newLog.slice(-maxChar);
          return newLog;
        });
      } else {
        bufferLenRef.current = 0;
        indexRef.current = 0;
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const requestScrenshot = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "request", device: "ALIMAD-PC" }));
      setAlready(true);
    }
  }
  const connectWS = () => {
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "wss://ws.alimad.co/socket")
    wsRef.current = ws

    ws.onopen = () => setDisconnected(false)
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        if (data.type == "init") {
          let lastActivity = data.data["ALIMAD-PC"];
          setDeviceData(lastActivity);
          setOpenApps(lastActivity.meta);
          if (data.devices.includes("ALIMAD-PC")) setDeviceOffline(false);
        }
        if (data.type === "sample" || data.type === "aggregate" || data.type == "offline") {
          if (data.type == "offline" && data.device == "ALIMAD-PC") { setDeviceOffline(true); setDeviceData(data.data["ALIMAD-PC"]); }
          data.data.ip = data.data.ip.replaceAll("\"", "").trim();
          setDeviceOffline(false);
          addLog(data.data.keys);
          setOpenApps(data.data.meta);
          setDeviceData(data.data);
          if (data.data.icon && data.data.icon.trim() && data.data.icon !== "none") setAppIcon(data.data.icon)
        }
        if (data.type === "screenshot") {
          setAlready(true); setScrMax(true);
          setTimeout(() => { setAlready(false) }, 10000);
          setScreenshot({ time: data.time, data: data.data });
        }
        if (data.type === "new") {
          setSpec(data.clients);
        }
      } catch (err) { console.error(err) }
    }

    const handleDisconnect = () => {
      setDisconnected(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setDeviceData(null)
    }

    ws.onclose = handleDisconnect
    ws.onerror = handleDisconnect
  }

  useEffect(() => {
    connectWS()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      wsRef.current?.close()
    }
  }, [])

  const fetchData = async (uh) => {
    const res = await fetch("/api/status" + (uh ? "?meta=true" : ""))
    const json = await res.json()
    setData(prev => ({ ...prev, ...json }))
  }

  useEffect(() => {
    fetchData(true)
    const t = setInterval(() => fetchData(false), 60000)
    return () => clearInterval(t)
  }, [])

  if (!data) return <div className="text-sm mt-4 font-mono">Loading…</div>

  const { discord, slack, meta } = data

  return (
    <div className="w-full grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
      <Card title="Discord" status={discord}>
        <UserRow
          user={meta.discord.name}
          avatar={meta.discord.avatar}
          status={discord}
          tag={meta.discord.tag}
          platform={meta.discord.platform}
          url="https://discord.com/users/888954248199549030"
        />
        <div className="space-y-2 mt-2">
          {meta.discord.activities?.map((a, i) => <Activity key={i} a={a} />)}
        </div>
      </Card>

      <Card title="Slack" status={slack}>
        <UserRow
          user={meta.slack.name}
          avatar={meta.slack.avatar}
          status={slack}
          tag={meta.slack.title}
          platform={meta.slack.pronouns}
          url="https://hackclub.enterprise.slack.com/team/U08LQFRBL6S"
        />
        {meta.slack.status_text && <Emojix text={meta.slack.status_text} emoji={meta.slack.status_emoji} />}
      </Card>

      {screenshot && scrMax && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setScrMax(false)}></div>
          <div className="relative pointer-events-auto w-[80vw] max-h-[80vh] rounded-xl overflow-hidden">
            <img
              src={screenshot.data}
              className="w-full h-full max-h-[80vh] object-contain rounded-xl block"
            />
          </div>
        </div>
      )}
      <DeviceMonitor deviceData={deviceData} disconnected={disconnected} appIcon={appIcon} connectWS={connectWS} log={log} openApps={openApps} offline={deviceOffline} scr={requestScrenshot} already={already} spec={spec} />
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="inline-flex px-1.5 py-0 rounded-md dark:bg-white/10 bg-black/10 border dark:border-white/10 border-black/10 text-xs">
      {children}
    </span>
  )
}

function Card({ title, status, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 rounded-xl border dark:border-white/10 border-black/10 bg-transparent shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${statusColor(status)}`} />
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </motion.div>
  )
}

function UserRow({ user, avatar, status, tag, platform, url }) {
  return (
    <div className="flex items-center gap-3">
      {avatar && <img src={avatar} className="w-12 h-12 rounded-full" />}
      <div className="text-sm text-left">
        <div className="flex gap-1">
          <a href={url} className="hover:underline"><div className="font-medium">{user}</div></a>
          <Badge>{tag}</Badge>
        </div>
        <div className="opacity-50 text-xs">{titleCase(platform)}</div>
      </div>
    </div>
  )
}

function Activity({ a }) {
  const large = a.assets?.large_image
  const showImage = large && /\.[a-zA-Z0-9]+$/.test(large)
  const img = showImage
    ? large.startsWith("mp:") ? `https://media.discordapp.net/${large.replace("mp:", "")}` : a.application_id ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${large}` : null
    : null

  return (
    <div className="flex gap-2 items-center p-2 rounded-lg dark:bg-white/5 bg-black/5">
      {a.emoji && <span className="text-lg">{a.emoji}</span>}
      {img && <img src={img} className="w-10 h-10 rounded" />}
      <div className="text-xs">
        <div className="font-medium">{a.name || a.state}</div>
        {a.details && <div className="opacity-70">{a.details}</div>}
      </div>
    </div>
  )
}
