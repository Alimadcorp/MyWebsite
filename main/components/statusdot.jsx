import {
  Moon,
  CircleMinus,
  CircleSlash,
  Circle,
  Globe,
  MessageCircle,
  Code,
  CircleEllipsis,
  Wallpaper
} from "lucide-react"
import { motion } from "framer-motion"

const modes = {
  online:      { icon: null,         color: "bg-green-500" },
  idle:        { icon: Moon,         color: "text-yellow-500" },
  dnd:         { icon: CircleMinus,  color: "text-red-500" },
  nodisplay:   { icon: CircleSlash,  color: "text-gray-500" },
  offline:     { icon: Circle,       color: "text-zinc-500" },
  browsing:    { icon: Globe,        color: "text-blue-500" },
  chatting:    { icon: MessageCircle,color: "text-purple-500" },
  coding:      { icon: Code,         color: "text-indigo-500" },
  typing:      { icon: CircleEllipsis,color: "text-emerald-500" },
  background:  { icon: Wallpaper,    color: "text-slate-500" }
}

export default function StatusDot({ status, size = 14 }) {
  const mode = modes[status] || modes.offline
  const Icon = mode.icon

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: Icon ? "transparent" : mode.color.replace("text", "rgb").replace("-", "(") + ")"
      }}
    >
      {Icon && (
        <Icon
          className={`${mode.color}`}
          style={{ width: size * 0.8, height: size * 0.8 }}
        />
      )}
    </motion.span>
  )
}
