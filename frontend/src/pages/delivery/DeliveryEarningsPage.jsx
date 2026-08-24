import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Download, Filter, Loader } from 'lucide-react';
import api from '../../api';

const DeliveryEarningsPage = () => {
    const [timeframe, setTimeframe] = useState('today');
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState({
        summaries: {
            today: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0 },
            week: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0 },
            month: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0 }
        },
        transactions: []
    });

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await api.get('/delivery/earnings');
            setEarningsData(res.data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentSummary = earningsData.summaries[timeframe] || earningsData.summaries.today;
    const transactions = earningsData.transactions || [];

    const StatBox = ({ label, value, main }) => (
        <div style={{ flex: 1, padding: '20px', background: main ? 'var(--primary)' : '#fff', color: main ? '#fff' : 'var(--text-main)', borderRadius: '12px', border: main ? 'none' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.85rem', color: main ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: main ? '2.4rem' : '1.5rem', fontWeight: 800 }}>₹{value.toLocaleString()}</div>
        </div>
    );

    const BreakdownItem = ({ label, amount }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 700 }}>₹{amount.toLocaleString()}</span>
        </div>
    );

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader className="spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
                <div>Loading earnings data...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Earnings</h1>
                <button style={{ background: '#fff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    <Download size={16} /> Statement
                </button>
            </div>

            {/* Timeframe Selector */}
            <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
                {['today', 'week', 'month'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        style={{
                            padding: '8px 24px',
                            background: timeframe === t ? '#EAF5F0' : 'transparent',
                            color: timeframe === t ? 'var(--primary)' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <StatBox label={`${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}'s Earnings`} value={currentSummary.total} main={true} />
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <StatBox label="Trips" value={currentSummary.trips || 0} />
                        <StatBox label="Online Hrs" value={(currentSummary.onlineHours || 0).toFixed(1)} />
                    </div>
                </div>

                <div style={{ flex: '2 1 400px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Earnings Breakdown</h3>
                    <BreakdownItem label="Delivery Earnings" amount={currentSummary.delivery} />
                    <BreakdownItem label="Distance Incentive" amount={currentSummary.distance} />
                    <BreakdownItem label="Peak Bonus" amount={currentSummary.peak} />
                    <BreakdownItem label="Other Incentive" amount={currentSummary.other} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', marginTop: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Payout</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>₹{currentSummary.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Transaction History</h3>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
                <div>
                    {transactions.map((tx, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EAF5F0', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowDownRight size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Order {tx.id} - {tx.type}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.time}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>
                                +₹{tx.amount}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '16px', textAlign: 'center', background: '#F8F9FA' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>View Older Transactions</button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryEarningsPage;
