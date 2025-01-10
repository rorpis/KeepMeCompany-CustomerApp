/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // NEXT_PUBLIC_BACKEND_URL: "https://keep-me-company-backend-b450f889ef90.herokuapp.com",
    NEXT_PUBLIC_BACKEND_URL: "https://102a-87-125-188-163.ngrok-free.app",
    NEXT_PUBLIC_FIREBASE_CONFIG_apiKey: "AIzaSyBap0GJ9EogEOqRpaerGtXvysfam2n93cw",
    NEXT_PUBLIC_FIREBASE_CONFIG_appId: "1:1099500018898:web:02b80dc6f1be388979a10b",
    NEXT_PUBLIC_FIREBASE_CONFIG_authDomain: "keepmecompanyai.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_CONFIG_measurementId: "G-HEEH2GZVH0",
    NEXT_PUBLIC_FIREBASE_CONFIG_messagingSenderId: "1099500018898",
    NEXT_PUBLIC_FIREBASE_CONFIG_projectId: "keepmecompanyai",
    NEXT_PUBLIC_FIREBASE_CONFIG_storageBucket: "keepmecompanyai.firebasestorage.app",
  },
};

export default nextConfig;