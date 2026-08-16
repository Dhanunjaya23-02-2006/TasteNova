import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Star, MessageSquare, Edit3, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ReviewsTab = () => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ratingForm, setRatingForm] = useState({ rating: 0, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchReviewsAndOrders = async () => {
        setLoading(true);
        try {
            const [reviewsRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/reviews/myreviews`, { headers: { Authorization: `Bearer ${user.token}` } }),
                fetch(`${API_URL}/orders/myorders`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);

            if (reviewsRes.ok && ordersRes.ok) {
                const reviewsData = await reviewsRes.json();
                const ordersData = await ordersRes.json();

                setReviews(reviewsData);

                // Calculate pending reviews: Orders that are Delivered/Completed but not in reviewsData
                const reviewedOrderIds = reviewsData.map(r => r.order?._id?.toString());
                const pending = ordersData.filter(o => 
                    ['Delivered', 'Completed'].includes(o.status) && 
                    o.chef && 
                    !reviewedOrderIds.includes(o._id?.toString())
                );
                
                setPendingReviews(pending);
            }
        } catch (error) {
            console.error("Error fetching reviews", error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchReviewsAndOrders();
    }, [user]);

    const handleRateSubmit = async (e) => {
        e.preventDefault();
        if (ratingForm.rating === 0) return toast.error('Please select a rating');
        if (!ratingForm.comment.trim()) return toast.error('Please write a comment');

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({
                    chefId: selectedOrder.chef._id,
                    orderId: selectedOrder._id,
                    rating: ratingForm.rating,
                    comment: ratingForm.comment
                })
            });

            if (res.ok) {
                toast.success('Review submitted successfully!');
                setIsRateModalOpen(false);
                setRatingForm({ rating: 0, comment: '' });
                fetchReviewsAndOrders(); // Refresh lists
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={16} 
                        fill={star <= rating ? '#f1c40f' : 'transparent'} 
                        color={star <= rating ? '#f1c40f' : 'var(--border)'} 
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews...</div>;
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Reviews & Ratings</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your past reviews and rate your recent orders.</p>
                </div>
            </div>

            {/* Pending Reviews Section */}
            {pendingReviews.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, rgba(252, 128, 25, 0.1), rgba(252, 128, 25, 0.05))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(252, 128, 25, 0.2)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> 
                        Awaiting Your Review
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingReviews.map(order => (
                            <div key={order._id} style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div>
                                    <h4 style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>{order.chef?.businessName || order.chef?.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.orderItems?.map(i => i.menuItem?.name).join(', ')} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setRatingForm({ rating: 0, comment: '' });
                                        setIsRateModalOpen(true);
                                    }}
                                >
                                    Rate Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Reviews */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Your Past Reviews</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                            <div key={review._id} style={{ padding: '24px', borderBottom: idx !== reviews.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '6px' }}>{review.chef?.businessName || review.chef?.name || 'Chef'}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {renderStars(review.rating)}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                                            <Edit3 size={14} />
                                        </button>
                                        <button style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#ff4757'; e.currentTarget.style.borderColor = '#ff4757'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                    "{review.comment}"
                                </p>
                                
                                <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'rgba(252, 128, 25, 0.05)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                                    View Order {review.order?._id?.slice(-6).toUpperCase() || 'Details'} <ChevronRight size={14} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <Star size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
                            <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '8px' }}>No reviews yet</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't left any reviews for your orders.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {isRateModalOpen && selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%', animation: 'scaleIn 0.2s ease' }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>Rate Your Experience</h2>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>How was the food from <strong>{selectedOrder.chef?.businessName || selectedOrder.chef?.name}</strong>?</p>
                        
                        <form onSubmit={handleRateSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        type="button"
                                        key={star}
                                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Star size={36} fill={star <= ratingForm.rating ? '#f1c40f' : 'transparent'} color={star <= ratingForm.rating ? '#f1c40f' : 'var(--border)'} style={{ transition: 'all 0.1s' }} />
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                className="input" 
                                style={{ width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '24px' }}
                                placeholder="What did you like? What could be better?"
                                value={ratingForm.comment}
                                onChange={e => setRatingForm({ ...ratingForm, comment: e.target.value })}
                            />

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setIsRateModalOpen(false)} className="btn" style={{ flex: 1, background: '#eee', color: 'var(--text-main)' }}>Cancel</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsTab;
