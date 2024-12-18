"use client";

import { useRouter } from "next/navigation";
import { ActiveButton } from "../_components/global_components";

export default function ErrorPage({ 
  title = "Service Temporarily Unavailable",
  message = "We're experiencing some technical difficulties. Our team has been notified and is working to resolve the issue.",
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {title}
          </h1>
          <p className="text-text-secondary mb-8">
            {message}
          </p>
        </div>

        <div className="bg-bg-elevated rounded-lg p-8 shadow-sm border border-border-main">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please try again in a few minutes. If the problem persists, contact support.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <ActiveButton
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </ActiveButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 