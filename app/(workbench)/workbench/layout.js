"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { OrganisationProvider } from '../../../lib/contexts/OrganisationContext';

const WorkbenchLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <OrganisationProvider>
      <div className="workbench-layout">
        <nav className="sidebar">
          <div className="user-info">
            <span>{user.email}</span>
          </div>
          <ul>
            <li onClick={() => router.push("/workbench")}>Workbench</li>
            <li onClick={handleSignOut}>Sign Out</li>
          </ul>
        </nav>
        <main className="content">
          {children}
        </main>
      </div>
    </OrganisationProvider>
  );
};

export default WorkbenchLayout; 