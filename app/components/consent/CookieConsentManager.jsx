'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Cookie, Shield, X } from 'lucide-react';
import {
  flushPendingPageViews,
  getConsentState,
  getVisitorId,
  hasAnalyticsConsent,
  logConsentToServer,
  queuePageView,
  saveConsentState,
  trackPageViewToServer,
} from '@/lib/consent/client';

const ADSENSE_CLIENT = 'ca-pub-4902724266607481';

function SettingsModal({ open, onClose, onAllow, onDecline, currentState }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#111827]/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-emerald-100 bg-gradient-to-r from-[#FAFDFA] to-white px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Privacy</p>
            <h2 className="mt-1 text-lg font-extrabold text-[#111827]" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
              Cookie preferences
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 text-[14px] leading-relaxed text-[#4B5563]">
          {currentState && (
            <div className="rounded-xl border border-emerald-100 bg-[#FAFDFA] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Your current choice</p>
              <p className="mt-1 font-semibold text-[#111827]">
                {currentState.status === 'granted' ? 'Allow cookies' : 'Decline cookies'}
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Analytics: {currentState.analyticsAllowed ? 'On' : 'Off'} · Marketing automation:{' '}
                {currentState.marketingAllowed ? 'On' : 'Off'}
              </p>
              {currentState.decidedAt && (
                <p className="mt-1 text-[12px] text-[#94A3B8]">
                  Saved {new Date(currentState.decidedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <p className="flex items-center gap-2 font-semibold text-[#111827]">
              <Shield className="h-4 w-4 text-emerald-700" />
              Why we ask
            </p>
            <p className="mt-2">
              Under GDPR (EU), CCPA (California), and India&apos;s DPDP Act, we need your permission before
              using tracking cookies for analytics, ads, or behavioral automation.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#111827]">Allow cookies</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
              <li>We set a visitor ID and log pages you view (pricing, demo, etc.)</li>
              <li>When you submit a form, we can link browsing history to your contact</li>
              <li>Lead scoring, attribution, and behavior-based follow-ups are enabled</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#111827]">Decline cookies</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
              <li>Only essential storage (site function, login session)</li>
              <li>No analytics pixels, ad tracking, or cross-session identification</li>
              <li>We only store what you explicitly submit in forms — no browsing trail</li>
              <li>Marketing automation stays off unless you opt in on a form separately</li>
            </ul>
          </div>

          <p className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#64748B]">
            WhatsApp, Instagram DM, and email replies you initiate are separate from cookie consent and
            may still receive service responses.
          </p>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-[#E2E8F0] bg-white px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-xl border border-[#D4D4D4] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#FAFAFA]"
          >
            Decline cookies
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="flex-1 rounded-xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:bg-black"
          >
            Allow cookies
          </button>
        </div>
      </div>
    </div>
  );
}

function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return undefined;

    const started = Date.now();
    queuePageView({ path: pathname, title: document.title, durationSec: 0 });

    trackPageViewToServer({
      path: pathname,
      title: document.title,
      durationSec: 0,
    }).catch(() => {});

    return () => {
      const durationSec = Math.round((Date.now() - started) / 1000);
      if (durationSec > 1) {
        trackPageViewToServer({ path: pathname, title: document.title, durationSec }).catch(() => {});
      }
    };
  }, [pathname]);

  return null;
}

export default function CookieConsentManager() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadAds, setLoadAds] = useState(false);

  const refreshConsent = useCallback(() => {
    const state = getConsentState();
    setConsent(state);
    setShowBanner(!state);
    setLoadAds(state?.status === 'granted' && state.analyticsAllowed);
  }, []);

  useEffect(() => {
    setMounted(true);
    getVisitorId();
    refreshConsent();

    const onChange = () => refreshConsent();
    const onOpenSettings = () => setShowSettings(true);
    window.addEventListener('lfg-consent-changed', onChange);
    window.addEventListener('lfg-open-cookie-settings', onOpenSettings);
    return () => {
      window.removeEventListener('lfg-consent-changed', onChange);
      window.removeEventListener('lfg-open-cookie-settings', onOpenSettings);
    };
  }, [refreshConsent]);

  const persistChoice = async (status) => {
    setLoading(true);
    const granted = status === 'granted';
    const visitorId = getVisitorId();
    const pendingViews = granted ? flushPendingPageViews() : [];

    const localState = {
      status,
      analyticsAllowed: granted,
      marketingAllowed: granted,
      visitorId,
    };

    try {
      await logConsentToServer({
        status,
        analyticsAllowed: granted,
        marketingAllowed: granted,
        pageViews: pendingViews.map((v) => ({
          path: v.path,
          title: v.title,
          durationSec: v.durationSec || 0,
          viewedAt: v.viewedAt,
        })),
        notes: granted
          ? 'Visitor allowed analytics and marketing cookies via banner'
          : 'Visitor declined tracking cookies — essential only',
      });

      saveConsentState(localState);
      setConsent(getConsentState());
      setShowBanner(false);
      setShowSettings(false);
      setLoadAds(granted);
    } catch (error) {
      console.error('[CookieConsent]', error);
      saveConsentState(localState);
      setConsent(getConsentState());
      setShowBanner(false);
      setShowSettings(false);
      setLoadAds(granted);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {consent?.analyticsAllowed && <PageViewTracker />}

      {loadAds && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-5">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Cookie consent</p>
              <p className="mt-1 text-[15px] font-semibold text-[#111827]">We use cookies to improve your experience</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">
                Allow cookies to help us measure traffic, attribute leads, and personalize follow-ups. Decline
                to use only essential cookies.{' '}
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                >
                  Learn more
                </button>
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => persistChoice('denied')}
                className="rounded-xl border border-[#D4D4D4] px-5 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#FAFAFA] disabled:opacity-60"
              >
                Decline cookies
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => persistChoice('granted')}
                className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                Allow cookies
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onAllow={() => persistChoice('granted')}
        onDecline={() => persistChoice('denied')}
        currentState={consent}
      />
    </>
  );
}
