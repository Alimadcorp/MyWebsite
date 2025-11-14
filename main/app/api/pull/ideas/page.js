import { format } from "timeago.js";

async function fetchIdeas() {
  const res = await fetch("https://log.alimad.co/api/pull?channel=plzgiveideasss&pwd=PASSWORDISBANANA", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.logs || [];
}

function ipToNumber(ip) {
  return ip.split(".").reduce((a, b) => a + parseInt(b, 10), 0);
}

export default async function Ideas({ searchParams }) {
  searchParams = await searchParams;
  if (searchParams.password !== "PASSWORDISBANANA") {
    return <div><h1>Page Not Found</h1></div>;
  }

  const logs = await fetchIdeas();

  const mapped = logs.map(log => ({
    id: ipToNumber(log.ip),
    text: log.text,
    time: new Date(log.time)
  }));

  mapped.sort((a, b) => b.time - a.time);

  const grouped = mapped.reduce((acc, log) => {
    const bucket = format(log.time);
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col">
      <h1 className="text-xl md:text-2xl font-black p-4">Ideas</h1>
      <div className="flex-1 bg-black border border-gray-700 rounded-lg mx-4 mb-4 p-3 overflow-y-auto text-sm md:text-base">
        {Object.entries(grouped).map(([bucket, entries]) => (
          <div key={bucket} className="mb-3">
            <div className="text-gray-500 text-sm">[{bucket}]</div>
            {entries.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">
                <span className="text-green-400">{log.id}</span>:{" "}
                <span className="text-white">{log.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
