"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Search, Zap, UserPlus, TrendingUp } from "lucide-react"
import { useState } from "react"

const steps = [
  {
    id: 1,
    title: "Capture",
    description:
      "Leads enter from website, social media, WhatsApp or campaigns automatically.",
    icon: Search,
    x: "10%",
    y: "50%",
  },
  {
    id: 2,
    title: "Automate",
    description:
      "Instant WhatsApp reply is sent. Follow-up sequences are triggered.",
    icon: Zap,
    x: "36.5%",
    y: "25%",
  },
  {
    id: 3,
    title: "Assign",
    description:
      "Lead is routed to the right sales agent with reminders and tracking.",
    icon: UserPlus,
    x: "63.5%",
    y: "75%",
  },
  {
    id: 4,
    title: "Convert",
    description:
      "Track activity, monitor engagement and close deals faster.",
    icon: TrendingUp,
    x: "90%",
    y: "50%",
  },
]

export default function Pain() {
  const [hoveredStep, setHoveredStep] = useState(null)

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32 bg-gradient-to-b from-[#add5ff] to-white">
      <div className="relative z-[10] mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
          >
            How LeadForGrow Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl font-medium text-slate-500/80"
          >
            A simple 4-step system designed for automation and growth
          </motion.p>
        </div>

        {/* Journey Path */}
        <div className="relative mx-auto h-[320px] w-full max-w-5xl">
          <svg
            viewBox="0 0 1000 400"
            fill="none"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <motion.path
              d="M 100 200 C 250 200, 250 100, 365 100 C 480 100, 520 300, 635 300 C 750 300, 750 200, 900 200"
              stroke="#e2e8f0"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            <motion.path
              d="M 100 200 C 250 200, 250 100, 365 100 C 480 100, 520 300, 635 300 C 750 300, 750 200, 900 200"
              stroke="url(#path-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: hoveredStep ? (hoveredStep - 1) / 3 : 0,
              }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />

            <defs>
              <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
          </svg>

          {/* Nodes */}
          {steps.map((step) => {
            const Icon = step.icon
            const isHovered = hoveredStep === step.id
            const isActive = hoveredStep !== null && hoveredStep >= step.id

            return (
              <div
                key={step.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: step.x, top: step.y }}
              >
                <div className="relative">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={`absolute -inset-6 rounded-full blur-2xl ${step.id === 4
                          ? "bg-yellow-400/20"
                          : "bg-primary/20"
                          }`}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                    whileHover={{ scale: 1.15, y: -5 }}
                    className={`relative z-10 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white shadow-2xl ${isActive
                      ? step.id === 4
                        ? "border-2 border-yellow-500"
                        : "border-2 border-primary"
                      : "border-2 border-slate-100"
                      }`}
                  >
                    <Icon
                      size={26}
                      className={
                        isActive
                          ? step.id === 4
                            ? "text-yellow-600"
                            : "text-primary"
                          : "text-slate-400"
                      }
                    />

                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 rounded-full ${step.id === 4
                          ? "bg-yellow-500/10"
                          : "bg-primary/10"
                          }`}
                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 15,
                            x: "-50%",
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            y: -25,
                            x: "-50%",
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: 15,
                            x: "-50%",
                            scale: 0.9,
                          }}
                          className="absolute bottom-full left-1/2 z-30 w-72 rounded-3xl bg-white/95 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-200"
                        >
                          <span
                            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${step.id === 4
                              ? "text-yellow-600"
                              : "text-primary"
                              }`}
                          >
                            Phase 0{step.id}
                          </span>
                          <h4 className="mt-1 text-xl font-bold text-slate-900">
                            {step.title}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {step.description}
                          </p>
                          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="mt-8 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-slate-900" : "text-slate-400"
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="inline-block rounded-full bg-slate-50 px-6 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-100">
            From first enquiry to final conversion — everything happens in one
            platform.
          </p>
        </motion.div>
      </div>
    </section>
  )
}