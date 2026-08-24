import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
    IndianRupee, ShoppingBag, MapPin, Star, TrendingUp,
    Wallet, Navigation, Phone, Clock, ArrowRight,
    Map as MapIcon, CheckCircle2, XCircle, Shield, HandPlatter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import io from 'socket.io-client';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const DeliveryDashboardPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/delivery/dashboard');
            setDashboardData(res.data);
            setIsOnline(res.data.isOnline);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.token) return;
        const socket = io(API_URL.replace('/api', ''), {
            auth: { token: user.token }
        });

        socket.on('connect', () => {
            socket.emit('join_delivery');
        });

        socket.on('new_delivery_request', (order) => {
            toast.success('New delivery request available!');
            fetchDashboard();
        });

        socket.on('delivery_status_update', (order) => {
            fetchDashboard();
        });

        socket.on('order_status_update', (order) => {
            fetchDashboard();
        });

        return () => socket.disconnect();
    }, [user]);

    const toggleStatus = async () => {
        try {
            const res = await api.post('/delivery/toggle-status');
            setIsOnline(res.data.isOnline);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Actual Data from Backend
    const stats = dashboardData?.stats || {
        earnings: { value: 0, trend: '', label: '' },
        deliveries: { value: 0, trend: '', label: '' },
        distance: { value: '0 km', trend: '', label: '' },
        rating: { value: user?.rating || 0, sub: `Based on ${user?.numReviews || 0} ratings` },
        acceptance: { value: '100%', trend: '', label: '' }
    };

    const activeDelivery = dashboardData?.activeDelivery || null;

    const newRequests = dashboardData?.stats?.newRequests || [];

    const recentDeliveries = dashboardData?.history || []; // Add history to dashboard controller or leave empty for now

    const StatCard = ({ icon: Icon, title, value, trend, label, sub, colorClass }) => (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '50%', background: `var(--${colorClass}-light, #f0f9f4)`, color: `var(--${colorClass}, #27ae60)` }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{value}</div>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)' }}>
                            <TrendingUp size={12} /> {trend} <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                    )}
                    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
                </div>
            </div>
        </div>
    );

    if (user && user.status === 'pending') {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Shield size={64} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '16px' }}>Application Pending</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Thank you for applying to be a TasteNova Delivery Partner! Your application is currently under review by our onboarding team.
                    We will contact you shortly to complete your verification.
                </p>
                <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '30px', padding: '12px 30px' }}>
                    Return to Home
                </button>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ paddingBottom: '20px' }}>
            {/* Greeting & Wallet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>
                        Good Morning, {user?.name?.split(' ')[0] || 'Rahul'} 👋
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <button 
                            onClick={toggleStatus}
                            style={{ 
                                padding: '4px 12px', borderRadius: '20px', border: 'none', 
                                background: isOnline ? '#EAF5F0' : '#FFEBEE', 
                                color: isOnline ? 'var(--success)' : 'var(--error)', 
                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--error)' }}></span>
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <Wallet size={20} color="var(--primary)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Wallet Balance</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{dashboardData?.stats?.earnings?.value || 0}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" style={{ marginLeft: '8px' }} />
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon={IndianRupee} title="Today's Earnings" value={`₹${stats.earnings.value}`} trend={stats.earnings.trend} label={stats.earnings.label} colorClass="success" />
                <StatCard icon={ShoppingBag} title="Today's Deliveries" value={stats.deliveries.value} trend={stats.deliveries.trend} label={stats.deliveries.label} colorClass="primary" />
                <StatCard icon={MapPin} title="Distance Travelled" value={stats.distance.value} trend={stats.distance.trend} label={stats.distance.label} colorClass="info" />
                <StatCard icon={Star} title="Rating" value={stats.rating.value} sub={stats.rating.sub} colorClass="warning" />
                <StatCard icon={TrendingUp} title="Acceptance Rate" value={stats.acceptance.value} trend={stats.acceptance.trend} label={stats.acceptance.label} colorClass="success" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                
                {/* Active Delivery */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Active Delivery</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View Details &rarr;</span>
                    </div>
                    <div style={{ padding: '20px' }}>
                        {activeDelivery && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Order {activeDelivery.id}</div>
                                    <div style={{ background: '#FFF3CD', color: '#856404', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                        {activeDelivery.status}
                                    </div>
                                </div>

                                <div style={{ position: 'relative', paddingLeft: '24px', marginBottom: '24px' }}>
                                    <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-subtle)', borderStyle: 'dashed' }}></div>
                                    
                                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                                        <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '4px solid var(--primary)', zIndex: 1 }}></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Pickup From</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeDelivery.pickup.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeDelivery.pickup.location}</div>
                                    </div>

                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-24px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: '4px solid #f39c12', zIndex: 1 }}></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Deliver To</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeDelivery.drop.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeDelivery.drop.location}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeDelivery ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8F9FA', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Clock size={16} color="var(--text-muted)" style={{ margin: '0 auto 4px' }} />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Time</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeDelivery.time}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <MapPin size={16} color="var(--text-muted)" style={{ margin: '0 auto 4px' }} />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{activeDelivery.distance}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <IndianRupee size={16} color="var(--text-muted)" style={{ margin: '0 auto 4px' }} />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Earnings</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)' }}>₹{activeDelivery.earnings}</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No active delivery currently.
                            </div>
                        )}

                        {activeDelivery && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.pickup.lat},${activeDelivery.pickup.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none', background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Navigation size={18} /> Navigate
                                </a>
                                <a href={`tel:${activeDelivery.pickup.phone || activeDelivery.drop.phone}`} style={{ flex: 1, textDecoration: 'none', background: '#fff', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Phone size={18} /> Call
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Earnings Overview */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '20px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Earnings Overview</h3>
                        <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{stats.earnings.value || 0}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Earnings (Today)</div>
                    </div>
                    
                    {/* Placeholder Chart */}
                    <div style={{ height: '160px', marginTop: '20px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '100%', background: i === 4 ? 'var(--primary)' : 'var(--primary-light)', height: `${stats.earnings.value > 0 ? Math.max(10, Math.random() * 100) : 5}%`, borderRadius: '4px' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{day}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                         <div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Earnings</div>
                             <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{stats.earnings.value || 0}</div>
                         </div>
                         <div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incentives</div>
                             <div style={{ fontWeight: 700, color: '#8e44ad' }}>₹{stats.earnings.incentives || 0}</div>
                         </div>
                         <div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tips</div>
                             <div style={{ fontWeight: 700, color: '#e67e22' }}>₹{stats.earnings.tips || 0}</div>
                         </div>
                    </div>
                </div>

                {/* New Delivery Requests */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>New Requests</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All &rarr;</span>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '400px' }}>
                        {newRequests.length > 0 ? newRequests.map(req => (
                            <div key={req.id} style={{ border: '1px solid var(--error-light)', background: '#fff', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--error)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ background: '#FFEBEE', color: 'var(--error)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>New Request</span>
                                    <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: '0.9rem' }}>{req.time}</span>
                                </div>
                                <div style={{ fontWeight: 800, marginBottom: '12px' }}>Order {req.id}</div>
                                
                                <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Pickup:</span> <strong>{req.chef}</strong> ({req.pickupLoc})
                                </div>
                                <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Drop:</span> <strong>{req.dropLoc}</strong>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', background: '#F8F9FA', padding: '8px', borderRadius: '6px' }}>
                                    <div><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</span><br/><strong>{req.dist}</strong></div>
                                    <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Earnings</span><br/><strong style={{ color: 'var(--success)' }}>₹{req.est}</strong></div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                                    <button onClick={() => navigate('/delivery/orders')} style={{ flex: 2, padding: '10px', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>View Request</button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                No new requests at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                
                {/* Recent Deliveries Table */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Recent Deliveries</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View All &rarr;</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#F8F9FA', color: 'var(--text-muted)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Order ID</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Customer</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Drop Location</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Earnings</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDeliveries.length > 0 ? recentDeliveries.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '12px 20px', fontWeight: 600 }}>{d.id}</td>
                                        <td style={{ padding: '12px 20px' }}>{d.customer}</td>
                                        <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{d.drop}</td>
                                        <td style={{ padding: '12px 20px', fontWeight: 600 }}>₹{d.earnings}</td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{ 
                                                background: d.status === 'Delivered' ? '#EAF5F0' : '#FFEBEE', 
                                                color: d.status === 'Delivered' ? 'var(--success)' : 'var(--error)', 
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 
                                            }}>
                                                {d.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent deliveries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Map Overview Placeholder */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Today's Map Overview</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View Full Map &rarr;</span>
                    </div>
                    <div style={{ flex: 1, background: '#EAF5F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', position: 'relative', overflow: 'hidden' }}>
                        {/* Mock Map Image or Graphic */}
                        <div style={{ position: 'absolute', inset: 0, background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.2 }}></div>
                        <MapIcon size={48} color="var(--primary)" style={{ opacity: 0.5 }} />
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                                 <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Zone: Kukatpally</span>
                             </div>
                             <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High Demand</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Banner */}
            <div style={{ marginTop: '24px', background: '#EAF5F0', border: '1px solid #c3e6cb', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#155724' }}>
                <Shield size={24} color="#27ae60" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Safety First! Always wear a helmet and follow traffic rules. Drive safely.</span>
            </div>
        </div>
    );
};

export default DeliveryDashboardPage;
