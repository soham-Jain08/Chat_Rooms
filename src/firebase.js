// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Load Firebase configuration from environment variables
// Make sure to create a .env file with your Firebase credentials
// See .env.example for the required variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBi1zqmdu6RmXqoeWHYDiYuR7z5RkjdVxk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chat-app-project-4d331.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chat-app-project-4d331",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chat-app-project-4d331.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "518564803213",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:518564803213:web:d5e90120daba042c8ce8c4"
};

// Validate that all required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Missing Firebase configuration. Please check your .env file. " +
    "See .env.example for required variables."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
// Allow different tabs/windows to use different accounts
setPersistence(auth, browserSessionPersistence).catch(() => {
  // ignore persistence errors; fallback to default
});
export const db = getFirestore(app);
