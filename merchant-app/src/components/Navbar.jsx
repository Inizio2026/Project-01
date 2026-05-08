import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Store, Menu } from 'lucide-react';
import api from '../api/axios'; // assuming axios is configured here

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const merchantName = JSON.parse(localStorage.getItem('merchant'))?.name || 'Merchant';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/merchant/profile');
                setIsOpen(res.data.is_open === 1);
            } catch (err) {
                console.error('Error fetching status', err);
            }
        };
        fetchStatus();
    }, []);

    const handleToggleStatus = async () => {
        const newStatus = !isOpen;
        setIsOpen(newStatus);
        try {
            // Only update the is_open flag via a targeted endpoint or the existing profile update endpoint
            // We'll use the profile update endpoint and just merge existing data, but it requires all fields.
            // Let's assume we can fetch the profile and just update the toggle, but that's heavy.
            // A dedicated endpoint would be better, but we don't have one. We will send a PUT to /merchant/profile with current data.
            // Actually, we can fetch profile, then update.
            const res = await api.get('/merchant/profile');
            const data = res.data;
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined && key !== 'logo_url' && key !== 'cover_url' && key !== 'license_url') {
                    formData.append(key, data[key]);
                }
            });
            formData.set('is_open', newStatus);
            await api.put('/merchant/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            console.error('Failed to update status', error);
            setIsOpen(!newStatus); // revert
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('merchant');
        navigate('/login');
    };

    return (
        <>
            <header className="top-navbar">
                <div className="d-flex align-center gap-2">
                    <Menu className="d-md-none" size={24} color="var(--primary)" onClick={toggleSidebar} style={{cursor: 'pointer'}} />
                    <h4 style={{ margin: 0 }}>Welcome, {merchantName}</h4>
                </div>
                
                <div className="d-flex align-center gap-4">
                    <div className="d-flex align-center gap-2">
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: isOpen ? 'var(--success)' : 'var(--text-muted)' }}>
                            {isOpen ? 'Shop Open' : 'Shop Closed'}
                        </span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={isOpen} onChange={handleToggleStatus} />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <button className="btn btn-secondary logout-btn" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowLogoutModal(true)}>
                        <LogOut size={18} /> <span className="d-none d-sm-inline">Logout</span>
                    </button>
                </div>
            </header>

            {showLogoutModal && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-content text-center">
                        <LogOut size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                        <h3>Confirm Logout</h3>
                        <p>Are you sure you want to log out of your merchant account?</p>
                        <div className="d-flex gap-3 mt-4 justify-between">
                            <button className="btn btn-secondary w-100" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn btn-success w-100" onClick={handleLogout}>Yes, Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
