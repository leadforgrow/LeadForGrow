import Footer from "./components/Footer";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// FIXED: Clean metadata without conflicts
export const metadata = {
  title: "LeadForGrow - All-in-One Agency Operating System",
  description: "Run your agency on one powerful platform. Build no-code pages, manage clients, capture leads, track analytics, and scale faster with a complete agency operating system",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "google-adsense-account": "ca-pub-4902724266607481",
  },
};
const currentYear = new Date().getFullYear();
// FIXED: Remove manual head tags - let Next.js handle it
import { ThemeProvider } from "./components/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* <Script
  id="interakt-sdk"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function(w,d,s,c,r,a,m){
        w['KiwiObject']=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)};
        w[r].l=1*new Date();a=d.createElement(s);m=d.getElementsByTagName(s)[0];a.async=1;a.src=c;m.parentNode.insertBefore(a,m)
      })(window,document,'script',"https://app.interakt.ai/kiwi-sdk/kiwi-sdk-17-prod-min.js",'kiwi');
    `,
  }}
/> */}

        {/* Separate init script - CRITICAL: Load AFTER SDK */}
        {/* <Script
  id="interakt-init"
  strategy="lazyOnload"
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        function initKiwi() {
          if (typeof window !== 'undefined' && window.kiwi && typeof window.kiwi.init === 'function') {
            window.kiwi.init('', 'e44NElePOvKgorqrHc5T7ZhowwlY6UAq', {});
            return true;
          }
          return false;
        }
        
        // Wait for SDK to fully load
        const initAttempts = setInterval(() => {
          if (initKiwi()) {
            clearInterval(initAttempts);
          }
        }, 300);
        
        // Max 10 seconds
        setTimeout(() => clearInterval(initAttempts), 10000);
      })();
    `,
  }}
/> */}


        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4902724266607481"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
          <Footer></Footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
