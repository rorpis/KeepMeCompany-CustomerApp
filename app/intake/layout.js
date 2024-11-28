"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/firebase/authContext";

const IntakeLayout = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="intake-layout">
      <nav className="sidebar">
        <ul>
          <li onClick={() => router.push("/workbench")}>Back to Workbench</li>
          <li onClick={() => router.push("/intake")}>Intake - Main Screen</li>
        </ul>
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default IntakeLayout; 