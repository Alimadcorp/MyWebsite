"use client";
import {
  LockKeyholeIcon,
  Loader2,
  AlertCircle,
  FileLockIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PasswordForm({ id, wrong }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  if (typeof id !== "string") {
    id = id.join("/");
  }
  let [lastLog, setLastLog] = useState(null);
  let [readPassLog, setReadPassLog] = useState(null);

  function getClientId() {
    let id = localStorage.getItem("clientId");
    if (!id) {
      id = Array.from({ length: 4 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join("");
      localStorage.setItem("clientId", id);
    }
    return id;
  }

  function log(entry) {
    if (typeof entry === "string") entry = { text: entry };
    entry.client = true;
    let readPassEntry = false;
    if (entry.read && entry.client && !entry.success) {
      readPassEntry = true;
    }
    entry.clientId = getClientId();
    const str = JSON.stringify(entry);
    if (lastLog === str || (readPassEntry && readPassLog)) return;

    setLastLog(str);
    fetch(
      `https://log.alimad.co/api/log?text=${encodeURIComponent(
        str
      )}&channel=blog-alimad-co-prod-3`
    ).catch(() => {});
    if (readPassEntry) setReadPassLog(true);
  }
  useEffect(() => {
    let logC = { read: id };
    log(logC);
  });

  function submit(e) {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    window.location = `/${id}?password=${encodeURIComponent(pw)}`;
  }

  return (
    <form
      onSubmit={submit}
      className="font-sans p-8 space-y-6 max-w-sm mx-auto bg-black rounded-2xl shadow-md border border-gray-700"
    >
      <div className="flex items-left justify-left gap-2 text-white">
        <LockKeyholeIcon className="w-6 h-6 text-red-500" />
        <h1 className="text-xl font-bold">Enter Password</h1>
      </div>
      <div className="text-gray-400 text-sm flex items-center gap-1">
        <FileLockIcon size={16} /> This is an encrypted post.
      </div>
      {wrong && (
        <div className="w-full bg-red-900 border-l-4 border-red-600 text-red-100 p-3 flex items-center font-sans">
          <AlertCircle className="w-5 h-5 mr-3 text-red-100" />
          <span className="font-medium">Wrong password</span>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          disabled={loading}
          className="rounded-lg px-4 py-2 w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-400 transition-all disabled:opacity-50"
          placeholder="Password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Unlock"
          )}
        </button>
      </div>
    </form>
  );
}
