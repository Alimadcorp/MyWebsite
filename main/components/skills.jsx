"use client";

import { useState } from "react";
import { ChevronDown, Gamepad, Globe, GlobeIcon, Videotape } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiHtml5,
  SiJavascript,
  SiCss,
  SiNextdotjs,
  SiReact,
  SiExpo,
  SiFigma,
  SiFramer,
  SiExpress,
  SiFirebase,
  SiVercel,
  SiGithub,
  SiSupabase,
  SiBlender,
  SiUnity,
  SiGodotengine,
  SiYoutube,
  SiDavinciresolve
} from "@icons-pack/react-simple-icons";

const Processing = () => {
  return <><img src="http://up.alimad.co/f/processing.png" width={19}></img></>
}

const P5js = () => {
  return <><img src="http://up.alimad.co/f/p5js.png" width={19}></img></>
}

const Camtasia = () => {
  return <><img src="http://up.alimad.co/f/camtasia.png" width={19}></img></>
}

const scrollingItems = [
  { name: "Surviellance", link: null },
  { name: "Youtubing", link: null },
  { name: "Yapping", link: null },
  { name: "Art", link: null },
  { name: "Blog writing", link: "https://blog.alimad.co" },
  { name: "Integrations", link: null },
  { name: "AI/ML", link: null },
  { name: "Crafting", link: null },
  { name: "Forging", link: null },
  { name: "Networking", link: null },
  { name: "Native app development", link: "https://besideu.alimad.co" },
  { name: "Cybersecurity", link: null },
  { name: "Intelligence services", link: null },
  { name: "Math", link: null },
  { name: "Mailing", link: null },
  { name: "Hacking", link: "https://hackclub.com" },
  { name: "Clubbing", link: null },
  { name: "Procrastination", link: null },
];

const skillsData = [
  {
    title: "Web Development",
    experience: "2 yrs",
    sections: [
      {
        name: "Frontend",
        items: [
          { name: "HTML5", icon: SiHtml5, link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { name: "CSS3", icon: SiCss, link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
          { name: "JavaScript", icon: SiJavascript, link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
          { name: "React", icon: SiReact, link: "https://react.dev" },
          { name: "Next.js", icon: SiNextdotjs, link: "https://nextjs.org" },
          { name: "React Native", icon: SiExpo, link: "https://reactnative.dev" },
          { name: "p5.js", icon: P5js, link: "https://p5js.org" },
          { name: "Figma", icon: SiFigma, link: "https://figma.com" },
          { name: "Framer", icon: SiFramer, link: "https://framer.com" },
        ],
      },
      {
        name: "Backend",
        items: [
          { name: "Express.js", icon: SiExpress, link: "https://expressjs.com" },
          { name: "Firebase", icon: SiFirebase, link: "https://firebase.google.com" },
          { name: "Supabase", icon: SiSupabase, link: "https://supabase.com" },
          { name: "Vercel", icon: SiVercel, link: "https://vercel.com" },
          { name: "GitHub", icon: SiGithub, link: "https://github.com" },
        ],
      },
    ],
  },
  {
    title: "Game Development",
    experience: "5 yrs",
    sections: [
      {
        name: "Engines",
        items: [
          { name: "Unity", icon: SiUnity, link: "https://unity.com" },
          { name: "Godot", icon: SiGodotengine, link: "https://godotengine.org" },
          { name: "Blender Game Engine", icon: SiBlender, link: "https://download.blender.org/release/Blender2.79/" },
        ],
      },
      {
        name: "Native",
        items: [
          { name: "p5.js", icon: P5js, link: "https://p5js.org" },
          { name: "Processing", icon: Processing, link: "https://processing.org" },
        ],
      },
    ],
  },
  {
    title: "Editing & Animation",
    experience: "6 yrs",
    sections: [
      {
        name: "Tools",
        items: [
          { name: "Camtasia", icon: Camtasia, link: "https://www.techsmith.com/screen-capture.html" },
          { name: "Blender", icon: SiBlender, link: "https://blender.org" },
          { name: "DaVinci", icon: SiDavinciresolve, link: "https://www.blackmagicdesign.com/products/davinciresolve" },
          { name: "YouTube", icon: SiYoutube, link: "https://www.youtube.com/@alimadcorp" },
        ],
      },
    ],
  },
];

function SkillAccordion({ skill }) {
  const [expandedSection, setExpandedSection] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full font-mono border-[1.5] border-gray-500/70"
    >
      <div className="p-4 relative group overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-accent">
            {skill.title}
          </h3>
          <span className="text-xs font-medium text-gray-500 px-1 py-1">
            {skill.experience}
          </span>
        </div>
      </div>

      <div className="border-t text-gray-700 dark:text-gray-300 border-gray-500/20 p-2 pl-3">
        {skill.sections.map((section, idx) => (
          <div key={idx}>
            <button
              onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
              className="w-full cursor-pointer hover:text-black dark:hover:text-white flex items-center justify-start gap-1 p-1"
            >
              <span className="font-semibold group-hover:font-bold">{section.name}</span>
              <motion.div
                animate={{ rotate: expandedSection === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedSection === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 flex flex-wrap gap-1">
                    {section.items.map((item, itemIdx) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.a
                          key={itemIdx}
                          href={item.link || "#"}
                          target={item.link ? "_blank" : "_self"}
                          rel={item.link ? "noopener noreferrer" : ""}
                          onClick={(e) => !item.link && e.preventDefault()}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1 p-1 border border-gray-500/0 hover:border-accent hover:bg-accent/20 group"
                        >
                          {IconComponent && (
                            <IconComponent
                              size={18}
                              className="text-accent group-hover:text-accent transition-colors"
                            />
                          )}
                          <span className="text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
                            {item.name}
                          </span>
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ScrollingText({ font }) {
  const items = [...scrollingItems, ...scrollingItems];
  return (
    <div className="relative w-full overflow-hidden whitespace-nowrap">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-black to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-black to-transparent" />

      <motion.div
        className="flex w-max"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {items.map((item, idx) => (
          <>{!item.link && <p
            key={idx}
            className="group relative inline-block px-8 py-2 decoration-accent decoration-2"
          >
            <span
              className={`${font} text-2xl md:text-4xl`}
            >
              {item.name}
            </span>
          </p>}
            {item.link && <a
              key={idx}
              href={item.link || "#"}
              className="group relative inline-block px-8 py-2 decoration-accent decoration-2 cursor-pointer hover:underline"
            >
              <span
                className={`${font} text-2xl md:text-4xl`}
              >
                {item.name}
              </span>
            </a>}
          </>
        ))}
      </motion.div>
    </div>
  );
}

export default function Skills({ font }) {
  font = font == "font-sans" ? "font-mono" : font;
  return (
    <div className="w-full max-w-6xl pb-7">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left space-y-4 my-5"
      >
        <h2 className="text-3xl md:text-5xl font-bold">
          Experience
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {skillsData.map((skill, idx) => (
          <SkillAccordion key={idx} skill={skill} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-8"
      >
        <h3 className="text-center text-lg text-foreground/70 mb-6">
          And more...
        </h3>
        <ScrollingText font={font} />
      </motion.div>
    </div>
  );
}
