import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

import { AdminSocketContext } from '../../context/AdminSocketContext';

const statusTabs = ['All', 'Placed', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Rejected'];

const SubadminOrders = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(AdminSocketContext) || {};
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [activeStatus, setActiveStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (status) => {
        setLoading(true);
        try {
            const q = status && status !== 'All' ? `?status=${status}` : '';
            const res = await fetch(`${API_URL}/subadmin/orders${q}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotal(data.total);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(activeStatus); }, [activeStatus, lastUpdated]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this order?')) return;
        try {
            const res = await fetch(`${API_URL}/subadmin/orders/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) { toast.success('Order cancelled'); fetchOrders(activeStatus); }
            else { const d = await res.json(); toast.error(d.message); }
        } catch (e) { toast.error('Error cancelling order'); }
    };

    const getBadgeClass = (status) => {
        if (['Completed'].includes(status)) return 'sa-badge-green';
        if (['Rejected'].includes(status)) return 'sa-badge-red';
        if (['Preparing', 'Ready', 'Out for Delivery'].includes(status)) return 'sa-badge-blue';
        return 'sa-badge-yellow';
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Orders</h1>
                <button className="btn btn-outline" onClick={() => fetchOrders(activeStatus)} style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 14px', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="sa-tabs">
                {statusTabs.map(s => (
                    <button key={s} className={`sa-tab ${activeStatus === s ? 'active' : ''}`} onClick={() => setActiveStatus(s)}>
                        {s}
                    </button>
                ))}
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : orders.length === 0 ? (
                <div className="sa-empty">No orders found.</div>
            ) : (
                <div className="sa-table-wrap">
                <table className="sa-table responsive-table">
                    <thead>
                        <tr><th>Order</th><th>Customer</th><th>Chef</th><th>Amount</th><th>Status</th><th>Refund</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o._id}>
                                <td data-label="Order" style={{ fontWeight: 600 }}>#{o._id.slice(-8)}</td>
                                <td data-label="Customer">{o.user?.name || 'Guest'}</td>
                                <td data-label="Chef">{o.chef?.kitchenName || o.chef?.name || '—'}</td>
                                <td data-label="Amount">₹{o.totalPrice}</td>
                                <td data-label="Status"><span className={`sa-badge ${getBadgeClass(o.status)}`}>{o.status}</span></td>
                                <td data-label="Refund">
                                    {o.refundStatus !== 'None' && (
                                        <span className={`sa-badge ${o.refundStatus === 'Approved' || o.refundStatus === 'Completed' ? 'sa-badge-green' : o.refundStatus === 'Escalated' ? 'sa-badge-red' : 'sa-badge-yellow'}`}>
                                            {o.refundStatus}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Actions">
                                    {!['Completed', 'Rejected'].includes(o.status) && (
                                        <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleCancel(o._id)}>
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing {orders.length} of {total} orders
            </div>
        </div>
    );
};

export default SubadminOrders;
