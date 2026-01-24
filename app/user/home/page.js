'use client';

import React from 'react';
import LeadForGrowHero from './F';
import AgencyOSLanding from './S';
import PricingSection from './P';
import ContactFormSection from './C';
import PainSection from './Pain';
import RevenueAudit from './RevenueAudit';
import SafetyNet from './SafetyNet';
import LeaderboardSection from './Leaderboard';
import Footer from './Footer';
import UserNavbar from '../Header';
import TrustPopup from '@/app/components/TrustPopup';
import SuccessNotification from '@/app/components/SuccessNotification';
import { useTheme } from '../../components/ThemeContext';
import { Moon, Sun, X, Play, ArrowRight, Target } from 'lucide-react';

export default function LeadForGrowHeroPage() {
  const { theme, toggleTheme } = useTheme();
  const [showVideo, setShowVideo] = React.useState(false);
  const [showTrustPopup, setShowTrustPopup] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [meetLink, setMeetLink] = React.useState('');
  const [userData, setUserData] = React.useState(null);

  // Handle Get Started button click
  const handleGetStarted = () => {
    const userId = localStorage.getItem('userid');
    
    if (!userId) {
      // Not logged in - redirect to register
      window.location.href = '/user/register';
      return;
    }

    // Logged in - fetch user data and show popup
    fetchUserDataAndShowPopup(userId);
  };

  // Fetch user data
  const fetchUserDataAndShowPopup = async (userId) => {
    try {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setShowTrustPopup(true);
      } else {
        console.error('Failed to fetch user data');
        // Fallback: show popup anyway
        setShowTrustPopup(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback: show popup anyway
      setShowTrustPopup(true);
    }
  };

  // Handle schedule call
  const handleScheduleCall = async () => {
    const userId = localStorage.getItem('userid');
    
    try {
      const response = await fetch('/api/onboarding/schedule-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Close popup and show success notification
        setShowTrustPopup(false);
        setMeetLink(data.meetLink);
        setShowSuccess(true);
      } else {
        alert('Failed to schedule call. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Navigation */}
      <UserNavbar />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-8 py-20 mt-24">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-indigo-600 rounded-full opacity-10 blur-3xl dark:opacity-20"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-rose-500 rounded-full opacity-10 blur-3xl dark:opacity-20"></div>
        
        {/* Decorative Circles (Refined for Light/Dark mode consistency) */}
        <div className="absolute top-28 left-6 lg:left-16 w-64 h-64 rounded-full border-[16px] border-white dark:border-slate-800 shadow-2xl hidden md:flex items-center justify-center animate-in fade-in zoom-in duration-1000">
           <div className="w-48 h-48 bg-slate-200/40 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 bg-slate-400/20 dark:bg-slate-600/30 rounded-full blur-sm"></div>
           </div>
        </div>
        
        <div className="absolute top-44 right-6 lg:right-20 w-80 h-80 rounded-full border-[20px] border-white dark:border-slate-800 shadow-2xl hidden lg:flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
           <div className="w-64 h-64 bg-slate-200/40 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
              <div className="w-44 h-44 bg-slate-400/20 dark:bg-slate-600/30 rounded-full blur-sm"></div>
           </div>
        </div>

        {/* Sliding Theme Toggle - Moved further Right */}
        <div 
          className="absolute top-16 right-4 lg:right-8 z-30 cursor-pointer group"
          style={{marginTop:"-60px"}}
          onClick={toggleTheme}
        >
          <div className="bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md rounded-full p-1 w-14 h-8 relative shadow-inner transition-colors duration-500">
            <div className={`absolute top-1 bottom-1 w-6 bg-white dark:bg-indigo-600 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ease-in-out ${theme === 'dark' ? 'left-[calc(100%-28px)]' : 'left-1'}`}>
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </div>
          <p className="text-right mt-2 text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">Mode</p>
        </div>

        {/* Main Content */}
        <div className="relative z-20 text-center pt-28" style={{marginTop:"-135px"}}>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-slate-900 dark:text-white leading-tight transition-colors duration-500 tracking-tight">
            Stop Losing Revenue<br />
            to Slow Follow-Ups.
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-6 mt-8 font-light transition-colors duration-500 leading-relaxed italic border-l-4 border-indigo-600 pl-6 text-left inline-block">
            Leads go cold within minutes if not followed up. LeadForGrow ensures every enquiry is instantly acted on — or marked lost — automatically.
          </p>
          
          <div className="flex flex-col items-center mt-12 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl px-4">
              <button 
                onClick={() => window.open('https://calendly.com/leadforgrow/30min', '_blank')}
                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-3"
              >
                Book a Free Demo <ArrowRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowVideo(true)}
                className="w-full sm:w-auto bg-white dark:bg-transparent text-slate-900 dark:text-white px-10 py-5 rounded-2xl text-xl font-bold border-2 border-slate-900 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-3 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Revenue Walkthrough
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Arrows */}
        <div className="absolute bottom-10 left-12 text-slate-300 dark:text-slate-700">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
      </div>

      <RevenueAudit />

      {/* REVENUE LEAK ESTIMATE BLOCK */}
      <div className="bg-slate-900 py-16 text-center border-y border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">What is one missed lead worth to you?</h3>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto font-medium">
             If your average deal is ₹50,000 and you miss just 3 leads a week, that’s ₹6,00,000 lost every month. 
             Stop letting them go to your competitors.
          </p>
          <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-xl">
             Estimate My Revenue Leak
          </button>
        </div>
      </div>

      <PainSection />
      <LeadForGrowHero />
      <LeaderboardSection />
      <SafetyNet />
      <AgencyOSLanding />
      <PricingSection onGetStarted={(planName) => {
        const userId = localStorage.getItem('userid');
        if (!userId) {
          window.location.href = '/user/register';
        } else {
          fetchUserDataAndShowPopup(userId);
        }
      }} />
      <ContactFormSection />
      {/* <Footer /> */}

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/HZZpgqgy3kg?autoplay=1" 
              title="Product Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Trust Popup */}
      <TrustPopup
        isOpen={showTrustPopup}
        onClose={() => setShowTrustPopup(false)}
        userName={userData?.name || ''}
        onScheduleCall={handleScheduleCall}
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        meetLink={meetLink}
      />
    </div>
  );
}
