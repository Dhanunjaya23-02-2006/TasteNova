import React from 'react';
import { 
    TrendingUp, Package, Activity, Brain, 
    Lightbulb, TrendingDown, Camera, Box, MessageSquare,
    Zap, BarChart2, Layers
} from 'lucide-react';

const ChefGrowth = ({ stats }) => {
    const totalEarnings = stats?.totalEarnings || 0;
    const completedOrders = stats?.ordersCompletedToday || 0;
    const topDish = stats?.topDishes && stats.topDishes.length > 0 ? stats.topDishes[0].name : 'No data yet';

    return (
        <div style={{ maxWidth: '1200px', paddingBottom: '40px' }} className="animate-fade-up">
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: '"Playfair Display", serif' }}>
                    <TrendingUp color="#27ae60" size={28} /> Growth Hub
                </h1>
                <button style={{ 
                    background: '#e8f5e9', color: '#2e7d32', border: 'none', 
                    padding: '8px 16px', borderRadius: '20px', fontWeight: 700, 
                    fontSize: '0.85rem', cursor: 'pointer' 
                }}>
                    Shopify for Home Chefs
                </button>
            </div>

            {/* 3 Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {/* Revenue Card */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#2e7d32', fontSize: '1.5rem', fontWeight: 700 }}>$</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>Total Revenue</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F3F26', fontFamily: '"Playfair Display", serif' }}>₹{totalEarnings.toFixed(2)}</div>
                    </div>
                </div>

                {/* Orders Card */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={28} color="#1976d2" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>Completed Orders</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F3F26', fontFamily: '"Playfair Display", serif' }}>{completedOrders}</div>
                    </div>
                </div>

                {/* Top Dish Card */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={28} color="#8e24aa" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>Top Performing Dish</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F3F26', fontFamily: '"Playfair Display", serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topDish}</div>
                    </div>
                </div>
            </div>

            {/* AI Business Insights Section */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Playfair Display", serif' }}>
                    <Brain color="#ec407a" size={24} /> AI Business Insights
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* Demand Forecasting */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #fbc02d', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbc02d', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={18} /> Demand Forecasting
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#424242', lineHeight: '1.6', margin: 0 }}>
                            Expect a <strong>25% surge</strong> in orders this upcoming weekend due to a local festival in your delivery radius. Ensure you have adequate raw materials stocked.
                        </p>
                    </div>

                    {/* Pricing Suggestions */}
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', borderLeft: '4px solid #e53935', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e53935', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart2 size={18} /> Pricing Suggestions
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#424242', lineHeight: '1.6', margin: 0 }}>
                            Your most popular dish is currently priced 15% lower than the neighborhood average. Consider a slight price adjustment to increase your profit margins.
                        </p>
                    </div>

                </div>
            </div>

            {/* Chef Resource Center Section */}
            <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: '"Playfair Display", serif' }}>
                    <Layers color="#1976d2" size={24} /> Chef Resource Center
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    
                    {/* Resource 1 */}
                    <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '140px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                            <Camera size={48} color="#757575" strokeWidth={1.5} />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', fontFamily: '"Playfair Display", serif' }}>
                                Food Photography 101
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: '1.6', margin: 0 }}>
                                Learn how to plate and shoot your dishes using just your smartphone for mouth-watering menu pictures.
                            </p>
                        </div>
                    </div>

                    {/* Resource 2 */}
                    <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '140px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                            <Box size={48} color="#757575" strokeWidth={1.5} />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', fontFamily: '"Playfair Display", serif' }}>
                                Packaging Guidance
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: '1.6', margin: 0 }}>
                                Best practices for spill-proof, eco-friendly, and temperature-retaining packaging to ensure 5-star ratings.
                            </p>
                        </div>
                    </div>

                    {/* Resource 3 */}
                    <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '140px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                            <MessageSquare size={48} color="#757575" strokeWidth={1.5} />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0', fontFamily: '"Playfair Display", serif' }}>
                                Social Media Marketing
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#757575', lineHeight: '1.6', margin: 0 }}>
                                Templates and strategies to promote your TasteNova kitchen on Instagram and local community groups.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default ChefGrowth;
