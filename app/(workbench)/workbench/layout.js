"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";
import { OrganisationProvider } from '../../../lib/contexts/OrganisationContext';

const WorkbenchLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <OrganisationProvider>
      <div className="workbench-layout">
        <nav className="sidebar">
          <div className="user-info">
            <img src={user.photoURL || "/default-avatar.png"} alt="Profile" />
            <span>{user.displayName || user.email}</span>
          </div>
          <ul>
            <li onClick={() => router.push("/workbench/profile")}>Profile</li>
            <li onClick={() => router.push("/workbench/organisations")}>Organizations</li>
            <li onClick={signOut}>Sign Out</li>
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