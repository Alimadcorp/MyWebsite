"use client";

import { format } from "timeago.js";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function groupByDay(logs) {
  const grouped = {};
  for (const log of logs) {
    const date = new Date(log.time).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(log);
  }
  return grouped;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserActionMonitor />
    </Suspense>
  );
}

function UserActionMonitor() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const password = searchParams.get("password");
  const focusedClient = searchParams.get("client");
  const ipFilter = searchParams.get("ip");

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch(
        "https://log.alimad.co/api/pull?channel=blog-alimad-co-prod-3&pwd="+process.env.NEXT_PUBLIC_PWD
      );
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data?.logs || []);
    }
    fetchLogs();
  }, []);

  if (password !== process.env.NEXT_PUBLIC_PWD) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center font-sans">
        <h1 className="text-9xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-amber-300">
          404
        </h1>
        <h1 className="text-2xl font-bold mb-2 text-amber-200">
          Blog not found
        </h1>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-amber-700 transition"
        >
          Go back home
        </Link>
      </div>
    );
  }

  const days = groupByDay(logs);
  const sortedDays = Object.keys(days).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const groupedByClient = {};
  for (const log of logs) {
    let obj = {};
    try {
      obj = JSON.parse(log.text);
    } catch { }
    const key = obj.clientId || log.ip;
    groupedByClient[key] ||= [];
    groupedByClient[key].push({ ...log, parsed: obj });
  }

  // ✅ FIX: attach latest IP per client
  const latestIpByClient = {};
  for (const key in groupedByClient) {
    const sorted = groupedByClient[key].sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );
    latestIpByClient[key] = sorted[sorted.length - 1]?.ip;
  }

  // ---------------- CLIENT VIEW ----------------
  if (focusedClient) {
    const clientLogs = groupedByClient[focusedClient] || [];

    const ipStats = {};
    for (const log of clientLogs) {
      ipStats[log.ip] ||= { count: 0, last: log.time };
      ipStats[log.ip].count++;
      if (new Date(log.time) > new Date(ipStats[log.ip].last))
        ipStats[log.ip].last = log.time;
    }

    const ipsSorted = Object.entries(ipStats).sort(
      (a, b) => b[1].count - a[1].count
    );

    return (
      <div className="min-h-screen bg-black text-gray-200 font-mono p-6">
        <Link
          href={"?password="+process.env.NEXT_PUBLIC_PWD}
          className="mb-4 inline-block px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">
          Client: {focusedClient}
        </h1>
        <div className="text-sm text-gray-400 mb-4">
          Latest IP: <code>{latestIpByClient[focusedClient]}</code>
        </div>

        <div className="mb-4 border border-gray-700 rounded-lg p-3">
          <details>
            <summary className="text-lg font-semibold mb-2">
              Connected IPs
            </summary>
            <ul className="space-y-1 text-sm">
              {ipsSorted.map(([ip, info]) => (
                <li
                  key={ip}
                  className="flex justify-between border-b border-gray-800 pb-1"
                >
                  <code>{ip}</code>
                  <span className="text-gray-400">
                    {info.count}× • {format(info.last)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="space-y-2">
          {clientLogs.map((log, i) => {
            const { parsed } = log;

            let color = "text-gray-300";
            if (parsed.password)
              color = parsed.success ? "text-green-400" : "text-red-400";
            else if (parsed.finish) color = "text-blue-400";
            else if (parsed.setPage !== undefined) color = "text-yellow-400";

            return (
              <div key={i} className={`flex flex-col ${color}`}>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 text-xs w-28 shrink-0">
                    {format(log.time)}
                  </span>

                  {parsed.read && (
                    <span className="flex items-center gap-1">
                      {parsed.read.startsWith("private") && (
                        <Lock size={14} className="text-gray-400" />
                      )}
                      Opened <code>{parsed.read}</code>
                    </span>
                  )}

                  {parsed.password && (
                    <span>
                      Tried password <code>{parsed.password}</code>
                      {parsed.success && " ✓ Success"}
                    </span>
                  )}

                  {parsed.finish && (
                    <span>
                      Finished reading <code>{parsed.read || "?"}</code>
                    </span>
                  )}

                  {parsed.setPage !== undefined && (
                    <span>
                      Changed page to <code>{parsed.setPage}</code>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-6">
      <h1 className="text-2xl font-bold mb-4">User Action Monitor</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search IP or Client ID..."
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm outline-none focus:border-amber-400"
        />
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (search) params.set("ip", search);
            else params.delete("ip");
            router.push("?" + params.toString());
          }}
          className="px-3 py-2 bg-amber-600 rounded text-sm hover:bg-amber-500"
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearch("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("ip");
            router.push("?" + params.toString());
          }}
          className="px-3 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      {sortedDays.map((day) => {
        const logsOfDay = days[day];

        const grouped = logsOfDay.reduce((acc, log) => {
          let obj = {};
          try {
            obj = JSON.parse(log.text);
          } catch { }

          const key = obj.clientId || log.ip;

          if (!focusedClient && search.length > 0) {
            const ipMatch = log.ip?.toLowerCase().includes(search);
            const idMatch = obj.clientId?.toLowerCase().includes(search);

            if (!ipMatch && !idMatch) return acc;
          }

          acc[key] ||= [];
          acc[key].push({ ...log, parsed: obj });
          return acc;
        }, {});

        const sortedIps = Object.keys(grouped);
        if (sortedIps.length === 0) return null;

        return (
          <details
            key={day}
            className="mb-6 border border-gray-700 rounded-lg p-3"
            open
          >
            <summary className="text-xl font-semibold mb-2">{day}</summary>

            {sortedIps.map((ip) => {
              const logs = grouped[ip];
              const id = logs[0]?.parsed?.clientId;
              const last = logs[logs.length - 1];

              const pageSuccess = {};
              for (const l of logs) {
                if (!l.parsed.password) continue;
                const page = l.parsed.read;
                if (!page) continue;

                if (l.parsed.success) pageSuccess[page] = true;
                else if (!(page in pageSuccess)) pageSuccess[page] = false;
              }

              const pages = [
                ...new Set(logs.map((l) => l.parsed.read).filter(Boolean)),
              ];

              return (
                <div
                  key={ip}
                  className="mb-3 border border-gray-700 rounded-lg p-3"
                >
                  <Link
                    href={`?password=${process.env.NEXT_PUBLIC_PWD}&client=${id || ip}`}
                    className="text-lg font-semibold hover:text-amber-300"
                  >
                    {id ? `Client ${id}` : ip}{" "}
                    <span className="text-gray-400">
                      ({format(last.time)})
                    </span>
                  </Link>

                  <div className="text-xs text-gray-500">
                    Latest IP: <code>{latestIpByClient[id || ip]}</code>
                  </div>

                  <div className="mt-1 text-sm flex flex-wrap gap-1">
                    {pages.map((p, i) => {
                      const isPrivate = p.startsWith("private/");
                      const unlocked = pageSuccess[p];

                      const color = unlocked
                        ? "bg-green-800 text-green-300"
                        : isPrivate
                          ? "bg-red-800 text-red-300"
                          : "bg-gray-800 text-gray-300";

                      return (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded ${color}`}
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </details>
        );
      })}
    </div>
  );
}