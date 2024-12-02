import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../lib/firebase/authContext";
import { AnimatePresence } from 'framer-motion'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "KeepMeCompany",
  description: "AI Phone Services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
