"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DeviceMonitor from "@/components/pc";

const statusColor = (s) => ({
  online: "dark:bg-green-500 bg-green-500",
  idle: "dark:bg-yellow-500 bg-yellow-500",
  dnd: "dark:bg-red-500 bg-red-500",
  offline: "dark:bg-gray-500 bg-gray-800"
}[s] || "bg-gray-500")

const titleCase = (str) => str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : ""

export default function StatusViewer() {
  const [data, setData] = useState(null)

  const fetchData = async (uh) => {
    const res = await fetch("/api/status" + (uh ? "?meta=true" : ""))
    const json = await res.json()
    setData(prev => ({
      ...prev,
      ...json
    }))
  }

  useEffect(() => {
    fetchData(true)
    const t = setInterval(() => fetchData(false), 60_000)
    return () => clearInterval(t)
  }, [])

  if (!data) return <div className="text-sm mt-4">Loading…</div>

  const { discord, slack, meta } = data

  return (
    <div className="w-full grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-8">
      <Card title={`Discord`} status={discord}>
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

      <Card title={`Slack`} status={slack}>
        <UserRow
          user={meta.slack.name}
          avatar={meta.slack.avatar}
          status={slack}
          tag={meta.slack.title}
          platform={meta.slack.pronouns}
          url="https://hackclub.enterprise.slack.com/team/U08LQFRBL6S"
        />
        {meta.slack.status_text && (
          <div className="flex items-center gap-1 p-3 mt-3 rounded-xl dark:bg-white/5 bg-black/5 dark:grayscale-0 grayscale-100">
            <span
              className="leading-none flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: renderEmoji(meta.slack.status_emoji) }}
              aria-hidden="true"
            />
            <span className="text-sm">
              {meta.slack.status_text}
            </span>
          </div>
        )}
      </Card>
      <DeviceMonitor/>
    </div>
  )
}

const renderEmoji = (text) => {
  if (!text) return "";
  return text.replace(
    /:([a-zA-Z0-9_+-]+):/g,
    (_, name) =>
      `<img 
        src="https://e.alimad.co/${name}" 
        class="w-5 h-5 inline-block object-contain align-middle" 
      />`
  );
};

function Badge({ children }) {
  return (
    <span className="inline-flex px-1.5 py-0 rounded-md dark:bg-white/10 bg-black/10 border dark:border-white/10 border-black/10 text-xs">
      {children}
    </span>
  )
}

function Card({ title, status, children, url = "#" }) {
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
      <div className="relative">
        {avatar && <img src={avatar} className="w-12 h-12 rounded-full dark:grayscale-0 grayscale-100" />}
        <div className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-white dark:border-black ${statusColor(status)}`} />
      </div>
      <div className="text-sm text-left">
        <div className="flex gap-1"><a href={url} className="hover:underline"><div className="font-medium">{user}</div></a>
          <Badge>{tag}</Badge></div>
        <div className="opacity-50 text-xs">{titleCase(platform)}</div>
      </div>
    </div >
  )
}

function Activity({ a }) {
  if (a.type === 4) {
    return (
      <div className="flex gap-2 items-center p-2 rounded-lg dark:bg-white/5 bg-black/5 dark:grayscale-0 grayscale-100">
        {a.emoji && <span className="text-lg">{a.emoji}</span>}
        <div className="text-xs font-medium">{a.state}</div>
      </div>
    )
  }

  let showImage = false
  const large = a.assets?.large_image

  if (large) {
    const endsWithExt = /\.[a-zA-Z0-9]+$/.test(large)
    if (endsWithExt) showImage = true
  }

  let img = null
  if (showImage && large) {
    img = large.startsWith("mp:")
      ? `https://media.discordapp.net/${large.replace("mp:", "")}`
      : a.application_id
        ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${large}`
        : null
  }

  return (
    <div className="flex gap-2 items-center p-2 rounded-lg bg-white/5">
      {img && <img src={img} className="w-10 h-10 rounded" />}
      <div className="text-xs">
        <div className="font-medium">{a.name}</div>
        {a.details && <div className="opacity-70">{a.details}</div>}
      </div>
    </div>
  )
}
