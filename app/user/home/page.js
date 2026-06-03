'use client';

import React from 'react';
import { LANDING_PAGE_BG } from '@/app/components/landing/landingStyles';
import ContactFormSection from './C';
import UserNavbar from '../Header';
import TrustPopup from '@/app/components/TrustPopup';
import SuccessNotification from '@/app/components/SuccessNotification';
import PremiumHero from '@/app/components/landing/PremiumHero';
import FeatureModules from '@/app/components/landing/FeatureModules';
import SmoothScroll from '@/app/components/landing/SmoothScroll';
import TrustedCompanies from '@/app/components/landing/TrustedCompanies';
import IndustrySolutionsSection from '@/app/components/landing/IndustrySolutionsSection';
import WhatsAppAutomationSection from '@/app/components/landing/WhatsAppAutomationSection';
import RevenueEngineWorkflow from '@/app/components/landing/RevenueEngineWorkflow';
import ProductTourSection from '@/app/components/landing/ProductTourSection';
import AIFeaturesSection from '@/app/components/landing/AIFeaturesSection';
import RoiComparisonSection from '@/app/components/landing/RoiComparisonSection';
import CallingEfficiencySection from '@/app/components/landing/CallingEfficiencySection';
import IntegrationsSection from '@/app/components/landing/IntegrationsSection';
import TestimonialSection from '@/app/components/landing/TestimonialSection';
import LandingPricingSection from '@/app/components/landing/LandingPricingSection';
import FAQSection from '@/app/components/landing/FAQSection';
import LandingCTA from '@/app/components/landing/LandingCTA';
import { authFetch } from '@/lib/apiClient';
import { X } from 'lucide-react';

export default function LeadForGrowHeroPage() {
  const [showVideo, setShowVideo] = React.useState(false);
  const [showTrustPopup, setShowTrustPopup] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [meetLink, setMeetLink] = React.useState('');
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const userId = localStorage.getItem('userid');
    if (userId) {
      fetch(`/api/user/profile/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.businessPlan) {
            const plan = (data.businessPlan || 'free').toLowerCase();
            localStorage.setItem('userPlan', plan);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleGetStarted = () => {
    const userId = localStorage.getItem('userid');
    if (!userId) {
      window.location.href = '/user/register';
      return;
    }
    fetchUserDataAndShowPopup(userId);
  };

  const fetchUserDataAndShowPopup = async (userId) => {
    try {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch { /* ignore */ }
    setShowTrustPopup(true);
  };

  const handleActivateTrial = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token) {
      window.location.href = '/user/register';
      return;
    }
    try {
      const response = await authFetch('/api/business/activate-trial', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('businessPlan', 'trial');
        localStorage.setItem('userPlan', 'trial');
        window.location.href = '/automation';
      } else if (data.error?.includes('Current plan is')) {
        window.location.href = '/automation';
      } else {
        alert(data.error || 'Failed to activate trial.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };

  const handleScheduleCall = async () => {
    try {
      const response = await authFetch('/api/onboarding/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        setShowTrustPopup(false);
        setMeetLink(data.meetLink);
        setShowSuccess(true);
      } else {
        alert(data.error || 'Failed to schedule call. Please try again.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <SmoothScroll>
      <div className={`min-h-screen ${LANDING_PAGE_BG} transition-colors duration-500 overflow-x-hidden`}>
        <UserNavbar />

        <PremiumHero onGetStarted={handleGetStarted} onWatchDemo={() => setShowVideo(true)} />
        <TrustedCompanies />
        <FeatureModules />
        <IndustrySolutionsSection />
        <WhatsAppAutomationSection />
        <RevenueEngineWorkflow />
        <ProductTourSection />
        <AIFeaturesSection />
        <RoiComparisonSection />
        <CallingEfficiencySection />
        <IntegrationsSection />
        <TestimonialSection />
        <LandingPricingSection />
        <FAQSection />
        <LandingCTA />
        <ContactFormSection />

        {showVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/HZZpgqgy3kg?autoplay=1"
                title="Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <TrustPopup
          isOpen={showTrustPopup}
          onClose={() => setShowTrustPopup(false)}
          userName={userData?.name || ''}
          onScheduleCall={handleScheduleCall}
        />

        <SuccessNotification
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          meetLink={meetLink}
        />
      </div>
    </SmoothScroll>
  );
}
