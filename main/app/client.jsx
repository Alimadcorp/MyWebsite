"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from "react";
import GitHubCalendar from "react-github-calendar";
import { ActivityCalendar } from 'react-activity-calendar';
import { Lightbulb, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import GithubStats from "@/components/github";
import LiveStatus from "@/components/live";
import Clock from '@/components/clock'
import StyledComments from "@/components/comments";
import IdeasModal from "@/components/idea";
import Skills from "@/components/skills";

function Counters({ openSecretUI }) {
  const [pageViews, setPageViews] = useState(0);
  const [pageVisitors, setPageVisitors] = useState(0);
  const [ideasCount, setIdeasCount] = useState(0);
  useEffect(() => {
    fetch("https://live.alimad.co/stats?app=alimadhomepage")
      .then(r => r.json())
      .then(d => {
        animateCount(d.uniqueIds, setPageViews);
        animateCount(d.totalPings, setPageVisitors);
      })
      .catch(e => { console.error(e) });
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
  return (
    <>
      <div className="flex flex-wrap gap-2 md:gap-4 justify-center sm:justify-start mt-6 w-full max-w-5xl">
        {counters.map((c, i) => (
          <div key={i} onClick={() => openSecretUI(i)} className="flex flex-col items-center justify-center p-1 sm:p-3 rounded-lg border-2 dark:border-accent bg-white/20 dark:bg-black/20 dark:hover:bg-accent-dark/20 w-full h-18 sm:w-36 sm:h-24 transition-all">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{c.label}</span>
            <span className="text-md sm:text-3xl font-bold text-black dark:text-white">{c.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home({ deployment, font }) {
  const [panel, setPanel] = useState(false);
  const [myIdea, setMyIdea] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [wakatimeActivity, setWakatimeActivity] = useState([]);
  const [showIdeas, setShowIdeas] = useState(false);
  const [streak, setStreak] = useState(0);
  const themer = { light: ['#222', 'rgb(18,186,255)'], dark: ['#222', 'rgb(18,186,255)'] };
  const themer2 = { light: ['#ddd', '#000'], dark: ['#ddd', '#000'] };
  const Router = useRouter();
  const openSecretUI = (i) => setShowIdeas(i == 2 ? true : false);
  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  useEffect(() => {
    fetch("/api/status/wakatime").then(r => r.json()).catch(e => { }).then(d => { setWakatimeActivity(d.days); setStreak(d.streak); }).catch(e => { });
  }, []);
  async function uploadIdea() {
    const idea = (document.getElementById("ideaForm"))?.value.trim();
    const daButton = document.getElementById("ideaSubmit");
    if (!idea) return;
    daButton.innerHTML = "Submitting...";
    daButton.disabled = true;
    await fetch(`https://log.alimad.co/api/log?channel=plzgiveideasss&text=${encodeURIComponent(idea)}&status=IDEA&country=idea`);
    setPanel(false);
    setMyIdea(idea);
    daButton.disabled = false;
  }
  return (
    <div className={font + " text-black bg-white dark:bg-black dark:text-white flex flex-col min-h-screen w-full overflow-x-hidden"}>
      <main className="flex flex-col grow mt-0 sm:mt-12 px-6 overflow-x-hidden sm:px-8 py-10 sm:py-14 items-center text-center sm:text-left bg-transparent w-full">
        <div className="max-w-5xl w-full flex">
          <div className="max-w-5xl w-full">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 dark:text-accent">Hello, World!</h1>
            <p className="text-black dark:text-white text-base sm:text-lg mb-1">I'm Muhammad Ali.</p>
            <p className="text-gray-800 dark:text-gray-300 text-base sm:text-md mb-3">I like programming. Since I first came into contact with it around six/seven years ago, I have been fascinated by the possibilities it opens up. So, I decided to study computer science to become a developer.</p>
            <Clock />
            <button onClick={() => setPanel(true)} className="flex items-center gap-2 hover:underline text-sm sm:text-base justify-center text-center sm:justify-start cursor-pointer mt-2 mb-2 mx-auto sm:mx-1">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              Give an idea
            </button>
            <Skills />
            {myIdea && <p className="text-gray-600 dark:text-gray-400 text-sm">{`One "${myIdea}" coming up!`}</p>}
            <div className="grid sm:hidden grid-cols-1 gap-2 mt-3 max-w-5xl w-full px-2">
              <button
                onClick={() => Router.push('/subdomains')}
                className="border-2 min-w-0 w-full border-accent text-accent
               hover:bg-accent-light/20 px-3 py-2 hover:underline hover:font-black font-semibold text-md 
               transition cursor-pointer rounded-full"
              >
                Subdomains
              </button>
            </div>
            <div className="sm:hidden mt-3 flex items-center gap-2 w-full max-sm:justify-center text-center"><LiveStatus /></div>
            <Counters openSecretUI={openSecretUI} />
          </div>
        </div>
      {false&&<GithubStats streak={streak} />}
        <StyledComments />
        <div className="flex flex-col -mt-8 ml-30 items-end w-full md:-rotate-20">
          <div className="relative flex flex-col items-start">
            <img
              src="https://cdn.alimad.co/f/static/arrow.png"
              alt="Arrow pointing at wakatime activity"
              className="ml-30 -mb-4 w-1/4 scale-y-[-1] dark:invert-0 invert"
            />
            <p className="text-xl md:text-3xl -mb-2 m-0 absolute font-hand left-50 bottom-2 whitespace-nowrap">
              My github activity
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8 w-full overflow-x-auto mb-8">
          <GitHubCalendar username="Alimadcorp" theme={darkMode ? themer : themer2} />
        </div>
        {true && ((Array.isArray(wakatimeActivity) && wakatimeActivity.length > 0) ?
          (<div className="flex justify-center items-center mt-0 w-full overflow-x-auto mb-8">
            <ActivityCalendar data={wakatimeActivity} theme={darkMode ? themer : themer2} labels={{
              totalCount: `${Math.floor(wakatimeActivity.reduce((s, d) => s + d.count, 0) / 60)} hours ${Math.floor(wakatimeActivity.reduce((s, d) => s + d.count, 0) % 60)} minutes spent coding this year`
            }} />
          </div>)
          : (
            <div className="flex justify-center items-center mt-0 w-full overflow-x-auto mb-8">
              <ActivityCalendar loading={true} theme={darkMode ? themer : themer2} />
            </div>))}
        <div className="flex flex-col -mt-4 ml-30 items-end w-full md:-rotate-20">
          <div className="relative flex flex-col items-start">
            <p className="text-xl md:text-3xl -mt-2 m-0 absolute font-hand left-0 whitespace-nowrap">
              My coding activity
            </p>
            <img
              src="https://cdn.alimad.co/f/static/arrow.png"
              alt="Arrow pointing at wakatime activity"
              className="ml-30 mb-4 -mt-6 w-1/4 scale-x-[-1] dark:invert-0 invert"
            />
          </div>
        </div>
      </main>
      {panel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 text-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
            <button onClick={() => setPanel(false)} className="absolute top-2 right-3 text-xl font-bold hover:text-red-500">✕</button>
            <h2 className="text-xl sm:text-2xl mb-4 font-semibold text-accent">Give your idea</h2>
            <textarea id="ideaForm" placeholder="Type your idea here..." className="w-full min-h-[120px] sm:min-h-[150px] p-3 rounded-md border border-gray-700 bg-gray-800 resize-vertical outline-none focus:outline-accent focus:outline-2 text-sm sm:text-base" />
            <button onClick={uploadIdea} id="ideaSubmit" className="mt-4 w-full flex items-center justify-center bg-accent text-black py-2 rounded-md hover:opacity-80 transition gap-2 text-sm sm:text-base">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              Upload to the checklist
            </button>
          </div>
        </div>
      )}
      <IdeasModal isOpen={showIdeas} onClose={() => setShowIdeas(false)} />
    </div>
  );
}
