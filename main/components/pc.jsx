"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Cpu, EthernetPort, Globe, Keyboard, MemoryStick, Mouse, Wifi } from "lucide-react"

const statusColor = (data) => {
  if (!data) return "bg-gray-500"
  if (data.isSleeping) return "bg-yellow-500"
  if (data.isIdle) return "bg-blue-500"
  return "bg-green-500"
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

function DeviceRow({ device, icon }) {
  const cpu = useLerp(device.cpuPercent || 0)
  const ram = useLerp(device.ramPercent || 0)
  const keys = useLerp(device.keysPressed || 0)
  const mouse = useLerp(device.mouseClicks || 0)

  return (
    <div className="flex items-center gap-3 w-full relative">
      {icon && <img src={`data:image/png;base64,${icon}`} className="w-6 h-6 rounded bottom-0 right-0 absolute" />}
      <div className="text-sm text-left flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-md truncate">{device.title || device.app}</div>
          <div className="truncate text-sm text-gray-300">{device.app}</div>
          <div className="truncate text-xs text-gray-400">{device.device}</div>
          {device.wifi && (
            <div className="truncate text-xs text-gray-500 flex items-center gap-1 font-mono">
              <Wifi className="w-4 h-4" /> {device.wifi} <Globe className="w-4 h-4" /> {device.ip} <EthernetPort className="w-4 h-4"/> {device.localIp.split(".").slice(2,4).join(".")}
            </div>
          )}
          <div className="truncate text-xs text-gray-500 flex items-center gap-1 font-mono">
            <Cpu className="w-4 h-4" /> {cpu.toFixed(1)}
            <MemoryStick className="w-4 h-4" /> {ram.toFixed(1)}
            <Keyboard className="w-4 h-4"/> {keys.toFixed(0)} 
            <Mouse className="w-4 h-4"/> {mouse.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeviceMonitorCard() {
  const [deviceData, setDeviceData] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const [appIcon, setAppIcon] = useState("");
  const wsRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket("wss://ws.alimad.co/socket")
    wsRef.current = ws
    ws.onopen = () => { setDisconnected(false); }
    ws.onmessage = (msg) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setDeviceData(null), 10000)
      try {
        const data = JSON.parse(msg.data)
        if (data.type === "sample" || data.type === "aggregate") {
          setDeviceData(data.data);
          if(data.data.icon && data.data.icon != "none" && data.data.icon.trim() != "") setAppIcon(data.data.icon);
        }
      } catch (err) {
        console.error(err)
      }
    }
    ws.onclose = () => {
      setDisconnected(true); if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setDeviceData(null)
    }
    ws.onerror = () => {
      setDisconnected(true); if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setDeviceData(null)
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); ws.close() }
  }, [])

  return (
    <Card title="Device" status={statusColor(deviceData)}>
      {disconnected || !deviceData ? (
        <div className="flex items-center justify-center h-24">
          <div className={`text-xs ${disconnected ? "text-red-400" : "text-gray-400"}`}>
            {disconnected ? "Disconnected" : "Bro is offline…"}
          </div>
        </div>
      ) : (
        <DeviceRow device={deviceData} icon={appIcon} />
      )}
    </Card>
  )
}
