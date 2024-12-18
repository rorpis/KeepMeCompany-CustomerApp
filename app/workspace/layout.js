"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/firebase/authContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import { useUser } from "../../lib/contexts/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../_components/LoadingSpinner";

const WorkspaceLayout = ({ children }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const { userDetails, loading: userLoading } = useUser();
  const { organisations, selectedOrgId, setSelectedOrgId, loading: orgLoading, organisationDetails } = useOrganisation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const profileMenuRef = useRef(null);

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
    if (
      (isMenuOpen && !e.target.closest('.side-menu') && !e.target.closest('.burger-button')) ||
      (isProfileOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target))
    ) {
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isProfileOpen]);

  // Check if any context is still loading
  const isLoading = authLoading || userLoading || orgLoading || (!orgLoading && selectedOrgId && !organisationDetails);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && !userDetails && !userLoading) {
      // Only redirect if we've tried and failed to load user details
      router.push('/login');
    }
  }, [user, authLoading, userDetails, userLoading, router]);

  // Show loading spinner while any context is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show nothing if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Show nothing if essential data is missing
  if (!userDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Top Navigation Bar */}
      <nav className="bg-bg-elevated border-b border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              {/* Burger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-text-primary hover:bg-bg-secondary rounded-md"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Home Button */}
              <button
                onClick={() => router.push('/workspace')}
                className="p-2 text-text-primary hover:bg-bg-secondary rounded-md flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </button>

              {/* Organisation Selector */}
              <select
                value={selectedOrgId || ""}
                onChange={handleOrganizationChange}
                className="bg-bg-secondary text-text-primary rounded-md border-none px-4 py-2 focus:ring-1 focus:ring-primary-blue"
              >
                <option value="">Select Organization</option>
                {organisations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
                <option value="create-new">Create new organization</option>
              </select>
            </div>

            {/* Profile Button and Dropdown */}
            <div className="relative flex items-center">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center"
              >
                {getInitials()}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-10 w-48 bg-bg-elevated border border-border-main rounded-md shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-2 text-sm text-text-secondary">
                    {userDetails?.name} {userDetails?.surname}
                  </div>
                  <div className="border-t border-border-main"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-bg-elevated transform transition-transform duration-200 ease-in-out z-50 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-text-secondary hover:text-text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="mt-8 space-y-4">
            <Link
              href="/workspace"
              className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Overview
            </Link>
            <Link
              href="/workspace/intake"
              className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Patient Intake
            </Link>
            <Link
              href="/workspace/remote-monitoring"
              className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Remote Monitoring
            </Link>
            <Link
              href="/workspace/organisation/dashboard"
              className="block px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Organisation Dashboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default WorkspaceLayout; 