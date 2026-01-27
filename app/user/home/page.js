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
      <div className="relative max-w-7xl mx-auto px-8 py-20 mt-24 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-full blur-3xl animate-glow-pulse delay-500"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-glow-pulse delay-700"></div>
        </div>
        
        {/* Decorative Circles with Float Animation */}
        <div className="absolute top-28 left-6 lg:left-16 w-64 h-64 rounded-full border-[16px] border-white dark:border-slate-800 shadow-2xl hidden md:flex items-center justify-center opacity-0 animate-fade-in-left delay-200">
           <div className="w-48 h-48 bg-slate-200/40 dark:bg-slate-700/50 rounded-full flex items-center justify-center animate-float">
              <div className="w-32 h-32 bg-slate-400/20 dark:bg-slate-600/30 rounded-full blur-sm"></div>
           </div>
        </div>
        
        <div className="absolute top-44 right-6 lg:right-20 w-80 h-80 rounded-full border-[20px] border-white dark:border-slate-800 shadow-2xl hidden lg:flex items-center justify-center opacity-0 animate-fade-in-right delay-400">
           <div className="w-64 h-64 bg-slate-200/40 dark:bg-slate-700/50 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
              <div className="w-44 h-44 bg-slate-400/20 dark:bg-slate-600/30 rounded-full blur-sm"></div>
           </div>
        </div>

        {/* Sliding Theme Toggle */}
        <div 
          className="absolute top-16 right-4 lg:right-8 z-30 cursor-pointer group opacity-0 animate-fade-in delay-600"
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

        {/* Main Content with Staggered Animation */}
        <div className="relative z-20 text-center pt-28" style={{marginTop:"-135px"}}>
          {/* Staggered Headline Animation */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-slate-900 dark:text-white leading-tight transition-colors duration-500 tracking-tight">
            <span className="inline-block opacity-0 animate-fade-in-up">Stop Losing Revenue</span>
            <br />
            <span className="inline-block opacity-0 animate-fade-in-up delay-200">to Slow Follow-Ups.</span>
          </h1>
          
          {/* Subtext with Fade + Slide */}
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-6 mt-8 font-light transition-colors duration-500 leading-relaxed italic border-l-4 border-indigo-600 pl-6 text-left inline-block opacity-0 animate-fade-in-up delay-400">
            Leads go cold within minutes if not followed up. LeadForGrow ensures every enquiry is instantly acted on — or marked lost — automatically.
          </p>
          
          {/* CTA Buttons with Subtle Pulse */}
          <div className="flex flex-col items-center mt-12 mb-12 opacity-0 animate-fade-in-up delay-600">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl px-4">
              <button 
                onClick={() => window.open('https://calendly.com/leadforgrow/30min', '_blank')}
                className="group w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-indigo-300 dark:hover:shadow-indigo-800/50 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">Book a Free Demo</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button 
                onClick={() => setShowVideo(true)}
                className="group w-full sm:w-auto bg-white dark:bg-transparent text-slate-900 dark:text-white px-10 py-5 rounded-2xl text-xl font-bold border-2 border-slate-900 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                Watch Revenue Walkthrough
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Arrow with Animation */}
        <div className="absolute bottom-10 left-12 text-slate-300 dark:text-slate-700 opacity-0 animate-fade-in delay-800">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-float">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
      </div>

      <RevenueAudit />

      {/* REVENUE LEAK ESTIMATE BLOCK */}
      <div className="bg-slate-900 py-16 text-center border-y border-slate-800 relative overflow-hidden">
        {/* Animated Background Blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-glow-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-glow-pulse delay-500"></div>
        
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 opacity-0 animate-fade-in-up">
            What is one missed lead worth to you?
          </h3>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto font-medium opacity-0 animate-fade-in-up delay-200">
             If your average deal is ₹50,000 and you miss just 3 leads a week, that's ₹6,00,000 lost every month. 
             Stop letting them go to your competitors.
          </p>
          <button className="group px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-xl hover:shadow-rose-500/50 hover:scale-105 active:scale-95 opacity-0 animate-fade-in-up delay-400 relative overflow-hidden">
            <span className="relative z-10">Estimate My Revenue Leak</span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
