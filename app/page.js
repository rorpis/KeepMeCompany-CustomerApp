"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to KeepMeCompany
          </h1>
          <p className="text-text-secondary mb-8">
            Please login or sign up to continue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-bg-elevated hover:bg-bg-secondary text-text-primary px-6 py-4 rounded-lg transition-colors duration-200 border border-border-main"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="w-full bg-bg-elevated hover:bg-bg-secondary text-text-primary px-6 py-4 rounded-lg transition-colors duration-200 border border-border-main"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
