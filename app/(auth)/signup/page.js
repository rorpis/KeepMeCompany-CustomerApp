"use client";

import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../../lib/firebase/config";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useLanguage } from "../../../lib/contexts/LanguageContext";

const SignupForm = () => {
  const { t } = useLanguage();
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
        throw new Error(t('auth.signup.errors.backendNotConfigured'));
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
        setErrorMessage(t('auth.signup.errors.registrationFailed'));
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get Google OAuth credentials
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send user info to server
      const userInfo = {
        email: user.email,
        name: user.displayName?.split(' ')[0] || '',
        surname: user.displayName?.split(' ').slice(1).join(' ') || '',
        googleCalendarToken: token
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error(t('auth.signup.errors.backendNotConfigured'));
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const responseData = await response.json();
      
      if (responseData.registration_message === "success") {
        router.push("/workspace");
      } else {
        await deleteUser(user);
        setErrorMessage(t('auth.signup.errors.registrationFailed'));
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
            {t('auth.signup.title')}
          </h1>
          <p className="text-text-secondary mb-8">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  {t('auth.signup.firstName')}
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
                  {t('auth.signup.lastName')}
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
                {t('auth.signup.email')}
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
                {t('auth.signup.password')}
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
              {t('auth.signup.signupButton')}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-main"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-bg-elevated text-text-secondary">
                  {t('auth.signup.continueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border-main rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-gray-900 font-medium">
                  {t('auth.signup.continueGoogle')}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              {t('auth.signup.haveAccount')}{' '}
              <Link href="/login" className="text-primary-blue hover:text-primary-blue/80">
                {t('auth.signup.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
