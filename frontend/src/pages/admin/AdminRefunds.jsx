import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const statusTabs = ['All', 'Pending', 'Approved', 'Processing', 'Completed', 'Rejected', 'Escalated'];

const AdminRefunds = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [activeStatus, setActiveStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            let q = activeStatus !== 'All' ? `?status=${activeStatus}` : '';
            const res = await fetch(`${API_URL}/Admin/refunds${q}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRefunds(); }, [activeStatus]);

    const handleRefund = async (id, action) => {
        const amount = action === 'approve' ? prompt('Enter refund amount (₹):') : null;
        if (action === 'approve' && !amount) return;
        try {
            const res = await fetch(`${API_URL}/Admin/refunds/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ action, amount: amount ? Number(amount) : 0 })
            });
            const data = await res.json();
            if (res.ok) { toast.success(data.message); fetchRefunds(); } else { toast.error(data.message); }
        } catch (e) { toast.error('Error'); }
    };

    const getBadgeClass = (status) => {
        if (['Approved', 'Completed'].includes(status)) return 'sa-badge-green';
        if (['Rejected'].includes(status)) return 'sa-badge-red';
        if (['Escalated'].includes(status)) return 'sa-badge-accent';
        return 'sa-badge-yellow';
    };

    return (
        <div>
            <div className="sa-page-header"><h1 className="sa-page-title">Refunds</h1></div>

            <div className="sa-tabs">
                {statusTabs.map(s => (<button key={s} className={`sa-tab ${activeStatus === s ? 'active' : ''}`} onClick={() => setActiveStatus(s)}>{s}</button>))}
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : orders.length === 0 ? <div className="sa-empty">No refund requests found.</div> : (
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Chef</th><th>Order Total</th><th>Refund Amount</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o._id}>
                                <td style={{ fontWeight: 600 }}>#{o._id.slice(-8)}</td>
                                <td>{o.user?.name || '—'}</td>
                                <td>{o.chef?.kitchenName || o.chef?.name || '—'}</td>
                                <td>₹{o.totalPrice}</td>
                                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{o.refundAmount || '—'}</td>
                                <td><span className={`sa-badge ${getBadgeClass(o.refundStatus)}`}>{o.refundStatus}</span></td>
                                <td>
                                    {o.refundStatus === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => handleRefund(o._id, 'approve')}>Approve</button>
                                            <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleRefund(o._id, 'reject')}>Reject</button>
                                        </div>
                                    )}
                                    {o.refundStatus === 'Escalated' && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting Super Admin</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    );
};

export default AdminRefunds;
