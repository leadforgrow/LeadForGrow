"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Home,
  GraduationCap,
  Landmark,
  HeartPulse,
  Briefcase,
  Shield,
  Wallet,
  Plane,
  Globe,
  Sparkles,
  Share2,
  Search,
  TrendingUp,
  Users,
  Menu,
  X,
} from "lucide-react";

function NavUnderline({ active = false }) {
  return (
    <span
      className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-blue-600 transition-all duration-300 ease-out ${
        active ? "w-full" : "w-0 group-hover:w-full"
      }`}
    />
  );
}

function NavLink({ href, children, className = "", onClick, active = false }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group relative inline-flex items-center py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors ${className}`}
    >
      {children}
      <NavUnderline active={active} />
    </a>
  );
}

function NavDropdownTrigger({ children, isOpen }) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      className="group relative inline-flex items-center gap-1 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
    >
      {children}
      <ChevronDown
        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : ""}`}
      />
      <NavUnderline active={isOpen} />
    </button>
  );
}

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [businessPlan, setBusinessPlan] = useState(null);
  const [hasAgency, setHasAgency] = useState(false);
  const [context, setContext] = useState("business");

  const productDropdown = [
    { label: "Website & Funnel Builder", href: "/product/builder" },
    { label: "Lead Capture Forms", href: "/product/forms" },
    { label: "Lead Management & CRM", href: "/product/crm" },
    { label: "Automation & Follow-ups", href: "/product/automation" },
    { label: "Analytics & Reporting", href: "/product/analytics" },
    { label: "Custom Domain & Hosting", href: "/product/hosting" },
  ];

  const servicesDropdown = [
    { label: "Done-For-You Website", href: "/services/dfy-website", description: "We build your site end-to-end", icon: Globe },
    { label: "Lead System Setup", href: "/services/lead-setup", description: "CRM & capture configured for you", icon: Users },
    { label: "Automation Setup", href: "/services/automation-setup", description: "Hands-free workflow automation", icon: Sparkles },
    { label: "Social Profile Setup", href: "/services/social-setup", description: "Branded social presence setup", icon: Share2 },
    { label: "SEO Setup", href: "/services/seo-setup", description: "Rank higher on Google", icon: Search },
    { label: "Managed Growth Service", href: "/services/managed-growth", description: "Full-service growth management", icon: TrendingUp },
  ];

  const agenciesDropdown = [
    { label: "Agency Platform Overview", href: "/agencies/overview" },
    { label: "Manage Multiple Clients", href: "/agencies/clients" },
    { label: "White-Label Solution", href: "/agencies/white-label" },
    { label: "Agency Pricing", href: "/pricing" },
    { label: "Become a Partner", href: "/agencies/partner" },
  ];

  const industryDropdown = [
    { label: "Real Estate", href: "/industry/real-estate", description: "Automate property enquiries", icon: Home },
    { label: "Education", href: "/industry/education", description: "Streamline student admissions", icon: GraduationCap },
    { label: "Bank", href: "/industry/bank", description: "Secure financial lead routing", icon: Landmark },
    { label: "Hospital", href: "/industry/hospital", description: "Manage patient appointments", icon: HeartPulse },
    { label: "Business", href: "/industry/business", description: "General sales automation", icon: Briefcase },
    { label: "Insurance", href: "/industry/insurance", description: "Fast claim & lead handling", icon: Shield },
    { label: "Fintech", href: "/industry/fintech", description: "Modern finance lead ops", icon: Wallet },
    { label: "Travel", href: "/industry/travel", description: "Booking & tour automation", icon: Plane },
  ];

  const resourcesDropdown = [
    { label: "About Us", href: "/resources/about" },
    { label: "How It Works", href: "/resources/how-it-works" },
    { label: "Use Cases", href: "/resources/use-cases" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: "Blog", href: "/resources/blog" },
    { label: "Help Center", href: "/resources/help" },
  ];

  const isPaid = isLoggedIn && businessPlan && businessPlan !== "free";

  const handleProfileClick = () => {
    const userid = localStorage.getItem("userid");
    if (userid) {
      window.location.href = `/user/profile/${userid}`;
    } else {
      window.location.href = "/user/register";
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const fetchSession = async (userId) => {
    try {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const plan = (data.businessPlan || "free").toLowerCase();
        setBusinessPlan(plan);
        setHasAgency(data.hasAgency);
        localStorage.setItem("businessPlan", plan);
        localStorage.setItem("hasAgency", data.hasAgency);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/agency/clients/")) setContext("client");
    else if (path.startsWith("/agency")) setContext("agency");
    else setContext("business");

    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const userid = localStorage.getItem("userid");
    if (userid) {
      setIsLoggedIn(true);
      const storedPlan = localStorage.getItem("businessPlan");
      const storedHasAgency = localStorage.getItem("hasAgency") === "true";
      if (storedPlan) setBusinessPlan(storedPlan);
      setHasAgency(storedHasAgency);
      fetchSession(userid);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let activePaidItems = [];
  if (context === "client") {
    activePaidItems = [
      { label: "Business Home", icon: "Home", href: "/", special: true },
      { label: "Leads", href: "#leads" },
      { label: "Financials", href: "#invoices" },
      { label: "Overview", href: "#overview" },
    ];
  } else if (isPaid) {
    activePaidItems = [
      { label: "Websites", href: "/websites" },
      { label: "Leads", href: "/automation/leads" },
      { label: "Dashboard", href: "/automation" },
      { label: "Report", href: "/automation/reports" },
    ];
    if (hasAgency) {
      activePaidItems.push({ label: "Clients / Agency", href: "/agency", highlighted: true });
    }
  }

  const activeCreateItems =
    hasAgency && isPaid
      ? [
          { label: "Create Website", href: "/website-funnel" },
          { label: "Add New Client", href: "/agency/clients" },
        ]
      : [
          { label: "Create Website", href: "/website-funnel" },
          { label: "Create Form", href: "/automation/forms" },
        ];

  const DropdownMenu = ({ items, isOpen }) => {
    if (!isOpen) return null;
    return (
      <div className="absolute top-full right-0 pt-3 w-64 z-50">
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] py-2 overflow-hidden">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="group/item block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 transition-colors"
            >
              <span className="relative">
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-600 group-hover/item:w-full transition-all duration-300" />
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const IndustryDropdownMenu = ({ items, isOpen }) => {
    if (!isOpen) return null;
    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[520px] max-w-[calc(100vw-2rem)]">
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.14)] p-4">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-2 pb-3">
            Select your industry
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/25 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50 flex items-center justify-center shrink-0 transition-colors">
                    {Icon && (
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.label}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{item.description}</div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const navShellClass = isScrolled
    ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
    : "bg-white/60 dark:bg-slate-950/50 backdrop-blur-lg border-b border-slate-200/40 dark:border-slate-800/40";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navShellClass}`}>
      {businessPlan === "trial" && (
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white text-center py-2 text-xs sm:text-sm font-medium">
          You are on a free trial — contact sales for full access
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 lg:h-[4.25rem]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2.5 group">
              <img
                src="/image.png"
                alt="LeadForGrow"
                className="w-10 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Lead<span className="text-blue-600">For</span>Grow
              </span>
            </a>
          </div>

          {/* Desktop nav */}
          <div className="hidden xl:flex flex-1 justify-center px-6">
            {isLoggedIn && (isPaid || context === "client") ? (
              <div className="flex items-center gap-7">
                {activePaidItems.map((item) =>
                  item.special ? (
                    <a
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-[12px] font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      {item.label}
                    </a>
                  ) : item.highlighted ? (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                      active
                    >
                      {item.label}
                    </NavLink>
                  ) : (
                    <NavLink key={item.href} href={item.href}>
                      {item.label}
                    </NavLink>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-7">
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("services")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <NavDropdownTrigger isOpen={openDropdown === "services"}>Services</NavDropdownTrigger>
                  <IndustryDropdownMenu items={servicesDropdown} isOpen={openDropdown === "services"} />
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("industry")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <NavDropdownTrigger isOpen={openDropdown === "industry"}>Industry</NavDropdownTrigger>
                  <IndustryDropdownMenu items={industryDropdown} isOpen={openDropdown === "industry"} />
                </div>

                <NavLink href="/pricing">Pricing</NavLink>
              </div>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden xl:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <NavLink href="/user/login" className="px-1">
                  Log in
                </NavLink>
                <a
                  href="/user/register"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:bg-blue-700 hover:shadow-[0_10px_28px_rgba(37,99,235,0.35)] transition-all duration-300"
                >
                  Get started
                </a>
              </>
            ) : (
              <>
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown("create")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    suppressHydrationWarning
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:bg-blue-700 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "create" ? "rotate-180" : ""}`} />
                  </button>
                  <DropdownMenu items={activeCreateItems} isOpen={openDropdown === "create"} />
                </div>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleProfileClick}
                  className="group relative inline-flex items-center py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Profile
                  <NavUnderline />
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200"
                >
                  Log out
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="xl:hidden">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`xl:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-out ${
          isMenuOpen ? "max-h-[85vh] opacity-100 visible overflow-y-auto" : "max-h-0 opacity-0 invisible overflow-hidden"
        }`}
      >
        <div className="px-4 pt-3 pb-6 space-y-1">
          {isLoggedIn && (isPaid || context === "client") ? (
            <>
              {activePaidItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-3 py-1.5">Create</div>
                {activeCreateItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 pb-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-3 py-1.5">Product</div>
                {productDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="space-y-1 py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-3 py-1.5">Services</div>
                {servicesDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <a
                href="/pricing"
                className="block px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              {!isLoggedIn && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href="/user/login"
                    className="block px-3 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </a>
                  <a
                    href="/user/register"
                    className="block px-3 py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-[0_8px_24px_rgba(37,99,235,0.25)] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get started
                  </a>
                </div>
              )}
            </>
          )}

          {isLoggedIn && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  handleProfileClick();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Profile
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
