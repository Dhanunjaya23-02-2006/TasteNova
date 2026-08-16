import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { 
    TrendingUp, Calendar, ChevronDown, CheckCircle2, 
    Users, Heart, HelpCircle, Package, ArrowRight,
    Sparkles, RefreshCw, Plus, Share2
} from 'lucide-react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Helper components
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
const StatCard = ({ title, value, change, isPositive, icon: Icon, iconBg, iconColor, smallChartData, chartColor }) => (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={iconColor} />
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>{value}</div>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isPositive ? '#27ae60' : '#e74c3c' }}>
                {isPositive ? '↑' : '↓'} {change}% <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>vs last 7 days</span>
            </div>
            {smallChartData && (
                <div style={{ width: '60px', height: '30px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={smallChartData}>
                            <Line type="monotone" dataKey="current" stroke={chartColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    </div>
);

const GrowthHubPage = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/chef/stats`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                if (res.ok) setStats(await res.json());
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Analytics...</div>;
    if (!stats) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)' }}>Failed to load data.</div>;

    const { revenueData = [], orderData = [], topDishes = [], totalEarnings = 0, newCustomersToday = 0, repeatCustomersToday = 0, revenueGrowth = 0, orderGrowth = 0, aiInsights = {} } = stats;

    return (
        <div style={{ maxWidth: '1400px', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp color="var(--primary)" size={28} /> Growth Hub
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Track your growth, discover opportunities and take action to scale your kitchen.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => toast.success('Compared with Last 7 Days')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
                        Compare with: Last 7 Days <ChevronDown size={16} />
                    </button>
                    <button onClick={() => toast.success('Date range selected')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
                        <Calendar size={16} /> 2 May - 8 May 2026
                    </button>
                </div>
            </div>

            {/* 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <StatCard 
                    title="Total Revenue" value={`₹${totalEarnings}`} change={revenueGrowth} isPositive={revenueGrowth >= 0}
                    icon={TrendingUp} iconBg="#EAF5F0" iconColor="#27ae60"
                    smallChartData={revenueData.length > 0 ? revenueData : null} chartColor="#27ae60"
                />
                <StatCard 
                    title="Completed Orders" value={stats.ordersCompletedToday || 0} change={orderGrowth} isPositive={orderGrowth >= 0}
                    icon={Package} iconBg="#eef2ff" iconColor="#5c6ac4"
                    smallChartData={orderData.length > 0 ? orderData.map(d => ({ current: d.orders })) : null} chartColor="#5c6ac4"
                />
                <StatCard 
                    title="New Customers" value={newCustomersToday} change="16.1" isPositive={true}
                    icon={Users} iconBg="#f3e5f5" iconColor="#9c27b0"
                    smallChartData={orderData.length > 0 ? orderData.map(d => ({ current: d.orders * 0.3 })) : null} chartColor="#9c27b0"
                />
                <StatCard 
                    title="Repeat Customers" value={`${repeatCustomersToday}%`} change="5.8" isPositive={true}
                    icon={Heart} iconBg="#fff3e0" iconColor="#ff9800"
                    smallChartData={orderData.length > 0 ? orderData.map(d => ({ current: d.orders * 0.7 })) : null} chartColor="#ff9800"
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Revenue Overview */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F3F26', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Revenue Overview <HelpCircle size={14} color="var(--text-muted)" />
                            </h3>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', marginTop: '8px' }}>₹{totalEarnings}</div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '4px', background: '#27ae60', borderRadius: '2px' }}></div> This Week</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '4px', background: '#e0e0e0', borderRadius: '2px' }}></div> Last Week</span>
                            </div>
                        </div>
                        <button onClick={() => toast.success('View changed to Daily')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Daily <ChevronDown size={14} />
                        </button>
                    </div>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9e9e9e' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9e9e9e' }} tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="previous" stroke="#e0e0e0" strokeWidth={2} dot={{ r: 3, fill: '#e0e0e0' }} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="current" stroke="#27ae60" strokeWidth={2} dot={{ r: 4, fill: '#27ae60', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Trend */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F3F26' }}>Order Trend</h3>
                        <button onClick={() => toast.success('View changed to Daily')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Daily <ChevronDown size={14} />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '-10px', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></div> Orders
                    </div>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9e9e9e' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9e9e9e' }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="orders" fill="#27ae60" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Dishes */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F3F26' }}>Top Performing Dishes</h3>
                        <button onClick={() => toast.success('View changed to This Week')} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: '#F8F9FA' }}>
                            This Week <ChevronDown size={14} />
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                        {topDishes.length > 0 ? topDishes.map((dish, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0 }}>
                                    {/* Placeholder image for dish */}
                                    <img src={`https://source.unsplash.com/100x100/?food,dish&sig=${i}`} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 600, color: '#0F3F26' }}>{dish.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dish.orders} orders</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#F8F9FA', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${(dish.orders / (dish.max || 50)) * 100}%`, height: '100%', background: '#27ae60', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No data yet</div>
                        )}
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Link to="/chef/menu" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', textDecoration: 'none' }}>
                            View Menu Performance <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row - 3 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                
                {/* Left Column (AI Insights & Weekly Growth) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* AI Business Insights */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#0F3F26', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} color="#9c27b0" /> AI Business Insights
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ background: '#EAF5F0', padding: '6px', borderRadius: '6px' }}><Calendar size={16} color="#27ae60" /></div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F3F26' }}>High Demand Day</span>
                                </div>
                                <p dangerouslySetInnerHTML={{ __html: aiInsights.highDemandDay || 'Gathering more data to find your high demand days.' }} style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.5', margin: '0 0 16px 0' }} />
                                <button onClick={() => toast.success('AI insights loaded')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Details <ArrowRight size={12} />
                                </button>
                            </div>

                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ background: '#f3e5f5', padding: '6px', borderRadius: '6px' }}><Users size={16} color="#9c27b0" /></div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F3F26' }}>Repeat Customer Growth</span>
                                </div>
                                <p dangerouslySetInnerHTML={{ __html: aiInsights.repeatGrowth || 'Gathering more data to calculate repeat customer growth.' }} style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.5', margin: '0 0 16px 0' }} />
                                <button onClick={() => toast.success('AI insights loaded')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Details <ArrowRight size={12} />
                                </button>
                            </div>

                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fff3e0', padding: '6px', borderRadius: '6px' }}><TrendingUp size={16} color="#ff9800" /></div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F3F26' }}>Revenue Opportunity</span>
                                </div>
                                <p dangerouslySetInnerHTML={{ __html: aiInsights.revenueOpportunity || 'Gathering more data to identify revenue opportunities.' }} style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.5', margin: '0 0 16px 0' }} />
                                <button onClick={() => toast.success('AI insights loaded')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Details <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Growth Summary */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#0F3F26' }}>Weekly Growth Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ background: '#EAF5F0', padding: '8px', borderRadius: '8px', color: '#27ae60' }}><TrendingUp size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Revenue Growth</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>{revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs last 7 days</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px', color: '#5c6ac4' }}><Package size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Order Growth</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>{orderGrowth > 0 ? '+' : ''}{orderGrowth}%</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs last 7 days</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ background: '#f3e5f5', padding: '8px', borderRadius: '8px', color: '#9c27b0' }}><Users size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>New Customers</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>{newCustomersToday}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs last 7 days</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ background: '#fff3e0', padding: '8px', borderRadius: '8px', color: '#ff9800' }}><RefreshCw size={20} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Avg. Order Value</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26' }}>₹{totalEarnings > 0 && stats.ordersCompletedToday > 0 ? Math.round(totalEarnings / stats.ordersCompletedToday) : 0}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs last 7 days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Recommendations & Actions) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Recommendations for You */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)', flex: 1 }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#0F3F26' }}>Recommendations for You</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#EAF5F0', padding: '6px', borderRadius: '4px', color: '#27ae60' }}><CheckCircle2 size={16} /></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Enable weekend special offers to increase orders</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#27ae60', background: '#EAF5F0', padding: '2px 8px', borderRadius: '12px' }}>Recommended</span>
                                    <ChevronDown size={16} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#EAF5F0', padding: '6px', borderRadius: '4px', color: '#27ae60' }}><CheckCircle2 size={16} /></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Add combo meals for top 3 dishes</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#27ae60', background: '#EAF5F0', padding: '2px 8px', borderRadius: '12px' }}>High Impact</span>
                                    <ChevronDown size={16} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#eef2ff', padding: '6px', borderRadius: '4px', color: '#5c6ac4' }}><CheckCircle2 size={16} /></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Promote your kitchen in nearby localities</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ff9800', background: '#fff3e0', padding: '2px 8px', borderRadius: '12px' }}>Medium Impact</span>
                                    <ChevronDown size={16} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#f3e5f5', padding: '6px', borderRadius: '4px', color: '#9c27b0' }}><CheckCircle2 size={16} /></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Consider increasing dinner time capacity</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', background: '#eee', padding: '2px 8px', borderRadius: '12px' }}>Low Impact</span>
                                    <ChevronDown size={16} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Growth Actions */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#0F3F26' }}>Growth Actions</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#EAF5F0', padding: '8px', borderRadius: '50%', color: '#27ae60' }}><CheckCircle2 size={20} /></div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F3F26' }}>Create a new offer</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Increase visibility and attract more customers</div>
                                    </div>
                                </div>
                                <Link to="/chef/offers" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem', textDecoration: 'none' }}>Create Offer</Link>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#EAF5F0', padding: '8px', borderRadius: '50%', color: '#27ae60' }}><CheckCircle2 size={20} /></div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F3F26' }}>Share on social media</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reach more people in your area</div>
                                    </div>
                                </div>
                                <button onClick={() => toast.success('Link copied to clipboard!')} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Share Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthHubPage;
