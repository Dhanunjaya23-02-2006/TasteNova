import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';

const CountdownTimer = ({ expiresAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiresAt).getTime() - new Date().getTime();
            if (difference > 0) {
                setTimeLeft(Math.floor(difference / 1000));
            } else {
                setTimeLeft(0);
                if (onExpire) onExpire();
            }
        };
        
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [expiresAt, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isUrgent = timeLeft < 30;

    return (
        <div style={{ textAlign: 'center', marginBottom: '15px', color: isUrgent ? 'var(--error)' : 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.4rem', padding: '10px', background: isUrgent ? 'rgba(255, 118, 117, 0.1)' : 'rgba(252, 128, 25, 0.1)', border: isUrgent ? '1px solid var(--error)' : '1px solid var(--primary-color)', borderRadius: '10px', animation: isUrgent ? 'pulse 1s infinite' : 'none' }}>
            <Clock size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

const OrdersTab = ({ orders, orderFilter, setOrderFilter, fetchOrders, handleUpdateOrder }) => {
    return (
        <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button className={`btn ${orderFilter === 'Instant' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrderFilter('Instant')} style={{ padding: '8px 15px' }}>Instant Orders</button>
                    <button className={`btn ${orderFilter === 'Scheduled' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrderFilter('Scheduled')} style={{ padding: '8px 15px' }}>Scheduled / Subscriptions</button>
                </div>
                <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '8px 15px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <Clock size={14} style={{ marginRight: '5px' }} /> Refresh
                </button>
            </div>

            {orders.filter(o => orderFilter === 'Instant' ? (o.orderType === 'Instant' || !o.orderType) : o.orderType !== 'Instant').length === 0 ? (
                <div className="text-center glass-panel" style={{ padding: '60px', boxShadow: 'var(--shadow-floating)' }}>
                    <ShoppingBag size={48} className="mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No {orderFilter} orders right now.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {orders.filter(o => orderFilter === 'Instant' ? (o.orderType === 'Instant' || !o.orderType) : o.orderType !== 'Instant').map(order => (
                        <motion.div key={order._id} layout className="order-card-new glass-panel" style={{ padding: '20px', boxShadow: 'var(--shadow-floating)' }}>
                            <div className="flex justify-between align-center mb-3">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>#{order._id.substring(order._id.length - 8)}</span>
                                    {order.orderType !== 'Instant' && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                                            {order.orderType} - {order.scheduledTime} {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : ''}
                                        </span>
                                    )}
                                </div>
                                <div className={`status-badge ${order.status === 'Placed' ? 'status-pending' : 'status-info'}`}>
                                    {order.status === 'Preparing' && <span className="pulse-dot"></span>}
                                    {order.status}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                {order.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between" style={{ fontSize: '0.95rem', marginBottom: '5px' }}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px' }} className="flex justify-between">
                                    <span style={{ fontWeight: 700 }}>Total Amount</span>
                                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>₹{order.totalPrice}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {order.status === 'Placed' && (
                                    <div style={{ width: '100%' }}>
                                        {order.expiresAt && <CountdownTimer expiresAt={order.expiresAt} onExpire={fetchOrders} />}
                                        <div className="flex gap-2">
                                            <button className="btn btn-primary" onClick={() => handleUpdateOrder(order._id, 'Accepted')} style={{ flex: 2, padding: '10px' }}>
                                                <CheckCircle2 size={18} style={{ marginRight: '8px' }} /> Accept
                                            </button>
                                            <button className="btn btn-outline" onClick={() => handleUpdateOrder(order._id, 'Rejected')} style={{ flex: 1, padding: '10px', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {order.status === 'Accepted' && (
                                    <button className="btn btn-secondary" onClick={() => handleUpdateOrder(order._id, 'Preparing')} style={{ width: '100%' }}>
                                        Start Preparing
                                    </button>
                                )}
                                {order.status === 'Preparing' && (
                                    <button className="btn btn-primary" onClick={() => handleUpdateOrder(order._id, 'Ready')} style={{ width: '100%' }}>
                                        <Package size={18} style={{ marginRight: '8px' }} /> Mark Ready
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default OrdersTab;
