// --- Dashboard.js (FINAL v3 - Search & Freeze Functionality) ---
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from './firebase';
import './Dashboard.css';

const Dashboard = () => {
    const [pioneers, setPioneers] = useState([]);
    const [liveStatus, setLiveStatus] = useState({ totalPioneers: 0, totalCapacity: 100 });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ type: null, data: null });
    const [formData, setFormData] = useState({});
    
    // --- NEW: State for our search query ---
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const pioneersRef = ref(database, 'pioneers');
        const statusRef = ref(database, 'liveStatus');

        const unsubPioneers = onValue(pioneersRef, (snapshot) => {
            const data = snapshot.val();
            const pioneersList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
            setPioneers(pioneersList);
            
            // --- UPGRADE: Count only active pioneers for the public status ---
            const activePioneers = pioneersList.filter(p => p.status !== 'FROZEN');
            set(ref(database, 'liveStatus/totalPioneers'), activePioneers.length);
        });

        const unsubStatus = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setLiveStatus(data);
            setLoading(false);
        });

        return () => { unsubPioneers(); unsubStatus(); };
    }, []);

    // --- NEW: Memoized filtering for search functionality ---
    const filteredPioneers = useMemo(() => {
        if (!searchQuery) return pioneers;
        return pioneers.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.page.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [pioneers, searchQuery]);

    const openModal = (type, pioneer = null) => {
        setModal({ type, data: pioneer });
        setFormData(pioneer || { name: '', page: '', status: 'PIONEER' });
    };
    const closeModal = () => setModal({ type: null, data: null });
    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { id, name, page, status } = formData;
        if (modal.type === 'add') {
            await push(ref(database, 'pioneers'), { name, page, status });
        } else if (modal.type === 'edit') {
            await update(ref(database, `pioneers/${id}`), { name, page, status });
        }
        closeModal();
    };
    
    const handleRemove = async (pioneerId) => {
        if (window.confirm("Are you sure? This will permanently delete the pioneer.")) {
            await remove(ref(database, `pioneers/${pioneerId}`));
        }
    };

    const handleCapacityUpdate = async (e) => {
        e.preventDefault();
        const newCapacity = parseInt(e.target.elements.capacity.value, 10);
        if (!isNaN(newCapacity) && newCapacity >= pioneers.length) {
            await set(ref(database, 'liveStatus/totalCapacity'), newCapacity);
        } else {
            alert("Invalid capacity.");
        }
    };

    if (loading) return <div>Loading Pioneer Data...</div>;

    return (
        <div className="dashboard-container">
            <div className="capacity-section">
                 {/* ... capacity management code (unchanged) ... */}
            </div>
            
            <div className="dashboard-header">
                <h1>Pioneer Management</h1>
                {/* --- NEW: Search Bar --- */}
                <input 
                    type="text"
                    placeholder="Search pioneers..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => openModal('add')} className="add-pioneer-btn">+ Add New Pioneer</button>
            </div>
            
            <div className="pioneer-table">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Business Page</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {/* --- UPGRADE: We now map over the filtered list --- */}
                        {filteredPioneers.map(pioneer => (
                            <tr key={pioneer.id}>
                                <td>{pioneer.name}</td>
                                <td>{pioneer.page}</td>
                                <td><span className={`status-tag ${pioneer.status.toLowerCase()}`}>{pioneer.status}</span></td>
                                <td>
                                    <button onClick={() => openModal('edit', pioneer)} className="action-btn">Edit</button>
                                    <button onClick={() => handleRemove(pioneer.id)} className="action-btn remove">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal.type && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>{modal.type === 'add' ? 'Add New Pioneer' : 'Edit Pioneer'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
                            <input type="text" name="page" value={formData.page} onChange={handleFormChange} required />
                            {/* --- UPGRADE: Added "FROZEN" status --- */}
                            <select name="status" value={formData.status} onChange={handleFormChange}>
                                <option value="PIONEER">Pioneer (Free)</option>
                                <option value="PARTNER">Partner (Paid)</option>
                                <option value="FROZEN">Frozen</option>
                            </select>
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancel</button>
                                <button type="submit">{modal.type === 'add' ? 'Add Pioneer' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;