// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
console.log("Initializing Firebase...");
let app;
try {
  // Debug config presence
  console.log("Firebase Config Check:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
  });

  app = initializeApp(firebaseConfig);
  console.log("Firebase App Initialized");
} catch (e) {
  console.error("Error initializing Firebase App:", e);
}

// Initialize services
export let auth;
export let db;
export let storage;

try {
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase Services Exported");
  } else {
    console.error("Firebase App not initialized, skipping services");
  }
} catch (e) {
  console.error("Error initializing Firebase Services:", e);
}

export default app;
