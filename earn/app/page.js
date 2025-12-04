"use client";
import { useEffect, useState } from "react";
import { format } from "timeago.js";
import {
  FolderOpen,
  FolderClosed,
  FileText,
  FileLock,
  FolderOpenDot,
  FolderLockIcon,
} from "lucide-react";

const hidden = ["static"];

function toTitle(str) {
  return str
    .replace(/\.txt$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(d) {
  return format(new Date(d));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ blog }) {
  return (
    <a
      href={`/${blog.href}`}
      className="flex items-start gap-2 bg-zinc-900 text-zinc-100 p-3 rounded-xl font-sans shadow hover:shadow-lg transition-all border border-transparent hover:border-zinc-700 group"
    >
      {blog.private ? (
        <FileLock className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors shrink-0 mt-0.5" />
      ) : (
        <FileText className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <h2
          className={`text-base font-bold truncate group-hover:text-${
            blog.private ? "red" : "blue"
          }-400 transition-colors`}
        >
          {blog.title}
        </h2>
        <div className="text-xs text-zinc-400 mt-1 space-y-0.5 leading-snug">
          <p className="hover:text-green-300 font-semibold transition-colors">
            {formatDate(blog.created)}
          </p>
          {blog.modified !== blog.created && (
            <p className="hover:text-orange-300 transition-colors">
              Updated {timeAgo(blog.modified)}
            </p>
          )}
          <p className="truncate hover:text-blue-300 transition-colors">
            ETag: {blog.etag}
          </p>
          {false && blog.type && (
            <p className="hover:text-purple-300 transition-colors">
              Type: {blog.type}
            </p>
          )}
          {blog.length && (
            <p className="hover:text-pink-300 transition-colors">
              Size: {blog.length} bytes
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

function Folder({ path, name, root = false }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchFolder() {
      try {
        const res = await fetch(`/api/list/blog${path === "/" ? "" : path}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch folder", path, err);
      }
    }
    fetchFolder();
  }, [path]);

  if (!data)
    return <p className="text-xs text-zinc-500 mt-3">Loading {name}…</p>;

  const blogs = Object.values(data).filter((h) => h.type === "text/plain");
  const folders = Object.values(data).filter(
    (h) => h.type === "application/x-directory" && h.href !== path
  );

  const displayName = toTitle(name);

  return (
    <div className="my-3">
      {!root && (
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 cursor-pointer font-bold text-zinc-200 hover:text-white transition-colors`}
        >
          {path.startsWith("/private") ? (
            <>
              {open ? (
                <FolderOpenDot className="w-5 h-5 text-red-400" />
              ) : (
                <FolderLockIcon className="w-5 h-5 text-zinc-400" />
              )}
            </>
          ) : (
            <>
              {open ? (
                <FolderOpen className="w-5 h-5 text-blue-400" />
              ) : (
                <FolderClosed className="w-5 h-5 text-zinc-400" />
              )}
            </>
          )}
          {displayName}
        </div>
      )}

      <div
        className={`pl-4 mt-2 border-l border-zinc-700 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
          open || root ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {blogs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {blogs.map((b, i) => {
              const filename = b.href.split("/").pop();
              return (
                <BlogCard
                  key={i}
                  blog={{
                    ...b,
                    href: b.href.replace(/^\//, "").replace(".txt", ""),
                    title: toTitle(filename),
                    private: path.startsWith("/private"),
                  }}
                />
              );
            })}
          </div>
        )}

        {folders.map((f, i) => {
          const folderName = f.href.split("/").filter(Boolean).pop();
          if (hidden.includes(folderName)) return null;
          return <Folder key={i} path={f.href} name={folderName} />;
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [lastLog, setLastLog] = useState(null);
  let [readPassLog, setReadPassLog] = useState(false);

  function getClientId() {
    if (typeof window === "undefined") return;
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
    if (typeof window === "undefined") return;
    if (typeof entry === "string") entry = { text: entry };
    entry.client = true;
    entry.clientId = getClientId();
    const str = JSON.stringify(entry);
    if ((lastLog || 0) === str) return;

    setLastLog(str);
    fetch(
      `https://log.alimad.co/api/log?text=${encodeURIComponent(
        str
      )}&channel=blog-alimad-co-prod-3`
    ).catch(() => {});
  }
  useEffect(() => {
    log({ read: "/" });
  }, []);
  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Blogs</h1>
      <Folder path="/" name="" root />
    </div>
  );
}
