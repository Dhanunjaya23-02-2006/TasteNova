import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Repeat, Calendar, Clock, MapPin, ChefHat, PauseCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionsTab = () => {
    const { user } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we are mocking for the UI Phase, we will simulate fetching
        const fetchSubscriptions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/subscriptions/my`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setSubscriptions(data.data || []);
                } else {
                    // Load mock data if backend endpoint isn't fully ready
                    setSubscriptions([
                        {
                            _id: 'sub_123',
                            planName: 'Daily Lunch Plan',
                            chefName: 'Lakshmi Home Kitchen',
                            status: 'Active',
                            startDate: '2025-05-10T12:00:00Z',
                            renewalDate: '2025-06-10T12:00:00Z',
                            price: 3500,
                            mealsRemaining: 21,
                            totalMeals: 30,
                            schedule: 'Mon-Fri • 12:30 PM',
                            deliveryAddress: 'H.No: 8-2-293/82, Siddiq Nagar, Gachibowli, Hyderabad',
                            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
                        },
                        {
                            _id: 'sub_124',
                            planName: 'Weekend Dinner Special',
                            chefName: 'Anjali\'s Kitchen',
                            status: 'Paused',
                            startDate: '2025-05-01T12:00:00Z',
                            renewalDate: '2025-05-31T12:00:00Z',
                            price: 1200,
                            mealsRemaining: 2,
                            totalMeals: 8,
                            schedule: 'Sat-Sun • 8:00 PM',
                            deliveryAddress: 'H.No: 8-2-293/82, Siddiq Nagar, Gachibowli, Hyderabad',
                            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching subscriptions", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSubscriptions();
        }
    }, [user]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return { bg: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' };
            case 'Paused': return { bg: 'rgba(255, 165, 2, 0.1)', color: '#ffa502' };
            case 'Cancelled': return { bg: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' };
            default: return { bg: 'var(--bg-surface)', color: 'var(--text-muted)' };
        }
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subscriptions...</div>;
    }

    if (subscriptions.length === 0) {
        return (
            <div className="animate-fade-up" style={{ background: 'var(--bg-surface)', padding: '60px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <Repeat size={64} style={{ color: 'var(--border)', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '10px' }}>No active subscriptions</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Save time and money by subscribing to your favorite kitchen's meal plans!</p>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px' }}>Explore Meal Plans</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Your Subscriptions</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Manage your monthly meal plans, pause deliveries, or cancel anytime.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {subscriptions.map((sub) => {
                    const statusStyle = getStatusStyle(sub.status);
                    const progress = (sub.totalMeals - sub.mealsRemaining) / sub.totalMeals * 100;
                    
                    return (
                        <div key={sub._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '120px', width: '100%', position: 'relative' }}>
                                <img src={sub.image} alt={sub.planName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }}></div>
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ color: '#fff' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{sub.planName}</h3>
                                        <p style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                                            <ChefHat size={14} /> {sub.chefName}
                                        </p>
                                    </div>
                                    <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                                        {sub.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly Price</div>
                                    <div style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 800 }}>₹{sub.price}</div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                                        <span style={{ fontWeight: 600 }}>{sub.totalMeals - sub.mealsRemaining} / {sub.totalMeals} Meals Delivered</span>
                                        <span>{sub.mealsRemaining} Left</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }}></div>
                                    </div>
                                </div>
                                
                                <div style={{ borderTop: '1px dashed var(--border-subtle)', margin: '4px 0' }}></div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <Clock size={16} style={{ color: 'var(--text-main)', marginTop: '2px' }} />
                                        <div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Schedule</div>
                                            {sub.schedule}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <Calendar size={16} style={{ color: 'var(--text-main)', marginTop: '2px' }} />
                                        <div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Next Renewal</div>
                                            {new Date(sub.renewalDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={16} style={{ color: 'var(--text-main)', marginTop: '2px' }} />
                                        <div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Delivering to</div>
                                            {sub.deliveryAddress.substring(0, 35)}...
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
                                <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '6px', color: 'var(--text-main)' }}>
                                    <PauseCircle size={16} /> {sub.status === 'Paused' ? 'Resume' : 'Pause'}
                                </button>
                                <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '6px', color: '#ff4757', borderColor: 'rgba(255, 71, 87, 0.3)' }}>
                                    <XCircle size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionsTab;
