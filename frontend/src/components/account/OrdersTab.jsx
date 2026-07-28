import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const OrdersTab = () => {
    const { user } = useContext(AuthContext);
    const { replaceCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [ratedItems, setRatedItems] = useState({});
    const [showRateModal, setShowRateModal] = useState(false);
    const [selectedChef, setSelectedChef] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const handleRateItem = async (menuItemId, star) => {
        try {
            const res = await fetch(`${API_URL}/menu/${menuItemId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating: star })
            });
            if (res.ok) {
                toast.success('Thank you for rating this item!');
                setRatedItems(prev => ({ ...prev, [menuItemId]: star }));
            } else {
                toast.error('Failed to submit rating.');
            }
        } catch (error) {
            toast.error('Error submitting rating.');
        }
    };

    const handleRateChef = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ chefId: selectedChef._id, rating, comment })
            });
            if (res.ok) {
                toast.success('Review submitted successfully!');
                setShowRateModal(false);
                setRating(0);
                setComment('');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            toast.error('Error submitting review');
        }
    };

    const handleRepeatOrder = (order) => {
        const repeatItems = order.orderItems.map(item => ({
            _id: item.menuItem._id,
            name: item.menuItem.name,
            image: item.menuItem.image,
            price: item.price,
            ingredientCost: item.ingredientCost || 0,
            qty: item.qty
        }));
        replaceCart(repeatItems);
        toast.success('Order items added to cart!');
        navigate('/checkout');
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px', boxShadow: 'var(--shadow-floating)', animation: 'fadeInUp 0.4s ease' }}>
            <h3 className="mb-4" style={{ fontSize: '1.6rem' }}>My Past & Current Orders</h3>
            {orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textAlign: 'center', padding: '20px' }}>You have no recorded orders to track.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.slice().reverse().map((order, index) => (
                        <div key={order._id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', animation: `fadeInUp 0.5s ease ${index * 0.1}s both`, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-floating)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>Order #{order._id.substring(order._id.length - 8)}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 'bold' }}>
                                        Total: ₹{order.totalPrice}
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.9rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Status: {order.status}</span>
                                        <span style={{ fontSize: '0.9rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(252, 160, 72, 0.15)', color: 'var(--secondary-color)', fontWeight: 'bold' }}>Logistics: {order.deliveryStatus}</span>
                                    </div>

                                    {/* Order Items UI for rating */}
                                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                        <h5 style={{ fontSize: '1rem', marginBottom: '10px' }}>Items ordered:</h5>
                                        {order.orderItems && order.orderItems.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-body)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {item.menuItem?.image && <img loading="lazy" src={item.menuItem.image} alt="food" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                                                    <span>{item.menuItem?.name || 'Unknown Item'} x{item.qty}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => {
                                                        const currentRating = ratedItems[item.menuItem?._id] || 0;
                                                        return (
                                                            <button
                                                                key={star}
                                                                onClick={() => {
                                                                    if(item.menuItem?._id) handleRateItem(item.menuItem._id, star);
                                                                }}
                                                                style={{ background: 'none', border: 'none', color: '#ffd700', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
                                                                title={`Rate ${star} stars`}
                                                            >
                                                                {star <= currentRating ? '★' : '☆'}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 200px' }}>
                                    <button className="btn btn-primary" style={{ padding: '12px 25px', width: '100%' }} onClick={() => navigate(`/track/${order._id}`)}>Track Live on Map ⌖</button>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '12px 25px', background: 'var(--secondary-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', width: '100%' }} 
                                        onClick={() => handleRepeatOrder(order)}
                                    >
                                        Repeat Order ↻
                                    </button>
                                    {order.status === 'Completed' && order.chef && (
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '10px 20px', fontSize: '0.9rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                            onClick={() => {
                                                setSelectedChef(order.chef);
                                                setShowRateModal(true);
                                            }}
                                        >
                                            Rate Chef {order.chef.businessName || order.chef.name} ★
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chef Rating Modal */}
            {showRateModal && selectedChef && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '30px', animation: 'scaleIn 0.3s ease', position: 'relative' }}>
                        <button 
                            onClick={() => setShowRateModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                        >✕</button>
                        <h3 className="mb-4 text-center">Rate {selectedChef.businessName || selectedChef.name}</h3>
                        <form onSubmit={handleRateChef}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                                {[1,2,3,4,5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#ffd700' : 'var(--border)' }}
                                    >
                                        {star <= rating ? '★' : '☆'}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Leave a comment (optional)</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="How was the food and packaging?"
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Submit Review</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
