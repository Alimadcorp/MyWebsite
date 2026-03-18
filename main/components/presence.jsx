"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import DeviceMonitor from "@/components/pc";
import StatusDot from "@/components/statusdot"
import { SiDiscord, SiSlack } from "@icons-pack/react-simple-icons";

const titleCase = (str) => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : "";

function processLog(input) {
  const delimiter = " BACKSPACE ";
  const parts = input.split(delimiter);

  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    result = result.slice(0, -1);
    result += parts[i];
  }
  return result;
}



export default function StatusViewer() {
  const [data, setData] = useState(null)
  const [deviceData, setDeviceData] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const [deviceOffline, setDeviceOffline] = useState(true)
  const [screenshot, setScreenshot] = useState(null);
  const [scrMax, setScrMax] = useState(false);
  const [already, setAlready] = useState(false);
  const [scrLoading, setScrLoading] = useState(false);
  const scrTimeoutRef = useRef(null);
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
  const maxChar = 300;

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
          return newLog
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
      setScrLoading(true);
      if (scrTimeoutRef.current) clearTimeout(scrTimeoutRef.current);
      scrTimeoutRef.current = setTimeout(() => {
        setScrLoading(false);
        setAlready(false);
      }, 10000);
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
          setScrLoading(false);
          if (scrTimeoutRef.current) clearTimeout(scrTimeoutRef.current);
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

  const discordActivities = meta?.discord?.activities || [];
  const slackActivities = meta?.slack?.status_text
    ? [{ name: meta.slack.status_text, emoji: meta.slack.status_emoji, type: 4 }]
    : [];

  return (
    <div className="w-full grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
      <Card title="Discord" status={discord}
        open={openApps?.discord || false}
        active={deviceData && deviceData.app && deviceData.app.toLowerCase() == "discord"}
        typing={deviceData && (deviceData.keysPressed > 1)}>
        <UserRow
          user={meta?.discord?.name}
          avatar={meta?.discord?.avatar}
          tag={meta?.discord?.tag}
          platform={meta?.discord?.platform}
          url="https://discord.com/users/888954248199549030"
          brandColor="#5865F2"
        />
        <div className="mt-4 space-y-3">
          {discordActivities.map((a, i) => <Activity key={i} a={a} brandColor="#7680eaff" />)}
        </div>
      </Card>

      <Card title="Slack" status={slack}
        open={openApps?.slack || false}
        active={deviceData && deviceData.app && deviceData.app.toLowerCase() == "slack"}
        typing={deviceData && (deviceData.keysPressed > 1)}>
        <UserRow
          user={meta?.slack?.name}
          avatar={meta?.slack?.avatar}
          tag={meta?.slack?.title}
          platform={meta?.slack?.pronouns}
          url="https://hackclub.enterprise.slack.com/team/U08LQFRBL6S"
          brandColor="#4A154B"
        />
        <div className="mt-4 space-y-3">
          {slackActivities.map((a, i) => <Activity key={i} a={a} brandColor="#fd7bffff" />)}
        </div>
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
      <DeviceMonitor deviceData={deviceData} disconnected={disconnected} appIcon={appIcon} connectWS={connectWS} log={processLog(log)} openApps={openApps} offline={deviceOffline} scr={requestScrenshot} already={already} scrLoading={scrLoading} spec={spec} />
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

function Card({ title, status, children, open, active, typing }) {
  let stat = status;
  if (open) {
    stat = "background";
    if (active) stat = "online";
  }
  if (typing && active) stat = "typing";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 rounded-xl border dark:border-white/10 border-black/10 bg-transparent shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <StatusDot status={stat} />
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </motion.div>
  )
}

function UserRow({ user, avatar, tag, platform, url, brandColor }) {
  return (
    <div className="flex items-center gap-3 group relative">
      <div className="relative shrink-0">
        {avatar && <img src={avatar} className="w-12 h-12 rounded-full border border-white/10 group-hover:border-white/20 transition-all shadow-sm" />}
        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-zinc-950 border border-white/10 shadow-xs scale-75">
          {brandColor === "#5865F2" ? <SiDiscord className="w-3.5 h-3.5 text-[#5865F2]" /> : <SiSlack className="w-3.5 h-3.5 text-[#4A154B]" />}
        </div>
      </div>
      <div className="text-sm text-left flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a href={url} target="_blank" className="hover:underline truncate"><div className="font-bold text-md leading-tight">{user || "Offline"}</div></a>
          {tag && <Badge>{tag}</Badge>}
        </div>
        <div className="opacity-40 text-[9px] font-bold tracking-tight">{titleCase(platform) || "Disconnected"}</div>
      </div>
    </div>
  )
}

function Activity({ a, brandColor }) {
  const large = a.assets?.large_image
  const showImage = large && /\.[a-zA-Z0-9]+$/.test(large)
  const img = showImage
    ? large.startsWith("mp:") ? `https://media.discordapp.net/${large.replace("mp:", "")}` : a.application_id ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${large}` : null
    : null

  const typeMap = { 0: "Playing", 1: "Streaming", 2: "Listening to", 3: "Watching", 4: "Status", 5: "Competing in" };
  const type = typeMap[a.type] || "Doing";

  const renderEmoji = (emoji) => {
    if (!emoji) return null;
    const match = emoji.match(/:([a-zA-Z0-9_+-]+):/);
    if (match) {
      return (
        <img
          src={`https://emoji.alimad.co/${match[1]}`}
          className="w-6 h-6 object-contain"
          alt={match[1]}
        />
      );
    }
    return <span className="text-xl">{emoji}</span>;
  };

  return (
    <div className="flex gap-3 items-center group transition-opacity hover:opacity-100 opacity-90">
      <div className="relative shrink-0">
        {img ? (
          <img src={img} className="w-10 h-10 rounded-lg border border-white/10 object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            {a.emoji ? renderEmoji(a.emoji) : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[9px] font-black opacity-60 mb-0.5" style={{ color: brandColor }}>{type}</div>
        <div className="font-bold text-xs truncate leading-tight">{a.name}</div>
        {(a.details || a.state) && <div className="text-[10px] opacity-50 truncate mt-0.5">{a.details || a.state}</div>}
      </div>
    </div>
  )
}
