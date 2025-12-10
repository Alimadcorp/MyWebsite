"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Cpu, EthernetPort, Globe, Keyboard, MemoryStick, Mouse, Wifi, Code, Camera, Expand, PanelLeft, PanelRight, Eye } from "lucide-react"
import { SiSlack, SiDiscord, SiWhatsapp, SiGooglechrome, SiGnometerminal } from "@icons-pack/react-simple-icons"

const appIconsMap = {
  slack: SiSlack,
  discord: SiDiscord,
  "whatsapp.root": SiWhatsapp,
  code: Code,
  chrome: SiGooglechrome,
  windowsterminal: SiGnometerminal
}

function OpenApps({ apps, device }) {
  return (
    <div className="flex items-center gap-2">
      {device.fullscreen && <Expand className="w-4 h-4" />}
      {device.splitLeft && <PanelLeft className="w-4 h-4" />}
      {device.splitRight && <PanelRight className="w-4 h-4" />}
      {Object.entries(apps).map(([name, open]) => {
        if (!open) return null
        const Icon = appIconsMap[name]
        return Icon ? <Icon key={name} className="w-4 h-4" /> : null
      })}
    </div>
  )
}

const statusColor = (data, offline) => {
  if (!data || offline) return "bg-gray-500"
  if (data.isSleeping) return "bg-yellow-500"
  if (data.isIdle) return "bg-blue-500"
  return "bg-green-500"
}

const formatLastActive = (ts) => {
  const d = new Date(ts)
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, "0")
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`

  const sameDay = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  if (sameDay) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`

  const diff = now - d
  const days = diff / 86400000
  if (days < 7) {
    return `${d.toLocaleDateString(undefined, { weekday: "long" })} at ${time}`
  }

  const date = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`
  return `${date} at ${time}`
}

function Card({ title, status, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 rounded-xl border dark:border-white/10 border-black/10 bg-transparent shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${status}`} />
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </motion.div>
  )
}

function useLerp(target, speed = 0.1) {
  const [value, setValue] = useState(target)
  const rafRef = useRef()

  useEffect(() => {
    const animate = () => {
      setValue(prev => {
        const delta = target - prev
        if (Math.abs(delta) < 0.01) return target
        return prev + delta * speed
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, speed])

  return value
}

function getBatteryIcon(percent = 0, charging = false) {
  if (charging) return BatteryCharging;
  if (percent <= 20) return Battery;
  if (percent <= 50) return BatteryLow;
  if (percent <= 80) return BatteryMedium;
  return BatteryFull;
}

function DeviceRow({ device, icon, apps, offline, scr, already, spec }) {
  const cpu = useLerp(device.cpuPercent || 0)
  const ram = useLerp(device.ramPercent || 0)
  const keys = useLerp(device.keysPressed || 0)
  const mouse = useLerp(device.mouseClicks || 0)
  const pct = typeof device.batteryPercent === "number" ? device.batteryPercent : 0;
  const BatteryIcon = getBatteryIcon(pct, !!device.charging);
  const lastActive = offline ? device.timestamp : null;

  return (
    <div className={`flex items-center gap-3 w-full relative ${offline ? "filter grayscale opacity-60" : ""}`}>
      {icon && <img src={`data:image/png;base64,${icon}`} className="w-6 h-6 rounded bottom-0 right-0 absolute smimage" />}
      <div className="text-sm text-left flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-md truncate">{device.title || device.app}</div>
          <div className="truncate text-sm dark:text-gray-300 text-gray-700">{device.app}</div>
          <div className="truncate text-xs text-gray-500">{device.device}</div>
          {lastActive && (
            <div className="text-xs text-gray-400">Last active: {formatLastActive(lastActive)}</div>
          )}
          {(device.ip || device.localIp || device.wifi) && (
            <div className="truncate text-xs text-gray-500 flex items-center gap-1 font-mono">
              {device.wifi && (<><Wifi className="w-4 h-4" /> {device.wifi} </>)}
              {device.ip && (/^\d+\.\d+\.\d+\.\d+$/.test(device.ip)) && (<><Globe className="w-4 h-4" /> {device.ip} </>)}
              {device.localIp && (<><EthernetPort className="w-4 h-4" /> {device.localIp.split(".").slice(2, 4).join(".")}</>)}
            </div>
          )}
          <div className="truncate text-xs text-gray-500 flex items-center gap-1 font-mono">
            <Cpu className="w-4 h-4" /> {cpu.toFixed(1)}
            <MemoryStick className="w-4 h-4" /> {ram.toFixed(1)}
            <BatteryIcon className="w-4 h-4" /> {pct}% {device.charging && <span className="sr-only">charging</span>}
            <Keyboard className="w-4 h-4" /> {keys.toFixed(0)}
            <Mouse className="w-4 h-4" /> {mouse.toFixed(0)}
          </div>
          <div className="truncate text-xs text-gray-500 flex p-1 items-center gap-1 font-mono">
            {!already && !offline && scr && (
              <button
                onClick={scr}
                className="rounded-full text-blue-500 mx-1"
                title="Steal Alimad's screen :3"
              >
                <Camera className="w-4 h-4 scale-120" />
              </button>
            )}
            {apps && <OpenApps apps={apps} device={device} />}
            <div className="truncate text-xs text-gray-500 flex items-center gap-1 mx-1 font-mono">
              <Eye className="w-4 h-4" /> {spec}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeviceMonitorCard({ deviceData, disconnected, appIcon, connectWS, log, openApps, offline, scr, already, spec }) {
  return (
    <>
      <Card title="Device" status={statusColor(deviceData, offline)}>
        {disconnected || !deviceData ? (
          <div className="flex items-center justify-center h-24">
            <div className={`text-xs ${disconnected ? "text-red-400" : "text-gray-400"}`}>
              {disconnected ? (
                <div className="md:col-span-3 flex justify-center items-center">
                  <button
                    onClick={connectWS}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Connect
                  </button>
                </div>)
                : "Waiting for data..."}
            </div>
          </div>
        ) : (
          <DeviceRow device={deviceData} icon={appIcon} apps={openApps} offline={offline} scr={scr} already={already} spec={spec} />
        )}
      </Card>
      <Card title="KeyLogger">
        <p className="text-sm font-mono break-word">{log}</p>
      </Card>
    </>
  )
}
