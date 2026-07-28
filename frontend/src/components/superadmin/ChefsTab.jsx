import React from 'react';
import { motion } from 'framer-motion';

const ChefsTab = ({ managementData, setEditRoleModal }) => {
    return (
        <motion.div key="chefs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Platform Chefs</h2>
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '16px' }}>Kitchen Name</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px' }}>City</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managementData.chefs?.map(chef => (
                            <tr key={chef._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td data-label="Kitchen Name" style={{ padding: '16px', fontWeight: 'bold' }}>{chef.kitchenName || chef.name}</td>
                                <td data-label="Email" style={{ padding: '16px' }}>{chef.email}</td>
                                <td data-label="City" style={{ padding: '16px', color: 'var(--text-muted)' }}>{chef.city?.name || 'N/A'}</td>
                                <td data-label="Status" style={{ padding: '16px' }}>
                                    <span className={`status-badge status-${chef.status === 'active' ? 'success' : (chef.status === 'suspended' ? 'error' : 'warning')}`}>
                                        {chef.status === 'active' ? 'Active' : (chef.status === 'suspended' ? 'Suspended' : 'Pending Verification')}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button onClick={() => setEditRoleModal(chef)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit / Assign City</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ChefsTab;
