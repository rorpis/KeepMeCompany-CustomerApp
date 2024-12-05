"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../lib/firebase/authContext";
import { useEffect } from "react";
import LoadingSpinner from "./_components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/workspace");
      } else {
        router.push("/welcome");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return null;
}
