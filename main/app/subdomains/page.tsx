"use client"
import LiveStatus from "@/components/live"
import Subdomain from "@/components/subdomain"
import subdomains from "@/data/subdomains"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useState, useMemo } from "react"

type VisitedMap = Record<string, boolean>
type LiveMap = Record<string, boolean>

export default function Subdomains() {
    const Router = useRouter()
    const subs = useMemo(() => subdomains(), [])

    const [visitedMap, setVisitedMap] = useState<VisitedMap>({})
    const [liveMap, setLiveMap] = useState<LiveMap>({})

    useEffect(() => {
        let cancelled = false
        const baseURL = "https://live.alimad.xyz/visited?app=" + Object.keys(subs).join(",")

        fetch(baseURL)
            .then(res => res.json())
            .then((remote: Record<string, number>) => {
                if (cancelled) return
                const result: VisitedMap = {}
                const lives: LiveMap = {}
                for (const name of Object.keys(subs)) {
                    const fromStorage = localStorage.getItem("visited_" + name)
                    if (remote?.[name] != 0 || fromStorage) result[name] = true
                    if (remote?.[name] == 2) lives[name] = true
                }
                setVisitedMap(result)
                setLiveMap(lives)
            })
            .catch(() => {
                const fallback: VisitedMap = {}
                for (const name of Object.keys(subs)) {
                    if (localStorage.getItem("visited_" + name)) fallback[name] = true
                }
                setVisitedMap(fallback)
            })

        return () => {
            cancelled = true
        }
    }, [subs])

    function renderSubdomain(name: string, i: number) {
        return (
            <motion.div
                key={name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            >
                <Subdomain domainName={name} visited={!!visitedMap[name]} live={!!liveMap[name]} data={(subs as Record<string, any>)[name] || { path: "/" }} />
            </motion.div>
        )
    }

    return (
        <div className="bg-black grid p-0 m-0 grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" suppressHydrationWarning>
            <header className="absolute top-0 w-full h-11 p-0 m-0 bg-gray-600/30 backdrop-blur-2xl text-center">
                <nav className="flex gap-8 left-4 absolute">
                    <button onClick={() => Router.push("/")} className="cursor-pointer hover:bg-gray-500 border-2 border-gray-500 transition-all p-1 mt-1 pl-2 pr-2 rounded-sm">Home</button>
                </nav>
                <p className="p-1 mt-2 pl-2 pr-2">Subdomains</p>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <LiveStatus />
                </div>
            </header>
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start sm:text-left font-[family-name:var(--font-geist-mono)] text-center">
                <div className="w-[100%] h-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid gap-20 gap-y-10">
                    {Object.keys(subs).map(renderSubdomain)}
                </div>
            </main>
        </div>
    )
}
