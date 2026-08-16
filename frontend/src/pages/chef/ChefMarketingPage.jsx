import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Megaphone, Share2, Users, TrendingUp, Star } from 'lucide-react';

const ChefMarketingPage = () => {
    
    const hubItems = [
        {
            title: 'Offers & Coupons',
            description: 'Create percentage or flat discounts for your customers to boost sales.',
            icon: Ticket,
            color: '#e74c3c',
            link: '/chef/offers'
        },
        {
            title: 'Promote a Dish',
            description: 'Highlight specific dishes in your menu to increase their visibility.',
            icon: Megaphone,
            color: '#9b59b6',
            link: '/chef/promotions'
        },
        {
            title: 'Featured Kitchen',
            description: 'Apply for featured placement on the TasteNova homepage.',
            icon: Star,
            color: '#f1c40f',
            link: '/chef/promotions'
        },
        {
            title: 'Social Media Promotion',
            description: 'Generate beautiful graphics for Instagram and Facebook.',
            icon: Share2,
            color: '#3498db',
            link: '/chef/promotions'
        },
        {
            title: 'Customer Re-engagement',
            description: 'Send special offers to customers who haven\'t ordered recently.',
            icon: Users,
            color: '#2ecc71',
            link: '/chef/promotions'
        },
        {
            title: 'Marketing Analytics',
            description: 'Track the performance and ROI of your campaigns.',
            icon: TrendingUp,
            color: '#e67e22',
            link: '/chef/growth-hub'
        }
    ];

    return (
        <div style={{ maxWidth: '1200px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Marketing Tools Hub</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Grow your kitchen's reach, attract new customers, and boost your sales.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {hubItems.map((item, idx) => (
                    <Link key={idx} to={item.link} style={{ textDecoration: 'none' }}>
                        <div style={{ 
                            background: '#fff', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-subtle)', 
                            padding: '24px',
                            display: 'flex',
                            gap: '16px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            height: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                        }}
                        >
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: `${item.color}15`, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <item.icon size={24} color={item.color} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0F3F26', fontWeight: 700 }}>{item.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {/* Quick Stats Summary */}
            <div style={{ marginTop: '40px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '24px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0F3F26' }}>Active Campaigns Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Offers</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>2</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Reach</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>1,240</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Orders Generated</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#27ae60' }}>14</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Estimated ROI</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F3F26' }}>4.2x</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefMarketingPage;
