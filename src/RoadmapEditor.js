// --- RoadmapEditor.js ---
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from './firebase';
import './RoadmapEditor.css';

const RoadmapEditor = () => {
    const [roadmapItems, setRoadmapItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ type: null, data: null });
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const roadmapRef = ref(database, 'siteContent/roadmap');
        const unsubscribe = onValue(roadmapRef, (snapshot) => {
            const data = snapshot.val();
            const loadedItems = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setRoadmapItems(loadedItems);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const openModal = (type, item = null) => {
        setModal({ type, data: item });
        setFormData(item || { title: '', description: '', icon: 'engine' });
    };

    const closeModal = () => setModal({ type: null, data: null });

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { id, title, description, icon } = formData;

        if (modal.type === 'add') {
            await push(ref(database, 'siteContent/roadmap'), { title, description, icon });
        } else if (modal.type === 'edit') {
            await set(ref(database, `siteContent/roadmap/${id}`), { title, description, icon });
        }
        closeModal();
    };

    const handleRemove = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this roadmap item?')) {
            await remove(ref(database, `siteContent/roadmap/${itemId}`));
        }
    };

    if (isLoading) return <div className="roadmap-editor-container">Loading Roadmap...</div>;

    return (
        <div className="roadmap-editor-container">
            <div className="roadmap-header">
                <h2>Roadmap Editor</h2>
                <button onClick={() => openModal('add')} className="add-item-btn">+ Add New Item</button>
            </div>

            <div className="roadmap-list">
                {roadmapItems.map(item => (
                    <div key={item.id} className="roadmap-item">
                        <div className="item-info">
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                            <small>Icon: {item.icon}</small>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => openModal('edit', item)}>Edit</button>
                            <button onClick={() => handleRemove(item.id)} className="remove">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {modal.type && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>{modal.type === 'add' ? 'Add Roadmap Item' : 'Edit Roadmap Item'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input name="title" value={formData.title} onChange={handleFormChange} placeholder="Title" required />
                            <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Description" required />
                            <select name="icon" value={formData.icon} onChange={handleFormChange}>
                                <option value="engine">Engine Icon</option>
                                <option value="media">Media Icon</option>
                                <option value="dashboard">Dashboard Icon</option>
                                <option value="rocket">Rocket Icon</option>
                                <option value="security">Security Icon</option>
                            </select>
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancel</button>
                                <button type="submit">{modal.type === 'add' ? 'Add Item' : 'Save Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapEditor;