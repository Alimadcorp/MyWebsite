"use client"

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Wifi, WifiOff, Play, Pause, Trash2, AlertCircle, Settings, Check, X, Plug2, Handshake, ArrowUpDown, PlayCircle, LucideArrowBigUpDash, LucideServerOff } from "lucide-react";
import { SiSocket } from "@icons-pack/react-simple-icons";

export default function WsLatencyPage() {
  const CONCURRENT_MS = 50;
  const PENDING_TTL = 30000;

  const [wsUrl, setWsUrl] = useState("wss://ws.alimad.co");
  const [tempUrl, setTempUrl] = useState("wss://ws.alimad.co");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [status, setStatus] = useState("disconnected");
  const [rate, setRate] = useState(1);
  const [auto, setAuto] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ count: 0, avg: 0, median: 0, p95: 0, min: 0, max: 0, std: 0 });
  const [logs, setLogs] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);

  const wsRef = useRef(null);
  const pendingRef = useRef(new Map());
  const idRef = useRef(1);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const lastRecvTimesRef = useRef([]);

  useEffect(() => {
    const font = new FontFace(
      'Geist',
      'url(https://corsproxy.io/?url=https://cdn.alimad.co/f/geist.woff2)'
    );

    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    }).catch(() => {
      setFontLoaded(true);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("ws");
    if (urlParam) {
      setWsUrl(urlParam);
      setTempUrl(urlParam);
    }
  }, []);
  function handleUrlChange() {
    const trimmed = tempUrl.trim();
    if (!trimmed) {
      pushLog("URL cannot be empty");
      return;
    }
    if (!trimmed.startsWith("ws://") && !trimmed.startsWith("wss://")) {
      pushLog("URL must start with ws:// or wss://");
      return;
    }

    if (wsRef.current) wsRef.current.close();
    setWsUrl(trimmed);
    setIsEditingUrl(false);
    pushLog(`URL changed to ${trimmed}`);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("ws", trimmed);
    window.history.replaceState(null, "", "?" + newParams.toString());

    setHistory([]);
    setStats({ count: 0, avg: 0, median: 0, p95: 0, min: 0, max: 0, std: 0 });
  }

  useEffect(() => {
    let shouldStop = false;
    let reconnectTimer = null;

    function connect() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;
      setStatus("connecting");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setStatus("connected");
        pushLog("Connected");
      };
      ws.onclose = () => {
        setStatus("disconnected");
        pushLog("Disconnected");
        if (!shouldStop) reconnectTimer = setTimeout(connect, 1000 + Math.random() * 2000);
      };
      ws.onerror = () => {
        pushLog("Connection error");
        ws.close();
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          handleMessage(data);
        } catch {
          pushLog("Invalid message");
        }
      };
    }
    return () => {
      shouldStop = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [wsUrl]);

  function manualToggleConnection() {
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      try {
        wsRef.current = null;
        setStatus("connecting");
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => { setStatus("connected"); pushLog("Connected"); };
        ws.onclose = () => { setStatus("disconnected"); pushLog("Disconnected"); };
        ws.onmessage = (ev) => {
          try { handleMessage(JSON.parse(ev.data)); } catch { }
        };
        ws.onerror = () => { pushLog("Error"); ws.close(); };
      } catch {
        pushLog("Connection failed");
      }
    } else {
      wsRef.current.close();
      wsRef.current = null;
      setStatus("disconnected");
      pushLog("Manually closed");
    }
  }

  function handleUrlChange() {
    const trimmed = tempUrl.trim();
    if (!trimmed) {
      pushLog("URL cannot be empty");
      return;
    }
    if (!trimmed.startsWith("ws://") && !trimmed.startsWith("wss://")) {
      pushLog("URL must start with ws:// or wss://");
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setWsUrl(trimmed);
    setIsEditingUrl(false);
    pushLog(`URL changed to ${trimmed}`);
    setHistory([]);
    setStats({ count: 0, avg: 0, median: 0, p95: 0, min: 0, max: 0, std: 0 });
  }

  function cancelUrlEdit() {
    setTempUrl(wsUrl);
    setIsEditingUrl(false);
  }

  useEffect(() => {
    if (!auto) return;
    let t = 0;
    let cancelled = false;
    function loop() {
      if (cancelled) return;
      sendPing();
      const delay = 1000 / Math.max(0.1, rate);
      t = setTimeout(loop, delay);
    }
    loop();
    return () => { cancelled = true; clearTimeout(t); };
  }, [auto, rate]);

  function sendPing() {
    const ws = wsRef.current;
    const id = idRef.current++;
    const sentAt = Date.now();
    const payload = { type: "ping", id, time: new Date(sentAt).toISOString() };
    try {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
      pendingRef.current.set(id, sentAt);
      prunePending();
    } catch {
      pushLog(`Send failed #${id}`);
    }
  }

  function prunePending() {
    const now = Date.now();
    for (const [id, ts] of pendingRef.current) {
      if (now - ts > PENDING_TTL) {
        pendingRef.current.delete(id);
        pushLog(`Timeout #${id}`);
      }
    }
  }

  function handleMessage(data) {
    if (!data || data.type !== "pong") return;
    const recvAt = Date.now();
    const id = data.id;
    const serverTime = data.time || null;
    const sentAt = pendingRef.current.get(id);

    if (sentAt == null) {
      pushLog(`Orphan pong #${id}`);
      return;
    }
    const rtt = recvAt - sentAt;
    pendingRef.current.delete(id);

    const receiveTimes = lastRecvTimesRef.current;
    receiveTimes.push(recvAt);
    if (receiveTimes.length > 10) receiveTimes.shift();
    let concurrent = false;
    if (receiveTimes.length >= 2) {
      const prev = receiveTimes[receiveTimes.length - 2];
      if (Math.abs(recvAt - prev) < CONCURRENT_MS) concurrent = true;
    }

    setHistory((prev) => {
      const next = [...prev, { id, sentAt, recvAt, rtt, serverTime, concurrent }].slice(-1000);
      computeStats(next);
      return next;
    });

    if (concurrent) pushLog(`Concurrent #${id} (${rtt}ms)`);
  }

  function computeStats(arr) {
    const lat = arr.map((a) => a.rtt).filter((v) => typeof v === "number" && !isNaN(v));
    if (!lat.length) {
      setStats({ count: 0, avg: 0, median: 0, p95: 0, min: 0, max: 0, std: 0 });
      return;
    }
    const count = lat.length;
    const sum = lat.reduce((s, v) => s + v, 0);
    const mean = sum / count;
    const avg = Math.round(mean);
    const sorted = [...lat].sort((a, b) => a - b);
    const median = sorted.length % 2 === 1
      ? sorted[(sorted.length - 1) / 2]
      : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
    const p95idx = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
    const p95 = sorted[p95idx];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const std = Math.round(Math.sqrt(sorted.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / count));
    setStats({ count, avg, median, p95, min, max, std });
  }

  function pushLog(s) {
    setLogs((l) => ([...l.slice(-80), `${new Date().toLocaleTimeString()} ${s}`]));
  }

  function clearLogs() { setLogs([]); }

  useEffect(() => {
    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext("2d");
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 600;
      const cssH = canvas.clientHeight || 300;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // Subtle gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, cssH);
      bg.addColorStop(0, "#09090b");
      bg.addColorStop(1, "#18181b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cssW, cssH);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (cssH * i) / 5);
        ctx.lineTo(cssW, (cssH * i) / 5);
        ctx.stroke();
      }

      const data = history.slice(-120);
      if (data.length) {
        const maxLatency = Math.max(200, ...data.map((d) => d.rtt));

        // Area fill
        ctx.beginPath();
        data.forEach((p, i) => {
          const x = 30 + (i / Math.max(1, data.length - 1)) * (cssW - 60);
          const y = cssH - 30 - (p.rtt / maxLatency) * (cssH - 60);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.lineTo(cssW - 30, cssH - 30);
        ctx.lineTo(30, cssH - 30);
        ctx.closePath();
        const fillG = ctx.createLinearGradient(0, 0, 0, cssH);
        fillG.addColorStop(0, "rgba(99, 102, 241, 0.15)");
        fillG.addColorStop(1, "rgba(99, 102, 241, 0.02)");
        ctx.fillStyle = fillG;
        ctx.fill();

        // Main line
        ctx.beginPath();
        data.forEach((p, i) => {
          const x = 30 + (i / Math.max(1, data.length - 1)) * (cssW - 60);
          const y = cssH - 30 - (p.rtt / maxLatency) * (cssH - 60);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(129, 140, 248, 0.9)";
        ctx.stroke();

        // Dots
        data.forEach((p, i) => {
          const x = 30 + (i / Math.max(1, data.length - 1)) * (cssW - 60);
          const y = cssH - 30 - (p.rtt / maxLatency) * (cssH - 60);
          ctx.beginPath();
          ctx.arc(x, y, p.concurrent ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.concurrent ? "#ef4444" : "#818cf8";
          ctx.fill();
          if (p.concurrent) {
            ctx.strokeStyle = "#fca5a5";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });

        if (fontLoaded) {
          ctx.font = "13px Geist, system-ui";
        } else {
          ctx.font = "13px system-ui";
        }
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "left";
        ctx.fillText(`Samples: ${stats.count}`, 20, 25);
        ctx.fillText(`Average: ${stats.avg}ms`, 20, 42);
        ctx.fillText(`Median: ${stats.median}ms`, 20, 59);
        ctx.fillText(`P95: ${stats.p95}ms`, 20, 76);
        ctx.fillText(`Range: ${stats.min}-${stats.max}ms`, 20, 93);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [history, stats, fontLoaded]);

  const recent = history.slice(-15).reverse();
  const statusColor = status === "connected" ? "bg-emerald-500" : status === "connecting" ? "bg-amber-500" : "bg-slate-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-925 to-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="md:flex grid grid-cols-1 gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <Plug2 className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight"><span className="hidden md:inline">Websocket </span>Speed Test</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{wsUrl}
                <Badge variant="outline" className={`${statusColor} text-white border-zinc-700/60 text-xs scale-90`}>
                  {status === "connected" ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                  {status}
                </Badge></p>
            </div>
          </div>

          <div className="md:flex hidden items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={manualToggleConnection}
              className={"border-zinc-700 text-black hover:text-white cursor-pointer hover:bg-zinc-800/70 " + (status == 'connected' ? "bg-zinc-900 text-white" : "")}
            >
              {status !== "connected" ?
                <LucideArrowBigUpDash /> : <LucideServerOff />}
              {status === "connected" ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Card className="lg:col-span-2 bg-zinc-900/40 border-zinc-800 backdrop-blur text-white">
            <CardContent className="p-6">
              <div className="md:flex grid grid-cols-1 items-center justify-between mb-4">
                <h2 className="text-2xl mb-3 font-medium text-zinc-200">Latency Graph</h2>
                <div className="flex gap-2 mb-4 items-center">
                  <Input
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    disabled={!isEditingUrl}
                    className="flex-1"
                    placeholder="WebSocket URL"
                  />
                  {isEditingUrl ? (
                    <>
                      <Button size="sm" className="border-zinc-700 hover:text-black text-white cursor-pointer bg-zinc-800/70" variant="outline" onClick={handleUrlChange}>Save</Button>
                      <Button size="sm" className="border-red-700 text-white cursor-pointer bg-red-800/70 hover:bg-red-700" variant="outline" onClick={cancelUrlEdit}>Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" className="border-zinc-700 hover:text-black text-white cursor-pointer bg-zinc-800/70" variant="outline" onClick={() => setIsEditingUrl(true)}>Edit URL</Button>
                  )}
                </div>
                <div className="md:flex grid grid-cols-1 items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={manualToggleConnection}
                    className={"md:hidden border-zinc-700 text-black hover:text-white cursor-pointer hover:bg-zinc-800/70 " + (status == 'connected' ? "bg-zinc-900 text-white" : "")}
                  >
                    {status !== "connected" ?
                      <LucideArrowBigUpDash /> : <LucideServerOff />}
                    {status === "connected" ? "Disconnect" : "Connect"}
                  </Button>
                  <Button
                    size="sm"
                    variant={auto ? "default" : "outline"}
                    onClick={() => setAuto(!auto)}
                    disabled={status !== "connected"}
                    className={auto
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      : "border-zinc-700 hover:text-black text-white cursor-pointer bg-zinc-800/70"}
                  >
                    {auto ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {auto ? "Stop" : "Start"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={sendPing}
                    className="border-zinc-700 hover:text-black text-white cursor-pointer bg-zinc-800/70"
                    disabled={status !== "connected"}
                  >
                    Send Ping
                  </Button>
                </div>
              </div>

              <div className="h-80 rounded-lg overflow-hidden border border-zinc-800 mb-4 bg-zinc-950/40">
                <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-zinc-500 min-w-[80px]">
                  Rate: {rate.toFixed(1)} /s
                </span>

                <Slider
                  value={[rate]}
                  onValueChange={(v) => setRate(v[0])}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="flex-1 [&_.radix-slider__track]:bg-blue-500 [&_.radix-slider__range]:bg-blue-400"
                />
              </div>

              <div className="grid md:grid-cols-6 grid-cols-2 gap-3">
                {[
                  ["Average", stats.avg, "text-indigo-400"],
                  ["Median", stats.median, ""],
                  ["P95", stats.p95, ""],
                  ["Min", stats.min || 0, "text-emerald-400"],
                  ["Max", stats.max || 0, "text-rose-400"],
                  ["Std Dev", stats.std, ""],
                ].map(([label, value, color], i) => (
                  <div key={i} className="bg-zinc-900/40 rounded-lg p-3 text-center border border-zinc-800/60">
                    <div className="text-xs text-zinc-500 mb-1">{label}</div>
                    <div className={`text-lg font-semibold ${color}`}>{value}ms</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}