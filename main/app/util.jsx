"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "timeago.js";

export function QuoteOfTheDay() {
    const [quote, setQuote] = useState(null);
    useEffect(() => {
        async function load() {
            const res = await fetch("/api/quote", { cache: "no-store" });
            const data = await res.json();
            setQuote(data);
        }
        load();
    }, []);
    if (!quote) return <></>;
    return (
        <div className="mt-8 p-4 text-justify w-full max-w-5xl mx-auto border-l-4 border-gray-600 translate-x-1">
            <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 italic">“{quote.quote}”</p>
            {quote.writer !== "Unknown" && <p className="text-sm text-gray-400 mt-2">- {quote.writer}</p>}
            <p className="text-xs text-gray-500 mt-1">
                {new Date(quote.date).toDateString().replace(" ", ", ")}
            </p>
        </div>
    );
}

export function TheFooter({ dpl }) {
    const secrets = [
        { clicks: 50, message: { text: "Is there anyone out there?" } },
        { clicks: 100, message: { text: "The search for life elsewhere is remarkable in our age." } },
        { clicks: 150, message: { text: "We can send spacecraft into outer space." } },
        { clicks: 200, message: { text: "We can check the radio, to see if there's been any message sent to us lately." } },
        { clicks: 250, message: { text: "We can see this in religion, superstition, and now in science." } },
        { clicks: 300, message: { text: "And it is something that touches the deepest of human concerns;" } },
        { clicks: 314, message: { text: "Are we alone?" } },
    ];
    function log(t) {
        t.clientId = localStorage.getItem("clientId");
        fetch(`https://log.alimad.co/api/log?channel=alimad-co-visit-2&text=${encodeURIComponent(JSON.stringify(t))}`);
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
        <div className="flex flex-col items-center justify-center my-0 px-4">
            <div className="mt-10 text-sm text-center text-gray-500 select-none">
                {dpl && <p>{dpl.state} from commit <a className="hover:underline text-gray-200" href={`https://github.com/Alimadcorp/MyWebsite/commit/${dpl.sha}`}>{dpl.sha.slice(0, 6)}</a> by {dpl.source}, <span className="text-gray-200" title={dpl.time.toLocaleString()}>{format(dpl.time)}</span>{dpl.duration != "0s" && <span> in {dpl.duration}</span>}</p>}
                Made with{" "}
                <span
                    onClick={handleClick}
                    className="animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 cursor-pointer transition-transform"
                    title={
                        count < 315
                            ? `${315 - count} clicks left...`
                            : "I don’t care how you define it, but I love you. You deserve love, and you are love."
                    }
                >
                    ❤️
                </span>{" "}
                by
                <span className="ml-1 font-semibold text-transparent bg-clip-text dark:bg-gradient-to-r dark:from-accent dark:to-accent-light bg-accent">
                    Muhammad Ali
                </span>
                {revealed.map((msg, i) => (
                    <div key={msg.text} className="mt-2 animate-fadeIn">
                        <p className="dark:text-gray-200 text-gray-800 text-sm">“{msg.text}”</p>
                        {msg.author && <p className="text-gray-400 text-xs mt-1">-{msg.author}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Note({ target, font }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        function run() {
            setVisible(font == "font-hand" && target.startsWith("39.63"));
        }
        run();
        const timer = setInterval(run, 60000);
        return () => clearInterval(timer);
    }, [target]);
    return (<>
        {visible && <p className={font + " font-bold text-pink-950 dark:text-pink-300 text-2xl mt-3"}>Happy Birthday!</p>}
    </>);
}
