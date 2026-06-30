import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIbzOUPy4a3ob9F4iNI9tJHxtCdf3I8UU",
  authDomain: "civic-sync-4764d.firebaseapp.com",
  projectId: "civic-sync-4764d",
  storageBucket: "civic-sync-4764d.firebasestorage.app",
  messagingSenderId: "863660203979",
  appId: "1:863660203979:web:0ac61aa334d300dee4604e",
  measurementId: "G-WLPE258Y0N"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };
