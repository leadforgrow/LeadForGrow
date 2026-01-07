"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";

const UserNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Check for userid in localStorage on mount
  useEffect(() => {
    const userid = localStorage.getItem("userid");
    setIsLoggedIn(!!userid);
  }, []);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userid");
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  // Handle profile click
  const handleProfileClick = () => {
    const userid = localStorage.getItem("userid");
    if (userid) {
      window.location.href = `/user/profile/${userid}`;
    } else {
      window.location.href = "/user/register";
    }
  };

  // Dropdown data for PUBLIC navbar
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
    { label: "SEO Setup", href: "/services/seo-setup", badge: "Coming Soon" },
    { label: "Managed Growth Service", href: "/services/managed-growth" },
  ];

  const agenciesDropdown = [
    { label: "Agency Platform Overview", href: "/agencies/overview" },
    { label: "Manage Multiple Clients", href: "/agencies/clients" },
    { label: "White-Label Solution", href: "/agencies/white-label" },
    { label: "Agency Pricing", href: "/agencies/pricing" },
    { label: "Become a Partner", href: "/agencies/partner" },
  ];

  const resourcesDropdown = [
    { label: "How It Works", href: "/resources/how-it-works" },
    { label: "Use Cases", href: "/resources/use-cases" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: "Blog", href: "/resources/blog" },
    { label: "Help Center", href: "/resources/help" },
  ];

  // Dropdown data for AUTHENTICATED navbar
  const createDropdown = [
    { label: "Create Website", href: "/website-funnel" },
    { label: "Create Form", href: "/forms/create" },
    { label: "Request DFU Service", href: "/services/request" },
  ];

  const authenticatedNavItems = [
    { label: "Dashboard", href: "/website-funnel/dashboard" },
    { label: "Websites", href: "/websites" },
    { label: "Forms", href: "/forms" },
    { label: "Leads", href: "/leads" },
    { label: "Automation", href: "/automation" },
    { label: "Analytics", href: "/analytics" },
    { label: "Clients", href: "/clients" },
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
            {item.badge && (
              <span className="ml-2 text-[10px] px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full uppercase tracking-wider font-semibold">
                {item.badge}
              </span>
            )}
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
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-3 group">
              <img src="/image.png" alt="Logo" className="w-12 h-12 transition-transform group-hover:scale-105" />
              <span className="text-2xl text-slate-900 dark:text-white tracking-tight font-semibold">
                LeadForGrow
              </span>
            </a>
          </div>

          {/* Navigation - Center */}
          <div className="hidden lg:flex flex-1 justify-center">
            {!isLoggedIn ? (
              // PUBLIC NAVIGATION
              <div className="flex items-center space-x-10">
                {/* Product Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown('product')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Product <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={productDropdown} isOpen={openDropdown === 'product'} />
                </div>

                {/* Services Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown('services')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Services <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={servicesDropdown} isOpen={openDropdown === 'services'} />
                </div>

                {/* For Agencies Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown('agencies')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    For Agencies <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={agenciesDropdown} isOpen={openDropdown === 'agencies'} />
                </div>

                {/* Pricing Link */}
                <a href="/#pricing" className="text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                  Pricing
                </a>

                {/* Resources Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenDropdown('resources')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider">
                    Resources <ChevronDown className="w-4 h-4" />
                  </button>
                  <DropdownMenu items={resourcesDropdown} isOpen={openDropdown === 'resources'} />
                </div>

              </div>
            ) : (
              // AUTHENTICATED NAVIGATION
              <div className="flex items-center space-x-10">
                {authenticatedNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm  text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Auth Section - Right Side */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-6">
              {!isLoggedIn ? (
                <>
                  <a
                    href="/user/login"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider font-medium"
                  >
                    Login
                  </a>
                  <a
                    href="/user/register"
                    className="px-8 py-3.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 uppercase tracking-wider font-medium hover:scale-105"
                  >
                    Get Started
                  </a>
                </>
              ) : (
                <>
                  {/* Create Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown('create')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-2 px-8 py-3.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 uppercase tracking-wider font-medium hover:scale-105">
                      <Plus className="w-4 h-4" /> Create <ChevronDown className="w-4 h-4" />
                    </button>
                    <DropdownMenu items={createDropdown} isOpen={openDropdown === 'create'} />
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider font-medium"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-8 py-3.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 uppercase tracking-wider font-medium hover:scale-105"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isMenuOpen
          ? "max-h-screen opacity-100 visible"
          : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
          {!isLoggedIn ? (
            <>
              {/* Product Section */}
              <div className="space-y-1">
                <div className="text-xs  text-slate-400 uppercase tracking-widest px-4 py-2">Product</div>
                {productDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Services Section */}
              <div className="space-y-1 pt-4">
                <div className="text-xs  text-slate-400 uppercase tracking-widest px-4 py-2">Services</div>
                {servicesDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {item.badge && <span className="ml-2 text-[10px] text-indigo-600 dark:text-indigo-400">({item.badge})</span>}
                  </a>
                ))}
              </div>

              {/* For Agencies Section */}
              <div className="space-y-1 pt-4">
                <div className="text-xs  text-slate-400 uppercase tracking-widest px-4 py-2">For Agencies</div>
                {agenciesDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Resources Section */}
              <div className="space-y-1 pt-4">
                <div className="text-xs  text-slate-400 uppercase tracking-widest px-4 py-2">Resources</div>
                {resourcesDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Pricing & Contact */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="/#pricing"
                  className="block px-4 py-3 text-base  text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="/user/login"
                  className="block px-4 py-3 text-center  text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href="/user/register"
                  className="block px-4 py-3 text-center  text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Authenticated Mobile Menu */}
              {authenticatedNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Create Section */}
              <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs  text-slate-400 uppercase tracking-widest px-4 py-2">Create</div>
                {createDropdown.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Profile & Logout */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    handleProfileClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;