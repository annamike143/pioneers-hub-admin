// --- firebase.js for ADMIN PORTAL (SECURE VERSION) ---
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Debug environment variables
console.log('Environment variables:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL ? 'Set' : 'Missing',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
});

// This code now securely reads your keys from the .env.local file
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);