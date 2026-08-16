import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const ChefEarningsPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error(e); }
    };

    const earnings = useMemo(() => {
        const completed = orders.filter(o => ['Ready', 'Delivered', 'Completed', 'Out for Delivery'].includes(o.status));
        const total = completed.reduce((sum, o) => sum + o.totalPrice, 0);
        const today = new Date().toDateString();
        const todayTotal = completed.filter(o => new Date(o.createdAt).toDateString() === today).reduce((sum, o) => sum + o.totalPrice, 0);
        const thisMonth = completed.filter(o => {
            const d = new Date(o.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).reduce((sum, o) => sum + o.totalPrice, 0);
        return { total, todayTotal, thisMonth, transactions: completed.slice(0, 15) };
    }, [orders]);

    const cardStyle = {
        background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
        border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)'
    };

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '24px' }}>Earnings & Wallet</h1>
            
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #27ae60' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Wallet size={20} color="#27ae60" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Earnings</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#27ae60' }}>₹{earnings.total.toLocaleString()}</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <TrendingUp size={20} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This Month</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{earnings.thisMonth.toLocaleString()}</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #3498db' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Clock size={20} color="#3498db" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Today</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3498db' }}>₹{earnings.todayTotal.toLocaleString()}</div>
                </div>
            </div>

            {/* Transactions */}
            <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontWeight: 700 }}>Recent Transactions</h3>
                {earnings.transactions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No transactions yet</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Order</th>
                                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Date</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Amount</th>
                                    <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.transactions.map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '12px 8px', fontSize: '0.9rem', fontWeight: 600 }}>
                                            #{order._id.slice(-6)}
                                        </td>
                                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, color: '#27ae60' }}>
                                            ₹{order.totalPrice}
                                        </td>
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(39,174,96,0.1)', color: '#27ae60', fontWeight: 600 }}>
                                                <CheckCircle2 size={12} /> {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChefEarningsPage;
