/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_FIREBASE_CONFIG: process.env.NEXT_PUBLIC_FIREBASE_CONFIG,
    NEXT_PUBLIC_FIREBASE_CONFIG_apiKey: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_apiKey,
    NEXT_PUBLIC_FIREBASE_CONFIG_appId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_appId,
    NEXT_PUBLIC_FIREBASE_CONFIG_authDomain: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_authDomain,
    NEXT_PUBLIC_FIREBASE_CONFIG_measurementId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_measurementId,
    NEXT_PUBLIC_FIREBASE_CONFIG_messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_messagingSenderId,
    NEXT_PUBLIC_FIREBASE_CONFIG_projectId: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_projectId,
    NEXT_PUBLIC_FIREBASE_CONFIG_storageBucket: process.env.NEXT_PUBLIC_FIREBASE_CONFIG_storageBucket,
  },
};

export default nextConfig;