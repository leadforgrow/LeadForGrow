"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";

const UserNavbar = () => {
  // 1. State Hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [businessPlan, setBusinessPlan] = useState(null);
  const [hasAgency, setHasAgency] = useState(false);
  const [context, setContext] = useState('business');

  // 2. Constants & Dropdowns
  const productDropdown = [
    { label: "Website & Funnel Builder", href: "/product/builder" },
    { label: "Lead Capture Forms", href: "/product/forms" },
    { label: "Lead Management & CRM", href: "/product/crm" },
    { label: "Automation & Follow-ups", href: "/product/automation" },
    { label: "Analytics & Reporting", href: "/product/analytics" },
    { label: "Custom Domain & Hosting", href: "/product/hosting" },
  ];

  const servicesDropdown = [
    { label: "Done-For-You Website", href: "/services/dfy-website" },
    { label: "Lead System Setup", href: "/services/lead-setup" },
    { label: "Automation Setup", href: "/services/automation-setup" },
    { label: "Social Profile Setup", href: "/services/social-setup" },
    { label: "SEO Setup", href: "/services/seo-setup" },
    { label: "Managed Growth Service", href: "/services/managed-growth" },
  ];

  const agenciesDropdown = [
    { label: "Agency Platform Overview", href: "/agencies/overview" },
    { label: "Manage Multiple Clients", href: "/agencies/clients" },
    { label: "White-Label Solution", href: "/agencies/white-label" },
    { label: "Agency Pricing", href: "/pricing" },
    { label: "Become a Partner", href: "/agencies/partner" },
  ];

  const resourcesDropdown = [
    { label: "How It Works", href: "/resources/how-it-works" },
    { label: "Use Cases", href: "/resources/use-cases" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: "Blog", href: "/resources/blog" },
    { label: "Help Center", href: "/resources/help" },
  ];

  const isPaid = isLoggedIn && businessPlan && businessPlan !== 'free';

  // 3. Action Handlers
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
        const plan = (data.businessPlan || 'free').toLowerCase();
        setBusinessPlan(plan);
        setHasAgency(data.hasAgency);
        localStorage.setItem("businessPlan", plan);
        localStorage.setItem("hasAgency", data.hasAgency);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  // 4. Effects
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/agency/clients/')) setContext('client');
    else if (path.startsWith('/agency')) setContext('agency');
    else setContext('business');

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const userid = localStorage.getItem("userid");
    if (userid) {
      setIsLoggedIn(true);
      const storedPlan = localStorage.getItem("businessPlan");
      const storedHasAgency = localStorage.getItem("hasAgency") === 'true';
      if (storedPlan) setBusinessPlan(storedPlan);
      setHasAgency(storedHasAgency);
      fetchSession(userid);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 5. Navigation Items logic
  let activePaidItems = [];
  if (context === 'client') {
    activePaidItems = [
      { label: "Business Home", icon: "Home", href: "/", special: true },
      { label: "Leads", href: "#leads" },
      { label: "Financials", href: "#invoices" },
      { label: "Overview", href: "#overview" }
    ];
  } else if (isPaid) {
    activePaidItems = [
      { label: "Websites", href: "/websites" },
      { label: "Forms", href: "/forms" },
      { label: "Leads", href: "/leads" },
      { label: "Automation", href: "/automation" },
      { label: "Analytics", href: "/analytics" }
    ];
    if (hasAgency) {
      activePaidItems.push({ label: "Clients / Agency", href: "/agency", highlighted: true });
    }
  }

  const activeCreateItems = (hasAgency && isPaid)
    ? [
      { label: "Create Website", href: "/website-funnel" },
      { label: "Add New Client", href: "/agency/clients" }
    ]
    : [
      { label: "Create Website", href: "/website-funnel" },
      { label: "Create Form", href: "/forms/create" }
    ];

  const DropdownMenu = ({ items, isOpen }) => {
    if (!isOpen) return null;
    return (
      <div className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 backdrop-blur-xl">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className="block px-6 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 dark:hover:from-slate-800 dark:hover:to-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 rounded-lg mx-2"
          >
            {item.label}
          </a>
        ))}
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
      ? 'bg-white dark:bg-black shadow-md border-b dark:border-slate-800'
      : 'bg-white/95 dark:bg-black/95 backdrop-blur-xl'
      }`}>
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-3 group">
              <img src="/image.png" alt="Logo" className="w-14 h-12 transition-transform group-hover:scale-105" />
              <span className="text-2xl text-slate-900 dark:text-white tracking-tight font-semibold">
                LeadForGrow
              </span>
            </a>
          </div>

          {/* Navigation - Center */}
          <div className="hidden lg:flex flex-1 justify-center">
            {isLoggedIn && (isPaid || context === 'client') ? (
              // PAID OR CONTEXTUAL NAVIGATION
              <div className="flex items-center space-x-8">
                {activePaidItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`text-[12px] transition-all uppercase tracking-widest font-bold flex items-center gap-2 ${item.special
                      ? 'bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200'
                      : item.highlighted
                        ? 'text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : (
              // PUBLIC/FREE NAVIGATION
              <div className="flex items-center space-x-10">
                <div className="relative" onMouseEnter={() => setOpenDropdown('product')} onMouseLeave={() => setOpenDropdown(null)}>
                  <button className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Product <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={productDropdown} isOpen={openDropdown === 'product'} />
                </div>

                <div className="relative" onMouseEnter={() => setOpenDropdown('services')} onMouseLeave={() => setOpenDropdown(null)}>
                  <button className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Services <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={servicesDropdown} isOpen={openDropdown === 'services'} />
                </div>

                <div className="relative" onMouseEnter={() => setOpenDropdown('agencies')} onMouseLeave={() => setOpenDropdown(null)}>
                  <button className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    For Agencies <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={agenciesDropdown} isOpen={openDropdown === 'agencies'} />
                </div>

                <a href="/pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                  Pricing
                </a>

                <div className="relative" onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}>
                  <button className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Resources <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={resourcesDropdown} isOpen={openDropdown === 'resources'} />
                </div>
              </div>
            )}
          </div>

          {/* Auth Section - Right Side */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-6">
              {!isLoggedIn ? (
                <>
                  <a href="/user/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider font-medium">
                    Login
                  </a>
                  <a href="/user/register" className="px-8 py-3.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 uppercase tracking-wider font-medium hover:scale-105">
                    Get Started
                  </a>
                </>
              ) : (
                <>
                  <div className="relative" onMouseEnter={() => setOpenDropdown('create')} onMouseLeave={() => setOpenDropdown(null)}>
                    <button className="flex items-center gap-2 px-8 py-3.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 uppercase tracking-wider font-medium hover:scale-105">
                      <Plus className="w-4 h-4" /> Create <ChevronDown className="w-4 h-4" />
                    </button>
                    <DropdownMenu items={activeCreateItems} isOpen={openDropdown === 'create'} />
                  </div>
                  <button onClick={handleProfileClick} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider font-medium">
                    Profile
                  </button>
                  <button onClick={handleLogout} className="px-8 py-3.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 uppercase tracking-wider font-medium hover:scale-105">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"}`}>
        <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
          {isLoggedIn && (isPaid || context === 'client') ? (
            <>
              {activePaidItems.map((item, idx) => (
                <a key={idx} href={item.href} className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400 uppercase tracking-widest px-4 py-2">Create</div>
                {activeCreateItems.map((item, idx) => (
                  <a key={idx} href={item.href} className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase tracking-widest px-4 py-2">Product</div>
                {productDropdown.map((item, idx) => (
                  <a key={idx} href={item.href} className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="space-y-1 pt-4 text-xs text-slate-400 uppercase tracking-widest px-4 py-2">Services</div>
              {servicesDropdown.map((item, idx) => (
                <a key={idx} href={item.href} className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <a href="/pricing" className="block px-4 py-3 text-base text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </a>
              {!isLoggedIn && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a href="/user/login" className="block px-4 py-3 text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </a>
                  <a href="/user/register" className="block px-4 py-3 text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/20" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </a>
                </div>
              )}
            </>
          )}

          {isLoggedIn && (
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => { handleProfileClick(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Profile
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;