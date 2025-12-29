'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NeoButton } from '@/components/ui/neo';
import { useAuthStore } from '@/lib/store';
import { cookieStorage } from '@/lib/utils';

const NavbarContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mode = searchParams.get('mode');
  const isGuestRecruiter = mode === 'recruiter';
  
  const isRecruiterMode = user?.role === 'recruiter' || user?.role === 'Recuter' || (!user && isGuestRecruiter);

  // Wait for hydration to complete before rendering dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleRecruiterMode = () => {
      if (!user) {
          const newMode = isGuestRecruiter ? '' : 'recruiter';
          router.push(`/?mode=${newMode}`);
      }
  };

  useEffect(() => {
    if (!mounted) return;
    // Check cookie storage or system preference
    const storedTheme = cookieStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, [mounted]);

  const toggleDarkMode = () => {
    if (darkMode) {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      cookieStorage.setItem('theme', 'light');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      cookieStorage.setItem('theme', 'dark');
    }
  };

  // Close menus on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeClass = isRecruiterMode 
    ? 'underline decoration-4 decoration-neo-orange' 
    : 'underline decoration-4 decoration-neo-green';

  const handleLinkClick = (path) => {
      setIsMobileMenuOpen(false);
      // Logic to handle "view" updates if it was SPA, but here we navigate
  };

  const isActive = (path) => pathname === path;

  const renderLinks = (mobile = false) => {
    const baseClass = mobile 
      ? "block w-full text-left py-2 font-bold text-lg hover:bg-gray-100 dark:hover:bg-zinc-800 px-2 text-neo-black dark:text-white" 
      : "font-bold hover:underline decoration-2 underline-offset-4 mr-4 text-neo-black dark:text-white";

    const activeStyle = (path) => mobile 
      ? (isActive(path) ? "bg-gray-100 dark:bg-zinc-800 border-l-4 border-neo-black dark:border-white" : "") 
      : (isActive(path) ? activeClass : "");

    // Wait for hydration before rendering user-specific links
    if (!mounted) {
      return null;
    }

    if (!user) {
      return (
        <>
          <Link href={isRecruiterMode ? "/?mode=recruiter" : "/"} className={baseClass}>HOME</Link>
          <Link href={isRecruiterMode ? "/?mode=recruiter#about" : "/about"} className={baseClass}>ABOUT</Link>
          <Link href={isRecruiterMode ? "/?mode=recruiter#features" : "/#features"} className={baseClass}>FEATURES</Link>
          <Link href={isRecruiterMode ? "/?mode=recruiter#pricing" : "/#pricing"} className={baseClass}>PRICING</Link>
          
          <div className={mobile ? "my-4" : "inline-block ml-2"}>
            <NeoButton 
              variant={isRecruiterMode ? "primary" : "secondary"} 
              onClick={() => { toggleRecruiterMode(); setIsMobileMenuOpen(false); }} 
              className={`text-xs sm:text-sm px-3 ${isRecruiterMode ? 'bg-neo-orange text-white hover:bg-red-400' : ''} ${mobile ? 'w-full' : ''}`}
            >
              {isRecruiterMode ? '→ RECRUITER MODE' : '→ CANDIDATE MODE'}
            </NeoButton>
          </div>
          
          <div className={mobile ? "mt-2" : "inline-block ml-2"}>
             <Link href={`/login${isRecruiterMode ? '?mode=recruiter' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <NeoButton className={`${mobile ? 'w-full' : ''} ${isRecruiterMode ? 'bg-neo-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black' : ''}`}>LOGIN</NeoButton>
             </Link>
          </div>
        </>
      );
    }

    if (user.role === 'candidate' || user.role === 'Employee') {
      return (
        <>
          <Link href="/candidate/dashboard" className={`${baseClass} ${activeStyle('/candidate/dashboard')}`}>DASHBOARD</Link>
          <Link href="/candidate/jobs" className={`${baseClass} ${activeStyle('/candidate/jobs')}`}>JOBS</Link>
          <Link href="/candidate/applications" className={`${baseClass} ${activeStyle('/candidate/applications')}`}>APPS</Link>
        </>
      );
    }

    if (user.role === 'recruiter' || user.role === 'Recruiter' || user.role === 'Recuter') {
      return (
        <>
          <Link href="/recruiter/dashboard" className={`${baseClass} ${activeStyle('/recruiter/dashboard')}`}>HUB</Link>
          <Link href="/recruiter/jobs" className={`${baseClass} ${activeStyle('/recruiter/jobs')}`}>POSTINGS</Link>
          <Link href="/recruiter/candidates" className={`${baseClass} ${activeStyle('/recruiter/candidates')}`}>TALENT</Link>
        </>
      );
    }

    return null;
  };

  return (
    <nav className="border-b-4 border-neo-black dark:border-white bg-white dark:bg-[#1E1E1E] sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href={user ? (user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard') : (isRecruiterMode ? '/?mode=recruiter' : '/')} className="flex items-center cursor-pointer">
            <div className={`w-8 h-8 ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow'} border-2 border-neo-black dark:border-white mr-2 shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff]`}></div>
            <span className="font-black text-2xl tracking-tighter uppercase text-neo-black dark:text-white">
              Neo<span className={isRecruiterMode ? 'text-neo-orange' : 'text-neo-blue'}>Hire</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            {renderLinks(false)}

            {mounted && user ? (
              <>
              <div className="ml-6 relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 border-2 border-neo-black dark:border-white p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] active:translate-y-[2px] active:shadow-none bg-white dark:bg-zinc-900"
                >
                  <img 
                    src={user.profilePicture || user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"} 
                    alt="User" 
                    className="w-8 h-8 border border-neo-black dark:border-white object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter";
                    }}
                  />
                  <span className="font-bold text-sm hidden lg:block mr-1 uppercase text-neo-black dark:text-white">{user.fullName || user.name || 'USER'}</span>
                  <svg className="w-4 h-4 text-neo-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] z-50 animate-in fade-in slide-in-from-top-2">
                    <Link href={(user?.role === 'recruiter' || user?.role === 'Recuter') ? '/recruiter/profile' : '/profile'}>
                        <button 
                        onClick={() => setShowProfileMenu(false)}
                        className="block w-full text-left px-4 py-3 text-sm font-bold text-neo-black dark:text-white hover:bg-neo-yellow dark:hover:text-black border-b-2 border-neo-black dark:border-white"
                        >
                        MY PROFILE
                        </button>
                    </Link>
                    {/* <button 
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-3 text-sm font-bold text-neo-black dark:text-white hover:bg-neo-blue hover:text-white border-b-2 border-neo-black dark:border-white"
                      >
                      SETTINGS
                    </button> */}
                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); router.push('/'); }}
                      className="block w-full text-left px-4 py-3 text-sm font-bold hover:bg-neo-orange hover:text-white text-red-600"
                    >
                      LOGOUT
                    </button>
                  </div>
                )}
              </div>

              <button onClick={toggleDarkMode} className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl">
                  {darkMode ? '☀️' : '🌙'}
              </button>
              </>
            ) : (
              <button onClick={toggleDarkMode} className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl">
                  {darkMode ? '☀️' : '🌙'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 border-2 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] active:translate-y-1 active:shadow-none transition-all dark:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isMobileMenuOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                  </svg>
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#1E1E1E] border-b-4 border-neo-black dark:border-white p-4 shadow-neo-lg z-30 animate-in slide-in-from-top-4">
              <div className="flex flex-col space-y-2 dark:text-white">
                  {renderLinks(true)}
                  {user && (
                      <div className="border-t-2 border-gray-200 dark:border-zinc-700 mt-4 pt-4">
                          <Link href={(user?.role === 'recruiter' || user?.role === 'Recuter') ? '/recruiter/profile' : '/profile'} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left py-2 font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 px-2">MY PROFILE</Link>
                          <button onClick={() => { logout(); setIsMobileMenuOpen(false); router.push('/'); }} className="block w-full text-left py-2 font-bold text-red-600 hover:bg-red-50 px-2">LOGOUT</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </nav>
  );
};

const Navbar = () => {
    return (
        <Suspense fallback={<nav className="h-20 border-b-4 border-neo-black dark:border-white bg-white dark:bg-[#1E1E1E]"></nav>}>
            <NavbarContent />
        </Suspense>
    );
};

export default Navbar;
