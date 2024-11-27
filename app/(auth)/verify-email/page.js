"use client";

import { useRouter } from "next/navigation";

const VerifyEmail = () => {
  const router = useRouter();

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
