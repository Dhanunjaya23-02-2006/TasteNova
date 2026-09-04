import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChefHat, Truck, Users, AlertTriangle, Tag, TrendingUp } from 'lucide-react';
import { API_URL } from '../../config';

import { AdminSocketContext } from '../../context/AdminSocketContext';

const SubadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(AdminSocketContext) || {};
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(`${API_URL}/subadmin/dashboard`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) setData(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchDashboard();
    }, [user, lastUpdated]);

    if (loading) return <div className="sa-empty">Loading dashboard...</div>;
    if (!data) return <div className="sa-empty">Failed to load dashboard data.</div>;

    const { stats, liveOrders, recentTickets } = data;

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">City Dashboard</h1>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Today's overview</span>
            </div>

            <div className="sa-stats-row">
                {[
                    { label: 'Orders Today', value: stats.todayOrders, icon: ShoppingBag, onClick: () => navigate('/subadmin/orders') },
                    { label: 'Revenue', value: `₹${stats.todayRevenue?.toLocaleString() || 0}`, icon: TrendingUp },
                    { label: 'Active Chefs', value: stats.totalChefs, icon: ChefHat, onClick: () => navigate('/subadmin/chefs') },
                    { label: 'Customers', value: stats.totalCustomers, icon: Users, onClick: () => navigate('/subadmin/customers') },
                    { label: 'Open Issues', value: stats.openTickets, icon: AlertTriangle, onClick: () => navigate('/subadmin/support') },
                ].map((s, i) => (
                    <div key={i} className="sa-stat-card" style={{ cursor: s.onClick ? 'pointer' : 'default' }} onClick={s.onClick}>
                        <s.icon size={22} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <div className="sa-stat-value">{s.value}</div>
                        <div className="sa-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Pending approvals */}
            {(stats.pendingChefs > 0 || stats.pendingRefunds > 0) && (
                <div className="sa-card" style={{ marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {stats.pendingChefs > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/subadmin/chefs?status=pending')}>
                            <span className="sa-badge sa-badge-yellow">{stats.pendingChefs} chef{stats.pendingChefs > 1 ? 's' : ''} awaiting approval</span>
                        </div>
                    )}
                    {stats.pendingRefunds > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/subadmin/refunds')}>
                            <span className="sa-badge sa-badge-red">{stats.pendingRefunds} refund{stats.pendingRefunds > 1 ? 's' : ''} pending</span>
                        </div>
                    )}
                    {stats.activePromotions > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="sa-badge sa-badge-accent">{stats.activePromotions} active promotion{stats.activePromotions > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Live Orders */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Live Orders</h3>
                {liveOrders.length === 0 ? (
                    <div className="sa-empty">No active orders right now.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {liveOrders.map(order => (
                            <div key={order._id} className="sa-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/subadmin/orders`)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{order._id.slice(-8)}</span>
                                    <span className={`sa-badge ${order.status === 'Placed' ? 'sa-badge-yellow' : order.status === 'Preparing' ? 'sa-badge-blue' : 'sa-badge-green'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <div>{order.user?.name || 'Guest'}</div>
                                    <div>Chef: {order.chef?.kitchenName || order.chef?.name || '—'}</div>
                                </div>
                                <div style={{ marginTop: '8px', fontWeight: 600 }}>₹{order.totalPrice}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Recent Support Tickets</h3>
                    <table className="sa-table">
                        <thead><tr><th>Ticket</th><th>Customer</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead>
                        <tbody>
                            {recentTickets.map(t => (
                                <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/subadmin/support')}>
                                    <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                                    <td>{t.customer?.name || '—'}</td>
                                    <td>{t.category?.replace(/_/g, ' ')}</td>
                                    <td><span className={`sa-badge ${t.priority === 'urgent' ? 'sa-badge-red' : t.priority === 'high' ? 'sa-badge-yellow' : 'sa-badge-gray'}`}>{t.priority}</span></td>
                                    <td><span className={`sa-badge ${t.status === 'open' ? 'sa-badge-yellow' : t.status === 'resolved' ? 'sa-badge-green' : 'sa-badge-blue'}`}>{t.status.replace(/_/g, ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SubadminDashboard;
