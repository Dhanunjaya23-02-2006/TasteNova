import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

const RevenueTab = ({ user }) => {
    const [stats, setStats] = useState({
        totalGmv: 0,
        estimatedRevenue: 0,
        totalOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRevenueStats();
    }, []);

    const fetchRevenueStats = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/revenue`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (error) {
            console.error('Error fetching revenue stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading revenue data...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Platform Revenue Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                
                {/* GMV Card */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        <ShoppingBag size={32} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Total GMV (Gross Merchandise Value)
                        </p>
                        <h3 style={{ margin: 0, fontSize: '2.5rem' }}>₹{stats.totalGmv.toLocaleString()}</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--success)' }}>Total value of all delivered orders</p>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        <TrendingUp size={32} color="var(--success)" />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Estimated Platform Revenue
                        </p>
                        <h3 style={{ margin: 0, fontSize: '2.5rem' }}>₹{stats.estimatedRevenue.toLocaleString()}</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculated from platform commissions</p>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        <DollarSign size={32} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Completed Orders
                        </p>
                        <h3 style={{ margin: 0, fontSize: '2.5rem' }}>{stats.totalOrders.toLocaleString()}</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform-wide</p>
                    </div>
                </div>

            </div>

            {/* Future Charts Area */}
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <h3>Revenue Analytics Chart</h3>
                <p>Monthly breakdown chart will be rendered here.</p>
            </div>
            
        </motion.div>
    );
};

export default RevenueTab;
