import React, { useState, useEffect, useContext } from 'react';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const SuperadminPayouts = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Pending');
    const [payouts, setPayouts] = useState([]);

    const fetchPayouts = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/payouts`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setPayouts(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        if(user) fetchPayouts();
    }, [user]);

    const filtered = payouts.filter(p => activeTab === 'Pending' ? p.status === 'Requested' : p.status === activeTab);

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Payouts & Settlements</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage weekly settlements for Chefs and Delivery Partners.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px' }} 
                        onClick={async () => {
                            try {
                                const res = await fetch(`${API_URL}/superadmin/finance/payouts/batch`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${user.token}` }
                                });
                                if(res.ok) {
                                    toast.success('Batch payout process initiated for pending settlements.');
                                    fetchPayouts();
                                }
                            } catch(e) { toast.error('Error initiating batch payout'); }
                        }}
                    >
                        Run Batch Payout
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e67e22', fontWeight: 600 }}>
                        <Clock size={18} /> Pending Settlements
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{payouts.filter(p => p.status === 'Requested').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across {payouts.filter(p => p.status === 'Requested').length} accounts</div>
                </div>
                <div className="sa-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#27ae60', fontWeight: 600 }}>
                        <CheckCircle size={18} /> Processed
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across {payouts.filter(p => p.status === 'Paid').length} accounts</div>
                </div>
                <div className="sa-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e74c3c', fontWeight: 600 }}>
                        <AlertCircle size={18} /> Failed Transfers
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{payouts.filter(p => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Requires manual review</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                {['Pending', 'Paid', 'Failed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none', border: 'none', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent'
                        }}
                    >
                        {tab} Payouts
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Payout ID</th>
                                <th>Recipient</th>
                                <th>Entity Type</th>
                                <th>Amount</th>
                                <th>Cycle Period</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p._id.substring(p._id.length - 8).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{p.chef_id?.name || 'Unknown'}</td>
                                    <td><span className={`sa-badge sa-badge-blue`}>Chef</span></td>
                                    <td style={{ fontWeight: 700, color: '#0F3F26' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {p.status === 'Requested' && <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => toast.success(`Processed payout for ${p.chef_id?.name}`)}>Process</button>}
                                        {p.status === 'Paid' && <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => toast.success(`Downloading receipt for ${p._id}`)}>View Receipt</button>}
                                        {p.status === 'Failed' && <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => toast.success(`Retrying payout for ${p._id}`)}>Retry</button>}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        No {activeTab.toLowerCase()} payouts at the moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperadminPayouts;
