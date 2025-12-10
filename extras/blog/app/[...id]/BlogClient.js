"use client";
import { useState, useEffect, useMemo } from "react";
import { parseToReact } from "@/lib/parser";
import PasswordForm from "./PasswordForm";
import { format } from "timeago.js";
import {
  Share2,
  Link2,
  ArrowUp,
  Code2,
  ArrowRight,
  ArrowLeft,
  Hash,
  FileTextIcon,
} from "lucide-react";
import LiveStatus from "@/components/live";

const commonStyle =
  "flex items-center text-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-white shadow-sm hover:shadow-md font-medium bg-white enabled:cursor-pointer transition-all active:bg-white active:text-black enabled:hover:bg-black enabled:hover:text-white disabled:opacity-50";

function BlogActions({ url, path }) {
  const [copied, setCopied] = useState(false);
  const pageUrl =
    typeof window !== "undefined" ? url || window.location.href : url || "";

  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: pageUrl });
      } catch {}
      return;
    }
    await copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function toTop() {
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 items-center pt-2 text-black font-bold">
      <button
        type="button"
        onClick={onShare}
        className={commonStyle}
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>

      <button
        type="button"
        onClick={copyLink}
        className={commonStyle}
        aria-label="Copy link"
      >
        <Link2 className="h-4 w-4" />
        <span>{copied ? "Copied!" : "Copy Link"}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          window.open(
            `https://cdn.alimad.co/f/Personal/blog/${path}.txt`,
            "_blank"
          );
        }}
        className={commonStyle}
        aria-label="Scroll to top"
      >
        <Code2 className="h-4 w-4" />
        <span>View Raw</span>
      </button>

      <button
        type="button"
        onClick={toTop}
        className={commonStyle}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
        <span>Back to Top</span>
      </button>
    </div>
  );
}

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

async function decryptAES(base64Data, password) {
  try {
    const buf = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const iv = buf.subarray(0, 12);
    const data = buf.subarray(12);

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("alimad-salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return "failed";
  }
}

const extractText = (n) =>
  !n
    ? ""
    : typeof n === "string"
    ? n
    : Array.isArray(n)
    ? n.map(extractText).join("")
    : n.props?.children
    ? extractText(n.props.children)
    : "";
const paginate = (nodes, per = 10, min = 1200) => {
  let pages = [],
    cur = [],
    chars = 0;
  nodes.forEach((n, i) => {
    chars += extractText(n).length;
    cur.push(n);
    if ((cur.length >= per && chars >= min) || i === nodes.length - 1) {
      pages.push(cur);
      cur = [];
      chars = 0;
    }
  });
  return pages;
};

const ProgressBar = ({ progress }) => (
  <div
    className="fixed top-0 left-0 h-1 bg-white transition-width duration-150 z-50"
    style={{ width: `${progress * 100}%` }}
  />
);
const LoadingScreen = ({ decrypt }) => (
  <div className="w-full mx-auto bg-gray-900 border-2 rounded-2xl border-gray-600 text-red-100 p-4 flex items-center gap-3">
    <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
    {decrypt && <p className="font-medium">Decrypting...</p>}
    {!decrypt && <p className="font-medium">Loading content...</p>}
  </div>
);
const Pagination = ({ page, total, change, open }) => (
  <div className="border border-t-1 border-t-gray-500 border-transparent mt-0 pt-0">
    <div className="grid grid-cols-2 lg:grid-cols-4 items-center gap-2 mt-6 leading-4 text-black">
      <button
        disabled={!page}
        onClick={() => change(page - 1)}
        className={commonStyle}
      >
        <ArrowLeft className="h-4 w-4" />
        Prev
      </button>
      <span className={commonStyle + " not-lg:hidden"}>
        <FileTextIcon className="h-4 w-4" />
        Page {page + 1}/{total}
      </span>
      <button
        disabled={page === total - 1}
        onClick={() => change(page + 1)}
        className={commonStyle}
      >
        <ArrowRight className="h-4 w-4" />
        Next
      </button>
      <span className={commonStyle + " lg:hidden"}>
        <FileTextIcon className="h-4 w-4" />
        Page {page + 1}/{total}
      </span>
      <button onClick={open} className={commonStyle}>
        <Hash className="h-4 w-4" />
        Go to page
      </button>
    </div>
  </div>
);
const JumpPopup = ({ total, val, setVal, onClose, onSubmit }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#000a] backdrop-blur z-50">
    <form
      onSubmit={onSubmit}
      className="bg-black border-2 rounded-2xl border-gray-400 p-6 shadow max-w-sm w-full"
    >
      <h3 className="text-lg font-semibold mb-3">Jump to page</h3>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full p-2 border rounded mb-4 border-transparent outline-2 outline-gray-800 focus:outline-white transition-all"
        placeholder={`1 - ${total}`}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className={
            commonStyle.replace("bg-white ", "") + " text-white bg-black"
          }
        >
          Cancel
        </button>
        <button type="submit" className={commonStyle + " text-black"}>
          Go
        </button>
      </div>
    </form>
  </div>
);
const PrevPreview = ({ prev = [] }) => (
  <div className="relative overflow-hidden text-gray-400 text-sm leading-snug -mt-2 mb-4 select-none pointer-events-none">
    {prev}
    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black" />
  </div>
);
const BlogContent = ({
  raw,
  metadata,
  visible,
  page,
  path,
  total,
  change,
  open,
  pages = [],
}) => (
  <>
    <article
      className="prose max-w-none mt-4 break-words"
      style={{ lineHeight: 0 }}
    >
      <h1 className="text-3xl font-bold mb-4">
        {(raw.split("\n")[0] || "").replace(/^#\s*/, "") || "Untitled"}
      </h1>
      {page > 0 && pages[page - 1] && (
        <PrevPreview prev={pages[page - 1].slice(-6)} />
      )}
      {visible}
      {total > 1 && (
        <Pagination
          page={page}
          total={total}
          change={change}
          open={open}
          className="m-0"
        />
      )}
      <BlogActions url={window.location} path={path} />
    </article>
    <div className="flex text-sm text-gray-500 mt-4 pt-4 border-t-1 border-t-gray-500">
      {toTitle(metadata.href.split("/").pop())} • {formatDate(metadata.created)}
      {metadata.created != metadata.modified && (
        <p> • {formatDate(metadata.modified)}</p>
      )}{" "}
      • {metadata.length} bytes • {metadata.etag} {<LiveStatus app={"blog"+path}/>}
    </div>
  </>
);

export default function BlogClient({ initialRaw, id, password, metadata }) {
  id = id.join("/");
  useEffect(() => {
    const logC = { read: id };
    if (password) logC.password = password;
    log(logC);
  }, [id, password]);
  const isPrivate = id.startsWith("private") || id.startsWith("/private");
  const [raw, setRaw] = useState(""),
    [loading, setLoading] = useState(true),
    [err, setErr] = useState(""),
    [authed, setAuthed] = useState(false),
    [pw, setPw] = useState(""),
    [progress, setProgress] = useState(0),
    [page, setPage] = useState(0),
    [jumpOpen, setJumpOpen] = useState(false),
    [jumpVal, setJumpVal] = useState("");
  const [lastLog, setLastLog] = useState(null);
  let [readPassLog, setReadPassLog] = useState(false);

  function getClientId() {
    if (typeof window === "undefined") return
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
    if (typeof window === "undefined") return
    if (typeof entry === "string") entry = { text: entry };
    entry.client = true;
    let readPassEntry = false;
    if (entry.read && entry.client && !entry.success) {
      readPassEntry = true;
    }
    entry.clientId = getClientId();
    const str = JSON.stringify(entry);
    if ((lastLog || 0) === str || (readPassEntry && readPassLog)) return;

    setLastLog(str);
    fetch(
      `https://log.alimad.co/api/log?text=${encodeURIComponent(
        str
      )}&channel=blog-alimad-co-prod-3`
    ).catch(() => {});
    if (readPassEntry) setReadPassLog(true);
  }
  useEffect(() => {
    if (!isPrivate) load();
    if (isPrivate) load();
    const sp = localStorage.getItem(`blog_page_${id}`);
    if (sp) setPage(+sp);
  }, [authed, id]);
  async function load() {
    setLoading(true);
    try {
      if (isPrivate) {
        initialRaw = await decryptAES(initialRaw, password, id);
        if (initialRaw == "failed") {
          setErr("Incorrect password");
          setLoading(false);
          return;
        }
        log({ read: id, password: password, success: true });
      }
      setRaw(initialRaw);
      setLoading(false);
      setTimeout(restoreScroll, 250);
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }
  function restoreScroll() {
    const m = JSON.parse(localStorage.getItem("blog_pos") || "{}"),
      y = m[`${id}_${page}`];
    if (y) window.scrollTo({ top: y, behavior: "smooth" });
  }
  useEffect(() => {
    let last = [],
      int;
    let done = false;
    const onScroll = () => {
      const y = scrollY,
        t = Date.now();
      last.push({ y, t });
      last = last.filter((p) => t - p.t <= 1e4);
    };
    int = setInterval(() => {
      const now = Date.now(),
        p = last.find((p) => now - p.t >= 8e3);
      if (p) {
        const m = JSON.parse(localStorage.getItem("blog_pos") || "{}");
        m[`${id}_${page}`] = p.y;
        localStorage.setItem("blog_pos", JSON.stringify(m));
      }
      const total = document.documentElement.scrollHeight - innerHeight;
      let pr = total > 0 ? scrollY / total : 0;
      setProgress(pr);
      if (pr > 0.99 && !done) {
        done = true;
        log({ finish: true });
      }
    }, 1e3);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      clearInterval(int);
    };
  }, [id, page]);
  const submitPw = (e) => {
    e.preventDefault();
    if (pw === process.env.NEXT_PUBLIC_BLOG_PASSWORD) {
      localStorage.setItem(`blog_auth_${id}`, "true");
      setAuthed(true);
      setErr("");
    } else setErr("Incorrect password");
  };
  const changePage = (n) => {
    setPage(n);
    log({ setPage: n });
    localStorage.setItem(`blog_page_${id}`, n);
    setTimeout(() => {
      const m = JSON.parse(localStorage.getItem("blog_pos") || "{}"),
        y = m[`${id}_${n}`];
      scrollTo({ top: y ?? 0, behavior: "smooth" });
    }, 250);
  };
  const handleJump = (e) => {
    e.preventDefault();
    const n = parseInt(jumpVal, 10) - 1;
    if (!isNaN(n) && n >= 0 && n < pages.length) {
      changePage(n);
      setJumpOpen(false);
    }
  };
  const paras = useMemo(
    () => (raw ? parseToReact(raw.split("\n").slice(1).join("\n")) : []),
    [raw]
  );
  const pages = useMemo(() => paginate(paras, 10, 1200), [paras]);
  const visible = pages[page] || [];
  return (
    <div className="relative font-sans break-words">
      <ProgressBar progress={progress} />
      <>
        {(loading || !raw) && !err && <LoadingScreen decrypt={isPrivate} />}
        {err && err == "Incorrect password" ? (
          <PasswordForm wrong={true} id={id} />
        ) : (
          <p className="text-red-500">{err}</p>
        )}
        {!loading && raw && (
          <BlogContent
            raw={raw}
            metadata={metadata}
            visible={visible}
            page={page}
            path={id}
            total={pages.length}
            change={changePage}
            open={() => setJumpOpen(true)}
            pages={pages}
          />
        )}
      </>
      {jumpOpen && (
        <JumpPopup
          total={pages.length}
          val={jumpVal}
          setVal={setJumpVal}
          onClose={() => setJumpOpen(false)}
          onSubmit={handleJump}
        />
      )}
    </div>
  );
}
