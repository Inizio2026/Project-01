import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Tag } from 'lucide-react';

const OffersManager = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offerForm, setOfferForm] = useState({ title: '', description: '', start_date: '', end_date: '', banner: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const offersRes = await axios.get('/offers');
            setOffers(offersRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;
        try {
            await axios.delete(`/offers/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete offer');
        }
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', offerForm.title);
            formData.append('description', offerForm.description);
            formData.append('start_date', offerForm.start_date);
            formData.append('end_date', offerForm.end_date);
            if (offerForm.banner) {
                formData.append('banner', offerForm.banner);
            }

            await axios.post('/offers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOfferForm({ title: '', description: '', start_date: '', end_date: '', banner: null });
            fetchData();
            alert('Offer created successfully');
        } catch (err) {
            console.error(err);
            alert('Error creating offer');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2>Offers</h2>
            <p>Create limited-time offers to attract customers.</p>

            <div className="grid grid-cols-2 mt-4 gap-4">
                
                {/* CREATE OFFER */}
                <div>
                    <div className="glass-panel mb-4" style={{borderTop: '4px solid var(--primary)', padding: '1.5rem'}}>
                        <h3 className="d-flex align-center gap-2 mb-3"><Tag size={20} /> Create New Offer</h3>
                        <form onSubmit={handleOfferSubmit}>
                            <div className="form-group">
                                <label className="form-label">Offer Title</label>
                                <input type="text" className="form-control" placeholder="e.g. 20% Off Burgers" value={offerForm.title} onChange={e => setOfferForm({...offerForm, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea className="form-control" style={{minHeight: '80px'}} value={offerForm.description} onChange={e => setOfferForm({...offerForm, description: e.target.value})}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="form-label">Start Date</label>
                                    <input type="date" className="form-control" value={offerForm.start_date} onChange={e => setOfferForm({...offerForm, start_date: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control" value={offerForm.end_date} onChange={e => setOfferForm({...offerForm, end_date: e.target.value})} required />
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Banner Image (Optional)</label>
                                <input type="file" className="form-control" accept="image/*" onChange={e => setOfferForm({...offerForm, banner: e.target.files[0]})} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Publish Offer</button>
                        </form>
                    </div>
                </div>

                {/* ACTIVE OFFERS */}
                <div>
                    <h3>Active Offers ({offers.length})</h3>
                    {loading ? <p>Loading...</p> : offers.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No active offers currently.</p> : offers.map(offer => (
                        <div key={offer.id} className="glass-panel mt-3 d-flex justify-between align-center" style={{padding: '1.25rem', marginBottom: '1rem'}}>
                            <div>
                                <h4 style={{margin: 0}}>{offer.title}</h4>
                                <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                                    Ends: {new Date(offer.end_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="d-flex align-center gap-3">
                                <span className="badge badge-success">Active</span>
                                <button onClick={() => handleDelete(offer.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 600, padding: '0.5rem'}}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OffersManager;
