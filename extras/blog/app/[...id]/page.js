import React from "react";
import BlogClient from "./BlogClient";
import PasswordForm from "./PasswordForm";
import Link from "next/link";

async function fetchBlogRaw(id) {
  let metadata = {
    "/error.txt": {
      href: "/error.txt",
      created: "2025-01-01T00:00:00Z",
      length: "1",
      type: "text/plain",
      etag: "404",
      modified: "2025-01-01T00:00:00Z",
    },
  };

  if (id[0].startsWith(".")) return { text: "", metadata, code: 404 };

  const cdnUrl = `https://cdn.alimad.co/f/Personal/blog/${id.join("/")}.txt`;
  const metaUrl = `https://blog.alimad.co/api/list/blog/${id.join("/")}.txt`;

  try {
    const [res, res2] = await Promise.allSettled([
      fetch(cdnUrl, { next: { revalidate: 60 } }),
      fetch(metaUrl),
    ]);

    if (res2.status === "fulfilled" && res2.value.ok) {
      try {
        metadata = await res2.value.json();
      } catch {
        // ignore bad metadata JSON
      }
    }

    if (res.status === "fulfilled") {
      if (!res.value.ok) {
        return { text: "", metadata, code: res.value.status };
      }
      const txt = await res.value.text();
      return { text: txt, metadata, code: res.value.status };
    }

    return { text: "", metadata, code: 500 };
  } catch {
    return { text: "", metadata: {}, code: 500 };
  }
}

export async function generateMetadata({ params }) {
  const id = (await params).id;

  try {
    const dat = await fetchBlogRaw(id);
    const raw = dat.text;
    const date = Object.values(dat.metadata)[0]?.created || "";
    const isPrivate = id[0] === "private";

    if (isPrivate) {
      return { title: "Private Blog", description: "This blog is private." };
    }

    const lines = raw.split("\n");
    const blogTitle = (lines[0] || "Untitled").replace(/^#\s*/, "");
    const body = lines.slice(1).join("\n").trim();
    const words = body.split(/\s+/);
    const description =
      words.length <= 30
        ? body || "A post on alimad.co"
        : words.slice(0, 30).join(" ") + "...";

    return {
      title: blogTitle,
      description,
      openGraph: {
        title: blogTitle,
        description: `${description} · A blog by Alimad Co`,
        url: `https://blog.alimad.co/${id.join("/")}`,
        images: [
          {
            url: `https://blog.alimad.co/api/og/${encodeURIComponent(
              blogTitle
            )}?date=${date}`,
            width: 1200,
            height: 630,
            alt: blogTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: blogTitle,
        description: `A blog by Alimad Co · ${description}`,
        images: [
          `https://blog.alimad.co/api/og/${encodeURIComponent(
            blogTitle
          )}?date=${date}`,
        ],
      },
      icons: {
        icon: "https://cdn.alimad.co/f/Personal/blog/static/favicon.png",
      },
    };
  } catch {
    return {
      title: "Blog Not Found",
      description: "The requested blog could not be found",
    };
  }
}

export default async function Page({ params, searchParams }) {
  const id = (await params).id;
  const query = await searchParams;

  let dat;
  try {
    dat = await fetchBlogRaw(id);
    const raw = dat.text;
    const metadata = Object.values(dat.metadata)[0];

    if (!raw || !metadata || dat.code >= 300) throw new Error("404");

    const isPrivate = id[0] === "private";
    if (!isPrivate) {
      return <BlogClient initialRaw={raw} id={id} metadata={metadata} />;
    }

    const password = query?.password || "";
    if (!password) {
      return <PasswordForm id={id} />;
    }

    return (
      <BlogClient
        initialRaw={raw}
        password={password}
        id={id}
        metadata={metadata}
      />
    );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center font-sans">
        <h1 className="text-9xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-amber-300">
          404
        </h1>
        <h1 className="text-2xl font-bold mb-2 text-amber-200">
          Blog not found
        </h1>
        <code className="text-md mb-2 font-bold bg-amber-950 px-1 border-2 rounded-md border-transparent text-amber-200">
          {id.join("/")}
        </code>
        <p className="text-amber-100 mb-4">
          Sorry, we couldn’t find the blog you’re looking for.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-amber-700 transition"
        >
          Go back home
        </Link>
      </div>
    );
  }
}
