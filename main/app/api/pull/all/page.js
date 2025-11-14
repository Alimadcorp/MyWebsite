import { format } from "timeago.js";

const PAGE_SIZE = 50;

async function fetchAllLogs() {
  const params = new URLSearchParams({
    channel: "all",
    pwd: "PASSWORDISBANANA"
  });
  const res = await fetch(`https://log.alimad.co/api/pull?${params}`, {
    cache: "force-cache"
  });
  if (!res.ok) return [];
  const j = await res.json();
  return j.logs || [];
}

export default async function Logs({ searchParams }) {
  const all = (await fetchAllLogs()).reverse();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const page = Math.min(
    Math.max(Number(searchParams.page || 1), 1),
    totalPages
  );

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const logs = all.slice(start, end);

  const parsed = logs.map(l => {
    let parsed = null;
    try { parsed = JSON.parse(decodeURIComponent(l.text)); } catch {}
    return { ...l, parsed };
  });

  const pageNav = (
    <nav className="flex gap-2 my-4">
      {page > 1 && <a href={`?page=${page-1}`}>&lt; Prev</a>}
      {Array.from({length: totalPages}, (_,i)=>i+1)
        .slice(Math.max(0, page-3), page+2)
        .map(n=>(
          <a key={n}
             href={`?page=${n}`}
             className={n===page?"underline font-bold":""}>
            {n}
          </a>
        ))}
      {page < totalPages && <a href={`?page=${page+1}`}>Next &gt;</a>}
    </nav>
  );

  return (
    <div className="p-5 bg-black text-gray-100 font-mono">
      <h1 className="text-xl">General Logs</h1>
      {pageNav}
      <div className="flex flex-col gap-3">
        {parsed.map((log,i)=>(
          <details key={i} open
            className="border border-gray-800 rounded p-2 bg-zinc-950/80">
            <summary className="flex justify-between text-sm cursor-pointer md:flex-row flex-col">
              <span>{log.ip}</span>
              <span>{log.status} • {log.channel}</span>
              <span className="text-gray-500 text-xs">
                {format(log.time)} ({new Date(log.time).toLocaleString()})
              </span>
            </summary>
            <div className="text-xs mt-1">
              {log.parsed ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(log.parsed, null, 2)}
                </pre>
              ) : (
                <code className="break-all">{log.text}</code>
              )}
            </div>
          </details>
        ))}
      </div>
      {pageNav}
    </div>
  );
}
