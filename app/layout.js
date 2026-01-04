import Footer from "./components/Footer";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// FIXED: Clean metadata without conflicts
export const metadata = {
  title: "LeadForGrow - All-in-One Agency Operating System",
  description: "Run your agency on one powerful platform. Build no-code pages, manage clients, capture leads, track analytics, and scale faster with a complete agency operating system",
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
};
const currentYear = new Date().getFullYear();
// FIXED: Remove manual head tags - let Next.js handle it
import { ThemeProvider } from "./components/ThemeContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
          <Footer></Footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
