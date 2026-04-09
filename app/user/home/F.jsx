"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"
import {
  Check,
  ArrowRight,
  Grid,
  Users,
  Mail,
  Sparkles,
  BarChart3,
  Settings,
  ChevronDown,
  Calendar
} from "lucide-react"
import Heading from "@/app/components/ui/Heading"

export default function LeadForGrowHero() {
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  })

  const dashboardScale = useTransform(smoothProgress, [0.1, 0.25], [0.94, 1])
  const dashboardOpacity = useTransform(smoothProgress, [0.1, 0.2], [0, 1])
  const dashboardY = useTransform(smoothProgress, [0.1, 0.25], [12, 0])

  const pointSlideDistance = 190
  const leftPointsX = useTransform(smoothProgress, [0.25, 0.4], [0, -pointSlideDistance])
  const rightPointsX = useTransform(smoothProgress, [0.25, 0.4], [0, pointSlideDistance])
  const pointsOpacity = useTransform(smoothProgress, [0.25, 0.35], [0, 1])
  const pointsScale = useTransform(smoothProgress, [0.25, 0.4], [0.8, 1])

  const ctaOpacity = useTransform(smoothProgress, [0.4, 0.5], [0, 1])

  const staticBulletPoints = [
    "Eliminate 40+ hours of manual data entry",
    "Improve lead response time by 300%",
    "Direct integration with WhatsApp & Meta",
    "Smart routing to available sales agents",
  ]

  const emergingPoints = [
    { id: 1, side: "left", text: "Faster Response", top: "20%" },
    { id: 2, side: "left", text: "Reduced Manual Work", top: "70%" },
    { id: 3, side: "right", text: "Automated Routing", top: "35%" },
    { id: 4, side: "right", text: "CRM Syncing", top: "80%" },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-grid pb-24 pt-32 md:pb-36 md:pt-48"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">

          {/* LEFT COLUMN */}
          <div className="relative z-30">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
              Why LeadForGrow
            </span>

            <Heading level={2} className="mt-6 text-balance">
              Why Growing Businesses Choose LeadForGrow
            </Heading>

            <p className="mt-6">
              LeadForGrow isn't just a tool; it's the engine that powers your sales operations.
              Built for high-performance teams who demand speed, visibility, and automation.
            </p>

            <ul className="mt-10 space-y-4">
              {staticBulletPoints.map((text, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative flex min-h-[500px] items-center justify-center">
            <div className="relative w-full max-w-[560px]">

              <motion.div
                style={{
                  scale: dashboardScale,
                  opacity: dashboardOpacity,
                  y: dashboardY,
                }}
                className="relative z-20 w-full overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-0 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] antialiased"
              >
                {/* Real Dashboard Mockup */}
                <div className="flex h-[420px] w-full font-sans text-slate-900">
                  {/* Sidebar */}
                  <div className="hidden sm:flex w-44 flex-col bg-[#1A1F2E] p-5 text-[#94A3B8]">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-tighter">LFG OS</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: Grid, label: "Overview", active: true },
                        { icon: Users, label: "Leads" },
                        { icon: Sparkles, label: "Automation" },
                        { icon: Mail, label: "Campaigns" },
                        { icon: BarChart3, label: "Reports" },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-1 py-0.5 transition-colors cursor-pointer ${item.active ? "text-white" : "hover:text-slate-300"}`}>
                          <item.icon size={15} />
                          <span className="text-[11px] font-semibold">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-center gap-3 px-1 text-slate-500">
                        <Settings size={15} />
                        <span className="text-[11px] font-semibold">Settings</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Main Workspace */}
                  <div className="flex-1 flex flex-col bg-[#F9FBFC]">
                    {/* Top Bar */}
                    <div className="h-12 border-b border-slate-100 bg-white flex items-center justify-between px-6">
                      <div className="flex items-center gap-4 text-slate-300">
                        <div className="h-4 w-32 bg-slate-50 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100" />
                        <ChevronDown size={14} className="text-slate-400" />
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Charts Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Conversions</div>
                          <div className="flex items-end gap-1 h-12">
                            {[40, 70, 45, 90, 65, 80].map((h, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex-1 rounded-t-sm bg-blue-100 hover:bg-blue-500 transition-colors"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">New Leads</div>
                          <div className="text-xl font-extrabold text-slate-900">+128%</div>
                          <div className="text-[9px] text-green-500 font-bold mt-1">▲ 12.4% this week</div>
                        </div>
                      </div>

                      {/* Lead List */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-900 uppercase">Recent Activity</span>
                          <span className="text-[9px] font-bold text-blue-600">View All</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {[
                            { name: "John Doe", time: "2m ago", status: "Active" },
                            { name: "Sarah Smith", time: "15m ago", status: "New" },
                            { name: "Mike Ross", time: "1h ago", status: "Closed" },
                          ].map((lead, i) => (
                            <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-slate-100" />
                                <div>
                                  <div className="text-[11px] font-bold text-slate-900">{lead.name}</div>
                                  <div className="text-[9px] text-slate-400">{lead.time}</div>
                                </div>
                              </div>
                              <div className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold ${lead.status === "Active" ? "bg-green-50 text-green-600" : lead.status === "New" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                                {lead.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Emerging Floating Points */}
              <div className="absolute inset-0 z-30 hidden lg:block">
                {emergingPoints.map((point) => (
                  <motion.div
                    key={point.id}
                    style={{
                      top: point.top,
                      x: point.side === "left" ? leftPointsX : rightPointsX,
                      opacity: pointsOpacity,
                      scale: pointsScale,
                    }}
                    className={`absolute flex items-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] ring-1 ring-slate-100 ${point.side === "left"
                      ? "right-1/2 mr-4 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]"
                      : "left-1/2 ml-4 shadow-[4px_0_12px_rgba(0,0,0,0.02)]"
                      }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    {point.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fallback */}
        <div className="mt-12 grid grid-cols-2 gap-3 lg:hidden">
          {emergingPoints.map((point) => (
            <div
              key={point.id}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3.5 bg-slate-50"
            >
              <Check size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                {point.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <motion.div
        style={{ opacity: ctaOpacity }}
        className="mt-20 flex w-full justify-center"
      >
        <div className="flex w-full max-w-4xl flex-col items-center justify-between gap-6 border-t border-slate-100 bg-[#EBF3FF] px-8 py-6 sm:flex-row sm:rounded-full sm:ring-1 sm:ring-blue-100 lg:px-12">
          <span className="text-lg font-bold text-blue-900">
            Ready to See It in Action?
          </span>

          <button suppressHydrationWarning className="group flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200">
            Book a Demo Today
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </motion.div>
    </section>
  )
}