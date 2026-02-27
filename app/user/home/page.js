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
  const [userPlan, setUserPlan] = React.useState('free');

  React.useEffect(() => {
    const storedPlan = localStorage.getItem('userPlan');
    if (storedPlan) setUserPlan(storedPlan);
    
    const userId = localStorage.getItem('userid');
    if (userId) {
      fetch(`/api/user/profile/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.businessPlan) {
            const plan = (data.businessPlan || 'free').toLowerCase();
            setUserPlan(plan);
            localStorage.setItem('userPlan', plan);
          }
        })
        .catch(err => console.error('Error fetching user plan:', err));
    }
  }, []);

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

  // Handle activate trial
  const handleActivateTrial = async () => {
    const userId = localStorage.getItem('userid');
    if (!userId) {
      window.location.href = '/user/register';
      return;
    }

    try {
      const response = await fetch('/api/business/activate-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('businessPlan', 'trial');
        localStorage.setItem('userPlan', 'trial');
        window.location.href = '/automation';
      } else {
        // If already on a plan or other error, just go to dashboard
        if (data.error && data.error.includes('Current plan is')) {
           window.location.href = '/automation';
        } else {
           alert(data.error || 'Failed to activate trial. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      alert('An error occurred. Please try again.');
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


      <RevenueAudit />

  

      <PainSection />
      <LeadForGrowHero />
      {/* <LeaderboardSection /> */}
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
