"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/firebase/authContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import { useUser } from "../../lib/contexts/UserContext";
import { useLanguage } from "../../lib/contexts/LanguageContext";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../_components/ui/LoadingSpinner";
import LanguageSelector from "../_components/LanguageSelector";

const WorkspaceLayout = ({ children }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const { userDetails, loading: userLoading } = useUser();
  const { organisations, selectedOrgId, setSelectedOrgId, loading: orgLoading, organisationDetails } = useOrganisation();
  const { t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef(null);
  const pathname = usePathname();

  const getInitials = () => {
    if (!userDetails) return "U";
    return `${userDetails.name[0]}${userDetails.surname[0]}`.toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleOrganizationChange = (e) => {
    const value = e.target.value;
    if (value === "create-new") {
      router.push("/workspace/organisation/create");
    } else {
      setSelectedOrgId(value);
    }
  };

  const handleClickOutside = (e) => {
    if (isProfileOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const isLoading = authLoading || userLoading || orgLoading || (!orgLoading && selectedOrgId && !organisationDetails);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !userDetails && !userLoading) {
      router.push('/login');
    } else if (!authLoading && user && organisations.length > 0) {
      const storedOrgId = localStorage.getItem('selectedOrgId');
      const isValidOrgId = organisations.some(org => org.id === storedOrgId);
      
      if (!storedOrgId || !isValidOrgId) {
        // If no stored org or invalid org, set the first available org
        setSelectedOrgId(organisations[0].id);
      }
    } else if (!authLoading && user && organisations.length === 0) {
      router.push('/workspace/organisation/setup');
    }
  }, [user, authLoading, userDetails, userLoading, organisations, router]);

  const getPageTitle = () => {
    switch (pathname) {
      case '/workspace/calls/create-follow-up':
        return 'Create Call';
      case '/workspace/calls/live-dashboard':
        return 'Calls Dashboard';
      case '/workspace/organisation/dashboard':
        return 'Organisation Settings';
      case '/workspace':
        return 'Home';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !userDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Top Navigation Bar */}
      <nav className="bg-bg-elevated border-b border-border-main/30 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-8">
              {/* Home Button */}
              <Link
                href="/workspace"
                className="text-text-primary hover:text-primary-blue transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>

              {/* Page Title */}
              <h1 className="text-lg font-medium text-text-primary">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {/* Organisation Selector */}
              {organisations.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedOrgId || ""}
                    onChange={handleOrganizationChange}
                    className="appearance-none bg-bg-secondary text-text-primary rounded-md pl-4 pr-10 py-2 text-sm border border-border-main/30 hover:border-primary-blue focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-colors duration-200"
                  >
                    {organisations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                    <option disabled className="border-t border-border-main">
                      ─────────────
                    </option>
                    <option value="create-new">
                      {t('workspace.layout.createNewOrg')}
                    </option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Language Selector */}
              <div className="border-l border-border-main/30 pl-6">
                <LanguageSelector />
              </div>

              {/* Profile Button */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center text-sm border border-border-main hover:border-primary-blue transition-all duration-200"
              >
                {getInitials()}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-4 top-14 w-56 bg-bg-elevated border border-border-main rounded-md shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-border-main">
                    <p className="text-sm font-medium text-text-primary">{userDetails?.name} {userDetails?.surname}</p>
                    <p className="text-xs text-text-secondary mt-1">{userDetails?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors duration-200"
                  >
                    {t('workspace.layout.signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default WorkspaceLayout; 