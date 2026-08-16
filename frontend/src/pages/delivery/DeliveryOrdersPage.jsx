import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle2, Navigation, Phone, ShieldCheck, Camera, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';

const DeliveryOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('active'); // new, active, history
    const [activeOrderState, setActiveOrderState] = useState('assigned');
    const [otp, setOtp] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/delivery/orders?tab=${activeTab}`);
            setOrders(res.data);
            if (activeTab === 'active' && res.data) {
                setActiveOrderState(res.data.frontendState || 'assigned');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (orderId) => {
        try {
            await api.post('/delivery/orders/accept', { orderId });
            setActiveTab('active');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to accept order');
        }
    };

    const handleAction = async (newState) => {
        const backendStateMap = {
            'arrived_chef': 'Arrived At Chef',
            'picked_up': 'Picked Up',
            'arrived_customer': 'Arrived At Customer',
            'delivered': 'Delivered'
        };

        try {
            await api.post('/delivery/orders/update-status', {
                orderId: orders._id,
                status: backendStateMap[newState],
                otp: newState === 'delivered' ? otp : undefined
            });
            setActiveOrderState(newState);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const renderNewRequests = () => (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {orders && orders.length > 0 ? orders.map(req => (
                <div key={req.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--error)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ background: '#FFEBEE', color: 'var(--error)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>New Request</span>
                        <span style={{ color: 'var(--error)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={16} /> 00:{req.expiry}
                        </span>
                    </div>

                    <h3 style={{ margin: '0 0 16px', fontSize: '1.4rem' }}>Order {req.id}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <MapPin color="var(--primary)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup</div>
                                <div style={{ fontWeight: 600 }}>{req.chef}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{req.pickupLoc}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <MapPin color="#f39c12" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drop</div>
                                <div style={{ fontWeight: 600 }}>{req.dropLoc}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#F8F9FA', borderRadius: '8px', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance</div>
                            <div style={{ fontWeight: 700 }}>{req.dist}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Earnings</div>
                            <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{req.est}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => fetchOrders()} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Ignore</button>
                        <button onClick={() => handleAcceptRequest(req._id)} style={{ flex: 2, padding: '14px', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Accept Request</button>
                    </div>
                </div>
            )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>No New Requests</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>You are online and looking for orders.</p>
                </div>
            )}
        </div>
    );

    const renderActiveDelivery = () => {
        if (!orders || Object.keys(orders).length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>No Active Delivery</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>You don't have an active delivery. Check New Requests.</p>
                </div>
            );
        }
        
        const activeOrder = orders;

        return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Order {activeOrder.id}</h2>
                    <span style={{ background: '#FFF3CD', color: '#856404', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {activeOrderState === 'assigned' ? 'Navigating to Chef' : 
                         activeOrderState === 'arrived_chef' ? 'At Pickup' : 
                         activeOrderState === 'picked_up' ? 'Out for Delivery' : 
                         activeOrderState === 'arrived_customer' ? 'At Customer Location' : 'Delivered'}
                    </span>
                </div>

                {/* Progress Visualizer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', left: '30px', right: '30px', height: '4px', background: 'var(--border-subtle)', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: '15px', left: '30px', width: activeOrderState === 'assigned' ? '0%' : activeOrderState === 'arrived_chef' ? '25%' : activeOrderState === 'picked_up' ? '50%' : activeOrderState === 'arrived_customer' ? '75%' : '100%', height: '4px', background: 'var(--primary)', zIndex: 1, transition: 'width 0.3s' }}></div>
                    
                    {['Accept', 'Pickup', 'Deliver', 'Done'].map((step, idx) => (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                            <div style={{ 
                                width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: idx <= (activeOrderState === 'assigned' ? 0 : activeOrderState === 'arrived_chef' ? 1 : activeOrderState === 'picked_up' ? 2 : activeOrderState === 'arrived_customer' ? 2 : 3) ? 'var(--primary)' : '#fff',
                                border: `2px solid ${idx <= (activeOrderState === 'assigned' ? 0 : activeOrderState === 'arrived_chef' ? 1 : activeOrderState === 'picked_up' ? 2 : activeOrderState === 'arrived_customer' ? 2 : 3) ? 'var(--primary)' : 'var(--border-subtle)'}`,
                                color: idx <= (activeOrderState === 'assigned' ? 0 : activeOrderState === 'arrived_chef' ? 1 : activeOrderState === 'picked_up' ? 2 : activeOrderState === 'arrived_customer' ? 2 : 3) ? '#fff' : 'var(--text-muted)',
                                fontWeight: 700
                            }}>
                                {idx < (activeOrderState === 'assigned' ? 0 : activeOrderState === 'arrived_chef' ? 1 : activeOrderState === 'picked_up' ? 2 : activeOrderState === 'arrived_customer' ? 2 : 4) ? <Check size={18} /> : (idx + 1)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* State based content */}
                {(activeOrderState === 'assigned' || activeOrderState === 'arrived_chef') && (
                    <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ background: '#EAF5F0', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><MapPin size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>PICKUP FROM</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{activeOrder.chef.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeOrder.chef.address}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.chef.lat},${activeOrder.chef.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-main)' }}><Navigation size={18} /> Navigate</a>
                            <a href={`tel:${activeOrder.chef.phone}`} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-main)' }}><Phone size={18} /> Call Chef</a>
                        </div>
                    </div>
                )}

                {activeOrderState === 'arrived_chef' && (
                    <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Order Details</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Items</span>
                            <span style={{ fontWeight: 600 }}>{activeOrder.items} items</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Amount to collect</span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>{activeOrder.payment}</span>
                        </div>
                        <div style={{ background: '#EAF5F0', color: 'var(--primary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '16px' }}>
                            <CheckCircle2 size={20} /> Food is Ready
                        </div>
                    </div>
                )}

                {(activeOrderState === 'picked_up' || activeOrderState === 'arrived_customer') && (
                    <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ background: '#FFF3CD', padding: '12px', borderRadius: '50%', color: '#856404' }}><MapPin size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>DELIVER TO</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{activeOrder.customer.name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeOrder.customer.address}</div>
                                <div style={{ marginTop: '8px', display: 'inline-block', background: '#EAF5F0', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>{activeOrder.payment}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.customer.lat},${activeOrder.customer.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-main)' }}><Navigation size={18} /> Navigate</a>
                            <a href={`tel:${activeOrder.customer.phone}`} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-main)' }}><Phone size={18} /> Call Customer</a>
                        </div>
                    </div>
                )}

                {activeOrderState === 'arrived_customer' && (
                    <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Delivery Verification</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>Ask the customer for the 4-digit delivery PIN</p>
                        <input 
                            type="text" 
                            placeholder="Enter PIN" 
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            style={{ width: '100%', maxWidth: '200px', fontSize: '2rem', letterSpacing: '10px', textAlign: 'center', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-subtle)', marginBottom: '16px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }}></div>
                            <span>OR</span>
                            <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }}></div>
                        </div>
                        <button style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Camera size={18} /> Take Photo Proof
                        </button>
                    </div>
                )}

                {/* Primary Action Button */}
                {activeOrderState === 'assigned' && <button onClick={() => handleAction('arrived_chef')} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>I've Arrived at Chef</button>}
                {activeOrderState === 'arrived_chef' && <button onClick={() => handleAction('picked_up')} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>Confirm Pickup</button>}
                {activeOrderState === 'picked_up' && <button onClick={() => handleAction('arrived_customer')} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>I've Arrived at Customer</button>}
                {activeOrderState === 'arrived_customer' && <button onClick={() => handleAction('delivered')} disabled={otp.length !== 4} style={{ width: '100%', padding: '16px', background: otp.length === 4 ? 'var(--primary)' : 'var(--border-subtle)', color: otp.length === 4 ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: otp.length === 4 ? 'pointer' : 'not-allowed' }}>Verify & Complete Delivery</button>}
                {activeOrderState === 'delivered' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <ShieldCheck size={64} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ margin: '0 0 8px', color: 'var(--success)' }}>Delivery Completed!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>You earned ₹68 for this delivery.</p>
                        <button onClick={() => { setActiveTab('new'); setActiveOrderState('assigned'); setOtp(''); }} style={{ marginTop: '24px', padding: '12px 24px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Back to Requests</button>
                    </div>
                )}
            </div>
        </div>
        );
    };

    const renderHistory = () => (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                    <tr style={{ background: '#F8F9FA', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Order Info</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Drop Location</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Earnings</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.length > 0 ? orders.map((order, i) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{order.id}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.time}</div>
                            </td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{order.drop}</td>
                            <td style={{ padding: '16px 24px', fontWeight: 700 }}>₹{order.earnings}</td>
                            <td style={{ padding: '16px 24px' }}>
                                <span style={{ background: '#EAF5F0', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{order.status}</span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No history found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Deliveries</h1>
            </div>

            {/* Custom Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {['new', 'active', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === tab ? 'var(--primary)' : '#fff',
                            color: activeTab === tab ? '#fff' : 'var(--text-main)',
                            border: `1px solid ${activeTab === tab ? 'var(--primary)' : 'var(--border-subtle)'}`,
                            borderRadius: '24px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab === 'new' ? 'New Requests' : tab === 'active' ? 'Active Delivery' : 'History'}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'new' && renderNewRequests()}
                {activeTab === 'active' && renderActiveDelivery()}
                {activeTab === 'history' && renderHistory()}
            </motion.div>
        </div>
    );
};

export default DeliveryOrdersPage;
