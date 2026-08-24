import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Star, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const ChefReviewsPage = () => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/reviews/${user._id}`);
                if (res.ok) {
                    setReviews(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchReviews();
            const socket = io(API_URL.replace('/api', ''));
            socket.emit('join_chef', user._id);
            socket.on('new_review', () => {
                toast.success('NEW REVIEW RECEIVED!', { icon: '⭐' });
                fetchReviews();
            });
            return () => socket.disconnect();
        }
    }, [user]);

    const calculateBreakdown = () => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
        });
        return breakdown;
    };

    const breakdown = calculateBreakdown();
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;

    const renderStars = (rating) => (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={16} fill={star <= rating ? '#f1c40f' : 'transparent'} color={star <= rating ? '#f1c40f' : 'var(--border)'} />
            ))}
        </div>
    );

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews...</div>;
    }

    return (
        <div className="animate-fade-up">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Reviews & Ratings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>See what your customers are saying about your food.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Aggregate Stats */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)' }}>{avgRating}</h2>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={24} fill={star <= Math.round(avgRating) ? '#f1c40f' : 'transparent'} color={star <= Math.round(avgRating) ? '#f1c40f' : 'var(--border)'} />
                        ))}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Based on {totalReviews} reviews</span>
                </div>

                {/* Rating Breakdown */}
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Rating Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = breakdown[star];
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ minWidth: '40px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {star} <Star size={12} fill="#f1c40f" color="#f1c40f" />
                                    </span>
                                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', background: '#27ae60', borderRadius: '4px' }}></div>
                                    </div>
                                    <span style={{ minWidth: '30px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Review List */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Customer Feedback</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                            <div key={review._id} style={{ padding: '24px', borderBottom: idx !== reviews.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '4px' }}>{review.user?.name || 'Customer'}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {renderStars(review.rating)}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    "{review.comment}"
                                </p>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <MessageSquare size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                            <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>No feedback yet</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>When customers leave reviews, they'll appear here.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ChefReviewsPage;
