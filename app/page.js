"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../lib/firebase/authContext";
import { useOrganisation } from "../lib/contexts/OrganisationContext";
import { useEffect } from "react";
import LoadingSpinner from "./_components/ui/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { organisations, loading: orgLoading } = useOrganisation();

  useEffect(() => {
    // Only redirect when both auth and org loading are complete
    if (!authLoading && !orgLoading) {
      if (!user) {
        router.push("/welcome");
      } else if (organisations.length === 0) {
        router.push("/workspace/organisation/setup");
      } else {
        router.push("/workspace");
      }
    }
  }, [user, authLoading, orgLoading, organisations, router]);

  // Show loading spinner while either auth or org is loading
  if (authLoading || orgLoading) {
    return <LoadingSpinner />;
  }

  return null;
}
