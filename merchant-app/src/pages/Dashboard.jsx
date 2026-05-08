import React, { useEffect, useState } from 'react';
import { Store, TrendingUp, Package, CheckCircle, Banknote, ShoppingCart, Activity, PlusCircle, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = () => {
    const [merchant, setMerchant] = useState(null);
    const [stats, setStats] = useState({ 
        todaySales: 0, items: 0, offers: 0, 
        pendingOrders: 0, completedOrders: 0, revenue: 0, revenueChange: 0 
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/merchant/profile');
                setMerchant(res.data);
                
                const [ordersRes, itemsRes, offersRes, revenueRes] = await Promise.all([
                    axios.get(`/orders?t=${new Date().getTime()}`).catch(() => ({data: []})),
                    axios.get('/menu').catch(() => ({data: []})),
                    axios.get('/offers').catch(() => ({data: []})),
                    axios.get('/orders/revenue/today').catch(() => ({data: {todayRevenue: 0, revenueChange: 0}}))
                ]);
                
                const orders = ordersRes.data;
                const pendingOrders = orders.filter(o => o.status === 'Pending').length;
                const completedOrders = orders.filter(o => o.status === 'Completed').length;
                
                const allTodayOrders = orders.filter(o => {
                    if (!o.created_at) return false;
                    const d = new Date(o.created_at);
                    const today = new Date();
                    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                });

                const todayRevenue = revenueRes.data.todayRevenue || 0;
                const revChange = revenueRes.data.revenueChange || 0;

                setStats({
                    todaySales: allTodayOrders.length,
                    items: itemsRes.data.length,
                    offers: offersRes.data.length,
                    pendingOrders,
                    completedOrders,
                    revenue: todayRevenue,
                    revenueChange: revChange
                });

                setRecentOrders(orders.slice(0, 5));

            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'badge-pending';
            case 'Accepted': return 'badge-primary';
            case 'Completed': return 'badge-success';
            case 'Rejected': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="animate-fade-in" style={{paddingBottom: '2rem'}}>
            <h2 style={{fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem'}}>Overview</h2>
            <p style={{color: '#64748b', fontSize: '1rem', marginBottom: '2rem'}}>Welcome back, track your daily performance.</p>

            <div className="grid grid-cols-4 gap-4 mb-4">
                {/* Revenue Card */}
                <div className="glass-panel" style={{padding: '1.5rem', position: 'relative', overflow: 'hidden', gridColumn: 'span 2'}}>
                    <div style={{color: '#64748b', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem'}}>Today's Revenue</div>
                    <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.1}}>
                        {stats.revenue > 0 ? `LKR ${stats.revenue.toFixed(2)}` : 'LKR 0'}
                    </div>
                    <div style={{display: 'inline-flex', alignItems: 'center', background: stats.revenueChange >= 0 ? '#d1fae5' : '#fee2e2', color: stats.revenueChange >= 0 ? '#059669' : '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600}}>
                        <TrendingUp size={12} style={{marginRight: '4px', transform: stats.revenueChange >= 0 ? 'none' : 'rotate(180deg)'}} /> {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}% vs Yesterday
                    </div>
                    <Banknote size={120} style={{position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03, color: 'var(--primary)'}} />
                </div>

                {/* Active Orders */}
                <div style={{background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: 'none', boxShadow: '0 15px 30px rgba(255, 90, 95, 0.25)', position: 'relative', overflow: 'hidden', gridColumn: 'span 2'}}>
                    <div style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem'}}>Pending Orders</div>
                    <div style={{fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>{stats.pendingOrders}</div>
                    <div style={{fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)', marginTop: '0.75rem'}}>Check order queue to process.</div>
                    <ShoppingCart size={140} style={{position: 'absolute', right: '-25px', bottom: '-25px', opacity: 0.15, transform: 'rotate(-10deg)'}} />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="card d-flex flex-column align-center text-center">
                    <Package size={24} color="var(--primary)" className="mb-2"/>
                    <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>{stats.todaySales}</div>
                    <div style={{color: '#64748b', fontSize: '0.85rem'}}>Today Sales</div>
                </div>
                <div className="card d-flex flex-column align-center text-center">
                    <CheckCircle size={24} color="var(--success)" className="mb-2"/>
                    <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>{stats.completedOrders}</div>
                    <div style={{color: '#64748b', fontSize: '0.85rem'}}>Completed</div>
                </div>
                <div className="card d-flex flex-column align-center text-center">
                    <Store size={24} color="var(--secondary)" className="mb-2"/>
                    <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>{stats.items}</div>
                    <div style={{color: '#64748b', fontSize: '0.85rem'}}>Menu Items</div>
                </div>
                <div className="card d-flex flex-column align-center text-center">
                    <Activity size={24} color="var(--warning)" className="mb-2"/>
                    <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a'}}>{stats.offers}</div>
                    <div style={{color: '#64748b', fontSize: '0.85rem'}}>Active Offers</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel" style={{gridColumn: 'span 2', padding: '1.5rem'}}>
                    <div className="d-flex justify-between align-center mb-4">
                        <h3 style={{margin: 0, fontSize: '1.2rem'}}>Recent Orders</h3>
                        <button className="btn btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => navigate('/orders')}>View All</button>
                    </div>
                    {recentOrders.length > 0 ? (
                        <div style={{overflowX: 'auto'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                <thead>
                                    <tr style={{borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase'}}>
                                        <th style={{padding: '0.75rem 0.5rem'}}>Order ID</th>
                                        <th style={{padding: '0.75rem 0.5rem'}}>Customer</th>
                                        <th style={{padding: '0.75rem 0.5rem'}}>Amount</th>
                                        <th style={{padding: '0.75rem 0.5rem'}}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id} style={{borderBottom: '1px solid var(--border)', transition: '0.2s'}} className="hover:bg-gray-50">
                                            <td style={{padding: '1rem 0.5rem', fontWeight: 600}}>#{order.id}</td>
                                            <td style={{padding: '1rem 0.5rem'}}>{order.customer_name || 'Walk-in'}</td>
                                            <td style={{padding: '1rem 0.5rem', fontWeight: 600}}>Rs. {order.total_amount}</td>
                                            <td style={{padding: '1rem 0.5rem'}}>
                                                <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No recent orders found.</div>
                    )}
                </div>

                <div className="glass-panel" style={{padding: '1.5rem'}}>
                    <h3 style={{margin: 0, marginBottom: '1.5rem', fontSize: '1.2rem'}}>Search</h3>
                    <div className="d-flex flex-column gap-3">
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search orders, menu items..." 
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', 
                                    borderRadius: '8px', border: '1px solid var(--border)',
                                    backgroundColor: '#fff', outline: 'none'
                                }}
                            />
                        </div>
                        <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
                            Quickly find specific customer orders or check menu item availability.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
