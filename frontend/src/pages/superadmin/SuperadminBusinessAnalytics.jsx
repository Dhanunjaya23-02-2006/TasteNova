import React, { useState, useEffect, useContext } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminBusinessAnalytics = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [period, setPeriod] = useState('Last 7 Days');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/business-analytics`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user.token]);

    const metrics = data ? [
        { label: 'Total Active Users', value: data.metrics.totalUsers.toLocaleString(), trend: '+0.0%', icon: Users, color: '#3498db' },
        { label: 'Total Orders', value: data.metrics.totalOrders.toLocaleString(), trend: '+0.0%', icon: ShoppingBag, color: '#9b59b6' },
        { label: 'Avg Order Value', value: `₹${data.metrics.avgOrderValue}`, trend: '+0.0%', icon: TrendingUp, color: '#e67e22' },
        { label: 'Customer Retention', value: `${data.metrics.retentionRate}%`, trend: '+0.0%', icon: BarChart3, color: '#27ae60' },
    ] : [];

    // Calculate max count for dynamic chart scaling
    const maxCount = data?.trend?.length > 0 ? Math.max(...data.trend.map(t => t.count)) : 10;

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Business Analytics</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Platform-wide performance, user growth, and order metrics.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="sa-search" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                        <option>Last Quarter</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {loading ? <div className="sa-empty">Loading real-time analytics...</div> : (
                <>
                    {/* Quick Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        {metrics.map((metric, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="sa-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${metric.color}15`, color: metric.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <metric.icon size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{metric.label}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{metric.value}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div className="sa-card" style={{ padding: '24px' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 24px 0', color: 'var(--text-main)' }}>Order Volume Trend (Last 7 Days)</h2>
                            {data?.trend?.length > 0 ? (
                                <>
                                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        {data.trend.map((day, i) => {
                                            const heightPercent = Math.max((day.count / maxCount) * 100, 5); // min 5% height for visibility
                                            return (
                                                <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} title={`${day._id}: ${day.count} orders`}>
                                                    <div style={{ width: '60%', background: 'var(--primary)', height: `${heightPercent}%`, borderRadius: '6px 6px 0 0', opacity: 0.8 }}></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {data.trend.map((day, i) => (
                                            <span key={i}>{new Date(day._id).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="sa-empty" style={{ height: '300px' }}>No order data for the last 7 days</div>
                            )}
                        </div>

                <div className="sa-card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 24px 0', color: 'var(--text-main)' }}>User Acquisition</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Organic Search</span>
                                <span style={{ fontWeight: 700 }}>45%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--border-subtle)', height: '8px', borderRadius: '4px' }}>
                                <div style={{ width: '45%', background: '#3498db', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Social Media</span>
                                <span style={{ fontWeight: 700 }}>30%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--border-subtle)', height: '8px', borderRadius: '4px' }}>
                                <div style={{ width: '30%', background: '#9b59b6', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Referrals</span>
                                <span style={{ fontWeight: 700 }}>15%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--border-subtle)', height: '8px', borderRadius: '4px' }}>
                                <div style={{ width: '15%', background: '#27ae60', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Other</span>
                                <span style={{ fontWeight: 700 }}>10%</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--border-subtle)', height: '8px', borderRadius: '4px' }}>
                                <div style={{ width: '10%', background: '#e67e22', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

export default SuperadminBusinessAnalytics;
