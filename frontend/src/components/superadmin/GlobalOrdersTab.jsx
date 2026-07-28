import React from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';

const GlobalOrdersTab = ({ globalOrders, user, fetchGlobalOrders }) => {
    return (
        <motion.div key="all_orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Global Order Stream</h2>
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '16px' }}>Order ID</th>
                            <th style={{ padding: '16px' }}>Customer</th>
                            <th style={{ padding: '16px' }}>Chef</th>
                            <th style={{ padding: '16px' }}>Total</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {globalOrders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td data-label="Order ID" style={{ padding: '16px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    #{order._id.substring(order._id.length - 6).toUpperCase()}
                                </td>
                                <td data-label="Customer" style={{ padding: '16px' }}>{order.user?.name}</td>
                                <td data-label="Chef" style={{ padding: '16px' }}>{order.chef?.kitchenName || order.chef?.name}</td>
                                <td data-label="Total" style={{ padding: '16px' }}>₹{order.totalPrice}</td>
                                <td data-label="Status" style={{ padding: '16px' }}>
                                    <span className={`status-badge status-${order.orderStatus === 'Delivered' ? 'success' : order.orderStatus === 'Cancelled' ? 'error' : 'info'}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td data-label="Action" style={{ padding: '16px' }}>
                                    {!['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ color: 'var(--error)', borderColor: 'var(--error)', padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={async () => {
                                                if(window.confirm('FORCE CANCEL this order? This cannot be undone.')) {
                                                    await fetch(`${API_URL}/superadmin/orders/${order._id}/cancel`, {
                                                        method: 'POST',
                                                        headers: { Authorization: `Bearer ${user.token}` }
                                                    });
                                                    fetchGlobalOrders();
                                                }
                                            }}
                                        >
                                            Force Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {globalOrders.length === 0 && (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found on the platform.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default GlobalOrdersTab;
