import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Calendar, TrendingUp, Users, Truck, Clock, 
    User, DollarSign, Settings, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { API_URL } from '../config';

const SubadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    // Data State
    const [orders, setOrders] = useState([]);
    const [chefs, setChefs] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [offers, setOffers] = useState([]);
    const [analytics, setAnalytics] = useState({ today: { orders: 0, revenue: 0 }, total: { orders: 0, revenue: 0 } });

    // Local Offer Form State
    const [offerData, setOfferData] = useState({ code: '', description: '', discountPercentage: 10, maxDiscountAmount: 100, validUntil: '' });

    useEffect(() => {
        if (!user || (user.role !== 'subadmin' && user.role !== 'admin')) {
            navigate('/');
        } else {
            if (activeTab === 'orders') fetchOrders();
            else if (activeTab === 'chefs' || activeTab === 'delivery') fetchManagementData();
            else if (activeTab === 'offers') fetchOffers();
        }
    }, [user, activeTab, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (error) { console.error('Error fetching orders', error); }
    };

    const fetchManagementData = async () => {
        try {
            const res = await fetch(`${API_URL}/users/all-management`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const data = await res.json();
                setChefs(data.chefs || []);
                setDeliveryPartners(data.delivery || []);
            }
        } catch (error) { console.error('Error fetching management data', error); }
    };

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${API_URL}/offers`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOffers(await res.json());
        } catch (error) { console.error('Error fetching offers', error); }
    };

    const handleProcessRefund = async (orderId, amount) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/refund`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ amount: Number(amount) })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.refundStatus === 'Escalated') {
                    toast.success('Refund amount exceeds ₹500. Escalated to Super Admin.');
                } else {
                    toast.success('Refund Approved & Processed.');
                }
                fetchOrders();
            } else {
                toast.error(data.message || 'Refund failed');
            }
        } catch (error) {
            toast.error('Error processing refund');
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/offers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ ...offerData, scope: 'City', city: user.city })
            });
            if (res.ok) {
                toast.success('Local Offer Created!');
                fetchOffers();
                setOfferData({ code: '', description: '', discountPercentage: 10, maxDiscountAmount: 100, validUntil: '' });
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create offer');
            }
        } catch (error) {
            toast.error('Error creating offer');
        }
    };

    const handleUserStatusUpdate = async (userId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/users/update-status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ userId, status: newStatus })
            });
            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                fetchManagementData();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    if (!user || (user.role !== 'subadmin' && user.role !== 'admin')) return (
        <div className="container mt-4 text-center">
            <LayoutDashboard size={48} className="mb-3 pulse-dot" style={{ color: 'var(--primary-color)' }} />
            <p>Securing Access...</p>
        </div>
    );

    return (
        <div className="container mt-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                    <LayoutDashboard size={40} style={{ color: 'var(--primary-color)' }} />
                    <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>Sub-Admin Basecamp</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Exclusive City Operations & Management</p>
            </motion.div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', justifyContent: 'center', background: 'var(--bg-body)', padding: '8px', borderRadius: '15px', overflowX: 'auto', flexWrap: 'wrap' }}>
                {[
                    { id: 'orders', label: 'Orders & Refunds', icon: ShoppingBag },
                    { id: 'chefs', label: 'Chef Management', icon: Users },
                    { id: 'delivery', label: 'Delivery Partners', icon: Truck },
                    { id: 'offers', label: 'Local Offers', icon: TrendingUp }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ padding: '8px 16px', fontSize: '0.85rem', textTransform: 'none', display: 'flex', gap: '6px', minWidth: '120px' }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between align-center mb-4">
                            <h3 style={{ margin: 0 }}>Live Order Stream (City-Wide)</h3>
                            <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                                <RefreshCw size={14} style={{ marginRight: '5px' }} /> Refresh
                            </button>
                        </div>
                        {orders.length === 0 ? <p className="text-center">No orders found for your city.</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                {orders.map(order => (
                                    <div key={order._id} className="order-card-new glass-panel" style={{ padding: '20px', boxShadow: 'var(--shadow-floating)' }}>
                                        <div className="flex justify-between mb-3">
                                            <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>#{order._id.substring(order._id.length - 8)}</span>
                                            <div className="status-badge status-pending">{order.status}</div>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            <div className="flex align-center gap-2 mb-1"><User size={14} /> {order.user?.name || 'Guest'}</div>
                                            <div className="flex align-center gap-2 mb-1"><LayoutDashboard size={14} /> Chef: {order.chef?.name || 'Unknown'}</div>
                                            <div className="flex align-center gap-2"><DollarSign size={14} /> ₹{order.totalPrice}</div>
                                        </div>
                                        
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                                            <div style={{ fontSize: '0.85rem', marginBottom: '5px' }}>Refund Status: <strong>{order.refundStatus}</strong></div>
                                            {order.refundStatus === 'None' && order.status !== 'Pending' && (
                                                <div className="flex gap-2">
                                                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '5px 10px', color: 'var(--warning)' }} onClick={() => handleProcessRefund(order._id, 450)}>
                                                        Issue Small Refund (₹450)
                                                    </button>
                                                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '5px 10px', color: 'var(--error)' }} onClick={() => handleProcessRefund(order._id, 600)}>
                                                        Escalate Large Refund (₹600)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'chefs' && (
                    <motion.div key="chefs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>City Chefs</h2>
                        <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '16px' }}>Kitchen Name</th>
                                        <th style={{ padding: '16px' }}>Email</th>
                                        <th style={{ padding: '16px' }}>Status</th>
                                        <th style={{ padding: '16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chefs.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No Chefs found for your city.</td></tr>
                                    ) : chefs.map(chef => (
                                        <tr key={chef._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 'bold' }}>{chef.kitchenName || chef.name}</td>
                                            <td style={{ padding: '16px' }}>{chef.email}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`status-badge status-${chef.status === 'active' ? 'success' : (chef.status === 'suspended' ? 'error' : 'warning')}`}>
                                                    {chef.status === 'active' ? 'Active' : (chef.status === 'suspended' ? 'Suspended' : 'Pending')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {chef.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleUserStatusUpdate(chef._id, 'active')}>Approve</button>
                                                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleUserStatusUpdate(chef._id, 'suspended')}>Reject</button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: chef.status === 'active' ? 'var(--success)' : 'var(--error)', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        {chef.status === 'active' ? '✓ Onboarded' : '✗ Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'delivery' && (
                    <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>City Delivery Partners</h2>
                        <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ padding: '16px' }}>Name</th>
                                        <th style={{ padding: '16px' }}>Vehicle Info</th>
                                        <th style={{ padding: '16px' }}>Status</th>
                                        <th style={{ padding: '16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveryPartners.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No Delivery Partners found for your city.</td></tr>
                                    ) : deliveryPartners.map(d => (
                                        <tr key={d._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 'bold' }}>{d.name}</td>
                                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{d.vehicleType || 'N/A'} - {d.vehicleNumber || 'N/A'}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className={`status-badge status-${d.status === 'active' ? 'success' : 'warning'}`}>
                                                    {d.status === 'active' ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {d.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleUserStatusUpdate(d._id, 'active')}>Approve</button>
                                                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleUserStatusUpdate(d._id, 'suspended')}>Reject</button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: d.status === 'active' ? 'var(--success)' : 'var(--error)', fontWeight: '500', fontSize: '0.9rem' }}>
                                                        {d.status === 'active' ? '✓ Onboarded' : '✗ Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'offers' && (
                    <motion.div key="offers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="glass-panel mb-5" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto 30px' }}>
                            <h4 className="mb-4 text-center">Create Local Campaign</h4>
                            <form onSubmit={handleCreateOffer}>
                                <div className="input-group mb-3">
                                    <label>Promo Code (e.g., HYD100)</label>
                                    <input type="text" className="form-control" required value={offerData.code} onChange={(e) => setOfferData({...offerData, code: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="input-group mb-3">
                                    <label>Description</label>
                                    <input type="text" className="form-control" required value={offerData.description} onChange={(e) => setOfferData({...offerData, description: e.target.value})} />
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }} className="mb-3">
                                    <div className="input-group flex-1">
                                        <label>Discount (%)</label>
                                        <input type="number" className="form-control" required value={offerData.discountPercentage} onChange={(e) => setOfferData({...offerData, discountPercentage: e.target.value})} />
                                    </div>
                                    <div className="input-group flex-1">
                                        <label>Max Amount (₹)</label>
                                        <input type="number" className="form-control" required value={offerData.maxDiscountAmount} onChange={(e) => setOfferData({...offerData, maxDiscountAmount: e.target.value})} />
                                    </div>
                                </div>
                                <div className="input-group mb-4">
                                    <label>Valid Until</label>
                                    <input type="date" className="form-control" required value={offerData.validUntil} onChange={(e) => setOfferData({...offerData, validUntil: e.target.value})} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Launch Local Offer</button>
                            </form>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {offers.map(offer => (
                                <div key={offer._id} className="glass-panel" style={{ padding: '20px' }}>
                                    <div className="flex justify-between align-center mb-3">
                                        <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{offer.code}</h4>
                                        <span className={`status-badge ${offer.isActive ? 'status-success' : 'status-pending'}`}>{offer.isActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{offer.description}</p>
                                    <div style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                                        <div><strong>Discount:</strong> {offer.discountPercentage}% (Max ₹{offer.maxDiscountAmount})</div>
                                        <div><strong>Expires:</strong> {new Date(offer.validUntil).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubadminDashboard;
