import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X } from 'lucide-react';

const OrdersManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');
    const [selectedOtpOrder, setSelectedOtpOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`/orders?t=${new Date().getTime()}`);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await axios.put(`/orders/${id}/status`, { status });
            if (res.data.otp_code) {
                const order = orders.find(o => o.id === id);
                if (order) {
                    setSelectedOtpOrder({ ...order, otp_code: res.data.otp_code });
                }
            }
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert('Error updating order');
        }
    };

    // Date formatting helper
    const formatDateTime = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const renderOrderCard = (order) => {
        const isPending = order.status === 'Pending';
        const isAccepted = order.status === 'Accepted';
        
        let statusColor = 'var(--warning)';
        let statusBg = '#fff3cd'; // Yellowish light
        let statusText = '#856404'; // Brownish text

        if (order.status === 'Accepted') {
            statusBg = '#e7f0ff';
            statusText = '#0b5ed7';
        } else if (order.status === 'Completed') {
            statusBg = '#d1e7dd';
            statusText = '#0f5132';
        } else if (order.status === 'Rejected') {
            statusBg = '#f8d7da';
            statusText = '#842029';
        }

        return (
        <div key={order.id} className="glass-panel mt-3" style={{ padding: '1.5rem' }}>
            <div className="d-flex justify-between align-center mb-1">
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Order #{order.id}</span>
                <span className="badge" style={{
                    backgroundColor: statusBg,
                    color: statusText,
                    fontWeight: 600,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                }}>
                    {order.status}
                </span>
            </div>
            
            <div className="mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {formatDateTime(order.created_at)}
            </div>

            <div className="grid grid-cols-2 mb-3" style={{gap: '1rem'}}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer</div>
                    <div style={{ fontWeight: 500 }}>{order.customer_name || 'Guest'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '2px' }}>Phone</div>
                    <div style={{ fontWeight: 500 }}>{order.customer_phone || 'N/A'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Type</div>
                    <div style={{ fontWeight: 500 }}>{order.order_type}</div>
                </div>
            </div>

            <div className="mb-3">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Items</div>
                <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '8px' }}>
                    {order.items?.map(item => (
                        <div key={item.id} className="d-flex justify-between align-center mb-2" style={{fontSize: '0.9rem'}}>
                            <div>{item.quantity}x {item.item_name}</div>
                            <div style={{color: 'var(--text-muted)'}}>Rs. {item.price * item.quantity}</div>
                        </div>
                    ))}
                    <div className="d-flex justify-between align-center mt-3 pt-2" style={{ borderTop: '2px dashed var(--border)', fontWeight: 700 }}>
                        <div style={{fontSize: '1rem'}}>Total</div>
                        <div style={{fontSize: '1rem'}}>Rs. {order.total_amount}</div>
                    </div>
                </div>
            </div>

            {order.notes && (
                <div className="mb-4">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes:</div>
                    <div style={{ background: '#fff9e6', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', color: '#856404' }}>
                        {order.notes}
                    </div>
                </div>
            )}

            {isPending && (
                <div className="d-flex gap-3 mt-4">
                    <button className="btn" style={{ flex: 1, fontWeight: 600, color: '#fff', background: 'var(--primary)', border: 'none' }} onClick={() => updateStatus(order.id, 'Accepted')}>
                        Accept Order
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1, fontWeight: 600 }} onClick={() => updateStatus(order.id, 'Rejected')}>
                        Reject
                    </button>
                </div>
            )}

            {isAccepted && (
                <div className="d-flex gap-3">
                    <button className="btn btn-success" style={{ flex: 1, fontWeight: 600 }} onClick={() => updateStatus(order.id, 'Completed')}>
                        Mark Completed
                    </button>
                    {order.order_type !== 'Dine-in' && (
                        <button className="btn" style={{ flex: 1, fontWeight: 600, border: '1px solid var(--border)', background: 'transparent' }} onClick={() => setSelectedOtpOrder(order)}>
                            View OTP
                        </button>
                    )}
                </div>
            )}
        </div>
    )};

    const filteredOrders = orders.filter(o => o.status === activeTab);

    return (
        <div className="animate-fade-in relative">
            <div>
                <h1 style={{fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.2rem'}}>Orders</h1>
                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>Manage your incoming and past orders.</p>
            </div>

            {/* Tabs */}
            <div className="d-flex gap-2 mb-4" style={{ background: 'var(--background)', padding: '0.5rem', borderRadius: '30px', display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {['Pending', 'Accepted', 'Completed', 'Rejected'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            background: activeTab === tab ? '#fff' : 'transparent',
                            color: activeTab === tab ? '#000' : 'var(--text-muted)',
                            fontWeight: activeTab === tab ? 600 : 500,
                            boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2" style={{gap: '1.5rem', alignItems: 'start'}}>
                {loading ? <p>Loading orders...</p> : 
                    filteredOrders.length === 0 ? <p className="text-muted" style={{gridColumn: '1 / -1'}}>No {activeTab.toLowerCase()} orders.</p> : 
                    filteredOrders.map(o => renderOrderCard(o))
                }
            </div>

            {/* OTP Modal */}
            {selectedOtpOrder && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    animation: 'otpModalOverlay 0.25s ease-out forwards'
                }}>
                    <style>
                        {`
                        @keyframes otpModalOverlay {
                            from { opacity: 0; backdrop-filter: blur(0px); }
                            to { opacity: 1; backdrop-filter: blur(2px); }
                        }
                        @keyframes otpModalContent {
                            from { opacity: 0; transform: scale(0.85) translateY(10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        `}
                    </style>
                    <div style={{ 
                        background: '#fff', padding: '2rem', borderRadius: '12px', 
                        width: '400px', maxWidth: '90%', position: 'relative',
                        animation: 'otpModalContent 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    }}>
                        <button 
                            onClick={() => setSelectedOtpOrder(null)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={20} />
                        </button>
                        <h3 style={{marginBottom: '0.5rem'}}>Order Accepted</h3>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
                            Share this OTP with the customer or delivery rider to verify the order.
                        </p>
                        <div style={{ 
                            background: '#fff9e6', color: '#d97706', padding: '1.5rem', 
                            textAlign: 'center', borderRadius: '12px', fontSize: '2.5rem', 
                            fontWeight: 700, letterSpacing: '8px', marginBottom: '1.5rem' 
                        }}>
                            {selectedOtpOrder.otp_code || 'N/A'}
                        </div>
                        <div className="d-flex justify-end">
                            <button className="btn" style={{background: 'var(--primary)', color: '#fff', fontWeight: 600, border: 'none'}} onClick={() => setSelectedOtpOrder(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default OrdersManager;
