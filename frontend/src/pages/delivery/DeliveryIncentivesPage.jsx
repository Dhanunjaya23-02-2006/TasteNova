import React from 'react';
import { Gift, Zap, TrendingUp, CheckCircle } from 'lucide-react';

const DeliveryIncentivesPage = () => {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Incentives & Bonuses</h1>
            
            {/* Daily Challenge */}
            <div style={{ background: 'linear-gradient(135deg, #FF9900 0%, #E67E22 100%)', borderRadius: '16px', padding: '24px', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                <Gift size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.2 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Zap size={20} fill="#fff" />
                    <span style={{ fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Today's Challenge</span>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem' }}>Complete 10 deliveries</h2>
                <p style={{ margin: '0 0 24px', fontSize: '1.1rem', opacity: 0.9 }}>Earn an extra ₹150 bonus today!</p>
                
                <div style={{ background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#fff', width: '80%', height: '100%', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span>8 / 10 Completed</span>
                    <span>Just 2 more!</span>
                </div>
            </div>

            <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)' }}>Active Offers</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', color: 'var(--primary)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Peak Hours Bonus</h4>
                            <span style={{ background: '#EAF5F0', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Active</span>
                        </div>
                        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Earn ₹20 extra on every delivery between 7:00 PM and 10:00 PM today.</p>
                        <div style={{ background: '#F8F9FA', height: '6px', borderRadius: '3px', marginBottom: '8px' }}>
                            <div style={{ background: 'var(--primary)', width: '60%', height: '100%', borderRadius: '3px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>3 / 5 Peak Deliveries</div>
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', color: '#f39c12' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Weekly Target</h4>
                            <span style={{ background: '#F8F9FA', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>Ongoing</span>
                        </div>
                        <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete 50 deliveries this week to unlock ₹500 bonus.</p>
                        <div style={{ background: '#F8F9FA', height: '6px', borderRadius: '3px', marginBottom: '8px' }}>
                            <div style={{ background: '#f39c12', width: '84%', height: '100%', borderRadius: '3px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>42 / 50 Deliveries (Ends Sunday)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryIncentivesPage;
