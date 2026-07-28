import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, 
    DollarSign, 
    Navigation, 
    Clock, 
    MapPin, 
    Phone, 
    CheckCircle2, 
    Package, 
    Radio,
    TrendingUp,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';

import { API_URL } from '../config';

const socket = io(API_URL.replace('/api', ''));

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [earnings, setEarnings] = useState({ todayEarnings: 0, previousEarnings: 0 });
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [currentTrackingId, setCurrentTrackingId] = useState(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!user || user.role !== 'delivery') {
            navigate('/');
        } else {
            fetchOrders();
            fetchEarnings();
        }
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/deliveryorders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) {
            console.error('Failed to fetch orders');
        }
    };

    const fetchEarnings = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/deliveryearnings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setEarnings(await res.json());
        } catch (err) {
            console.error('Failed to fetch earnings');
        }
    };

    const handleAction = async (id, action, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/deliverystatus`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ action, deliveryStatus: status })
            });
            if (res.ok) fetchOrders();
        } catch (err) {
            console.error('Failed to update order');
        }
    };

    const startBroadcasting = (orderId) => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by your browser');
            return;
        }

        if (isBroadcasting) stopBroadcasting();

        setIsBroadcasting(true);
        setCurrentTrackingId(orderId);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                socket.emit('send_location', {
                    orderId: orderId,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            (err) => console.error('Error tracking', err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const stopBroadcasting = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsBroadcasting(false);
        setCurrentTrackingId(null);
    };

    if (!user || user.role !== 'delivery') return null;

    return (
        <div className="container mt-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                    <Truck size={40} style={{ color: 'var(--primary-color)' }} />
                    <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>
                        Delivery Hub
                    </h2>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Your mission: Hot food, fast delivery!</p>
            </motion.div>

            {/* Earnings Stats */}
            <div className="stats-grid">
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Today's Earnings</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>₹{earnings.todayEarnings?.toFixed(2) || '0.00'}</div>
                    <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <TrendingUp size={14} /> Keep it up!
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ borderLeftColor: 'var(--secondary-color)', boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Previous Earnings</div>
                    <div className="stat-value">₹{earnings.previousEarnings?.toFixed(2) || '0.00'}</div>
                    <div className="status-badge status-info">
                        <DollarSign size={14} /> Total Payout
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="stat-card glass-panel" style={{ borderLeftColor: '#3498db', boxShadow: 'var(--shadow-floating)' }}>
                    <div className="stat-label">Active Broadcast</div>
                    <div className="stat-value">{isBroadcasting ? 'ON' : 'OFF'}</div>
                    {isBroadcasting ? (
                        <div className="status-badge status-pending">
                            <span className="pulse-dot"></span> Tracking Active
                        </div>
                    ) : (
                        <div className="status-badge" style={{ background: 'var(--bg-body)', color: 'var(--text-muted)' }}>Idle</div>
                    )}
                </motion.div>
            </div>

            <div className="flex justify-between align-center mb-4">
                <h3 style={{ margin: 0 }}>Available & Active Deliveries</h3>
                <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '8px 15px', fontSize: '0.8rem' }}>
                    <Clock size={14} style={{ marginRight: '5px' }} /> Refresh
                </button>
            </div>

            <AnimatePresence>
                {orders.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center glass-panel" style={{ padding: '60px', boxShadow: 'var(--shadow-floating)' }}>
                        <Package size={48} className="mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-muted)' }}>No orders currently available to manage.</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        {orders.map((o, index) => (
                            <motion.div 
                                key={o._id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="order-card-new glass-panel"
                                style={{ 
                                    padding: '25px', 
                                    borderLeftColor: o.deliveryPartner?._id === user._id ? 'var(--primary-color)' : 'transparent',
                                    boxShadow: 'var(--shadow-floating)'
                                }}
                            >
                                <div className="flex justify-between align-center flex-wrap gap-4">
                                    <div style={{ flex: 2, minWidth: '300px' }}>
                                        <div className="flex align-center gap-3 mb-3">
                                            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order #{o._id.substring(o._id.length - 6)}</span>
                                            {o.deliveryPartner?._id === user._id && (
                                                <span className="status-badge status-success">
                                                    <ShieldCheck size={14} /> Assigned to You
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            <div className="flex gap-2" style={{ color: 'var(--text-dark)' }}>
                                                <MapPin size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.95rem' }}>{o.shippingAddress.address || 'N/A'}</span>
                                            </div>
                                            <div className="flex gap-2" style={{ color: 'var(--text-dark)' }}>
                                                <Phone size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.95rem' }}>{o.user?.phone || 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="timeline-container">
                                            <div className={`timeline-step ${['Pending', 'Assigned', 'Picked Up', 'Delivered'].includes(o.deliveryStatus) ? 'completed' : ''} ${o.deliveryStatus === 'Pending' ? 'active' : ''}`}>
                                                <div className="step-dot">{o.deliveryStatus === 'Pending' ? '●' : '✓'}</div>
                                                <div className="step-label">Placed</div>
                                            </div>
                                            <div className={`timeline-step ${['Assigned', 'Picked Up', 'Delivered'].includes(o.deliveryStatus) ? 'completed' : ''} ${o.deliveryStatus === 'Assigned' ? 'active' : ''}`}>
                                                <div className="step-dot">{o.deliveryStatus === 'Assigned' ? '●' : o.deliveryStatus === 'Pending' ? '' : '✓'}</div>
                                                <div className="step-label">Assigned</div>
                                            </div>
                                            <div className={`timeline-step ${['Picked Up', 'Delivered'].includes(o.deliveryStatus) ? 'completed' : ''} ${o.deliveryStatus === 'Picked Up' ? 'active' : ''}`}>
                                                <div className="step-dot">{o.deliveryStatus === 'Picked Up' ? '●' : o.deliveryStatus === 'Delivered' ? '✓' : ''}</div>
                                                <div className="step-label">Picked Up</div>
                                            </div>
                                            <div className={`timeline-step ${o.deliveryStatus === 'Delivered' ? 'completed active' : ''}`}>
                                                <div className="step-dot">{o.deliveryStatus === 'Delivered' ? '✓' : ''}</div>
                                                <div className="step-label">Delivered</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                                        {/* Accept logic */}
                                        {o.deliveryStatus === 'Pending' && !o.deliveryPartner && (
                                            <button className="btn btn-primary" onClick={() => handleAction(o._id, 'accept')} style={{ width: '100%' }}>
                                                <CheckCircle2 size={18} style={{ marginRight: '8px' }} /> Accept Order
                                            </button>
                                        )}

                                        {/* Assigned lifecycle */}
                                        {o.deliveryPartner?._id === user._id && (
                                            <>
                                                {o.deliveryStatus === 'Assigned' && (
                                                    <button className="btn btn-secondary" onClick={() => handleAction(o._id, 'update', 'Picked Up')} style={{ width: '100%' }}>
                                                        <Package size={18} style={{ marginRight: '8px' }} /> Mark Picked Up
                                                    </button>
                                                )}
                                                {o.deliveryStatus === 'Picked Up' && (
                                                    <>
                                                        {!isBroadcasting || currentTrackingId !== o._id ? (
                                                            <button className="btn btn-primary" onClick={() => startBroadcasting(o._id)} style={{ width: '100%' }}>
                                                                <Navigation size={18} style={{ marginRight: '8px' }} /> Enable Live Tracking
                                                            </button>
                                                        ) : (
                                                            <button className="btn btn-outline" onClick={stopBroadcasting} style={{ width: '100%', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                                                <Radio size={18} style={{ marginRight: '8px' }} className="pulse-dot" /> Stop Broadcast
                                                            </button>
                                                        )}
                                                        <button className="btn btn-secondary" onClick={() => { stopBroadcasting(); handleAction(o._id, 'update', 'Delivered').then(() => fetchEarnings()); }} style={{ width: '100%' }}>
                                                            Mark Delivered
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        
                                        {!o.deliveryPartner && o.deliveryStatus !== 'Pending' && (
                                            <div className="status-badge" style={{ background: 'var(--bg-body)', color: 'var(--text-muted)', justifyContent: 'center' }}>
                                                <AlertCircle size={14} /> Waiting for pickup
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeliveryDashboard;
