"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/firebase/authContext";

const VerifyEmail = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push("/workspace");
        }
      }
    };

    checkVerification();
  }, [user, router]);

  return (
    <div>
      <h1>Verify Your Email</h1>
      <p>Please check your email and click the verification link.</p>
      <p>Once verified, you can proceed to login.</p>
      <button onClick={() => router.push("/login")}>
        Go to Login
      </button>
    </div>
  );
};

export default VerifyEmail;
