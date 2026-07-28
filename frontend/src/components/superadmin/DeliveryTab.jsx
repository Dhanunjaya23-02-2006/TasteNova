import React from 'react';
import { motion } from 'framer-motion';

const DeliveryTab = ({ managementData }) => {
    return (
        <motion.div key="delivery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Delivery Partners</h2>
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Vehicle Info</th>
                            <th style={{ padding: '16px' }}>City</th>
                            <th style={{ padding: '16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managementData.delivery?.map(d => (
                            <tr key={d._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px' }}>{d.name}</td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{d.vehicleType || 'Not Provided'} - {d.vehicleNumber}</td>
                                <td style={{ padding: '16px' }}>{d.city?.name || 'N/A'}</td>
                                <td style={{ padding: '16px' }}>
                                    <span className={`status-badge status-${d.isApproved ? 'success' : 'warning'}`}>
                                        {d.isApproved ? 'Active' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default DeliveryTab;
