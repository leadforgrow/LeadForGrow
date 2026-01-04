export default function LeadForGrowHero() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500 overflow-hidden relative border-t dark:border-slate-800">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 opacity-20 blur-2xl"></div>
      <div className="absolute top-1/2 left-12 w-12 h-12 bg-emerald-400 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-0 right-32 w-20 h-20 bg-orange-500 rounded-full opacity-20 blur-xl"></div>

      <div className="max-w-7xl mx-auto px-8 py-24 relative z-10">

        {/* ROW 1: Headline + 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">

          {/* Heading */}
          <div className="lg:pr-10 py-6">
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight transition-colors duration-500">
              Discover<br />
              all <span className="italic text-indigo-600">our</span><br />
              Services.
            </h2>
            <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">Everything you need to scale your agency operations from zero to one.</p>
          </div>

          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl group-hover:scale-110 transition-transform" onClick={() => window.location.href = '/website-funnel'}>
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <rect x="8" y="16" width="20" height="4" fill="#6366f1" rx="2" />
                <rect x="8" y="24" width="20" height="4" fill="#f472b6" rx="2" />
                <rect x="8" y="32" width="20" height="4" fill="#fbbf24" rx="2" />
                <path d="M36 12 L52 20 L52 44 L36 52 L20 44 L20 20 Z" stroke="#6366f1" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 cursor-pointer" onClick={() => window.location.href = '/website-funnel'}>Website Funnel</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              Build landing pages, funnels & payment pages — ultra fast.
            </p>
            <div className="text-indigo-600 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              Explore Layer <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <rect x="12" y="10" width="12" height="6" fill="#fbbf24" rx="2" />
                <rect x="28" y="10" width="12" height="6" fill="#60a5fa" rx="2" />
                <rect x="44" y="10" width="8" height="6" fill="#f472b6" rx="2" />
                <path d="M16 22 L16 50 M32 22 L32 50 M48 22 L48 50" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Client Accounts</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              Manage multiple clients with separate access & roles.
            </p>
            <div className="text-emerald-500 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              Manage Access <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

        </div>

        {/* ROW 2: Remaining Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 rounded-2xl group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <path d="M12 28 L28 12 L44 28" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="28" cy="28" r="8" fill="#22d3ee" />
                <path d="M20 36 L36 52" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Lead Management</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              Capture, track & manage leads in one unified dashboard.
            </p>
            <div className="text-rose-500 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              Track Growth <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <rect x="8" y="32" width="6" height="20" fill="#22d3ee" rx="2" />
                <rect x="18" y="24" width="6" height="28" fill="#60a5fa" rx="2" />
                <rect x="28" y="16" width="6" height="36" fill="#a78bfa" rx="2" />
                <rect x="38" y="20" width="6" height="32" fill="#f472b6" rx="2" />
                <rect x="48" y="28" width="6" height="24" fill="#fbbf24" rx="2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Analytics & Reports</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              Track performance, conversions & deep client ROI.
            </p>
            <div className="text-cyan-500 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              View Reports <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded-2xl group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <circle cx="20" cy="32" r="8" fill="#22d3ee" />
                <circle cx="44" cy="32" r="8" fill="#34d399" />
                <path d="M28 32 L36 32" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Domain & Links</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              Custom domains, short links & campaign tracking.
            </p>
            <div className="text-amber-500 flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              Link Domains <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
