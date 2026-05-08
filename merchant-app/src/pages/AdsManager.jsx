import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Send } from 'lucide-react';

const AdsManager = () => {
    const [adRequests, setAdRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adForm, setAdForm] = useState({ title: '', duration_days: 7, notes: '', banner: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const adsRes = await axios.get('/ads');
            setAdRequests(adsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ad request?')) return;
        try {
            await axios.delete(`/ads/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete ad request');
        }
    };

    const handleAdSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', adForm.title);
            formData.append('duration_days', adForm.duration_days);
            formData.append('notes', adForm.notes);
            if (adForm.banner) {
                formData.append('banner', adForm.banner);
            }

            await axios.post('/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setAdForm({ title: '', duration_days: 7, notes: '', banner: null });
            fetchData();
            alert('Ad request submitted successfully! Pending admin approval.');
        } catch (err) {
            console.error(err);
            alert('Error submitting ad request');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2>Advertisements</h2>
            <p>Request sponsored banner ads to increase your shop's visibility.</p>

            <div className="grid grid-cols-2 mt-4 gap-4">
                
                {/* CREATE AD REQUEST */}
                <div>
                    <div className="glass-panel mb-4" style={{borderTop: '4px solid var(--warning)', padding: '1.5rem'}}>
                        <h3 className="d-flex align-center gap-2 mb-3"><Send size={20} /> Request Sponsored Ad</h3>
                        <div style={{fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)'}}>
                            Sponsored ads appear on the customer home page. Billed separately.
                        </div>
                        <form onSubmit={handleAdSubmit}>
                            <div className="form-group">
                                <label className="form-label">Ad Campaign Title</label>
                                <input type="text" className="form-control" placeholder="Internal name for your ad" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration</label>
                                <select className="form-control" value={adForm.duration_days} onChange={e => setAdForm({...adForm, duration_days: parseInt(e.target.value)})}>
                                    <option value={7}>7 Days (Recommended)</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes for Admin (Optional)</label>
                                <textarea className="form-control" style={{minHeight: '80px'}} value={adForm.notes} onChange={e => setAdForm({...adForm, notes: e.target.value})}></textarea>
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Banner Image (Optional)</label>
                                <input type="file" className="form-control" accept="image/*" onChange={e => setAdForm({...adForm, banner: e.target.files[0]})} />
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{width: '100%'}}>Submit Request</button>
                        </form>
                    </div>
                </div>

                {/* AD REQUEST STATUS */}
                <div>
                    <h3>Ad Requests Status ({adRequests.length})</h3>
                    {loading ? <p>Loading...</p> : adRequests.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No ad requests submitted.</p> : adRequests.map(ad => (
                        <div key={ad.id} className="glass-panel mt-3 d-flex justify-between align-center" style={{padding: '1.25rem', marginBottom: '1rem'}}>
                            <div>
                                <h4 style={{margin: 0}}>{ad.title}</h4>
                                <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{ad.duration_days} Days</div>
                            </div>
                            <div className="d-flex align-center gap-3">
                                <span className={`badge ${ad.status === 'Approved' ? 'badge-success' : ad.status === 'Pending' ? 'badge-pending' : 'badge-danger'}`}>
                                    {ad.status}
                                </span>
                                <button onClick={() => handleDelete(ad.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 600, padding: '0.5rem'}}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AdsManager;
