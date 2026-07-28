import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';

export const AnalyticsTab = ({ user }) => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/analytics`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data.dailyStats);
            }
        } catch (error) {
            console.error('Error fetching analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Analytics...</div>;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--bg-surface)', padding: '15px', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: 0, color: 'var(--primary)' }}>Revenue: ₹{payload[0].value}</p>
                    {payload[1] && <p style={{ margin: 0, color: '#8884d8' }}>Orders: {payload[1].value}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Platform Analytics (Last 7 Days)</h2>

            {analytics.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <h3>No Data Available</h3>
                    <p>There are no completed orders in the last 7 days to display analytics.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Revenue Line Chart */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <TrendingUp size={24} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>Daily Revenue</h3>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <LineChart data={analytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="_id" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orders Bar Chart */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <ShoppingBag size={24} color="#8884d8" />
                            <h3 style={{ margin: 0 }}>Order Volume</h3>
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={analytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="_id" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="orders" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
