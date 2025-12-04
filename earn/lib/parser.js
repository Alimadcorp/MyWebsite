import React from "react";
import * as Icons from "lucide-react";
import { Emoji } from "./emoji";

const tokenRe =
  /(`[^`]+`)|(\*[^*]+\*)|(_[^_]+_)|(~{2}[^~]+~{2})|(__[^_]+__)|(\[[^\]]+\])|(%[A-Za-z0-9_-]+%)|(:[a-zA-Z0-9_+-]+:)|(https?:\/\/[^\s]+)/g;

import { useState } from "react";

function Image({ url, name, j }) {
  const [error, setError] = useState(false);

  if (error)
    return (
      <a className="relative group w-[400px] h-[200px] flex items-center justify-center rounded-xl overflow-hidden cursor-pointer" href={url} target="_blank">
        <div className="absolute inset-0 bg-gray-800/70 rounded-xl"></div>
        <div className="relative w-full h-full flex items-center justify-center rounded-xl transition duration-300 group-hover:scale-105 overflow-hidden">
          <p className="text-lg text-gray-300 font-mono z-10 group-hover:text-black group-hover:font-bold transition-all">
            {name || "404 Media Not found"}
          </p>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[rainbow_3s_linear_infinite] rounded-xl"></div>
        </div>
      </a>
    );

  return (
    <div
      key={j}
      className="relative flex-shrink-0 w-full h-[60vh] flex items-center justify-center bg-black/5"
    >
      <img
        src={url}
        alt={name || ""}
        className="max-h-full max-w-full object-contain border-0 rounded-2xl"
        loading="lazy"
        onError={() => setError(true)}
      />
      {name && (
        <div className="absolute bottom-1 right-1 text-sm text-white bg-gray-800/70 px-1 backdrop-blur-sm text-center w-fit break-words rounded-xl">
          {name}
        </div>
      )}
    </div>
  );
}

const escapeHtml = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );

const toPascal = (s) =>
  s.replace(/(^|[^A-Za-z0-9]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());

function parseInline(line, i) {
  let last = 0,
    parts = [],
    m;
  while ((m = tokenRe.exec(line))) {
    if (m.index > last) parts.push(escapeHtml(line.slice(last, m.index)));
    const t = m[0];
    if (t[0] === "`")
      parts.push(
        <code
          key={i + "c" + m.index}
          className="px-1 rounded bg-gray-800 text-green-500"
        >
          {t.slice(1, -1)}
        </code>
      );
    else if (t.startsWith("~~"))
      parts.push(<del key={i + "d" + m.index}>{t.slice(2, -2)}</del>);
    else if (t.startsWith("__"))
      parts.push(<u key={i + "u" + m.index}>{t.slice(2, -2)}</u>);
    else if (t[0] === "*")
      parts.push(<strong key={i + "b" + m.index}>{t.slice(1, -1)}</strong>);
    else if (t[0] === "_")
      parts.push(<em key={i + "i" + m.index}>{t.slice(1, -1)}</em>);
    else if (t[0] === "[")
      parts.push(
        <span key={i + "g" + m.index} className="text-gray-500 font-bold">
          {t}
        </span>
      );
    else if (t.startsWith("http")) {
      const [url, label] = t.split("|");
      parts.push(
        <a
          key={i + "a" + m.index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-600 underline"
        >
          {label || url}
        </a>
      );
    } else if (t[0] === ":" && t.at(-1) === ":")
      parts.push(<Emoji key={i + "e" + m.index} name={t.slice(1, -1)} />);
    else if (t[0] === "%") {
      const rawName = t.slice(1, -1),
        pascal = toPascal(rawName);
      let Icon =
        Icons[rawName] ||
        Icons[rawName + "Icon"] ||
        Icons[pascal] ||
        Icons[pascal + "Icon"];
      parts.push(
        Icon ? (
          <span
            key={i + "ic" + m.index}
            className="inline-block align-text-bottom relative"
            style={{ transform: "translateY(-3px)" }}
          >
            <Icon size="1em" />
          </span>
        ) : (
          escapeHtml(t)
        )
      );
    }
    last = m.index + t.length;
  }
  if (last < line.length) parts.push(escapeHtml(line.slice(last)));
  return parts.map((p, j) =>
    typeof p === "string" ? (
      <span key={i + "s" + j} dangerouslySetInnerHTML={{ __html: p }} />
    ) : (
      p
    )
  );
}

function parseSummaryBlocks(lines, i) {
  if (!lines[i].startsWith(":::summary")) return null;

  const title = lines[i].slice(":::summary".length).trim();
  let body = [];
  let depth = 1,
    j = i + 1;

  for (; j < lines.length; j++) {
    if (lines[j].startsWith(":::summary")) {
      depth++;
      body.push(lines[j]);
    } else if (lines[j].startsWith(":::") && --depth === 0) {
      break;
    } else {
      body.push(lines[j]);
    }
  }

  const node = (
    <details key={"sum" + i} className="my-3">
      <summary className="cursor-pointer text-blue-200 text-lg font-semibold">
        {title}
      </summary>
      <div className="pl-4 space-y-2">{parseToReact(body.join("\n"))}</div>
    </details>
  );

  return { node, next: j };
}

function parseMediaBlock(lines, i) {
  const mediaItems = [];
  let j = i;

  while (j < lines.length) {
    const res = lines[j].match(/^<([^>]+)>$/);
    if (!res) break;

    const raw = res[1].trim();
    let [url, name] = raw.split("|");
    if (!url) break;

    let node = null;
    let imnode = <Image url={url} name={name} j={j} />;
    if (/\.(jpe?g|png|gif|webp)$/i.test(url)) {
      node = imnode;
    } else if (/\.mp4$/i.test(url)) {
      node = (
        <div
          key={j}
          className="flex-shrink-0 w-full h-full flex items-center justify-center bg-black/5"
        >
          <video
            src={url}
            controls
            className="max-h-full max-w-full object-contain"
            title={name || ""}
          />
        </div>
      );
    } else if (/\.mp3$/i.test(url)) {
      node = (
        <div key={j} className="text-center w-[80vw] lg:w-[45vw]">
          <audio src={url} controls className="w-full" />
          {name && <div className="mt-2 text-sm text-gray-600">{name}</div>}
        </div>
      );
    } else {
      node = imnode;
    }

    if (node) mediaItems.push(node);
    j++;
  }

  if (mediaItems.length === 0) return null;

  const container = (
    <div className="flex items-center justify-center" key={"meda" + i}>
      <div
        key={"media" + i}
        className="relative my-6 text-center"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#555 transparent",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          WebkitScrollbarWidth: "thin",
        }}
      >
        <div className="flex overflow-x-auto overflow-y-hidden gap-4 h-fit bg-transparent p-4">
          {mediaItems.map((item, idx) => (
            <div key={idx} className="flex-shrink-0 w-fit h-full">
              {item}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-black/60 to-transparent rounded-l-xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-black/60 to-transparent rounded-r-xl" />
      </div>
    </div>
  );

  return { node: container, next: j - 1 };
}

export function parseToReact(raw) {
  if (!raw) return null;
  const lines = raw.split(/\r?\n/);
  const nodes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      nodes.push(<div key={"br" + i} style={{ height: 8 }} />);
      continue;
    }

    const summaryRes = parseSummaryBlocks(lines, i);
    if (summaryRes) {
      nodes.push(summaryRes.node);
      i = summaryRes.next;
      continue;
    }

    const mediaRes = parseMediaBlock(lines, i);
    if (mediaRes) {
      nodes.push(mediaRes.node);
      i = mediaRes.next;
      continue;
    }

    if (line.startsWith("##"))
      nodes.push(
        <h2
          key={i}
          style={{ color: "#ddd" }}
          className="my-3 text-2xl font-semibold"
        >
          {parseInline(line.slice(2).trim(), i)}
        </h2>
      );
    else if (line.startsWith("#"))
      nodes.push(
        <h1
          key={i}
          style={{ color: "#ddd" }}
          className="my-4 text-3xl font-bold"
        >
          {parseInline(line.slice(1).trim(), i)}
        </h1>
      );
    else
      nodes.push(
        <p key={i} className="my-3 leading-7 text-base">
          {parseInline(line, i)}
        </p>
      );
  }
  return nodes;
}
