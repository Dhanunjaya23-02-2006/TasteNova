import React, { useState, useEffect, useContext } from 'react';
import { Search, ShieldAlert, CheckCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { SuperadminSocketContext } from '../../context/SuperadminSocketContext';
import { API_URL } from '../../config';

const SuperadminRefunds = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(SuperadminSocketContext);
    const [activeTab, setActiveTab] = useState('Pending');
    const [search, setSearch] = useState('');
    const [refunds, setRefunds] = useState([]);

    const fetchRefunds = async () => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/refunds`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setRefunds(await res.json());
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        if(user) fetchRefunds();
    }, [user, lastUpdated]);

    const handleAction = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/superadmin/finance/refunds/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status })
            });
            if(res.ok) {
                toast.success(`Refund ${status.toLowerCase()}`);
                fetchRefunds();
            } else toast.error('Failed to update refund');
        } catch(e) { toast.error('An error occurred'); }
    };

    const filtered = refunds.filter(r => {
        if (activeTab === 'Pending') return ['Pending', 'Escalated'].includes(r.refundStatus);
        return r.refundStatus === activeTab;
    }).filter(r => (r.user?.name?.toLowerCase().includes(search.toLowerCase()) || r._id.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="animate-fade-up">
            <div className="sa-page-header">
                <div>
                    <h1 className="sa-page-title">Central Refunds</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage escalated refunds and high-value claims across all cities.
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="sa-search" style={{ paddingLeft: '32px', width: '250px' }} placeholder="Search refund ID or user..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Escalated Requests</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{refunds.filter(r => r.refundStatus === 'Escalated').length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approved Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{refunds.filter(r => r.refundStatus === 'Approved').length}</div>
                    </div>
                </div>
                <div className="sa-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Requests</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{refunds.length}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                {['Pending', 'Approved', 'Rejected'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none', border: 'none', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent'
                        }}
                    >
                        {tab} Requests
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="sa-card" style={{ padding: '24px' }}>
                <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Refund ID</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>City</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r._id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{r._id.substring(r._id.length - 8).toUpperCase()}</div>
                                        {r.refundStatus === 'Escalated' && <span className="sa-badge sa-badge-red" style={{ fontSize: '0.7rem', padding: '2px 6px', marginTop: '4px' }}>Escalated</span>}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.user?.name || 'Unknown'}</div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#e74c3c' }}>₹{r.refundAmount || (r.totalPrice || 0)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.refundReason || 'Escalated Issue'}</td>
                                    <td>{r.city?.name || 'Unknown'}</td>
                                    <td>
                                        {['Pending', 'Escalated'].includes(r.refundStatus) ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => handleAction(r._id, 'Approved')}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'var(--error)' }} onClick={() => handleAction(r._id, 'Rejected')}>Reject</button>
                                            </div>
                                        ) : (
                                            <span className={`sa-badge sa-badge-${r.refundStatus === 'Approved' ? 'green' : 'red'}`}>{r.refundStatus}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        No {activeTab.toLowerCase()} requests found.
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

export default SuperadminRefunds;
