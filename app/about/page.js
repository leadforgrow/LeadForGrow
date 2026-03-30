// import MarketingLayout from '@/app/components/MarketingLayout';

// export default function AboutPage() {
//   const benefits = [
//     {
//       title: "Eliminate Revenue Leakage",
//       text: "We believe no business should lose a deal because they were 'too busy' to answer a WhatsApp message or an email inquiry."
//     },
//     {
//       title: "Empower Small Teams",
//       text: "Our mission is to give solo founders and small agencies the same technological leverage as global corporations."
//     },
//     {
//       title: "Trust & Transparency",
//       text: "We build systems that create clear accountability between businesses and their leads, fostering long-term trust."
//     },
//     {
//       title: "Relentless Innovation",
//       text: "The lead management landscape changes every day. We stay ahead of the curve so our partners don't have to."
//     }
//   ];

//   const whoIsThisFor = [
//     "Mission-driven Founders scaling their impact",
//     "Ethical Agencies building long-term client value",
//     "Service Providers who care about every inquiry",
//     "Growth Hackers who value systems over hustle"
//   ];

//   const whyItMatters = [
//     "LeadForGrow was born out of the frustration of seeing great businesses fail due to poor follow-up systems.",
//     "We aren't just a software company; we are an infrastructure partner for the next generation of agencies.",
//     "Our goal is to turn lead management from a manual chore into a predictable, automated growth engine.",
//     "When you join LeadForGrow, you're joining a movement toward professional, efficient business growth."
//   ];

//   return (
//     <MarketingLayout
//       title="Our Mission: Bridging the Gap Between Hustle and Growth."
//       subtitle="We're on a mission to simplify the agency business model through powerful, unified automation and lead management technology. Because every inquiry deserves a professional response."
//       benefits={benefits}
//       whoIsThisFor={whoIsThisFor}
//       whyItMatters={whyItMatters}
//       ctaText="Join the Movement"
//     />
//   );
// }

'use client';

import React from 'react';
import UserNavbar from '../user/Header';
import Footer from '../components/Footer';
import { useTheme } from '../components/ThemeContext';
import { Users, BarChart3, Timer, Globe, ArrowRight, Smartphone, Terminal, AppWindow } from 'lucide-react';
import Heading from '@/app/components/ui/Heading';

export default function AboutPage() {
  const { theme } = useTheme();

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "50+ Beta Users",
      description: "First cohort of early adopters scaling with us"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      value: "10k+ Leads",
      description: "Managed through our early automation pipeline"
    },
    {
      icon: <Timer className="w-6 h-6" />,
      value: "20% Efficiency",
      description: "Average increase in speed to lead for our partners"
    }
  ];

  const subBusinesses = [
    {
      name: "rev-os",
      title: "Revenue Operating System",
      description: "The core engine that automates your agency's sales and fulfillment pipeline.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
    },
    {
      name: "funnel-pro",
      title: "Zero-Code Builder",
      description: "Create high-converting landing pages and forms without touching single line of code.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2340&auto=format&fit=crop"
    },
    {
      name: "lead-ai",
      title: "Smart Attribution",
      description: "AI-driven lead scoring that identifies the highest-intent customers instantly.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2340&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden flex flex-col">
      <UserNavbar />

      {/* Hero Section - 80% Viewport Height */}
      <div className="relative h-[80vh] w-full mt-20 group overflow-hidden">
        {/* Colored Image with zoom effect on hover */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105 group-hover:scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=2340&auto=format&fit=crop')`,
          }}
        >
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl space-y-6">
            <Heading
              level={1}
              className="text-6xl md:text-8xl text-white tracking-widest uppercase drop-shadow-lg"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Lead For Grow
            </Heading>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-8 py-24 w-full">

        {/* Intro Section - Zomato Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xl font-light">
              Founded with a singular mission: to eliminate the "Speed to Lead" gap.
              What began as a simple enquiry tracker has grown into a comprehensive
              <span className="font-bold text-slate-900 dark:text-white"> Agency Operating System</span> that connects
              businesses, customers, and fulfillment partners seamlessly across the globe.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xl font-light">
              At its core, LeadForGrow is driven by relentless focus on customer experience.
              Through innovative technology and deep behavioral insights,
              we are reshaping the revenue landscape, one lead at a time.
            </p>
          </div>
          {/* Intro Image */}
          <div className="relative rounded-[3rem] overflow-hidden group shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2340&auto=format&fit=crop"
              alt="Team Collaboration"
              className="w-full aspect-[4/3] object-cover transition-all duration-1000"
            />
          </div>
        </div>

        {/* Stats Section - Zomato Style */}
        <div className="space-y-16 mb-32">
          <div className="border-l-4 border-indigo-600 pl-8">
            <Heading level={2} className="text-4xl md:text-5xl tracking-tight">
              Fueling growth through every interaction
            </Heading>
            <p className="text-xl text-slate-500 dark:text-slate-400 mt-4 font-light">
              LeadForGrow has created an intricate network of businesses, automation, and revenue flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center group cursor-pointer">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 overflow-hidden">
                  {stat.icon}
                </div>
                <Heading level={3} className="text-3xl mb-2">{stat.value}</Heading>
                <p className="text-slate-500 dark:text-slate-400 font-light">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download / CTA Section - Zomato Style */}
        <div className="bg-slate-100 dark:bg-slate-950 p-12 md:p-20 rounded-[4rem] relative overflow-hidden mb-32 shadow-xl border border-slate-200 dark:border-slate-800 group cursor-pointer">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center relative z-10">
            <div className="space-y-8">
              <Heading level={2} className="text-4xl md:text-6xl leading-tight">
                Scale your business <br /> in the cloud.
              </Heading>
              <p className="text-xl text-slate-600 dark:text-slate-400 font-light">
                Experience seamless revenue management on the LeadForGrow platform.
                Secure, fast, and built for the future.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-5 rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 group/btn">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold opacity-70">Coming Soon to</p>
                    <p className="text-lg font-bold leading-none">App Store</p>
                  </div>
                </button>
                <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-5 rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95">
                  <Terminal className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold opacity-70">Get Access to</p>
                    <p className="text-lg font-bold leading-none">Cloud Dashboard</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Asset - Modern Dashboard Mockup Style */}
            <div className="mt-12 lg:mt-0 relative flex justify-center lg:justify-end">
              <div className="relative w-80 h-[640px] bg-slate-900 dark:bg-slate-800 rounded-[3rem] border-[12px] border-slate-900 dark:border-slate-800 shadow-2xl group cursor-pointer hover:-rotate-3 transition-transform duration-700">
                {/* Mockup Camera/Sensor Slot */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-3xl z-20"></div>

                {/* Internal Screen Content */}
                <div className="absolute inset-0 bg-white dark:bg-slate-950 rounded-[2.2rem] overflow-hidden m-[2px]">
                  <div className="p-6 pt-12 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1.5 flex-grow">
                        <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        <div className="h-2 w-1/4 bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" alt="Dashboard" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                      <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                      <div className="h-3 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Glowing Circle */}
              <div className="absolute -z-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] -bottom-20 -right-20"></div>
            </div>
          </div>
        </div>

        {/* Ecosystem Section - Zomato Style */}
        <div className="space-y-16">
          <div className="border-l-4 border-indigo-600 pl-8">
            <Heading level={2} className="text-4xl md:text-5xl tracking-tight">
              Our Core Ecosystem
            </Heading>
            <p className="text-xl text-slate-500 dark:text-slate-400 mt-4 font-light">
              Empowering modern agencies through integrated technology solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {subBusinesses.map((biz, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative rounded-[2.5rem] overflow-hidden mb-8 shadow-lg aspect-square">
                  <img
                    src={biz.image}
                    alt={biz.title}
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                    <Heading level={4} className="text-5xl uppercase tracking-tighter group-hover:scale-110 transition-transform duration-700 text-white">
                      {biz.name}
                    </Heading>
                  </div>
                </div>
                <Heading level={3} className="text-2xl mb-3 group-hover:text-indigo-600 transition-colors">
                  {biz.title}
                </Heading>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-6">
                  {biz.description}
                </p>
                <button className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest uppercase text-xs group-hover:translate-x-2 transition-transform">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Final Quote Section */}
        <div className="mt-32 pt-32 border-t border-slate-100 dark:border-slate-800 text-center">
          <Heading level={2} className="text-4xl md:text-5xl text-slate-300 dark:text-slate-800 mb-8 italic">
            "The missing layer between enquiry and revenue."
          </Heading>
        </div>

      </div>

      {/* <Footer /> */}
    </div>
  );
}

