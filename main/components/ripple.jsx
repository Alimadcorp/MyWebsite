"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
function DATE({ dateStr }) {
  const date = new Date(dateStr);
  return (
    <time
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
      className="text-[10px] text-gray-500 font-mono"
    >
      {date.toLocaleString()}
    </time>
  );
}
export default function Ripple() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not reach status endpoint."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      {!loading && !error && !data?.present && (
        <main className="min-h-screen bg-black text-white flex items-center font-sans justify-center px-3">
          <div className="w-full max-w-md">
            {(data?.notes?.length > 0 || data?.alerts?.length > 0) && (
              <>
              <div className="space-y-2 mb-4">
                  {data.alerts?.map((alert, i) => (
                    <div key={i} className="border border-yellow-500/30 bg-yellow-500/5 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        alert
                      </div>
                      <p className="text-xs">{alert.text}</p>
                      {alert.url && (
                        <a
                          href={alert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-gray-400 underline"
                        >
                          {alert.url.startsWith("mailto:")
                            ? alert.url.split("@")[1].split("?")[0]
                            : new URL(alert.url).hostname}
                        </a>
                      )}
                    </div>
                  ))}</div>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-[11px] font-mono text-gray-400 mb-2">
                    <span>view notes he left behind</span>
                    <ChevronDown className="w-3 h-3 transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-2">
                    {data.notes?.map((note, i) => {
                      const isNull = note.text === "null";
                      const isLast = note.last;
                      const date = new Date(note.time);
                      if (isNull) {
                        return (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                            <div className="flex-1 h-px bg-white/10" />
                            <span>
                              checked in on {date.toLocaleDateString()}
                            </span>
                            <div className="flex-1 h-px bg-white/10" />
                          </div>
                        );
                      }
                      return (
                        <>
                          <div key={i} className="border border-white/10 bg-white/5 rounded-md px-2 py-1.5">
                            <p className="text-xs">{note.text}</p>
                            < DATE dateStr={note.time} />
                          </div>
                          {isLast && (
                            <div key={i + 1} className="flex items-center gap-2 text-[10px] text-gray-600 font-mono mb-1">
                              <div className="flex-1 h-px bg-white/10" />
                              <span>
                                that's it folks!
                              </span>
                              <div className="flex-1 h-px bg-white/10" />
                            </div>)}
                        </>
                      );
                    })}
                  </div>
                </details></>
            )}
            {!data?.notes?.length && !data?.alerts?.length && (
              <p className="text-xs text-gray-500 mt-4">
                nothing here
              </p>
            )}
            {data?.ip && (
              <p className="text-[10px] text-gray-500 font-mono">
                last seen on {new Date(data?.last).toLocaleString()} with ip {data.ip}
              </p>
            )}
            <p className="mt-1 text-[10px] text-gray-600 font-mono">
              Ripple · Alimad Interlligence · © 2026
            </p>
          </div>
        </main>
      )}
    </>
  );
}