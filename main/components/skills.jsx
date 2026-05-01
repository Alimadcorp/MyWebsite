"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiHtml5,
  SiJavascript,
  SiCss3,
  SiNextdotjs,
  SiReact,
  SiReactnative,
  SiP5js,
  SiFigma,
  SiFramer,
  SiExpress,
  SiFirebase,
  SiVercel,
  SiGithub,
  SiSupabase,
  SiBlender,
  SiUnity,
  SiGodot,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

// Scrolling text items - customize these with your social links
const scrollingItems = [
  { name: "Let's build something amazing", link: null },
  { name: "Full Stack Developer", link: "https://github.com/alimadcorp" },
  { name: "Game Dev Enthusiast", link: null },
  { name: "3D Artist", link: "https://www.youtube.com/@alimadcorp" },
  { name: "Video Creator", link: "https://www.youtube.com/@alimadcorp" },
];

// Skills data
const skillsData = [
  {
    title: "Web Development",
    experience: "2 yrs",
    description: "Full-stack web development with modern frameworks",
    sections: [
      {
        name: "Frontend",
        items: [
          { name: "HTML5", icon: SiHtml5, link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { name: "CSS3", icon: SiCss3, link: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
          { name: "JavaScript", icon: SiJavascript, link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
          { name: "React", icon: SiReact, link: "https://react.dev" },
          { name: "Next.js", icon: SiNextdotjs, link: "https://nextjs.org" },
          { name: "React Native", icon: SiReactnative, link: "https://reactnative.dev" },
          { name: "p5.js", icon: SiP5js, link: "https://p5js.org" },
          { name: "Figma", icon: SiFigma, link: "https://figma.com" },
          { name: "Framer", icon: SiFramer, link: "https://framer.com" },
        ],
      },
      {
        name: "Backend",
        items: [
          { name: "Express.js", icon: SiExpress, link: "https://expressjs.com" },
          { name: "Firebase", icon: SiFirebase, link: "https://firebase.google.com" },
          { name: "GitHub", icon: SiGithub, link: "https://github.com" },
        ],
      },
      {
        name: "Database",
        items: [
          { name: "Supabase", icon: SiSupabase, link: "https://supabase.com" },
          { name: "Firebase", icon: SiFirebase, link: "https://firebase.google.com" },
          { name: "Vercel", icon: SiVercel, link: "https://vercel.com" },
        ],
      },
    ],
  },
  {
    title: "Game Development",
    experience: "5 yrs",
    description: "Cross-platform game development across multiple engines",
    sections: [
      {
        name: "Game Engines",
        items: [
          { name: "Unity", icon: SiUnity, link: "https://unity.com" },
          { name: "Godot", icon: SiGodot, link: "https://godotengine.org" },
          { name: "Blender Game Engine", icon: SiBlender, link: "https://blender.org" },
        ],
      },
      {
        name: "Native",
        items: [
          { name: "p5.js", icon: SiP5js, link: "https://p5js.org" },
          { name: "Processing", icon: SiP5js, link: "https://processing.org" },
        ],
      },
    ],
  },
  {
    title: "3D Animation",
    experience: "2 yrs",
    description: "3D modeling and animation with professional tools",
    sections: [
      {
        name: "Tools",
        items: [
          { name: "Blender", icon: SiBlender, link: "https://blender.org" },
          { name: "YouTube", icon: SiYoutube, link: "https://www.youtube.com/@alimadcorp" },
        ],
      },
    ],
  },
  {
    title: "Video Editing",
    experience: "3 yrs",
    description: "Professional video production and post-processing",
    sections: [
      {
        name: "Tools",
        items: [
          { name: "Camtasia", icon: null, link: "https://www.techsmith.com/screen-capture.html" },
          { name: "Blender", icon: SiBlender, link: "https://blender.org" },
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
      className="w-full border-2 border-accent/30 rounded-lg overflow-hidden bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/50 transition-colors"
    >
      <div className="p-6 cursor-pointer hover:bg-accent/10 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-accent">{skill.title}</h3>
          <span className="text-sm font-medium text-accent/70 bg-accent/10 px-3 py-1 rounded-full">
            {skill.experience}
          </span>
        </div>
        <p className="text-foreground/70">{skill.description}</p>
      </div>

      <div className="border-t border-accent/20">
        {skill.sections.map((section, idx) => (
          <div key={idx} className="border-b border-accent/10 last:border-b-0">
            <button
              onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
              className="w-full p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
            >
              <span className="font-semibold text-foreground/80">{section.name}</span>
              <motion.div
                animate={{ rotate: expandedSection === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} className="text-accent/60" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedSection === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-accent/5 border-t border-accent/10"
                >
                  <div className="p-4 flex flex-wrap gap-3">
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
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 hover:border-accent hover:bg-accent/20 transition-all group"
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

function ScrollingText() {
  const [isPaused, setIsPaused] = useState(false);

  // Double the items for seamless looping
  const items = [...scrollingItems, ...scrollingItems];

  return (
    <div className="relative w-full overflow-hidden py-8 bg-gradient-to-r from-background via-accent/5 to-background">
      {/* Left fade gradient */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: isPaused ? 0 : [0, -1920],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {items.map((item, idx) => (
          <motion.a
            key={idx}
            href={item.link || "#"}
            target={item.link ? "_blank" : "_self"}
            rel={item.link ? "noopener noreferrer" : ""}
            onClick={(e) => !item.link && e.preventDefault()}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-accent/40 bg-accent/10 hover:bg-accent/20 hover:border-accent transition-all cursor-pointer text-nowrap"
          >
            <span className="font-semibold text-accent/80 group-hover:text-accent">
              {item.name}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}

export default function Skills() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold">
          <span className="text-accent">Skills</span> & Experience
        </h2>
        <p className="text-foreground/60 max-w-2xl mx-auto">
          A journey through development, design, and digital creation spanning multiple domains
        </p>
      </motion.div>

      {/* Main Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {skillsData.map((skill, idx) => (
          <SkillAccordion key={idx} skill={skill} />
        ))}
      </div>

      {/* Scrolling Text Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-8"
      >
        <h3 className="text-center text-lg font-semibold text-foreground/70 mb-6">
          Things I&apos;m passionate about
        </h3>
        <ScrollingText />
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center pt-8"
      >
        <p className="text-foreground/70 mb-4">
          Interested in collaborating or learning more?
        </p>
        <motion.a
          href="mailto:contact@alimad.co"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-8 py-3 rounded-lg bg-accent text-background font-semibold hover:bg-accent/90 transition-colors"
        >
          Get in Touch
        </motion.a>
      </motion.div>
    </div>
  );
}
