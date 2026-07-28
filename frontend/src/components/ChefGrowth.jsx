import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Package, Activity, Camera, Presentation, MessageSquare, Zap, BarChart2 } from 'lucide-react';

const ChefGrowth = ({ orders }) => {
    // Analytics calculations
    const analytics = useMemo(() => {
        if (!orders || orders.length === 0) return { revenue: 0, orderCount: 0, topDishes: [] };
        
        // Count as completed if not pending or cancelled
        const completedOrders = orders.filter(o => o.status !== 'Pending' && o.status !== 'Cancelled');
        const revenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const orderCount = completedOrders.length;

        // Top dishes count
        const dishCounts = {};
        completedOrders.forEach(order => {
            order.items?.forEach(item => {
                dishCounts[item.name] = (dishCounts[item.name] || 0) + item.qty;
            });
        });
        
        const topDishes = Object.entries(dishCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return { revenue, orderCount, topDishes };
    }, [orders]);

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp color="var(--primary)" /> Growth Hub
                </h2>
                <span style={{ padding: '6px 12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Shopify for Home Chefs
                </span>
            </div>

            {/* Analytics Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px', marginBottom: '35px' }}>
                <div className="glass-panel p-4" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '12px', color: '#2ecc71' }}>
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Total Revenue</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>₹{analytics.revenue.toFixed(2)}</h3>
                    </div>
                </div>
                
                <div className="glass-panel p-4" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', color: '#3498db' }}>
                        <Package size={28} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Completed Orders</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics.orderCount}</h3>
                    </div>
                </div>

                <div className="glass-panel p-4" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '15px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '12px', color: '#9b59b6' }}>
                        <Activity size={28} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 5px 0' }}>Top Performing Dish</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {analytics.topDishes.length > 0 ? analytics.topDishes[0].name : 'No data yet'}
                        </h3>
                    </div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>🧠 AI Business Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '35px' }}>
                <div className="glass-panel p-4" style={{ borderLeft: '4px solid #f1c40f', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f1c40f', marginBottom: '10px' }}>
                        <Zap size={20} /> Demand Forecasting
                    </h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, flex: 1 }}>
                        Expect a <strong>25% surge</strong> in orders this upcoming weekend due to a local festival in your delivery radius. Ensure you have adequate raw materials stocked.
                    </p>
                </div>
                
                <div className="glass-panel p-4" style={{ borderLeft: '4px solid #e74c3c', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c', marginBottom: '10px' }}>
                        <BarChart2 size={20} /> Pricing Suggestions
                    </h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, flex: 1 }}>
                        Your most popular dish is currently priced 15% lower than the neighborhood average. Consider a slight price adjustment to increase your profit margins.
                    </p>
                </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>📚 Chef Resource Center</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
                <div className="glass-panel p-4 hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', flexShrink: 0 }}>
                        <Camera size={40} color="var(--text-muted)" />
                    </div>
                    <h4 style={{ marginBottom: '5px' }}>Food Photography 101</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, flex: 1 }}>Learn how to plate and shoot your dishes using just your smartphone for mouth-watering menu pictures.</p>
                </div>

                <div className="glass-panel p-4 hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', flexShrink: 0 }}>
                        <Presentation size={40} color="var(--text-muted)" />
                    </div>
                    <h4 style={{ marginBottom: '5px' }}>Packaging Guidance</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, flex: 1 }}>Best practices for spill-proof, eco-friendly, and temperature-retaining packaging to ensure 5-star ratings.</p>
                </div>

                <div className="glass-panel p-4 hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', flexShrink: 0 }}>
                        <MessageSquare size={40} color="var(--text-muted)" />
                    </div>
                    <h4 style={{ marginBottom: '5px' }}>Social Media Marketing</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, flex: 1 }}>Templates and strategies to promote your TasteNova kitchen on Instagram and local community groups.</p>
                </div>
            </div>
        </div>
    );
};

export default ChefGrowth;
