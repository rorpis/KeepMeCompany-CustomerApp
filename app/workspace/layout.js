"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/firebase/authContext";
import { useOrganisation } from "../../lib/contexts/OrganisationContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WorkspaceLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const { organisations, selectedOrgId, setSelectedOrgId, loading } = useOrganisation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
    if (isMenuOpen && !e.target.closest('.side-menu') && !e.target.closest('.burger-button')) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Burger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="burger-button px-4 text-gray-500 focus:outline-none"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isMenuOpen 
                      ? "M6 18L18 6M6 6l12 12" // X icon when menu is open
                      : "M4 6h16M4 12h16M4 18h16" // Burger icon when menu is closed
                    } 
                  />
                </svg>
              </button>

              {/* Organisation Selector */}
              <div className="ml-4 flex items-center">
                <select
                  value={selectedOrgId || ""}
                  onChange={handleOrganizationChange}
                  className="form-select rounded-md border-gray-300 pr-8 text-sm"
                >
                  <optgroup label="Your organizations">
                    {organisations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Options">
                    <option value="create-new">Create new organization</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-medium text-gray-700"
                >
                  {getInitials()}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation Menu with Overlay */}
      {isMenuOpen && (
        <>
          {/* Dark overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Side Menu */}
          <div className="side-menu fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30">
            {/* Close button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="pt-20 px-4">
              <Link 
                href="/workspace" 
                className="block py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Overview
              </Link>
              <Link 
                href="/workspace/intake" 
                className="block py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Patient Intake
              </Link>
              <Link 
                href="/workspace/organisation/dashboard" 
                className="block py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Organisation Dashboard
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default WorkspaceLayout; 