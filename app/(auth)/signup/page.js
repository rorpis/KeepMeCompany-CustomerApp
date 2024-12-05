"use client";

import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { auth } from "../../../lib/firebase/config";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // get user id token
      const idToken = await userCredential.user.getIdToken();

      // send user info to server for database signup
      const userInfo = {
        email: email,
        name: name,
        surname: surname
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }
      
      const response = await fetch(`${backendUrl}/customer_app_api/user_signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ userInfo })
      });

      if (!response.ok) {
        // Add this to see what's going wrong
        const errorData = await response.json();
        console.error('Signup failed:', errorData);
        throw new Error(errorData.message || 'Signup failed');
      }

      const responseData = await response.json();
      
      if (responseData.registration_message === "success") {
        // Send email verification
        await sendEmailVerification(userCredential.user);
        router.push("/verify-email");
      } else {
        // delete user from firebase if signup fails
        await deleteUser(userCredential.user);
        setErrorMessage('Registration failed');
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create Your Account
          </h1>
          <p className="text-text-secondary mb-8">
            Join KeepMeCompany to get started
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Last Name
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-blue hover:bg-primary-blue/80 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-blue hover:text-primary-blue/80">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
