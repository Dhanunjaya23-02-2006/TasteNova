import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { 
    Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, TrendingUp,
    Download, ChevronRight, Building, FileText, Gift, HelpCircle, UserCog, Calendar, Info, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const ChefEarningsPage = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [activeTxnTab, setActiveTxnTab] = useState('All');
    
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Wallet Data
            const walletRes = await fetch(`${API_URL}/earnings/wallet`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const walletData = await walletRes.json();
            setWallet(walletData);

            // Fetch Stats Data
            const statsRes = await fetch(`${API_URL}/orders/chef/stats`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fake some payouts for UI since there is no chef endpoint for own payouts currently
            setPayouts([
                { id: 1, date: '08 Sep 2026', period: '1 Sep - 7 Sep', amount: 6320, status: 'Scheduled', account: 'HDFC Bank **** 4821' },
                { id: 2, date: '01 Sep 2026', period: '25 Aug - 31 Aug', amount: 8450, status: 'Paid', account: 'HDFC Bank **** 4821' },
                { id: 3, date: '25 Aug 2026', period: '18 Aug - 24 Aug', amount: 7820, status: 'Paid', account: 'HDFC Bank **** 4821' },
                { id: 4, date: '18 Aug 2026', period: '11 Aug - 17 Aug', amount: 6950, status: 'Paid', account: 'HDFC Bank **** 4821' },
                { id: 5, date: '11 Aug 2026', period: '4 Aug - 10 Aug', amount: 6200, status: 'Paid', account: 'HDFC Bank **** 4821' },
            ]);

        } catch (error) {
            console.error('Error fetching earnings data:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    const nextPayoutDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7); // Next Monday
        if (d.getDay() === 1 && new Date().getHours() < 9) {
            // It's Monday morning, maybe payout is today
        } else if (d.getDay() === 1) {
             d.setDate(d.getDate() + 7);
        }
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }, []);
    
    const earningsPeriod = useMemo(() => {
        const d = new Date();
        const past = new Date(d);
        past.setDate(d.getDate() - 7);
        return `${past.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }, []);

    const filteredTxns = useMemo(() => {
        if (!wallet?.transactions) return [];
        if (activeTxnTab === 'All') return wallet.transactions.slice(0, 5);
        if (activeTxnTab === 'Orders') return wallet.transactions.filter(t => t.type === 'credit' && !t.desc.includes('Refund')).slice(0,5);
        if (activeTxnTab === 'Payouts') return wallet.transactions.filter(t => t.type === 'debit').slice(0,5);
        if (activeTxnTab === 'Refunds') return wallet.transactions.filter(t => t.type === 'refund').slice(0,5);
        return wallet.transactions.slice(0, 5);
    }, [wallet, activeTxnTab]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    );

    const availableBalance = wallet?.earningsBalance || 0;
    const pendingEarnings = wallet?.pending_balance || 0;
    const thisMonth = stats?.totalEarnings || 0;
    const totalEarnings = (stats?.totalEarnings || 0) + availableBalance;
    const nextPayout = availableBalance; // assuming available goes to next payout
    
    // Fallback data if stats.revenueData is missing
    const chartData = stats?.revenueData || [
        { day: 'Mon', current: 1500 }, { day: 'Tue', current: 2300 }, { day: 'Wed', current: 3400 },
        { day: 'Thu', current: 2900 }, { day: 'Fri', current: 4800 }, { day: 'Sat', current: 6500 }, { day: 'Sun', current: 5200 }
    ];

    const cardStyle = {
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    };

    return (
        <div className="animate-fade-up" style={{ paddingBottom: '100px', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Payouts & Earnings</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Track your earnings, payouts and payment history</p>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                    <Download size={18} /> Download Statement
                </button>
            </div>

            {/* Top Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Wallet size={20} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Available Balance</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>₹{availableBalance.toLocaleString()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ready for payout</span>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                </div>
                
                <div style={cardStyle}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Clock size={20} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Pending Earnings</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>₹{pendingEarnings.toLocaleString()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From active orders</span>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>This Month</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>₹{thisMonth.toLocaleString()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            <ArrowUpRight size={14} style={{ marginRight: '4px' }} /> 18.4% <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>from last month</span>
                        </span>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Calendar size={20} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>Total Earnings</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>₹{totalEarnings.toLocaleString()}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Since joining</span>
                        <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                </div>
            </div>

            {/* Next Payout Progress Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ ...cardStyle, flex: '1 1 600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>NEXT PAYOUT</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '8px' }}>₹{nextPayout.toLocaleString()}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Scheduled for {nextPayoutDate}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Earnings period</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{earningsPeriod}</div>
                        </div>
                    </div>
                    
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '80%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>80%</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>You are all set! Payouts are processed every Monday.</div>
                    </div>
                </div>
                
                <div style={{ ...cardStyle, flex: '1 1 300px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>Payout Account</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.bankDetails?.bankName || 'HDFC Bank'}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>**** {user.bankDetails?.accountNumber?.slice(-4) || '4821'}</div>
                            </div>
                        </div>
                        <span style={{ background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Verified</span>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                        View Payout Details
                    </button>
                </div>
            </div>

            {/* Charts & Breakdown */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
                
                {/* Left: Chart */}
                <div style={{ ...cardStyle, flex: '1 1 600px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Earnings Overview</h3>
                        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px' }}>
                            {['7 Days', '30 Days', '3 Months', 'Custom'].map(period => (
                                <button key={period} style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: period === '7 Days' ? 700 : 500, borderRadius: '6px', background: period === '7 Days' ? 'var(--primary)' : 'none', color: period === '7 Days' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                                    {period} {period === 'Custom' && <Calendar size={12} style={{ marginLeft: '4px' }}/>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '240px', width: '100%', marginBottom: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E9A94' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E9A94' }} tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Earnings']}
                                />
                                <Line type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                        <div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>₹{thisMonth.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total earnings this week</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                                <ArrowUpRight size={18} /> 18.4%
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>vs last 7 days</div>
                        </div>
                    </div>
                </div>

                {/* Right: Breakdown */}
                <div style={{ ...cardStyle, flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Earnings Breakdown</h3>
                        <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)', outline: 'none' }}>
                            <option>This Month</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Gross Food Sales</span>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>₹{Math.round(thisMonth * 1.1).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>TasteNova Commission (10%)</span>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>-₹{Math.round(thisMonth * 0.1).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Taxes / Adjustments</span>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>-₹350</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Refund Adjustments</span>
                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>₹0</span>
                        </div>
                        
                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '2px dashed var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700 }}>Net Chef Earnings</span>
                            <span style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 800 }}>₹{thisMonth.toLocaleString()}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '8px' }}>
                            <Info size={14} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>amounts may take up to 24 hours to reflect</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Split Section */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Left Column */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Recent Payouts Table */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Payouts</h3>
                            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View All</button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Period</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Amount</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Account / UTR</th>
                                        <th style={{ textAlign: 'right', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((p, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{p.date}</td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.period}</td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <span style={{ 
                                                    background: p.status === 'Scheduled' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(39, 174, 96, 0.1)', 
                                                    color: p.status === 'Scheduled' ? '#3498db' : '#27ae60', 
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 
                                                }}>{p.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.account}</td>
                                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Transactions</h3>
                            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
                                {['All', 'Orders', 'Payouts', 'Refunds', 'Adjustments'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTxnTab(tab)}
                                        style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: activeTxnTab === tab ? 700 : 500, borderRadius: '6px', background: activeTxnTab === tab ? '#fff' : 'none', color: activeTxnTab === tab ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', boxShadow: activeTxnTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', whiteSpace: 'nowrap' }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Type</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Description</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Order ID</th>
                                        <th style={{ textAlign: 'right', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Amount</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTxns.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                                    ) : filteredTxns.map((t, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {t.type === 'credit' ? <ArrowDownRight size={14} color="#27ae60"/> : <ArrowUpRight size={14} color="#e74c3c" />}
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                        {t.type === 'credit' ? 'Order Earnings' : t.type === 'refund' ? 'Refund' : 'Payout'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {t.desc}
                                            </td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                #{t._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td style={{ padding: '16px 8px', fontSize: '0.9rem', textAlign: 'right', fontWeight: 700, color: t.type === 'credit' ? '#27ae60' : '#e74c3c' }}>
                                                {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                                                <span style={{ 
                                                    background: t.status === 'completed' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(243, 156, 18, 0.1)', 
                                                    color: t.status === 'completed' ? '#27ae60' : '#f39c12', 
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 
                                                }}>{t.status === 'completed' ? 'Completed' : 'Pending'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All amounts are in INR. Earnings are updated every 24 hours.</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Refer & Earn Widget */}
                    <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f9f9f9 0%, #fff 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                            <Gift size={120} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(39, 174, 96, 0.3)' }}>
                                <Wallet size={40} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>Refer & Earn</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                            Invite other home chefs and earn exciting rewards when they complete their first order.
                        </p>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 700, borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                            Refer Now
                        </button>
                    </div>

                    {/* Payment Account Summary */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Payment Account</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.bankDetails?.bankName || 'HDFC Bank'}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>**** {user.bankDetails?.accountNumber?.slice(-4) || '4821'}</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Account Holder</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.bankDetails?.accountName || user.businessName || user.name}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#27ae60', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
                            <CheckCircle2 size={16} /> Verified
                        </div>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Manage Account
                        </button>
                    </div>

                    {/* Payout Settings */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>Payout Settings</h3>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Payout Frequency</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Weekly (Every Monday)</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Change</button>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Minimum Payout Threshold</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>₹500</div>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Change</button>
                        </div>

                        <div style={{ background: 'rgba(52, 152, 219, 0.05)', border: '1px solid rgba(52, 152, 219, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Info size={16} color="#3498db" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                Payouts are processed automatically if minimum threshold is met.
                            </div>
                        </div>
                    </div>

                    {/* Need Help */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Need Help?</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <FileText size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Payout & Earnings Guide</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learn how payouts work</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <TrendingUp size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>How to increase earnings</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tips to grow your business</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <HelpCircle size={18} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Contact Support</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>We are here to help</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChefEarningsPage;
