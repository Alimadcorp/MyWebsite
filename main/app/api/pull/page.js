
import { format } from "timeago.js";

async function fetchLogs() {
  const res = await fetch(
    "https://log.alimad.co/api/pull?channel=alimad-co-visit-2&pwd=" + process.env.NEXT_PUBLIC_PWD,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data?.logs || [];
}

export default async function UserActionMonitor({ searchParams }) {
  let logs = [];

  async function g() {
    let pwd = (await searchParams).password;
    if (pwd !== process.env.NEXT_PUBLIC_PWD) return;
    logs = await fetchLogs();
  }
  await g();

  const parsed = logs.map((l) => {
    let obj = {};
    try {
      obj = JSON.parse(decodeURIComponent(l.text));
    } catch { }
    return { ...l, parsed: obj };
  });

  const ipToClient = {};
  for (const log of parsed) {
    const cid = log.parsed.clientId?.trim();
    if (cid) ipToClient[log.ip] = cid;
  }

  for (const log of parsed) {
    if (!log.parsed.clientId && ipToClient[log.ip]) {
      log.parsed.clientId = ipToClient[log.ip];
    }
  }

  const grouped = {};

  for (const log of parsed) {
    const clientId = log.parsed.clientId || "unknown";
    const ip = log.ip;

    grouped[clientId] ||= {};
    grouped[clientId][ip] ||= [];
    grouped[clientId][ip].push(log);
  }

  const sortedClients = Object.keys(grouped).sort((a, b) => {
    const ta = Math.max(
      ...Object.values(grouped[a]).flat().map((l) => new Date(l.time).getTime())
    );
    const tb = Math.max(
      ...Object.values(grouped[b]).flat().map((l) => new Date(l.time).getTime())
    );
    return tb - ta;
  });

  const keyColors = {
    client: "text-blue-400",
    referer: "text-emerald-400",
    host: "text-yellow-400",
    clientId: "text-cyan-400 font-semibold",
    type: "text-purple-400 font-semibold",
  };

  const renderObj = (obj) => (
    <div className="flex flex-col gap-0.5">
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} className="flex gap-1 text-xs sm:text-sm">
          <span className="text-gray-500">"{k}"</span>
          <span className="text-gray-500">:</span>
          <span className={keyColors[k] || "text-gray-300"}>
            {JSON.stringify(v)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
        Visitor Logs
      </h1>

      <div className="flex flex-col gap-4">
        {sortedClients.map((clientId) => {
          const ipGroups = grouped[clientId];

          const visibleIPs = Object.keys(ipGroups);
          if (visibleIPs.length === 0) return null;

          return (
            <details
              key={clientId}
              open
              className="rounded-xl border border-gray-800 bg-zinc-950/70"
            >
              <summary className="px-4 py-2 cursor-pointer text-cyan-300 font-semibold">
                {clientId}
              </summary>

              <div className="flex flex-col divide-y divide-gray-800">
                {visibleIPs.sort((a, b) => {
                  const latestA = Math.max(...ipGroups[a].map(l => new Date(l.time)));
                  const latestB = Math.max(...ipGroups[b].map(l => new Date(l.time)));
                  return latestB - latestA;
                }).map((ip) => {
                  const logs = ipGroups[ip].sort(
                    (a, b) => new Date(b.time) - new Date(a.time)
                  );

                  const isTarget = ip.startsWith("39.63");

                  return (
                    <div
                      key={ip}
                      className={`p-3 sm:p-4 ${isTarget ? "border-l-4 border-pink-500" : ""
                        }`}
                    >
                      <div className="text-xs text-gray-400 mb-2">
                        IP: {ip} ({logs.length} logs)
                      </div>

                      {logs.map((log, j) => (
                        <div key={j} className="mb-3">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>{format(log.time)}</span>
                            <span>
                              {new Date(log.time).toLocaleTimeString()}
                            </span>
                          </div>
                          {renderObj(log.parsed)}
                        </div>
                      ))}
                    </div>
                  );
                })
                }
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
