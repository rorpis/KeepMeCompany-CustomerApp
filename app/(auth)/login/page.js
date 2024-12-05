"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase/config";
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email.endsWith('@keepmecompanyai.com') || user.emailVerified) {
          router.push("/workspace");
        } else {
          router.push("/verify-email");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await userCredential.user.reload();
      const freshUser = auth.currentUser;
      
      if (freshUser.email.endsWith('@keepmecompanyai.com') || freshUser.emailVerified) {
        router.push("/workspace");
      } else {
        router.push("/verify-email");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-text-secondary mb-8">
            Please login to your account
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-blue hover:bg-primary-blue/80 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-blue hover:text-primary-blue/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
