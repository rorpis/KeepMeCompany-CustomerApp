"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../lib/firebase/authContext";
import { useOrganisation } from "../lib/contexts/OrganisationContext";
import { useEffect } from "react";
import LoadingSpinner from "./_components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { organisations, loading: orgLoading } = useOrganisation();

  useEffect(() => {
    if (!loading && !orgLoading) {
      if (!user) {
        router.push("/welcome");
      } else if (organisations.length === 0) {
        router.push("/workspace/organisation/setup");
      } else {
        router.push("/workspace");
      }
    }
  }, [user, loading, orgLoading, organisations, router]);

  if (loading || orgLoading) {
    return <LoadingSpinner />;
  }

  return null;
}
