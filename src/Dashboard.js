// --- Dashboard.js (THE FINAL GRANDMASTER VERSION - All Tools Included) ---
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from './firebase';
import ServerStatusManager from './ServerStatusManager'; // <-- IMPORTING THE TOOL
import RoadmapEditor from './RoadmapEditor';         // <-- IMPORTING THE TOOL
import './Dashboard.css';

const Dashboard = () => {
    const [pioneers, setPioneers] = useState([]);
    const [liveStatus, setLiveStatus] = useState({ totalPioneers: 0, totalCapacity: 100 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ type: null, data: null });
    const [formData, setFormData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        console.log('Dashboard: Starting Firebase connection...');
        const pioneersRef = ref(database, 'pioneers');
        const statusRef = ref(database, 'liveStatus');

        // Set a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            console.log('Dashboard: Loading timeout reached');
            setError('Failed to load data from Firebase. Please check your connection and try again.');
            setLoading(false);
        }, 10000); // 10 second timeout

        const unsubPioneers = onValue(pioneersRef, (snapshot) => {
            console.log('Firebase: Pioneers data received', snapshot.exists());
            const data = snapshot.val();
            console.log('Firebase: Pioneers raw data', data);
            const pioneersList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
            console.log('Firebase: Processed pioneers list', pioneersList);
            setPioneers(pioneersList);
            
            const activePioneers = pioneersList.filter(p => p.status !== 'FROZEN');
            set(ref(database, 'liveStatus/totalPioneers'), activePioneers.length);
            clearTimeout(loadingTimeout);
        }, (error) => {
            console.error('Firebase: Error reading pioneers data', error);
            setError(`Firebase Error: ${error.message}`);
            setLoading(false);
            clearTimeout(loadingTimeout);
        });

        const unsubStatus = onValue(statusRef, (snapshot) => {
            console.log('Firebase: Status data received', snapshot.exists());
            const data = snapshot.val();
            console.log('Firebase: Status raw data', data);
            if (data) setLiveStatus(data);
            setLoading(false);
            clearTimeout(loadingTimeout);
        }, (error) => {
            console.error('Firebase: Error reading status data', error);
            setError(`Firebase Error: ${error.message}`);
            setLoading(false);
            clearTimeout(loadingTimeout);
        });

        return () => { 
            clearTimeout(loadingTimeout);
            unsubPioneers(); 
            unsubStatus(); 
        };
    }, []);

    const filteredPioneers = useMemo(() => {
        if (!searchQuery) return pioneers;
        return pioneers.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.page && p.page.toLowerCase().includes(searchQuery.toLowerCase()))
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
        if (!isNaN(newCapacity) && newCapacity >= pioneers.filter(p=>p.status !== 'FROZEN').length) {
            await set(ref(database, 'liveStatus/totalCapacity'), newCapacity);
        } else {
            alert("Invalid capacity. Must be a number and greater than or equal to the current number of active pioneers.");
        }
    };

    if (loading) return <div>Loading Pioneer Data... <br/><small>This may take a few seconds. If this persists, check browser console for errors.</small></div>;
    
    if (error) return <div style={{color: 'red', padding: '20px'}}>Error: {error}</div>;

    return (
        <div className="dashboard-container">
            {/* --- OUR NEW TOOLS ARE HERE --- */}
            <ServerStatusManager />
            <RoadmapEditor />

            <div className="capacity-section">
                <div className="capacity-header">
                    <h2>Live Server Status</h2>
                    <form onSubmit={handleCapacityUpdate}>
                        <div className="capacity-form">
                            <label>Update Total Capacity:</label>
                            <input type="number" name="capacity" defaultValue={liveStatus.totalCapacity} />
                            <button type="submit">Update</button>
                        </div>
                    </form>
                </div>
                <div className="capacity-stats">
                    <div className="capacity-stat"><p>Active Pioneers / Capacity</p><span>{liveStatus.totalPioneers} / {liveStatus.totalCapacity}</span></div>
                    <div className="capacity-stat"><p>Available Slots</p><span>{liveStatus.totalCapacity - liveStatus.totalPioneers}</span></div>
                </div>
            </div>
            
            <div className="dashboard-header">
                <h1>Pioneer Management</h1>
                <input type="text" placeholder="Search pioneers..." className="search-bar" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button onClick={() => openModal('add')} className="add-pioneer-btn">+ Add New Pioneer</button>
            </div>
            
            <div className="pioneer-table">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Business Page</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
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