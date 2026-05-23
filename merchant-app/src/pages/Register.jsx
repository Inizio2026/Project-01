import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, CheckCircle2, Lightbulb, User, Utensils, LayoutList, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        owner_name: '', phone: '', email: '', password: '', 
        nic_number: '', registration_id: '', registration_date: '',
        shop_name: '', shop_type: 'Restaurant', custom_shop_type: '', 
        description: '', business_description: '',
        address: '', area: '', district: '', 
        seating: false, takeaway: true, delivery: false,
        opening_time: '', closing_time: '', working_days: '',
        tags: [], logo: null, cover: null, license: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const AVAILABLE_TAGS = ['Riverside', 'Beachside', 'Lakeside', 'Calm Place', 'Family Friendly', 'Study Friendly', 'City View', 'Date Night'];

    const getRecommendation = (type) => {
        switch (type) {
            case 'Juice Bar': return 'We recommend setting up in Beachside or City areas. Suggested tags: Beachside, City View.';
            case 'Café': return 'Best suited for Calm & Scenic areas. Suggested tags: Calm Place, Study Friendly.';
            case 'Restaurant': return 'Ideal for Town areas or Family zones. Suggested tags: Family Friendly.';
            case 'Bakery': return 'Great for Residential areas. Suggested tags: Family Friendly.';
            case 'Fast Food': return 'Best suited for high traffic City areas. Suggested tags: City View.';
            default: return 'Use specific tags to help customers find you faster.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    submitData.append('tags', JSON.stringify(formData.tags));
                } else if (key === 'logo' || key === 'cover' || key === 'license') {
                    if (formData[key]) submitData.append(key, formData[key]);
                } else if (key === 'shop_type') {
                    const finalType = formData.shop_type === 'Other' ? formData.custom_shop_type : formData.shop_type;
                    submitData.append('shop_type', finalType);
                } else if (key !== 'custom_shop_type') {
                    submitData.append(key, formData[key]);
                }
            });

            await axios.post('http://localhost:5000/api/auth/register', submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert('Registration Successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container d-flex justify-center" style={{ padding: '3rem 1rem' }}>
            {/* Desktop-first dynamic grid (stacks on mobile) */}
            <div style={{ width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'flex-start' }}>
                
                {/* Left Form */}
                <div className="auth-card animate-fade-in" style={{ padding: '2.5rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', borderRadius: '24px', maxWidth: 'none', margin: 0 }}>

                    <h2 style={{fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.1}}>Establish Your<br/>Identity</h2>
                    
                    <div style={{height: '4px', width: '40%', background: 'var(--primary)', borderRadius: '2px', marginBottom: '2rem'}}></div>
                    
                    {error && <div className="badge badge-danger mb-4 d-flex" style={{padding: '0.8rem', fontSize: '0.9rem', borderRadius: '8px'}}>{error}</div>}

                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        
                        {/* Section 1 */}
                        <div className="form-group" style={{gridColumn: '1 / -1', marginTop: '0.5rem'}}>
                            <h4 className="d-flex align-center gap-2" style={{color: '#0f172a', fontSize: '1.1rem'}}><User size={18} color="var(--primary)"/> Owner Details</h4>
                        </div>
                        
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Owner Name</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="e.g. Julian Alexander" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Phone Number</label>
                            <input type="tel" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Email Address</label>
                            <input type="email" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="owner@shop.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>NIC Number</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="e.g. 199012345678" value={formData.nic_number} onChange={e => setFormData({...formData, nic_number: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control" 
                                    style={{background: '#f1f5f9', border: 'none', paddingRight: '2.75rem'}} 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#64748b'
                                    }}
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="form-group mt-4" style={{gridColumn: '1 / -1'}}>
                            <h4 className="d-flex align-center gap-2" style={{color: '#0f172a', fontSize: '1.1rem'}}><Utensils size={18} color="var(--primary)"/> Shop Information</h4>
                        </div>

                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Shop Name</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="The Green Table" value={formData.shop_name} onChange={e => setFormData({...formData, shop_name: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Shop Type</label>
                            <div className="d-flex gap-2">
                                <select className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.shop_type} onChange={e => setFormData({...formData, shop_type: e.target.value})}>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Café">Café</option>
                                    <option value="Bakery">Bakery</option>
                                    <option value="Juice Bar">Juice Bar</option>
                                    <option value="Fast Food">Fast Food</option>
                                    <option value="Other">Other (Specify)</option>
                                </select>
                                {formData.shop_type === 'Other' && (
                                    <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="Custom Type" value={formData.custom_shop_type} onChange={e => setFormData({...formData, custom_shop_type: e.target.value})} required />
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Business Registration ID</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="BR-12345" value={formData.registration_id} onChange={e => setFormData({...formData, registration_id: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Registration Date</label>
                            <input type="date" className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.registration_date} onChange={e => setFormData({...formData, registration_date: e.target.value})} />
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Business Description</label>
                            <textarea className="form-control" style={{background: '#f1f5f9', border: 'none', minHeight: '80px'}} placeholder="Briefly describe your business..." value={formData.business_description} onChange={e => setFormData({...formData, business_description: e.target.value})}></textarea>
                        </div>
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Address & Pin</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Area (e.g. Town)</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>District</label>
                            <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required />
                        </div>

                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <div style={{background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '1rem', borderRadius: '8px', color: '#166534', fontSize: '0.9rem'}}>
                                <strong>Smart Suggestion:</strong> {getRecommendation(formData.shop_type)}
                            </div>
                        </div>

                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Business Hours & Operations</label>
                            <div className="grid grid-cols-2 gap-3" style={{marginTop: '0.5rem'}}>
                                <div>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Opening Time</label>
                                    <input type="time" className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.opening_time} onChange={e => setFormData({...formData, opening_time: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Closing Time</label>
                                    <input type="time" className="form-control" style={{background: '#f1f5f9', border: 'none'}} value={formData.closing_time} onChange={e => setFormData({...formData, closing_time: e.target.value})} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Working Days (e.g., Mon - Fri)</label>
                                <input type="text" className="form-control" style={{background: '#f1f5f9', border: 'none'}} placeholder="Mon - Sun" value={formData.working_days} onChange={e => setFormData({...formData, working_days: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Environment Tags</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                {AVAILABLE_TAGS.map(tag => (
                                    <label key={tag} style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                                        background: formData.tags.includes(tag) ? 'var(--primary)' : '#f1f5f9',
                                        color: formData.tags.includes(tag) ? '#fff' : '#475569',
                                        fontWeight: formData.tags.includes(tag) ? 600 : 500, transition: '0.2s',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <input type="checkbox" style={{display: 'none'}} 
                                            checked={formData.tags.includes(tag)} 
                                            onChange={(e) => {
                                                if (e.target.checked) setFormData({...formData, tags: [...formData.tags, tag]});
                                                else setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
                                            }} 
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group mt-2" style={{gridColumn: '1 / -1'}}>
                            <label className="form-label" style={{fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase'}}>Media & Documents</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Business License (Image/PDF)</label>
                                    <input type="file" className="form-control" style={{fontSize: '0.85rem'}} onChange={e => setFormData({...formData, license: e.target.files[0]})} required />
                                </div>
                                <div>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Shop Logo (Optional)</label>
                                    <input type="file" accept="image/*" className="form-control" style={{fontSize: '0.85rem'}} onChange={e => setFormData({...formData, logo: e.target.files[0]})} />
                                </div>
                                <div>
                                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Cover Image (Optional)</label>
                                    <input type="file" accept="image/*" className="form-control" style={{fontSize: '0.85rem'}} onChange={e => setFormData({...formData, cover: e.target.files[0]})} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="form-group mt-4" style={{gridColumn: '1 / -1'}}>
                            <h4 className="d-flex align-center gap-2" style={{color: '#0f172a', fontSize: '1.1rem'}}><LayoutList size={18} color="var(--primary)"/> Services Available</h4>
                            <div className="d-flex gap-4 mt-3 flex-wrap">
                                <label className="d-flex align-center gap-2" style={{cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500}}>
                                    <input type="checkbox" checked={formData.takeaway} onChange={e => setFormData({...formData, takeaway: e.target.checked})} style={{accentColor: 'var(--primary)'}} />
                                    Takeaway
                                </label>
                                <label className="d-flex align-center gap-2" style={{cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500}}>
                                    <input type="checkbox" checked={formData.seating} onChange={e => setFormData({...formData, seating: e.target.checked})} style={{accentColor: 'var(--primary)'}} />
                                    Dine-in
                                </label>
                                <label className="d-flex align-center gap-2" style={{cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500}}>
                                    <input type="checkbox" checked={formData.delivery} onChange={e => setFormData({...formData, delivery: e.target.checked})} style={{accentColor: 'var(--primary)'}} />
                                    Delivery
                                </label>
                            </div>
                        </div>

                        <div style={{gridColumn: '1 / -1', marginTop: '1.5rem'}}>
                            <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', borderRadius: '12px'}} disabled={loading}>
                                <UserPlus size={20} /> {loading ? 'Processing...' : 'Register Shop Identity'}
                            </button>
                        </div>

                        <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#64748b'}} className="mt-4">
                            Already have an account? <Link to="/login" style={{color: 'var(--primary)', fontWeight: 600, textDecoration: 'none'}}>Sign In here</Link>
                        </div>
                    </form>
                </div>
                
                {/* Right Info Box */}
                <div className="animate-fade-in" style={{ position: 'sticky', top: '2rem' }}>
                    <div style={{ background: '#047857', color: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(4, 120, 87, 0.3)' }}>
                        <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>Why register?</h3>
                        
                        <div className="d-flex align-top gap-3 mb-4">
                            <CheckCircle2 color="#34d399" size={24} style={{flexShrink: 0, marginTop: '2px'}} />
                            <span style={{fontSize: '1.05rem', lineHeight: 1.5, color: '#ecfdf5'}}>Access the Authority Dashboard with real-time profit tracking.</span>
                        </div>
                        <div className="d-flex align-top gap-3 mb-4">
                            <CheckCircle2 color="#34d399" size={24} style={{flexShrink: 0, marginTop: '2px'}} />
                            <span style={{fontSize: '1.05rem', lineHeight: 1.5, color: '#ecfdf5'}}>Connect with over 10,000 fresh food enthusiasts in your area.</span>
                        </div>
                        <div className="d-flex align-top gap-3">
                            <CheckCircle2 color="#34d399" size={24} style={{flexShrink: 0, marginTop: '2px'}} />
                            <span style={{fontSize: '1.05rem', lineHeight: 1.5, color: '#ecfdf5'}}>Editorial-grade menu presentation tools included.</span>
                        </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'white', borderRadius: '12px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                            <Lightbulb size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem' }}>Pro-Tip</h4>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5 }}>Use a clear, recognizable shop name to increase your discoverability by 40%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
