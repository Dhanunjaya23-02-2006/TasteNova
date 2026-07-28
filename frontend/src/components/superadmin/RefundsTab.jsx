import React from 'react';
import { motion } from 'framer-motion';

const RefundsTab = ({ escalatedRefunds, handleApproveRefund }) => {
    return (
        <motion.div key="refunds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Escalated Refunds</h2>
            {escalatedRefunds.length === 0 ? <p className="text-muted">No pending escalations.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {escalatedRefunds.map(order => (
                        <div key={order._id} className="glass-panel flex justify-between align-center" style={{ padding: '20px' }}>
                            <div>
                                <h5 style={{ margin: '0 0 10px 0' }}>Order #{order._id.substring(order._id.length - 8)}</h5>
                                <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <span>Customer: {order.user?.name}</span>
                                    <span>Chef: {order.chef?.name}</span>
                                    <span>Total: ₹{order.totalPrice}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-primary" onClick={() => handleApproveRefund(order._id, order.totalPrice)}>Approve Full Refund</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default RefundsTab;
