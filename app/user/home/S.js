import { Check } from 'lucide-react';

export default function AgencyOSLanding() {
  return (
    <div id="features" className="min-h-screen bg-white dark:bg-black transition-colors duration-500 py-24 border-t dark:border-slate-800">
      {/* Hero Section */}
      <main className="px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          {/* Left Illustration */}
          <div className="relative">
            <div className="relative w-full max-w-lg mx-auto bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-[3rem] p-16 overflow-hidden border border-white dark:border-slate-800 shadow-xl transition-colors duration-500">
              {/* Background decorative elements */}
              <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-300 rounded-full animate-pulse"></div>
              <div className="absolute bottom-12 left-8 w-16 h-12 border-2 border-white/40 dark:border-slate-700 rounded-lg rotate-12"></div>
              <div className="absolute bottom-6 right-12 w-3 h-3 bg-rose-400 rounded-full"></div>

              {/* Illustrations - keeping them same for now but wrapped in transition */}
              <div className="relative h-80">
                 {/* Simplified representation of the illustration for brevity in this tool call */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl">🚀</span>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-colors duration-500">
              Reliable Platform <span className="mx-2">•</span> <span className="underline">150,000+ client</span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-serif text-slate-900 dark:text-white leading-tight transition-colors duration-500">
              Providing Services<br />
              with <span className="text-indigo-600">top</span> quality.
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-500">
              Everything you need to run your agency professionally. We understand your needs and provide the best tools.
            </p>

            <div className="space-y-4 pt-4">
              {[
                "Amazing communication channels.",
                "Best trending designing experience.",
                "24/7 Email & Live chat support."
              ].map(item => (
                <div key={item} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-sm tracking-wide group-hover:text-indigo-600 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-12 text-center pt-20 border-t dark:border-slate-900 transition-colors duration-500">
          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent mb-4">
              20M+
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Total Leads Captured</div>
          </div>

          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent mb-4">
              150k+
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Global Agencies</div>
          </div>

          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-4">
              3000+
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Custom Domains Connected</div>
          </div>
        </div>
      </main>
    </div>
  );
}
