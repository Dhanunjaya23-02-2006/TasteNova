import React, { useState, useEffect, useContext } from 'react';
import { IndianRupee, TrendingUp, Calendar, ArrowRight, Download, BarChart2, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminRevenue = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [period, setPeriod] = useState('This Month');
    const [statsData, setStatsData] = useState({ totalGMV: 0, platformFees: 0, deliveryFees: 0, netProfit: 0 });

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await fetch(`${API_URL}/superadmin/finance/revenue?period=${period}`, { headers: { Authorization: `Bearer ${user.token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setStatsData(data);
                }
            } catch(e) { console.error(e); }
        };
        fetchRevenue();
    }, [user, period]);

    const stats = [
        { title: 'Total GMV', value: `₹${statsData.totalGMV.toLocaleString('en-IN')}`, trend: '+12.5%', color: 'var(--primary)' },
        { title: 'Platform Fees', value: `₹${statsData.platformFees.toLocaleString('en-IN')}`, trend: '+14.2%', color: 'var(--accent)' },
        { title: 'Delivery Fees', value: `₹${statsData.deliveryFees.toLocaleString('en-IN')}`, trend: '+8.4%', color: '#3498db' },
        { title: 'Net Profit', value: `₹${statsData.netProfit.toLocaleString('en-IN')}`, trend: '+15.3%', color: '#27ae60' }
    ];

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Revenue & Finance</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track platform earnings, GMV, and financial health.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="sa-search" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>This Year</option>
                    </select>
                    <button 
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => toast.success('Report generation started. You will receive an email shortly.')}
                    >
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {stats.map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="sa-card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {stat.title}
                            <span style={{ color: stat.trend.startsWith('+') ? '#27ae60' : '#e74c3c', background: stat.trend.startsWith('+') ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Chart Area */}
                <div className="sa-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Revenue Trend</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}/> GMV</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}/> Profit</span>
                        </div>
                    </div>
                    {/* Mock Chart Visualization */}
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        {[40, 60, 45, 80, 50, 90, 75, 100, 85, 110, 95, 120].map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                <div style={{ width: '100%', background: 'rgba(232, 155, 44, 0.8)', height: `${val * 0.2}%`, borderRadius: '4px 4px 0 0' }}></div>
                                <div style={{ width: '100%', background: 'rgba(39, 174, 96, 0.8)', height: `${val * 0.8}%`, borderRadius: '4px 4px 0 0' }}></div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Secondary Panels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="sa-card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>Revenue by Source</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                            <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', background: 'conic-gradient(var(--primary) 0% 70%, var(--accent) 70% 85%, #3498db 85% 100%)' }}>
                                <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', background: '#fff', borderRadius: '50%' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '2px' }}/> Orders</span>
                                <span style={{ fontWeight: 600 }}>70%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '2px' }}/> Catering</span>
                                <span style={{ fontWeight: 600 }}>15%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', background: '#3498db', borderRadius: '2px' }}/> Subscriptions</span>
                                <span style={{ fontWeight: 600 }}>15%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperadminRevenue;
