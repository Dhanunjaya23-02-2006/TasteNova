import React, { useState, useEffect } from 'react';
import { Gift, Zap, TrendingUp, CheckCircle, Loader } from 'lucide-react';
import api from '../../api';

const DeliveryIncentivesPage = () => {
    const [incentives, setIncentives] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIncentives();
    }, []);

    const fetchIncentives = async () => {
        try {
            const res = await api.get('/delivery/incentives');
            setIncentives(res.data);
        } catch (error) {
            console.error('Error fetching incentives:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader className="spin" size={32} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
                <div>Loading incentives...</div>
            </div>
        );
    }

    const { dailyChallenge, activeOffers } = incentives || { 
        dailyChallenge: { target: 10, completed: 0, bonusAmount: 150 }, 
        activeOffers: [] 
    };

    if (!dailyChallenge) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>Incentives & Bonuses</h1>
                <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
                    <Gift size={64} color="var(--primary)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                    <h2 style={{ margin: '0 0 12px', color: 'var(--text-main)', fontSize: '1.5rem' }}>Unlock Your Bonuses!</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                        Complete your first delivery to start receiving daily challenges, peak hour bonuses, and exclusive incentives.
                    </p>
                </div>
            </div>
        );
    }

    const progressPercent = Math.min((dailyChallenge.completed / dailyChallenge.target) * 100, 100);

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
                <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem' }}>Complete {dailyChallenge.target} deliveries</h2>
                <p style={{ margin: '0 0 24px', fontSize: '1.1rem', opacity: 0.9 }}>Earn an extra ₹{dailyChallenge.bonusAmount} bonus today!</p>
                
                <div style={{ background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#fff', width: `${progressPercent}%`, height: '100%', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span>{dailyChallenge.completed} / {dailyChallenge.target} Completed</span>
                    <span>{dailyChallenge.completed >= dailyChallenge.target ? 'Completed!' : `Just ${dailyChallenge.target - dailyChallenge.completed} more!`}</span>
                </div>
            </div>

            <h3 style={{ margin: '0 0 16px', color: 'var(--text-main)' }}>Active Offers</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeOffers.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active offers at the moment. Check back later!
                    </div>
                ) : activeOffers.map(offer => {
                    const offerProgress = Math.min((offer.progress.current / offer.progress.max) * 100, 100);
                    return (
                        <div key={offer.id} style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', color: offer.color }}>
                                {offer.iconType === 'trending' ? <TrendingUp size={24} /> : <CheckCircle size={24} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{offer.title}</h4>
                                    <span style={{ background: offer.status === 'Active' ? '#EAF5F0' : '#F8F9FA', color: offer.status === 'Active' ? 'var(--success)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>{offer.status}</span>
                                </div>
                                <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{offer.description}</p>
                                <div style={{ background: '#F8F9FA', height: '6px', borderRadius: '3px', marginBottom: '8px' }}>
                                    <div style={{ background: offer.color, width: `${offerProgress}%`, height: '100%', borderRadius: '3px' }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{offer.progress.current} / {offer.progress.max} {offer.progress.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryIncentivesPage;
