"use client";
/* eslint-disable @next/next/no-img-element */
import LiveStatus from "@/components/live";
import { SiDiscord, SiGithub, SiGmail, SiInstagram, SiItchdotio, SiSlack, SiTwitch, SiYoutube } from "@icons-pack/react-simple-icons";
import { Lightbulb, Phone, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import GitHubCalendar from "react-github-calendar";

function Socials() {
  return (<>
    <a href="https://alimad.itch.io" target="_blank" className="border-2 border-[#FA5C5C] text-[#FA5C5C] hover:bg-[#FA5C5C]/30 rounded-full p-1 px-2"><SiItchdotio size={16} /></a>
    <a href="https://youtube.com/@alimadco" target="_blank" className="border-2 border-red-500 text-red-500 hover:bg-red-500/30 rounded-full p-1 px-2"><SiYoutube size={16} /></a>
    <a href="https://github.com/Alimadcorp" target="_blank" className="border-2 border-gray-400 text-gray-400 hover:bg-gray-700/30 rounded-full p-1 px-2"><SiGithub size={16} /></a>
    <a href="https://discord.gg/fY4Q8rKsz4" target="_blank" className="border-2 border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/30 rounded-full p-1 px-2"><SiDiscord size={16} /></a>
    <a href="https://hackclub.slack.com/team/U08LQFRBL6S" target="_blank" className="border-2 border-[#933294] text-[#933294] hover:bg-[#933294]/30 rounded-full p-1 px-2"><SiSlack size={16} /></a>
    <a href="https://instagram.com/alimadco" target="_blank" className="border-2 border-[#ff41b3] text-[#ff41b3] hover:bg-[#ff41b3]/30 rounded-full p-1 px-2"><SiInstagram size={16} /></a>
    <a href="mailto:alimad.co.ltd@gmail.com" target="_blank" className="border-2 border-[#0022ff] text-[#0022ff] hover:bg-[#0022ff]/30 rounded-full p-1 px-2"><SiGmail size={16} /></a>
    <a href="tel:+923124503700" target="_blank" className="border-2 border-[#64dfd2] text-[#64dfd2] hover:bg-[#64dfd2]/30 rounded-full p-1 px-2"><Phone size={16} /></a>
  </>);
}

const WebButton = ({ src, title, href }) => {
  src = src?.startsWith("http") ? src : "https://bomberfish.ca" + src;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="my-1 mx-1 w-[88px] h-[31px]">
      <img src={src} alt={title} title={title} className="pixel" />
    </a>
  );
};

function Webring() {
  const [members, setMembers] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function loadWebring() {
      try {
        const res = await fetch("https://webring.hackclub.com/members.json");
        let data = await res.json();
        data.push({ member: "ErrorCode0", url: "https://errorcodezero.dev" });
        data.push({ member: "F1nn", url: "https://f1nn.me" });
        setIndex(data.findIndex((m) => m.member === "ErrorCode0"));
        setMembers(data);
      } catch (err) {
        console.error("Failed to load webring:", err);
      }
    }
    loadWebring();
  }, []);

  const prev = () => setIndex((index - 1 + members.length) % members.length);
  const next = () => setIndex((index + 1) % members.length);

  if (!members.length) {
    return (
      <div className="flex justify-left items-center mt-8 text-gray-400">
        Loading Hackclub Webring...
      </div>
    );
  }

  const current = members[index];

  return (
    <div className="mt-6 text-left w-full max-w-4xl">
      <p>Check out my friends' cool websites:</p>
      <div className="flex justify-left items-start gap-3 mt-2 w-full">
        <button
          onClick={prev}
          className="text-4xl font-bold text-cyan-500 hover:text-cyan-300 transition cursor-pointer"
        >
          ‹
        </button>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 border border-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-600/20 transition text-base sm:text-lg w-full max-w-xs"
        >
          {current.member}
        </a>
        <button
          onClick={next}
          className="text-4xl font-bold text-cyan-500 hover:text-cyan-300 transition cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function Counters() {
  const [pageViews, setPageViews] = useState(0);
  const [pageVisitors, setPageVisitors] = useState(0);
  const [ideasCount, setIdeasCount] = useState(0);
  useEffect(() => {
    fetch("https://live.alimad.co/stats?app=alimadhomepage")
      .then(r => r.json())
      .then(d => {
        animateCount(d.uniqueIds, setPageViews);
        animateCount(d.totalPings, setPageVisitors);
      });

    fetch("/api/pull/count")
      .then(r => r.text())
      .then(d => animateCount(Number(d), setIdeasCount));
  }, []);

  function animateCount(target, setter) {
    let current = 0;
    const step = Math.max(1, Math.floor(target / 100));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setter(target);
        clearInterval(interval);
      } else {
        setter(current);
      }
    }, 15);
  }

  const counters = useMemo(() => [
    { label: "Unique Visitors", value: pageViews },
    { label: "Page Views", value: pageVisitors },
    { label: "Total Ideas", value: ideasCount }
  ], [pageViews, pageVisitors, ideasCount]);
  return (<div className="flex flex-wrap gap-2 md:gap-4 justify-center sm:justify-start mt-6 w-full max-w-4xl">
    {counters.map((c, i) => (
      <div key={i} className="flex flex-col items-center justify-center p-1 sm:p-3 rounded-lg border-2 border-cyan-600 bg-white/20 dark:bg-black/20 hover:bg-cyan-900/20 w-24 h-18 sm:w-36 sm:h-24 transition-all">
        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{c.label}</span>
        <span className="text-md sm:text-3xl font-bold text-black dark:text-white">{c.value}</span>
      </div>
    ))}
  </div>);
}

function QuoteOfTheDay() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/quote", { cache: "no-store" });
      const data = await res.json();
      setQuote(data);
    }
    load();
  }, []);

  if (!quote) return <div className="text-gray-500 mt-8 text-left">Loading quote...</div>;

  return (
    <div className="mt-8 p-4 text-justify w-full max-w-4xl mx-auto border-l-4 border-gray-600">
      <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 italic">“{quote.quote}”</p>
      {quote.writer !== "Unknown" && <p className="text-sm text-gray-400 mt-2">- {quote.writer}</p>}
      <p className="text-xs text-gray-500 mt-1">
        {new Date(quote.date).toDateString().replace(" ", ", ")}
      </p>
    </div>
  );
}

function TheFooter() {
  const secrets = [
    { clicks: 50, message: { text: "Is there anyone out there?" } },
    { clicks: 100, message: { text: "The search for life elsewhere is remarkable in out age." } },
    { clicks: 150, message: { text: "We can send spacecraft into space." } },
    { clicks: 200, message: { text: "We can check the radio, to see if there's been any message sent to us lately." } },
    { clicks: 250, message: { text: "We can see this in religion, superstition, and now in science." } },
    { clicks: 300, message: { text: "And it is something that touches the deepest of human concerns;" } },
    { clicks: 314, message: { text: "Are we alone?" } },
  ];


  function log(t) {
    t.clientId = localStorage.getItem("clientId");
    fetch(`/api/post?t=${encodeURIComponent(JSON.stringify(t))}`);
  }

  const [count, setCount] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const clickLock = useRef(false);

  function handleClick() {
    if (clickLock.current) return;
    clickLock.current = true;
    if (count % 10 == 0) log({ type: "heart-click", count });

    setCount(prev => {
      const newCount = prev + 1;

      setRevealed(prevRevealed => {
        const revealedTexts = new Set(prevRevealed.map(r => r.text));
        const newlyUnlocked = secrets
          .filter(s => s.clicks <= newCount && !revealedTexts.has(s.message.text))
          .map(s => s.message);
        return newlyUnlocked.length ? [...prevRevealed, ...newlyUnlocked] : prevRevealed;
      });

      return newCount;
    });

    setTimeout(() => (clickLock.current = false), 30);
  }
  return (
    <div className="mt-6 text-sm text-center text-gray-500 select-none">
      Made with{" "}
      <span
        onClick={handleClick}
        className="animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 cursor-pointer transition-transform active:scale-125"
        title={
          count < 315
            ? `${315 - count} clicks left...`
            : "I don’t care how you define it, but I love you. You deserve love, and you are love."
        }
      >
        ❤️
      </span>{" "}
      by
      <span className="ml-1 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-cyan-300">
        Muhammad Ali
      </span>

      {revealed.map((msg, i) => (
        <div key={msg.text} className="mt-2 animate-fadeIn">
          <p className="dark:text-gray-200 text-gray-800 text-sm">“{msg.text}”</p>
          {msg.author && <p className="text-gray-400 text-xs mt-1">-{msg.author}</p>}
        </div>
      ))}
    </div>
  );
}


export default function Home() {
  const [panel, setPanel] = useState(false);
  const [myIdea, setMyIdea] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const Router = useRouter();
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    async function fetchGitHub() {
      try {
        const res = await fetch("https://api.github.com/users/Alimadcorp/events/public");
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const pushes = data
          .filter(ev => ev.type === "PushEvent")
          .map(ev => ({
            repo: ev.repo?.name || "unknown",
            date: ev.created_at,
            message: ev.message || "Message",
            url: `https://github.com/${ev.repo?.name}`,
            ref: ev.payload?.ref,
            head: ev.payload?.head,
            before: ev.payload?.before
          }));

        setCommits(pushes.slice(0, 16));
      } catch (err) {
        console.error("GitHub fetch error:", err);
      }
    }

    fetchGitHub();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setDarkMode(saved !== "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const host = location.host;
    const referer = document.referrer;
    if (!(userAgent.includes('Googlebot') || userAgent.includes('Bingbot') || userAgent.includes('vercel') || userAgent.includes('OpenStatus') || userAgent.includes('UptimeRobot'))) {
      fetch(`/api/post?t=${encodeURIComponent(JSON.stringify({ client: userAgent, referer, host, clientId: localStorage.getItem("clientId") }))}`);
    }
  }, []);

  useEffect(() => {
    const iframeSrc = "https://blog.alimad.co/api/cook"
    const iframe = document.createElement("iframe")
    iframe.src = iframeSrc
    iframe.style.display = "none"
    document.body.appendChild(iframe)

    const handleMessage = (event) => {
      try {
        const url = new URL(event.origin)
        const host = url.hostname
        if (host !== "blog.alimad.co") {
          return
        }
        if (!event.data || typeof event.data !== "string") return
        if (localStorage.getItem("clientId") == event.data) return
        localStorage.setItem("clientId", event.data)
        iframe.remove()
        window.removeEventListener("message", handleMessage)
        fetch(`/api/post?t=${encodeURIComponent(JSON.stringify({ type: "client", clientId: event.data }))}`);
      } catch (err) {
        console.error("Error handling message:", err)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  async function uploadIdea() {
    const idea = (document.getElementById("ideaForm"))?.value.trim();
    const daButton = document.getElementById("ideaSubmit");
    if (!idea) return;
    daButton.innerHTML = "Submitting...";
    daButton.disabled = true;
    await fetch(`https://madlog.vercel.app/api/log?channel=plzgiveideasss&text=${encodeURIComponent(idea)}&status=IDEA&country=idea`);
    setPanel(false);
    setMyIdea(idea);
    daButton.disabled = false;
  }
  const [songdata, setsongData] = useState(null);
  const [songTop, setSongTop] = useState([]);

  useEffect(() => {
    async function load() {
      const now = await fetch("/api/spotify").then(r => r.json());
      setsongData(now);
      if (!now.playing && songTop.length == 0) {
        const t = await fetch("/api/spotify/top").then(r => r.json());
        setSongTop(t.tracks.slice(0, 7));
      }
    }
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [songTop]);

  return (
    <div className="text-black bg-gray-50 dark:bg-zinc-900 dark:text-white flex flex-col min-h-screen w-full font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      <header className="fixed top-0 w-full h-12 bg-black/90 dark:bg-black/50 backdrop-blur-sm border-b border-gray-800 hidden sm:flex items-center justify-between px-3 sm:px-6 z-50">
        <nav className="flex items-center gap-2">
          <button onClick={() => Router.push('/domains')} className="hidden border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-600/20 px-2 py-1 rounded-sm text-sm transition">Domains</button>
          <button onClick={() => Router.push('/subdomains')} className="border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-600/20 px-2 py-1 rounded-sm text-sm transition cursor-pointer">Subdomains</button>
          <div className="hidden sm:flex gap-1"><Socials /></div>
        </nav>
        <div className="flex items-center gap-2"><LiveStatus /></div>
      </header>

      <main className="flex flex-col flex-grow mt-0 sm:mt-12 px-6 overflow-x-hidden sm:px-8 py-10 sm:py-14 items-center text-center sm:text-left bg-gradient-to-br from-zinc-200 via-gray-300 to-white border-gray-200 dark:from-zinc-900 dark:via-gray-900 dark:to-black border-t dark:border-gray-800 w-full">
        <div className="max-w-4xl w-full flex">
          <div className="max-w-4xl w-full">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 text-cyan-400">Hello, World!</h1>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-3">This is Muhammad Ali's website!</p>
            <a href="https://blog.alimad.co/e" className="text-cyan-500 underline text-sm sm:text-base mb-3 hidden">I am currently unavailable</a>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{myIdea ? `One "${myIdea}" coming up!` : 'Keep giving ideas...'}</p>
            <div className="grid sm:hidden items-center gap-2 mt-3 max-w-4xl">
              <button onClick={() => Router.push('/subdomains')} className="border-2 border-gray-800 text-gray-700 dark:border-gray-200 dark:text-gray-300 hover:bg-indigo-600/20 px-2 py-2 rounded-sm text-sm transition cursor-pointer">Subdomains</button>
              <div className="flex sm:hidden gap-1"><Socials /></div>
            </div>
            <Webring />
            <div className="sm:hidden mt-3 flex items-center gap-2 w-full text-center"><LiveStatus /></div>
            <Counters />
            {(songdata && songdata.playing) && (
              <div className="flex flex-col gap-3 mt-3 p-3 rounded-xl bg-black/20 border border-white/10 w-full max-w-sm">
                <div className="font-semibold text-lg">Listening</div>
                <a href={songdata.url} target="_blank" className="flex gap-3 items-center">
                  <img src={songdata.cover} alt="" className="w-14 h-14 rounded-md" />
                  <div className="flex flex-col">
                    <div className="font-semibold text-cyan-500">{songdata.title}</div>
                    <div className="text-sm opacity-70">{songdata.artist}</div>
                  </div>
                </a>
              </div>
            )}
            {(songdata && !songdata.playing) && (
              <div className="flex md:hidden flex-col gap-3 p-3 mt-3 rounded-xl bg-black/20 border border-white/10 w-full max-w-sm">
                <div className="font-semibold text-lg">Top Tracks</div>
                <div className="flex flex-col gap-2">
                  {songTop.map((t, i) => (
                    <a
                      key={i}
                      href={t.url}
                      target="_blank"
                      className="flex gap-3 items-center"
                    >
                      <div className="w-5 ml-1 text-3xl font-semibold text-cyan-400">{i + 1}</div>
                      <img src={t.cover} alt="" className="w-10 h-10 rounded-md hidden" />
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-cyan-400 text-left">{t.title}</div>
                        <div className="text-xs text-white opacity-70 text-left">{t.artist}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(songdata && !songdata.playing) && (
            <div className="hidden md:flex flex-col gap-3 p-3 rounded-xl bg-black/20 border border-white/10 w-full max-w-sm">
              <div className="font-semibold text-lg">Top Tracks</div>
              <div className="flex flex-col gap-2">
                {songTop.map((t, i) => (
                  <a
                    key={i}
                    href={t.url}
                    target="_blank"
                    className="flex gap-3 items-center"
                  >
                    <div className="w-5 ml-1 text-3xl font-semibold text-cyan-400">{i + 1}</div>
                    <img src={t.cover} alt="" className="w-10 h-10 rounded-md hidden" />
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-cyan-400">{t.title}</div>
                      <div className="text-xs text-white opacity-70">{t.artist}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <QuoteOfTheDay />

        <div className="mt-8 w-full max-w-4xl hidden">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-cyan-400">Recent GitHub Commits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[40vh] sm:max-h-[80vh] pb-4 px-2">
            {commits.map((c, i) => (
              <a key={i} href={c.url} target="_blank" className="bg-gray-200 dark:bg-gray-800 p-3 rounded-md shadow-lg hover:shadow-cyan-500/50 transition flex flex-col border-2 border-transparent hover:border-cyan-400/50">
                <p className="font-mono text-xs sm:text-sm truncate text-gray-800 dark:text-gray-200">{c.message}</p>
                <p className="text-xs text-gray-500 mt-1">{c.repo}</p>
                <p className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center mt-8 w-full overflow-x-auto">
          <GitHubCalendar username="Alimadcorp" />
        </div>

        <div className="grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-6 dark:grid hidden">
          {[
            "https://stats.github.alimad.co/api?username=alimadcorp&show_icons=true&theme=dark&count_private=true",
            "https://stats.github.alimad.co/api/top-langs/?username=alimadcorp&layout=compact&theme=dark",
            "https://lanyard-profile-readme.vercel.app/api/888954248199549030?idleMessage=Not%20Active%20Rn&showDisplayName=true&theme=dark"
          ].map((src, i) => (
            <img key={i} src={src} alt="Stat" className="w-full h-60 object-contain rounded-lg" />
          ))}
        </div>
        <div className="grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-6 dark:hidden grid">
          {[
            "https://stats.github.alimad.co/api?username=alimadcorp&show_icons=true&theme=light&count_private=true",
            "https://stats.github.alimad.co/api/top-langs/?username=alimadcorp&layout=compact&theme=light",
            "https://lanyard-profile-readme.vercel.app/api/888954248199549030?idleMessage=Not%20Active%20Rn&showDisplayName=true&theme=light"
          ].map((src, i) => (
            <img key={i} src={src} alt="Stat" className="w-full h-60 object-contain rounded-lg" />
          ))}
        </div>

        <span className="flex flex-wrap gap-0  max-w-4xl">
          <WebButton
            src="https://cdn.alimad.co/f/static/ecz.png"
            title="ErrorCode0"
            href="https://errorcodezero.dev"
          />
          <WebButton
            src="/buttons/hackclub.gif"
            title="Hack Club"
            href="https://hack.club"
          />
          <WebButton
            src="/button.gif"
            title="BomberFish"
            href="https://bomberfish.ca/"
          />
          <WebButton
            src="/buttons/ce88x31.gif"
            title="velzie.d"
            href="https://velzie.rip"
          />
          <WebButton
            src="/buttons/thinlqd.gif"
            title="ThinLiquid"
            href="https://thinliquid.dev"
          />
          <WebButton
            src="/buttons/foxmossbutton.gif"
            title="FoxMoss"
            href="https://foxmoss.com"
          />
          <WebButton
            src="/buttons/k8.gif"
            title="thememesniper"
            href="https://thememesniper.dev"
          />
          <WebButton
            src="/buttons/cvfd.gif"
            title="notfire"
            href="https://notfire.cc"
          />
          <WebButton
            src="/buttons/kopper.png"
            title="kopper"
            href="https://w.on-t.work"
          />
          <WebButton
            src="/buttons/melon.gif"
            title="melontini"
            href="https://melontini.me"
          />
          <WebButton
            src="/buttons/aol-sucks.gif"
            title="Good riddance."
            href="https://help.aol.com/articles/dial-up-internet-to-be-discontinued"
          />
          <WebButton
            src="/buttons/affection.gif"
            title="<3"
          />
          <WebButton
            src="/buttons/besteyes2.gif"
            title="How else?"
          />
          <WebButton
            src="/buttons/sun.gif"
            title="Godspeed, Sun."
          />
          <WebButton
            src="/buttons/firefox.gif"
            title="Firefox is EVIL!"
            href="https://lunduke.locals.com/post/5871895/mozilla-firefox-goes-anti-privacy-pro-advertising"
          />
          <WebButton
            src="/buttons/smoke.gif"
            title="Smokepowered"
            href="https://smokepowered.com"
          />
          <WebButton
            src="/buttons/blazed.png"
            title="Epic MegaBlazed"
            href="https://epicblazed.com"
          />
          <WebButton
            src="/buttons/beos_now_anim.gif"
            title="Download Haiku!"
            href="https://haiku-os.org"
          />
          <WebButton
            src="/buttons/mariokart.gif"
            title="Play some Mario Kart!"
            href="https://bomberfish.ca/N64Wasm"
          />
          <WebButton
            src="/buttons/iframsuc.gif"
            title="Iframes SUCK!"
          />
          <WebButton
            src="/buttons/eightyeightthirtyone.gif"
            title="88x31"
            href="https://eightyeightthirty.one"
          />
          <WebButton
            src="/buttons/melankorin.gif"
            title="melankorin"
            href="https://melankorin.net"
          />
          <WebButton
            src="/buttons/lucida-2.gif"
            title="Lucida: Free Music. No BS."
            href="https://lucida.to"
          />
          <WebButton
            src="/buttons/newgrounds.gif"
            href="https://newgrounds.com"
            title="Newgrounds!"
          />
          <WebButton
            src="/buttons/modarchive.gif"
            href="https://modarchive.org"
            title="The Mod Archive"
          />
          <WebButton
            src="/buttons/github.gif"
            href="https://github.com/Alimadcorp"
            title="Social Coding!"
          />
          <WebButton
            src="/buttons/javanow.gif"
            title="Java is underrated"
          />
        </span>

        <button onClick={() => setPanel(true)} className="flex items-center gap-2 hover:underline text-sm sm:text-base cursor-pointer mt-4">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
          Give an idea
        </button>
      </main>

      {panel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 text-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
            <button onClick={() => setPanel(false)} className="absolute top-2 right-3 text-xl font-bold hover:text-red-500">✕</button>
            <h2 className="text-xl sm:text-2xl mb-4 font-semibold text-cyan-400">Give your idea</h2>
            <textarea id="ideaForm" placeholder="Type your idea here..." className="w-full min-h-[120px] sm:min-h-[150px] p-3 rounded-md border border-gray-700 bg-gray-800 resize-vertical outline-none focus:outline-cyan-400 focus:outline-2 text-sm sm:text-base" />
            <button onClick={uploadIdea} id="ideaSubmit" className="mt-4 w-full flex items-center justify-center bg-cyan-500 text-black py-2 rounded-md hover:opacity-80 transition gap-2 text-sm sm:text-base">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              Upload to the checklist
            </button>
          </div>
        </div>
      )}

      <footer className="flex gap-4 flex-wrap items-center justify-center py-6 text-cyan-400 border-t border-gray-800 mt-auto">
        <TheFooter />
      </footer>
    </div>
  );
}
