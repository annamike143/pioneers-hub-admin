// --- App.js for ADMIN PORTAL (FINAL) ---
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase';
import Login from './Login';
import Dashboard from './Dashboard'; // We import our new Dashboard
import './App.css'; // Let's add some basic app-wide styles

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error("Sign out error", error));
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>; 
  }

  return (
    <div className="admin-app">
      {user ? (
        <>
          <div className="admin-header">
            <h3>SmartBot Admin Portal</h3>
            <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
          </div>
          <Dashboard />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;