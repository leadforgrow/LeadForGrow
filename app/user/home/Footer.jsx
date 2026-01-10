import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 transition-colors duration-500 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">LFG</div>
              <h2 className="text-2xl font-bold tracking-tight">LeadForGrow</h2>
            </div>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed mb-8">
              The Revenue Follow-Up Operating System (Rev-OS) for high-growth teams. We ensure every enquiry converts or is marked lost—automatically.
            </p>
            <div className="flex gap-4">
              {/* Social links placeholder */}
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                <span className="text-xs">in</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                <span className="text-xs">X</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Product</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">Rev-OS Flow</li>
              <li className="hover:text-white cursor-pointer transition-colors">Accountability Dashboard</li>
              <li className="hover:text-white cursor-pointer transition-colors">Team Gamification</li>
              <li className="hover:text-white cursor-pointer transition-colors">Category Comparison</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Company</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li className="hover:text-white cursor-pointer transition-colors">Pricing Philosophy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Trust & Security</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact Support</li>
              <li className="hover:text-white cursor-pointer transition-colors">Book Walkthrough</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 LeadForGrow. Built for Revenue, not just dashboards.</p>
          <div className="flex gap-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
    </footer>
  );
}
