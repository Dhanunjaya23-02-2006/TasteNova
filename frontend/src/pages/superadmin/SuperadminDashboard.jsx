import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { ShoppingBag, Users, IndianRupee, ChefHat, AlertTriangle, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { API_URL } from '../../config';

const SuperadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/dashboard`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setData(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchDashboard();
    }, [user, lastUpdated]);

    if (loading) return <div className="sa-empty">Loading command center...</div>;
    if (!data) return <div className="sa-empty">Failed to load platform data.</div>;

    const { stats, liveOperations, alerts, cityStats } = data;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                    Good evening, {user.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Here's what's happening across TasteNova today.</p>
            </div>

            {/* Top KPIs */}
            <div className="sup-stats-row">
                <div className="sup-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="sup-stat-label">Orders Today</div>
                            <div className="sup-stat-value">{stats.todayOrders}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Active platform-wide</div>
                        </div>
                        <ShoppingBag size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>
                <div className="sup-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="sup-stat-label">Revenue Today</div>
                            <div className="sup-stat-value" style={{ color: 'var(--primary)' }}>₹{stats.todayRevenue.toLocaleString()}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gross value</div>
                        </div>
                        <IndianRupee size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>
                <div className="sup-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="sup-stat-label">Active Chefs</div>
                            <div className="sup-stat-value">{stats.totalChefs}</div>
                        </div>
                        <ChefHat size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>
                <div className="sup-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="sup-stat-label">Customers</div>
                            <div className="sup-stat-value">{stats.totalCustomers.toLocaleString()}</div>
                        </div>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Live Operations */}
                <div className="sa-card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif", color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Live Operations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} color="var(--info, #2874A6)" /> <span>Preparing</span></div>
                            <span style={{ fontWeight: 600 }}>{liveOperations.Preparing}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="var(--primary)" /> <span>Ready for Pickup</span></div>
                            <span style={{ fontWeight: 600 }}>{liveOperations.Ready}</span>
                        </div>
                        <div className="sa-live-stat">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#27AE60" /> <span>Completed</span></div>
                            <span style={{ fontWeight: 600 }}>{liveOperations.Completed}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><XCircle size={16} color="var(--error)" /> <span>Placed (Waiting Accept)</span></div>
                            <span style={{ fontWeight: 600 }}>{liveOperations.Placed}</span>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="sa-card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif", color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System Alerts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.pendingChefs > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#FFF3CD', borderRadius: '8px', color: '#856404' }}>
                                <AlertTriangle size={20} />
                                <div><strong>{alerts.pendingChefs} chef applications</strong> waiting for verification</div>
                            </div>
                        )}
                        {alerts.escalatedRefunds > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8D7DA', borderRadius: '8px', color: 'var(--error)' }}>
                                <AlertTriangle size={20} />
                                <div><strong>{alerts.escalatedRefunds} refund requests</strong> require Super Admin approval</div>
                            </div>
                        )}
                        {alerts.pendingChefs === 0 && alerts.escalatedRefunds === 0 && (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                All queues are clear. No active alerts.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* City Performance */}
            <div className="sa-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif", color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    City Performance
                </h3>
                <table className="sa-table">
                    <thead><tr><th>City</th><th>Total Orders</th><th>Total Revenue</th><th>Active Chefs</th><th>Status</th></tr></thead>
                    <tbody>
                        {cityStats.map(c => (
                            <tr key={c._id}>
                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                <td>{c.orderCount.toLocaleString()}</td>
                                <td>₹{c.revenue.toLocaleString()}</td>
                                <td>{c.chefCount}</td>
                                <td>{c.status}</td>
                            </tr>
                        ))}
                        {cityStats.length === 0 && <tr><td colSpan="5" className="sa-empty">No cities configured.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperadminDashboard;
