import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../lib/firebase/authContext";
import { OrganisationProvider } from "../lib/contexts/OrganisationContext";
import { UserProvider } from '../lib/contexts/UserContext';
import { LanguageProvider } from '../lib/contexts/LanguageContext';

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
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <UserProvider>
            <LanguageProvider>
              <OrganisationProvider>
                {children}
              </OrganisationProvider>
            </LanguageProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
