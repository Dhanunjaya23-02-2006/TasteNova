import React, { useState } from 'react';
import { RefreshCw, MoreHorizontal, User, Phone, MapPin } from 'lucide-react';

const OrdersTab = ({ orders, orderFilter, setOrderFilter, fetchOrders, handleUpdateOrder }) => {
    
    // Filter orders based on tabs
    const filteredOrders = orders.filter(o => {
        if (orderFilter === 'Instant') return o.orderType === 'Instant' || !o.orderType;
        if (orderFilter === 'Scheduled') return o.orderType === 'Scheduled';
        if (orderFilter === 'Subscriptions') return o.orderType === 'Subscription';
        return true;
    });

    const tabStyle = (isActive) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: isActive ? 'rgba(39, 174, 96, 0.08)' : 'transparent',
        color: isActive ? '#0F3F26' : 'var(--text-muted)',
        border: 'none',
        transition: 'all 0.2s ease'
    });

    const statusColors = {
        'Placed': { bg: 'rgba(230,126,34,0.1)', text: '#e67e22' },
        'Accepted': { bg: 'rgba(39,174,96,0.1)', text: '#27ae60' },
        'Preparing': { bg: 'rgba(230,126,34,0.1)', text: '#e67e22' },
        'Ready': { bg: 'rgba(52,152,219,0.1)', text: '#3498db' },
        'Out for Delivery': { bg: 'rgba(52,152,219,0.1)', text: '#3498db' },
        'Delivered': { bg: 'rgba(39,174,96,0.1)', text: '#27ae60' },
        'Completed': { bg: 'rgba(39,174,96,0.1)', text: '#27ae60' },
        'Rejected': { bg: 'rgba(231,76,60,0.1)', text: '#e74c3c' }
    };

    return (
        <div>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <button style={tabStyle(orderFilter === 'Instant')} onClick={() => setOrderFilter('Instant')}>Instant Orders</button>
                    <button style={tabStyle(orderFilter === 'Scheduled')} onClick={() => setOrderFilter('Scheduled')}>Scheduled Orders</button>
                    <button style={tabStyle(orderFilter === 'Subscriptions')} onClick={() => setOrderFilter('Subscriptions')}>Subscriptions</button>
                </div>
                
                <button 
                    onClick={fetchOrders}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No orders found for this category.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredOrders.map(order => {
                        const statusStyle = statusColors[order.status] || statusColors['Placed'];
                        
                        return (
                            <div key={order._id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontWeight: 700, color: '#0F3F26' }}>Order #{order._id.slice(-6).toUpperCase()}</span>
                                        <span style={{ margin: '0 8px' }}>•</span>
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700,
                                            background: statusStyle.bg, color: statusStyle.text 
                                        }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusStyle.text }}></span>
                                            {order.status}
                                        </span>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr', gap: '24px', alignItems: 'start' }}>
                                    
                                    {/* Customer Info */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: '#0F3F26' }}>
                                            <User size={16} color="var(--text-muted)" />
                                            {order.shippingAddress?.address?.split(',')[0] || 'Customer'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <MapPin size={16} />
                                            {order.shippingAddress?.address || 'Address'}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '24px', borderRight: '1px solid var(--border-subtle)', paddingRight: '24px' }}>
                                        {order.orderItems?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                                <span>{item.qty} × {item.menuItem?.name || 'Item'}</span>
                                                <span>₹{item.price * item.qty}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pricing Summary */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', borderRight: '1px solid var(--border-subtle)', paddingRight: '24px' }}>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F3F26' }}>
                                            ₹{order.totalPrice}
                                        </div>
                                        {order.isPaid && (
                                            <span style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 600, marginTop: '4px' }}>Paid Online</span>
                                        )}
                                    </div>

                                    {/* Actions & ETA */}
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end' }}>
                                        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Preparation Time</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F3F26' }}>20 min</div>
                                        </div>
                                        <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', fontWeight: 600 }}>
                                            View Details
                                        </button>
                                    </div>

                                </div>
                                
                                {/* Quick Action Footer if Needed */}
                                {['Placed', 'Accepted', 'Preparing'].includes(order.status) && (
                                    <div style={{ background: '#F8F9FA', padding: '12px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        {order.status === 'Placed' && (
                                            <>
                                                <button onClick={() => handleUpdateOrder(order._id, 'Rejected')} className="btn" style={{ background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--error)', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600 }}>Reject</button>
                                                <button onClick={() => handleUpdateOrder(order._id, 'Accepted')} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600 }}>Accept Order</button>
                                            </>
                                        )}
                                        {order.status === 'Accepted' && (
                                            <button onClick={() => handleUpdateOrder(order._id, 'Preparing')} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600 }}>Start Preparing</button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button onClick={() => handleUpdateOrder(order._id, 'Ready')} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600 }}>Mark as Ready</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Mock */}
            {filteredOrders.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span>Showing 1 to {filteredOrders.length} of {filteredOrders.length} orders</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>&lt;</button>
                        <span style={{ padding: '4px 10px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', borderRadius: '4px', fontWeight: 700 }}>1</span>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>&gt;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
