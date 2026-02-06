// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwGVYTYRMYYoUatlMAUKk3N6Hu0Y9E9kw",
  authDomain: "beijamin-50d6a.firebaseapp.com",
  projectId: "beijamin-50d6a",
  storageBucket: "beijamin-50d6a.firebasestorage.app",
  messagingSenderId: "606593291938",
  appId: "1:606593291938:web:a139539adbbc01fc1e69fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
