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
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The parent component will handle the successful login
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
            console.error("Login Error:", err);
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