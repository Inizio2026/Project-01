import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, ArrowRight, TrendingUp, Truck, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('merchant', JSON.stringify(res.data.merchant));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container d-flex align-center justify-center">
            <div className="grid grid-cols-2" style={{width: '100%', maxWidth: '1000px', gap: '4rem', alignItems: 'center'}}>
                
                {/* Left Form Pane */}
                <div className="auth-card animate-fade-in" style={{padding: '2.5rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', borderRadius: '24px'}}>
                    <h2 style={{fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem'}}>Merchant Portal</h2>
                    <p style={{color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem'}}>Enter your email and password to get started.</p>

                    {error && <div className="badge badge-danger mb-4 d-flex" style={{padding: '0.8rem', fontSize: '0.9rem', borderRadius: '8px'}}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label className="form-label" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#475569'}}>Email Address</label>
                            <div className="d-flex align-center" style={{background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem'}}>
                                <input 
                                    type="email" 
                                    placeholder="owner@shop.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required 
                                    style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '0.5rem', fontSize: '1rem', color: '#0f172a'}}
                                />
                            </div>
                        </div>

                        <div className="form-group mb-5">
                            <label className="form-label" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#475569'}}>Password</label>
                            <div className="d-flex align-center" style={{background: '#f1f5f9', borderRadius: '12px', padding: '0.5rem'}}>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required 
                                    style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '0.5rem', fontSize: '1rem', color: '#0f172a'}}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '12px'}} disabled={loading}>
                            {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight size={18} />
                        </button>
                        
                        <div className="mt-4" style={{textAlign: 'center', fontSize: '0.85rem', color: '#64748b'}}>
                            By continuing, you agree to our <br/>
                            <span style={{color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'}}>Terms of Service</span> and <span style={{color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'}}>Privacy Policy</span>.
                        </div>
                        
                        <div className="mt-4 pt-4" style={{borderTop: '1px solid var(--border)', textAlign: 'center', color: '#64748b', fontSize: '0.95rem'}}>
                            Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600, textDecoration: 'none'}}>Register Shop</Link>
                        </div>
                    </form>
                </div>

                {/* Right Branding Pane */}
                <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: '#047857', padding: '0.4rem 1rem', borderRadius: '20px', width: 'fit-content', fontWeight: 600, fontSize: '0.85rem'}}>
                        <CheckCircle2 size={16} /> LOCAL SHOP PARTNER
                    </div>
                    
                    <h1 style={{fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.05, marginBottom: 0, letterSpacing: '-1px'}}>
                        The Fresh <br/><span style={{color: 'var(--primary)'}}>Authority</span>
                    </h1>
                    
                    <p style={{fontSize: '1.15rem', color: '#475569', maxWidth: '400px', lineHeight: 1.6}}>
                        Scale your local business with editorial-grade tools. Manage orders, track inventory, and grow your shop's digital presence with ease.
                    </p>

                    <div className="d-flex flex-column gap-3 mt-2">
                        <div style={{background: '#f1f5f9', padding: '1.25rem', borderRadius: '16px'}}>
                            <TrendingUp size={24} color="var(--primary)" style={{marginBottom: '0.5rem'}} />
                            <h4 style={{margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem'}}>Profit Growth</h4>
                            <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Real-time analytics to optimize your margins and daily sales.</p>
                        </div>
                        
                        <div style={{background: '#f1f5f9', padding: '1.25rem', borderRadius: '16px'}}>
                            <Truck size={24} color="var(--primary)" style={{marginBottom: '0.5rem'}} />
                            <h4 style={{margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem'}}>Smart Logistics</h4>
                            <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Seamless order fulfillment and delivery tracking for your fleet.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
