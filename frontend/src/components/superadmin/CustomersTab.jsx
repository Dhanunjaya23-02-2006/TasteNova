import React from 'react';
import { motion } from 'framer-motion';

const CustomersTab = ({ managementData }) => {
    return (
        <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Customer Accounts</h2>
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Email / Phone</th>
                            <th style={{ padding: '16px' }}>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managementData.users?.map(c => (
                            <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td data-label="Name" style={{ padding: '16px' }}>{c.name}</td>
                                <td data-label="Email / Phone" style={{ padding: '16px', color: 'var(--text-muted)' }}>{c.email || c.phone}</td>
                                <td data-label="Joined Date" style={{ padding: '16px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default CustomersTab;
