import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Link } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import { ArrowRight, Clock, MapPin, ChefHat, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersTab = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/myorders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setOrders(data.data || []);
            } else {
                toast.error(data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            toast.error('An error occurred while fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (user) {
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        
        const handleOrderStatusUpdate = (data) => {
            setOrders(prevOrders => prevOrders.map(order => {
                if (order._id === data.orderId) {
                    toast.success(`Order #${data.orderId.substring(data.orderId.length - 6).toUpperCase()} is now ${data.status}`);
                    return { ...order, status: data.status };
                }
                return order;
            }));
        };

        socket.on('order_status_update', handleOrderStatusUpdate);
        
        return () => {
            socket.off('order_status_update', handleOrderStatusUpdate);
        };
    }, [socket]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Placed': return { bg: 'rgba(255, 165, 2, 0.1)', color: '#ffa502' };
            case 'Accepted': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' };
            case 'Preparing': return { bg: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' };
            case 'Out for Delivery': return { bg: 'rgba(230, 126, 34, 0.1)', color: '#e67e22' };
            case 'Delivered': return { bg: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' };
            case 'Rejected':
            case 'Cancelled': return { bg: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' };
            default: return { bg: 'rgba(149, 165, 166, 0.1)', color: '#95a5a6' };
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="animate-fade-up" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="animate-fade-up" style={{ background: 'var(--bg-surface)', padding: '60px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
                <Package size={64} style={{ color: 'var(--border)', margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '10px' }}>No orders yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Looks like you haven't placed any orders yet. Discover delicious home-cooked meals now!</p>
                <Link to="/chefs" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px' }}>Explore Chefs</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Order History</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Track your current orders and view past purchases.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    
                    return (
                        <div key={order._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                            {/* Order Header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID:</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginLeft: '8px', letterSpacing: '1px' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <Clock size={14} /> {formatDate(order.createdAt)}
                                </div>
                            </div>
                            
                            {/* Order Body */}
                            <div style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <ChefHat size={18} style={{ color: 'var(--primary)' }} />
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                            {order.chef?.businessName || order.chef?.name || 'TasteNova Kitchen'}
                                        </h3>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                        {order.orderItems.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.95rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-main)', minWidth: '30px' }}>{item.qty}x</span>
                                                <span style={{ color: 'var(--text-muted)' }}>{item.menuItem?.name || 'Item Unavailable'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={14} /> Deliver to: {order.shippingAddress?.address.substring(0, 30)}...
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', minWidth: '150px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Amount</div>
                                        <div style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800 }}>₹{order.totalPrice.toFixed(2)}</div>
                                    </div>
                                    
                                    <span style={{ 
                                        padding: '6px 16px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 600, 
                                        background: statusStyle.bg, 
                                        color: statusStyle.color,
                                        display: 'inline-block'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Order Footer Actions */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Rejected' && (
                                    <Link to={`/track/${order._id}`} className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Track Order <ArrowRight size={16} />
                                    </Link>
                                )}
                                {(order.status === 'Delivered' || order.status === 'Cancelled' || order.status === 'Rejected') && (
                                    <button className="btn btn-outline" style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        Reorder
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrdersTab;
