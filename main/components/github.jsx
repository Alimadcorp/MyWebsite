"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Monitor, Cpu, LucideFlame,
  Code,
  Code2
} from "lucide-react"
import { SiGithub, SiWakatime } from "@icons-pack/react-simple-icons"
import { format } from "timeago.js"

function ProgressBar({ label, value, color, index }) {
  const numericValue = parseFloat(value)
  const isDark = document.documentElement.classList.contains("dark")
  const barColor = isDark ? color : "bg-black/80";
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-1"
    >
      <div className="flex justify-between text-sm">
        <span className="dark:opacity-90">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full dark:bg-white/10 bg-black/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${numericValue}%` }}
          transition={{ duration: 1.5, delay: index * 0.1 + 0.2 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </motion.div>
  )
}

function EditorUsage({ editors }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        Editor Usage
      </h3>
      {editors.map((editor, index) => (
        <div key={editor.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="dark:opacity-90">{editor.name}</span>
            <span className="dark:text-accent-light">{editor.percent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full dark:bg-white/10 bg-black/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${editor.percent}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full bg-accent rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <motion.div
      className="p-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5"
    >
      <div className="relative p-1 overflow-hidden flex px-3 justify-between items-start text-left">
        <div
          className="absolute bottom-0 left-0 h-full m-0 bg-accent/40 blur-xs"
          style={{ width: `${project.percent}%` }}
        ></div>
        <div className="z-10">
          {project.repo_url ? (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              <h4 className="font-medium">{project.name}</h4>
            </a>
          ) : <h4 className="font-medium">{project.name}</h4>}
        </div>
        <div className="text-sm text-accent">
          {project.text}
        </div>
      </div>
    </motion.div>
  )
}

export default function GithubStats({ streak }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let r = () => fetch("/api/status/github").then((res) => res.json()).then((jsonData) => { console.log(jsonData); setData(jsonData) });
    r();
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl w-full mx-auto pt-6 space-y-6 grayscale-100 dark:grayscale-0">
      <div className="grid lg:grid-cols-3 grid-cols-1 w-full gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 col-span-1 w-full space-y-6 h-full flex flex-col"
        >
          <div className="p-6 rounded-2xl border border-white/10 h-fit">
            <a href="https://github.com/Alimadcorp" target="_blank" rel="noopener noreferrer">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 hover:underline">
                <SiGithub size={24} />
                Alimadcorp
              </h2>
            </a>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 w-full">
              <div className="text-center p-4 rounded-xl dark:bg-white/5 bg-black/5">
                <div className="text-3xl font-bold dark:text-accent-light">{data.rank}</div>
                <div className="text-sm opacity-70 mt-1">Rank</div>
              </div>
              <div className="text-center p-4 rounded-xl dark:bg-white/5 bg-black/5">
                <div className="text-3xl font-bold dark:text-accent-light">{data.repos}</div>
                <div className="text-sm opacity-70 mt-1">Repositories</div>
              </div>
              <div className="text-center p-4 rounded-xl dark:bg-white/5 bg-black/5">
                <div className="text-3xl font-bold dark:text-accent-light">{data.total_commits}</div>
                <div className="text-sm opacity-70 mt-1">Commits</div>
              </div>
              <div className="text-center p-4 rounded-xl dark:bg-white/5 bg-black/5">
                <div className="text-3xl font-bold dark:text-accent-light">{data.total_stars_earned}</div>
                <div className="text-sm opacity-70 mt-1">Stars Earned</div>
              </div>
            </div>
            <div className="space-y-3 mb-0">
              <h3 className="text-xl font-semibold">Language Distribution</h3>
              <div className="space-y-2">
                {Object.entries(data.langs).map(([lang, pct], index) => (
                  <ProgressBar
                    key={lang}
                    label={lang}
                    value={pct}
                    color={index === 0 ? "bg-accent" :
                      index === 1 ? "bg-accent" :
                        index === 2 ? "bg-accent" :
                          index === 3 ? "bg-accent" : "bg-accent"}
                    index={index}
                  />
                ))}
              </div>
              <h3 className="text-xl font-semibold">Active Projects this Week</h3>
              <div className="grid md:grid-cols-2 gap-1 mb-4">
                {data.wakatime.projects.slice(0, 8).map((project, index) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
              </div>
              <h3 className="text-xl font-semibold">Recent activity</h3>
              <div className="space-y-2 text-sm text-gray-500">
                {!data.latest && <p>No recent activity found.</p>}
                {data.latest && data.latest.map(e => (
                  <p>Commit{" "}
                    "<a href={`https://github.com/${e.repo}/commit/${e.sha}`} className="text-white hover:underline cursor-pointer">{e.message.replaceAll("\n", " ").replaceAll(/\s+/g, " ").split(" ").slice(0, 10).join(" ")}</a>" to{" "}
                    <a href={`https://github.com/${e.repo}`} className="text-white hover:underline cursor-pointer">{e.repo.replace("Alimadcorp/", "")}</a>{", "}
                    <span title={new Date(e.time).toLocaleString()}>{format(e.time)}</span></p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 h-full flex flex-col"
        >
          <div className="p-6 rounded-2xl border border-white/10 h-fit">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              <SiWakatime size={24} />
              <span className="flex items-center gap-2">
                AlimadCo
                {streak > 0 &&
                  <div className="flex items-center gap-1 bg-accent text-white px-2 py-0.5 rounded-full shadow-md text-sm">
                    <LucideFlame className="w-4 h-4 text-white" />
                    <span className="font-semibold">{streak}</span>
                  </div>
                }
              </span>
            </h2>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl dark:bg-white/5 bg-black/5">
                <div className="text-3xl font-bold dark:text-accent-light">{data.wakatime.total_seconds}</div>
                <div className="text-sm opacity-70 mt-1">Total Coding Time</div>
              </div>
              <div className="grid grid-cols-2 gap-2 -mt-2">
                <div className="text-center p-3 rounded-lg dark:bg-white/5 bg-black/5">
                  <div className="text-xl font-bold dark:text-accent-light">{data.wakatime.total_week}</div>
                  <div className="text-xs opacity-70 mt-1">This Week</div>
                </div>
                <div className="text-center p-3 rounded-lg dark:bg-white/5 bg-black/5">
                  <div className="text-xl font-bold dark:text-accent-light">{data.wakatime.total_today}</div>
                  <div className="text-xs opacity-70 mt-1">Today</div>
                </div>
              </div>
              <EditorUsage editors={data.wakatime.editors} />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Machine Usage
                </h3>
                {data.wakatime.machines.map((machine, index) => (
                  <div key={machine.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{machine.name}</span>
                      <span className="dark:text-accent-light">{machine.percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full dark:bg-white/10 bg-black/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${machine.percent}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="text-lg mt-3 mb-2 font-semibold flex items-center gap-2">
              Top Languages this Week
            </h3>
            <div className="grid grid-cols-2 gap-1 max-h-90 overflow-hidden">
              {data.wakatime.languages.slice(0, 12).map((lang, i) => (
                <div key={lang.name} className="flex items-center gap-3 p-0 rounded-lg">
                  <div className="w-8 h-8 rounded-lg dark:bg-white/10 bg-black/10 flex items-center justify-center">
                    <span className="text-sm font-bold dark:text-accent-light">{i + 1}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm opacity-60">{lang.percent.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}