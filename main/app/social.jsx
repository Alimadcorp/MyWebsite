"use client";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { SiDiscord, SiGithub, SiGmail, SiInstagram, SiItchdotio, SiSlack, SiYoutube, SiSnapchat, SiRoblox, SiReddit } from "@icons-pack/react-simple-icons";

function LinkedIn({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
        </svg>
    );
}

const WebButton = ({ src, title, href }) => {
    src = src?.startsWith("http") ? src : "https://bomberfish.ca" + src;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="my-1 mx-1 w-[88px] h-[31px]">
            <img src={src} alt={title} title={title} className="pixel" />
        </a>
    );
};

export function Socials({ sizer = 24 }) {
    return (<>
        <a href="https://alimad.itch.io" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiItchdotio size={sizer} /></a>
        <a href="https://youtube.com/@alimadco" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiYoutube size={sizer} /></a>
        <a href="https://github.com/Alimadcorp" target="_blank" className="border-2 border-accent text-accent hover:bg-accent-dark/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiGithub size={sizer} /></a>
        <a href="https://discord.gg/fY4Q8rKsz4" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiDiscord size={sizer} /></a>
        <a href="https://linkedin.com/in/alimadco" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><LinkedIn size={sizer} /></a>
        <a href="https://roblox.com/users/10698961932/profile" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiRoblox size={sizer} /></a>
        <a href="https://hackclub.slack.com/team/U08LQFRBL6S" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiSlack size={sizer} /></a>
        <a href="https://instagram.com/alimadco" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiInstagram size={sizer} /></a>
        <a href="mailto:alimad.co.ltd@gmail.com" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><SiGmail size={sizer} /></a>
        <a href="tel:+923124503700" target="_blank" className="border-2 border-accent text-accent hover:bg-accent/30 rounded-full p-1 px-2 text-center items-center flex justify-center"><Phone size={sizer} /></a>
    </>);
}

export function Webring() {
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
            }
        }
        loadWebring();
    }, []);
    const prev = () => setIndex((index - 1 + members.length) % members.length);
    const next = () => setIndex((index + 1) % members.length);
    if (!members.length) {
        return (
            <></>
        );
    }
    const current = members[index];
    return (
        <div className="mt-6 sm:text-left w-full max-w-5xl text-center">
            <p>Check out my friends' cool websites:</p>
            <div className="flex max-sm:justify-center items-center sm:items-start gap-3 mt-2 w-full">
                <button
                    onClick={prev}
                    className="text-4xl font-bold dark:text-accent dark:hover:text-accent-light transition cursor-pointer"
                >
                    ‹
                </button>
                <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dark:text-accent border dark:border-accent px-4 py-2 rounded-md dark:hover:bg-accent/20 transition text-base sm:text-lg w-full max-w-xs"
                >
                    {current.member}
                </a>
                <button
                    onClick={next}
                    className="text-4xl font-bold dark:text-accent dark:hover:text-accent-light transition cursor-pointer"
                >
                    ›
                </button>
            </div>
        </div>
    );
}

export function WebButtons() {
    return (<span className="flex flex-wrap gap-0 max-w-4xl justify-center items-center">
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
            src="https://bomberfish.ca/buttons/acon-gets-a-button-animated.gif"
            title="Acon Dev"
            href="https://aconlin.com/"
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
            src="https://authenyo.xyz/images/button.gif"
            title="authenyo"
            href="https://authenyo.xyz"
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
    </span>);
}