"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <div>
        <button onClick={() => router.push("/login")}>Login</button>
        <button onClick={() => router.push("/signup")}>Sign Up</button>
      </div>
    </div>
  );
}
