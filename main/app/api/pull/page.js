import { format } from "timeago.js";

async function fetchLogs() {
  const res = await fetch(
    "https://log.alimad.co/api/pull?channel=alimad-co-visit-2&pwd=PASSWORDISBANANA",
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data?.logs || [];
}

export default async function UserActionMonitor({ searchParams }) {
  searchParams = await searchParams;
  if (searchParams.password !== "PASSWORDISBANANA") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-sans text-center">
        <h1 className="text-9xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-amber-300">
          404
        </h1>
      </div>
    );
  }

  const logs = await fetchLogs();
  const parsed = logs.map((l) => {
    let obj = {};
    try {
      obj = JSON.parse(decodeURIComponent(l.text));
    } catch {}
    return { ...l, parsed: obj };
  });

  const ipToClient = {};
  for (const log of parsed) {
    const cid = log.parsed.clientId?.trim();
    if (cid) ipToClient[log.ip] = cid;
  }

  for (const log of parsed) {
    if (!log.parsed.clientId && ipToClient[log.ip])
      log.parsed.clientId = ipToClient[log.ip];
  }

  const grouped = {};
  for (const log of parsed) {
    const key = log.parsed.clientId || log.ip;
    grouped[key] ||= [];
    grouped[key].push(log);
  }
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const ta = Math.max(...grouped[a].map((l) => new Date(l.time).getTime()));
    const tb = Math.max(...grouped[b].map((l) => new Date(l.time).getTime()));
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
        <div key={k} className="flex flex-wrap gap-1 text-xs sm:text-sm">
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
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 sm:p-6 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
        Visitor Logs
      </h1>
      <div className="flex flex-col gap-4">
        {sortedKeys.map((key, i) => {
          // Reverse logs in each group so newest appear first
          const logs = [...grouped[key]].sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          );
          const lastTime = logs[0]?.time;
          return (
            <details
              key={key}
              open
              className="rounded-xl border border-gray-800 bg-zinc-950/70 backdrop-blur-sm"
            >
              <summary className="cursor-pointer px-4 py-2 flex flex-wrap justify-between items-center hover:bg-zinc-900/70 transition">
                <span className="font-semibold text-sm sm:text-base text-cyan-300">
                  {key}
                </span>
                <span className="text-gray-400 text-xs">
                  {format(lastTime)}
                </span>
                <span className="text-gray-500 text-xs">
                  ({logs.length} logs)
                </span>
              </summary>
              <div className="flex flex-col divide-y divide-gray-800">
                {logs.map((log, j) => (
                  <div key={j} className="p-3 sm:p-4">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>{format(log.time)}</span>
                      <span>{new Date(log.time).toLocaleTimeString()}</span>
                    </div>
                    {renderObj(log.parsed)}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
