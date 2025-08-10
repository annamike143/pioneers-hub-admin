// --- firebase.js for ADMIN PORTAL ---
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need analytics

const firebaseConfig = {
  apiKey: "AIzaSyDXAZoTDlEtkeoQ9HwqR4-xFsLZUt3E-ks",
  authDomain: "smartbot-status-dashboard.firebaseapp.com",
  databaseURL: "https://smartbot-status-dashboard-default-rtdb.firebaseio.com",
  projectId: "smartbot-status-dashboard",
  storageBucket: "smartbot-status-dashboard.appspot.com", // Fixed domain
  messagingSenderId: "962499826914",
  appId: "1:962499826914:web:2a3e66c7fd20dac4283abb",
  measurementId: "G-DSDQLN7YJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Uncomment if you need analytics

// Get a reference to the services
export const database = getDatabase(app);
export const auth = getAuth(app);