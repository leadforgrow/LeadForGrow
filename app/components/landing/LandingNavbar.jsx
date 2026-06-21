'use client';

import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

function NavDropdownTrigger({ children, isOpen }) {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-1 py-1 text-[14px] font-medium text-[#1a1a1a] hover:text-black transition-colors"
    >
      {children}
      <ChevronDown
        className={`h-3.5 w-3.5 text-[#1a1a1a]/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

const platformDropdown = [
  { label: 'CRM & Sales Pipeline', href: '/blog/crm-sales-pipeline' },
  { label: 'Unified Inbox', href: '/blog/unified-inbox' },
  { label: 'AI Reply Assistant', href: '/blog/ai-reply-assistant' },
  { label: 'Website Lead Capture', href: '/blog/website-lead-capture' },
  { label: 'Analytics & Reports', href: '/blog/analytics-reports' },
  { label: 'Team Inbox & Assignment', href: '/blog/team-inbox-assignment' },
];

const automationDropdown = [
  { label: 'WhatsApp Automation', href: '/blog/whatsapp-automation' },
  { label: 'Instagram Automation', href: '/blog/instagram-automation' },
  { label: 'Email Automation', href: '/blog/email-automation' },
  { label: 'AI Automation Workflows', href: '/blog/ai-automation-workflows' },
];

function DropdownMenu({ items, isOpen }) {
  if (!isOpen) return null;
  return (
    <div className="absolute top-full left-0 pt-2 w-56 z-50">
      <div className="rounded-xl border border-[#E2E8F0]/80 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.1)] py-1.5 overflow-hidden">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="block px-4 py-2 text-sm font-medium text-[#374151] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function LandingNavbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink = ({ href, children }) => (
    <a
      href={href}
      className="inline-flex items-center py-1 text-[14px] font-medium text-[#1a1a1a] hover:text-black transition-colors"
    >
      {children}
    </a>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-5 sm:px-6">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 rounded-xl border border-white/70 bg-white/55 px-4 py-2.5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5 lg:px-6">
        {/* Logo */}
        <a href="/" className="shrink-0 ml-5">
          <span className="landing-logo text-[17px] sm:text-[18px]">
            LeadForGrow<span className="text-[9px] align-super text-[#1a1a1a]/60">™</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-7 xl:gap-9">
          <NavLink href="/">Home</NavLink>
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('platform')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <NavDropdownTrigger isOpen={openDropdown === 'platform'}>Platform</NavDropdownTrigger>
            <DropdownMenu items={platformDropdown} isOpen={openDropdown === 'platform'} />
          </div>
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('automation')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <NavDropdownTrigger isOpen={openDropdown === 'automation'}>Automation</NavDropdownTrigger>
            <DropdownMenu items={automationDropdown} isOpen={openDropdown === 'automation'} />
          </div>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/contact">Enterprise</NavLink>
          <NavLink href="/contact">Contact us</NavLink>
        </nav>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a
            href="/user/login"
            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2 text-[14px] font-medium text-[#1a1a1a] border border-[#E8E8E8] hover:bg-[#FAFAFA] transition-colors"
          >
            Login
          </a>
          <a
            href="/user/register"
            className="inline-flex items-center justify-center rounded-lg bg-[#1a1a1a] px-5 py-2 text-[14px] font-semibold text-white hover:bg-black transition-colors"
          >
            Join
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#1a1a1a] hover:bg-white/60 transition-colors"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden mx-auto mt-2 max-w-[1100px] rounded-xl border border-white/70 bg-white/90 backdrop-blur-xl shadow-lg p-4">
          <div className="space-y-1">
            <a href="/" className="block px-3 py-2 text-sm font-medium text-[#1a1a1a] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>Home</a>
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Platform</p>
            {platformDropdown.map((item) => (
              <a key={item.label} href={item.href} className="block px-3 py-2 text-sm text-[#374151] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
            ))}
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Automation</p>
            {automationDropdown.map((item) => (
              <a key={item.label} href={item.href} className="block px-3 py-2 text-sm text-[#374151] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
            ))}
            <a href="/#pricing" className="block px-3 py-2 text-sm font-medium text-[#1a1a1a] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="/contact" className="block px-3 py-2 text-sm font-medium text-[#1a1a1a] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>Enterprise</a>
            <a href="/contact" className="block px-3 py-2 text-sm font-medium text-[#1a1a1a] rounded-lg hover:bg-white/80" onClick={() => setIsMenuOpen(false)}>Contact us</a>
          </div>
          <div className="mt-3 flex gap-2 pt-3 border-t border-[#E8E8E8]">
            <a href="/user/login" className="flex-1 text-center rounded-xl bg-white border border-[#E8E8E8] px-4 py-2.5 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Login</a>
            <a href="/user/register" className="flex-1 text-center rounded-xl bg-[#1a1a1a] text-white px-4 py-2.5 text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>Join</a>
          </div>
        </div>
      )}
    </header>
  );
}
