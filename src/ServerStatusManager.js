// --- ServerStatusManager.js ---
import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from './firebase';
import './ServerStatusManager.css';

const ServerStatusManager = () => {
    const [status, setStatus] = useState('Operational');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const statusRef = ref(database, 'siteContent/serverStatus');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setStatus(data.status);
                setMessage(data.message);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const statusRef = ref(database, 'siteContent/serverStatus');
        try {
            await set(statusRef, { status, message });
            alert('Server status updated successfully!');
        } catch (error) {
            alert('Failed to update status.');
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="status-manager-container">Loading Status...</div>;
    }

    return (
        <div className="status-manager-container">
            <h2>System Status Manager</h2>
            <form onSubmit={handleUpdate} className="status-form">
                <div className="form-group">
                    <label>Current Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Outage">Major Outage</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Status Message</label>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., All systems are operational."
                    />
                </div>
                <button type="submit" className="update-btn">Update Status</button>
            </form>
        </div>
    );
};

export default ServerStatusManager;