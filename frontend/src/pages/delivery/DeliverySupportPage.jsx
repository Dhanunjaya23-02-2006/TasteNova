import React from 'react';
import { HelpCircle, AlertTriangle, MessageSquare, Phone, Package, ChevronRight } from 'lucide-react';

const DeliverySupportPage = () => {
    const issues = [
        { icon: Package, title: 'Active Delivery Problem', desc: 'Customer unavailable, wrong address' },
        { icon: AlertTriangle, title: 'Pickup Problem', desc: 'Chef not responding, food not ready' },
        { icon: HelpCircle, title: 'Payment Problem', desc: 'Missing earnings, incentive issues' },
        { icon: MessageSquare, title: 'App Problem', desc: 'GPS issues, app crashing' },
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Help & Support</h1>
            
            <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)' }}>What do you need help with?</h3>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
                {issues.map((issue, i) => (
                    <button key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '12px', borderRadius: '50%' }}>
                                <issue.icon size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '4px' }}>{issue.title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.desc}</div>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </button>
                ))}
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <Phone size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 8px' }}>Need immediate help?</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our support team is available 24/7 for active delivery partners.</p>
                <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={18} /> Contact Support
                </button>
            </div>
        </div>
    );
};

export default DeliverySupportPage;
