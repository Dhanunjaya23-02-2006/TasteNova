import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const AdminAnalytics = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/Admin/analytics`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) setData(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAnalytics();
    }, [user]);

    if (loading) return <div className="sa-empty">Loading analytics...</div>;
    if (!data) return <div className="sa-empty">Failed to load analytics data.</div>;

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">City Analytics</h1>
                <span style={{ color: 'var(--text-muted)' }}>City-wide performance metrics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className="sa-card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Orders & Revenue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Today</span>
                            <span style={{ fontWeight: 600 }}>{data.orders.today.count} (₹{data.orders.today.revenue.toLocaleString()})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>This Week</span>
                            <span style={{ fontWeight: 600 }}>{data.orders.week.count} (₹{data.orders.week.revenue.toLocaleString()})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>This Month</span>
                            <span style={{ fontWeight: 600 }}>{data.orders.month.count} (₹{data.orders.month.revenue.toLocaleString()})</span>
                        </div>
                    </div>
                </div>

                <div className="sa-card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Platform Users</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Customers</span>
                            <span style={{ fontWeight: 600 }}>{data.customers.total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>New Customers (Month)</span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>+{data.customers.newThisMonth}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Active Chefs</span>
                            <span style={{ fontWeight: 600 }}>{data.chefs.active}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sa-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontFamily: "'DM Serif Display', serif" }}>Top Performing Chefs</h3>
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead><tr><th>Chef / Kitchen</th><th>Rating</th><th>Reviews</th></tr></thead>
                    <tbody>
                        {data.chefs.topPerformers.map(c => (
                            <tr key={c._id}>
                                <td style={{ fontWeight: 600 }}>{c.kitchenName || c.name}</td>
                                <td>⭐ {c.rating?.toFixed(1) || 'N/A'}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{c.numReviews || 0}</td>
                            </tr>
                        ))}
                        {data.chefs.topPerformers.length === 0 && <tr><td colSpan="3" className="sa-empty">No chef data available yet.</td></tr>}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
