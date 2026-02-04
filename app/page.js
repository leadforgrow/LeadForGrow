import React from "react";
import Script from "next/script";
import UserHome from "./user/home/page";
import LeadForGrowWidget from "./Enquiry";
import AIChatPopup from "./components/AIChatPopup";

export default function page() {
  return (
    <div>
   


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LeadForGrow",
            "url": "https://www.leadforgrow.com",
            "logo": "https://www.leadforgrow.com/logo.png"
          }),
        }}
      />
      <UserHome></UserHome>
      <LeadForGrowWidget></LeadForGrowWidget>
      <div className="flex justify-center py-8">
        <a 
          href="https://www.producthunt.com/products/leadforgrow?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-leadforgrow" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1061110&theme=dark&t=1768075503703" 
            alt="LeadForGrow - The missing layer between enquiry and revenue. | Product Hunt" 
            width="250" 
            height="54" 
          />
        </a>
      </div>
      {/* <AIChatPopup /> */}
      
      {/* Interakt WhatsApp Widget */}
      <Script
        id="interakt-kiwi"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,c,r,a,m){
              w['KiwiObject']=r;
              w[r]=w[r] || function () {
                (w[r].q=w[r].q||[]).push(arguments)};
              w[r].l=1*new Date();
                a=d.createElement(s);
                m=d.getElementsByTagName(s)[0];
              a.async=1;
              a.src=c;
              m.parentNode.insertBefore(a,m)
            })(window,document,'script',"https://app.interakt.ai/kiwi-sdk/kiwi-sdk-17-prod-min.js?v="+ new Date().getTime(),'kiwi');
            
            const initKiwi = () => {
                if (window.kiwi && typeof window.kiwi.init === 'function') {
                    window.kiwi.init('', 'txl2ro13PPN8TfMgn4xMNKVy3D7ptcQA', {});
                } else {
                    // Script not fully loaded yet, retry in a moment
                    setTimeout(initKiwi, 200);
                }
            };
            
            if (document.readyState === 'complete') {
                initKiwi();
            } else {
                window.addEventListener("load", initKiwi);
            }
          `,
        }}
      />
    </div>
  );
}
