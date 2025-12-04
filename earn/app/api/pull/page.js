import { format } from "timeago.js";
import Link from "next/link";
import { Lock } from "lucide-react";

const GREYED_IDS = new Set(["EHCX", "MHPI"]);

async function fetchLogs() {
  const res = await fetch(
    "https://log.alimad.co/api/pull?channel=blog-alimad-co-prod-3&pwd=PASSWORDISBANANA",
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data?.logs || [];
}

function groupByDay(logs) {
  const grouped = {};
  for (const log of logs) {
    const date = new Date(log.time).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(log);
  }
  return grouped;
}

export default async function UserActionMonitor({ searchParams }) {
  searchParams = await searchParams;
  if (searchParams.password !== "PASSWORDISBANANA") {
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

  const logs = await fetchLogs();
  const days = groupByDay(logs);
  const sortedDays = Object.keys(days).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const focusedClient = searchParams.client || null;

  const groupedByClient = {};
  for (const log of logs) {
    let obj = {};
    try {
      obj = JSON.parse(log.text);
    } catch {}
    const key = obj.clientId || log.ip;
    groupedByClient[key] ||= [];
    groupedByClient[key].push({ ...log, parsed: obj });
  }
  for (const key in groupedByClient) {
    groupedByClient[key].sort((a, b) => new Date(a.time) - new Date(b.time));
    let lastRead = null;
    for (const log of groupedByClient[key]) {
      const parsed = log.parsed || {};
      if (parsed.read) {
        lastRead = parsed.read;
      }
      if (parsed.finish && !parsed.read && lastRead) {
        log.parsed = { ...parsed, read: lastRead };
      }
    }
  }

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
    const pages = [
      ...new Set(clientLogs.map((l) => l.parsed.read).filter(Boolean)),
    ];
    const privatePages = pages.filter((p) => p.startsWith("private/"));
    let correct = 0,
      incorrect = 0;

    for (const log of clientLogs) {
      if (log.parsed.password) {
        if (log.parsed.success) correct++;
        else incorrect++;
      }
    }

    return (
      <div className="min-h-screen bg-black text-gray-200 font-mono p-6">
        <Link
          href="?password=PASSWORDISBANANA"
          className="mb-4 inline-block px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-4">Client: {focusedClient}</h1>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-gray-400">Pages Opened</div>
            <div className="text-xl font-bold text-amber-300">
              {pages.length}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-gray-400">Private Pages</div>
            <div className="text-xl font-bold text-red-400">
              {privatePages.length}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-gray-400">Correct</div>
            <div className="text-xl font-bold text-green-400">{correct}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-gray-400">Incorrect</div>
            <div className="text-xl font-bold text-red-400">{incorrect}</div>
          </div>
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
                  <span>
                    <code>{ip}</code>
                  </span>
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

  const allLogs = logs;
  let totalVisits = 0;
  let totalPrivate = 0;
  let correctPrivate = 0;
  let incorrectPrivate = 0;
  const pageStats = {};
  const pageDetails = {};
  const lastReadByClient = {};

  for (const log of allLogs) {
    let obj = {};
    try {
      obj = JSON.parse(log.text);
    } catch {}
    const key = obj.clientId || log.ip;
    if (obj.read) {
      lastReadByClient[key] = obj.read;
    } else if (obj.finish && !obj.read && lastReadByClient[key]) {
      obj.read = lastReadByClient[key];
    }
    if (obj.read) {
      totalVisits++;
      pageStats[obj.read] = (pageStats[obj.read] || 0) + 1;
      pageDetails[obj.read] ||= { visits: 0, finished: 0, wrong: 0, right: 0 };
      pageDetails[obj.read].visits++;
      if (obj.finish) pageDetails[obj.read].finished++;
      if (obj.password) {
        if (obj.success) pageDetails[obj.read].right++;
        else pageDetails[obj.read].wrong++;
      }
      if (obj.read.startsWith("private/")) totalPrivate++;
    }
    if (obj.password) {
      if (obj.success) correctPrivate++;
      else incorrectPrivate++;
    }
  }

  // sort pages by visits using the detailed stats object
  const sortedPages = Object.entries(pageDetails).sort(
    (a, b) => b[1].visits - a[1].visits
  );
  const maxCount = sortedPages[0]?.[1]?.visits || 1;

  // ✅ Overview Mode
  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-6">
      <h1 className="text-2xl font-bold mb-4">User Action Monitor</h1>

      {/* ✅ Overview Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-center">
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xl font-bold text-amber-300">{totalVisits}</div>
          <div className="text-sm text-gray-400">Visits</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xl font-bold text-amber-200">{totalPrivate}</div>
          <div className="text-sm text-gray-400">Private</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xl font-bold text-green-400">
            {correctPrivate}
          </div>
          <div className="text-sm text-gray-400">Correct</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="text-xl font-bold text-red-400">
            {incorrectPrivate}
          </div>
          <div className="text-sm text-gray-400">Wrong</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-300">Pages</h2>
        <div className="flex flex-wrap gap-2">
          {sortedPages.map(([page, stats]) => {
            const intensity = Math.min(1, stats.visits / maxCount);
            const bg = `rgba(34,34,94,${0.3 + 0.4 * intensity})`;
            const color = intensity > 0.5 ? "text-green-300" : "text-gray-300";
            const isPrivate = page.startsWith("private/");
            const border = isPrivate ? "border-red-500/40" : "border-gray-700";
            const diff = stats.wrong - stats.right;
            return (
              <div
                key={page}
                className={`px-2 py-1 rounded border text-sm font-mono flex gap-2 items-center ${border}`}
                style={{ backgroundColor: bg }}
                title={`${page} (Visits: ${stats.visits}, Finished: ${stats.finished}, Wrong: ${stats.wrong}, Right: ${stats.right})`}
              >
                <span className="text-gray-300">{page}</span>
                {stats.visits > 0 && (
                  <span className="text-blue-400 font-bold">{stats.visits}</span>
                )}
                {stats.finished > 0 && (
                  <span className="text-purple-400">{stats.finished}</span>
                )}
                {stats.wrong > 0 && (
                  <span className="text-red-400">{diff}</span>
                )}
                {stats.right > 0 && (
                  <span className="text-emerald-400">{stats.right}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {sortedDays.map((day) => {
        const logsOfDay = days[day];
        const grouped = logsOfDay.reduce((acc, log) => {
          let obj = {};
          try {
            obj = JSON.parse(log.text);
          } catch {}
          const key = obj.clientId || log.ip;
          acc[key] ||= [];
          acc[key].push({ ...log, parsed: obj });
          return acc;
        }, {});
        const sortedIps = Object.keys(grouped).sort((a, b) => {
          const ta = new Date(grouped[a][grouped[a].length - 1].time).getTime();
          const tb = new Date(grouped[b][grouped[b].length - 1].time).getTime();
          return tb - ta;
        });

        return (
          <details
            key={day}
            className="mb-6 border border-gray-700 rounded-lg p-3"
            open
          >
            <summary className="text-xl font-semibold cursor-pointer mb-2">
              {day}
            </summary>
            {sortedIps.map((ip) => {
              const id = grouped[ip][0]?.parsed?.clientId;
              const isGreyed = GREYED_IDS.has(id);
              const opacity = isGreyed ? "opacity-40" : "opacity-100";
              const last = grouped[ip][grouped[ip].length - 1];
              const clientParam = id || ip;

              const passwordMap = {};
              for (const l of grouped[ip]) {
                const p = l.parsed.password;
                if (!p) continue;
                if (l.parsed.success) passwordMap[p] = true;
                else if (!(p in passwordMap)) passwordMap[p] = false;
              }
              const passwords = Object.entries(passwordMap).map(
                ([val, ok]) => ({ val, ok })
              );
              const pages = [
                ...new Set(
                  grouped[ip].map((l) => l.parsed.read).filter(Boolean)
                ),
              ];

              return (
                <div
                  key={ip}
                  className={`mb-3 border border-gray-700 rounded-lg p-3 ${opacity}`}
                >
                  <Link
                    href={`?password=PASSWORDISBANANA&client=${clientParam}`}
                    className="cursor-pointer text-lg font-semibold hover:text-amber-300"
                  >
                    {id ? `Client ${id}` : ip}{" "}
                    <span className="text-gray-400">({format(last.time)})</span>
                  </Link>

                  {pages.length > 0 && (
                    <div className="mt-1 text-sm flex flex-wrap gap-1">
                      {pages.map((p, i) => {
                        const isPrivate = p.startsWith("private/");
                        const unlocked =
                          isPrivate && passwords.some((x) => x.ok);
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
                  )}

                  {passwords.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Passwords:</span>{" "}
                      {passwords.map((p, i) => (
                        <code
                          key={i}
                          className={
                            "mr-2 " + (p.ok ? "text-green-400" : "text-red-400")
                          }
                        >
                          {p.val}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </details>
        );
      })}
    </div>
  );
}
