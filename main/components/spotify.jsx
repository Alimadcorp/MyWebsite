import { useEffect, useState, useRef } from "react";

function fmt(ms) {
  if (ms == null) return "--";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (!h && !m) return `${sec.toString().padStart(2, "0")}s`;
  if (!h) return `${m}m ${sec.toString().padStart(2, "0")}s`;
  return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function parseLRC(lrc) {
  if (!lrc) return [];
  return lrc.split("\n").map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return null;
    const [, m, s, text] = match;
    return { time: (Number(m) * 60 + Number(s)) * 1000, text: text.trim() };
  }).filter(Boolean);
}

function getActiveLineIndex(parsedLyrics, progressMs) {
  if (!parsedLyrics.length || progressMs == null) return -1;
  let idx = parsedLyrics.findIndex((l, i) => {
    const next = parsedLyrics[i + 1];
    return progressMs >= l.time && (!next || progressMs < next.time);
  });
  return idx === -1 ? parsedLyrics.length - 1 : idx;
}

function convertPlainToSynced(lines, durationMs) {
  if (!lines?.length || !durationMs) return [];
  const step = durationMs / lines.length;
  return lines.map((text, i) => ({
    time: Math.floor(i * step),
    text: text.trim()
  }));
}

export default function Spotify({ songData: songDataFromParent, loading: loadingFromParent }) {
  const [localSongData, setLocalSongData] = useState(songDataFromParent);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const perfStartRef = useRef(performance.now());
  const baseProgressRef = useRef(songDataFromParent?.progressMs || 0);
  const lastFetchedRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    if (!localSongData) return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("lyrics_")) localStorage.removeItem(key);
    });

    const id = `${localSongData.title}_${localSongData.artist}`;
    if (lastFetchedRef.current === id) return;
    lastFetchedRef.current = id;

    const key = `lyrics_${id}`.replaceAll(/\s+/g, "_").toLowerCase();
    const cached = localStorage.getItem(key);
    if (cached) {
      const obj = JSON.parse(cached);
      setParsedLyrics(obj.synced ? parseLRC(obj.synced) : obj.plainLines || []);
      return;
    }

    (async () => {
      try {
        const r = await fetch(`/api/spotify/lyrics?title=${encodeURIComponent(localSongData.title)}&artist=${encodeURIComponent(localSongData.artist)}`);
        const j = await r.json();
        if (!j.synced && !j.plain) return;
        const payload = j.synced
          ? { synced: j.synced }
          : { plainLines: j.plain.split("\n").map(l => l.trim() || "♪") }; // add music note for empty lines
        localStorage.setItem(key, JSON.stringify(payload));
        const next = payload.synced
          ? parseLRC(payload.synced)
          : convertPlainToSynced(payload.plainLines || [], localSongData.durationMs || 0);
        setParsedLyrics(next);
      } catch (e) {
        console.error("Failed fetching lyrics", e);
      }
    })();
  }, [localSongData?.title, localSongData?.artist]);

  useEffect(() => {
    if (!songDataFromParent) return;
    setLocalSongData(songDataFromParent);
    perfStartRef.current = performance.now();
    baseProgressRef.current = songDataFromParent.progressMs || 0;
  }, [songDataFromParent]);

  useEffect(() => {
    const tick = setInterval(() => {
      setLocalSongData(d => {
        if (!d || !d.playing || d.progressMs == null || d.durationMs == null) return d;
        const elapsed = baseProgressRef.current + (performance.now() - perfStartRef.current);
        const capped = Math.min(elapsed, d.durationMs);
        return { ...d, progressMs: capped, percentage: Math.min((capped / d.durationMs) * 100, 100) };
      });
    }, 100);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!lyricsContainerRef.current || !parsedLyrics.length || !localSongData?.progressMs) return;

    const container = lyricsContainerRef.current;
    const activeIndex = typeof parsedLyrics[0] === "object"
      && getActiveLineIndex(parsedLyrics, localSongData.progressMs);

    const lineHeight = container.scrollHeight / parsedLyrics.length;
    const targetScroll = Math.max(0, lineHeight * (activeIndex - 2)); // center 5 lines

    container.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [localSongData?.progressMs, parsedLyrics]);


  if (!localSongData) return null;

  return (
    <div className="flex flex-col gap-3 mt-3 p-4 rounded-xl bg-black/20 border border-white/10 w-full text-left">
      <div className="font-semibold text-lg tracking-tight">Listening</div>

      <a href={localSongData.url || "#"} target="_blank" className="flex items-center gap-3 w-full truncate overflow-ellipsis">
        {localSongData.cover && <img src={localSongData.cover} alt="" className="w-16 h-16 rounded-md shadow-sm" />}
        <div className="flex flex-col leading-tight w-full">
          <div className="font-semibold text-cyan-400 truncate">{localSongData.title || "Unknown Title"}</div>
          <div className="text-sm opacity-70 truncate">{localSongData.artist || "Unknown Artist"}</div>
          {localSongData.album && <div className="text-xs opacity-50 truncate">{localSongData.album}</div>}
        </div>
      </a>

      {localSongData.progressMs != null && localSongData.durationMs != null && (
        <div className="w-full grid grid-cols-1 gap-2">
          <div className="w-full h-1 bg-white/10 rounded-md overflow-hidden">
            <div className="h-full transition-all" style={{ width: `${localSongData.percentage || 0}%`, backgroundColor: !loadingFromParent ? "#06b6d4" : "#10b981" }} />
          </div>
          <div className="w-full flex justify-between">
            <div className="text-xs opacity-70 text-left font-mono">{(localSongData.progressMs / localSongData.durationMs * 100).toFixed(2)}%</div>
            <div className="text-xs opacity-70 text-right font-mono">{fmt(localSongData.progressMs)} / {fmt(localSongData.durationMs)}</div>
          </div>
        </div>
      )}

      {parsedLyrics.length > 0 && (
        <div
          ref={lyricsContainerRef}
          className="mt-2 flex flex-col gap-1 max-h-40 text-md text-wrap wrap-break-word"
          style={{ overflow: "hidden", pointerEvents: "none" }}
        >
          {parsedLyrics.map((line, i) => (
            <div key={i} className={i === getActiveLineIndex(parsedLyrics, localSongData.progressMs) ? "text-cyan-400 font-semibold" : "opacity-50"}>
              {typeof line === "object" ? (line.text || "♪") : (line || "♪")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
