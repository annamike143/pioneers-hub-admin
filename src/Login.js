// --- Login.js - Secure Login Component for Admin Portal ---
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase'; // We will create this auth object next
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        console.log('Attempting login with:', { email, passwordLength: password.length });
        console.log('Firebase config check:', {
            hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
        });
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.email);
            // The parent component will handle the successful login
        } catch (err) {
            console.error("Login Error Details:", {
                code: err.code,
                message: err.message,
                customData: err.customData
            });
            
            // Provide specific error messages
            let errorMessage = 'Login failed. ';
            switch (err.code) {
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Network error. Please check your connection.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage += 'Invalid credentials provided.';
                    break;
                case 'auth/api-key-expired':
                    errorMessage += 'API key expired. Configuration has been updated - please try again.';
                    break;
                default:
                    errorMessage += `Error: ${err.code} - ${err.message}`;
            }
            setError(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src="/logo-mascot.png" alt="SmartBot Mascot" className="login-logo" />
                <h2>Pioneer Hub Admin Portal</h2>
                <p>Please sign in to continue</p>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;