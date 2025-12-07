"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Cpu, Globe, MemoryStick, Wifi } from "lucide-react"

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
        <div className="font-semibold hover:underline">{title}</div>
      </div>
      {children}
    </motion.div>
  )
}

function DeviceRow({ device }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="text-sm text-left flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-md truncate">{device.title}</div>
          <div className="truncate text-sm text-gray-300">{device.app}</div>
          <div className="truncate text-xs text-gray-400">
            {device.device}
          </div>
          {device.wifi && (
            <div className="truncate text-xs text-gray-500 flex items-center gap-1">
              <Wifi className="w-4 h-4" /> {device.wifi} <Globe className="w-4 h-4" /> {device.ip}
            </div>
          )}
          <div className="truncate text-xs text-gray-500 flex items-center gap-1">
            <Cpu className="w-4 h-4" /> {device.cpuPercent} <MemoryStick className="w-4 h-4" /> {device.ramPercent}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeviceMonitorCard() {
  const [deviceData, setDeviceData] = useState(null)
  const [disconnected, setDisconnected] = useState(false)
  const wsRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket("wss://ws.alimad.co/socket")
    wsRef.current = ws
    ws.onopen = () => setDisconnected(false)
    ws.onmessage = (msg) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setDeviceData(null), 10000)
      try {
        const data = JSON.parse(msg.data)
        if (data.type === "sample" || data.type === "aggregate") {
          setDeviceData(data.data)
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
        <DeviceRow device={deviceData} />
      )}
    </Card>
  )
}
