import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

const categories = ['food_quality', 'late_delivery', 'wrong_item', 'missing_item', 'chef_issue', 'delivery_issue', 'payment_issue', 'refund_request', 'other'];

const AdminSupport = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [counts, setCounts] = useState({ urgent: 0, open: 0, inProgress: 0, resolved: 0 });
    const [activeStatus, setActiveStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            let q = activeStatus !== 'All' ? `?status=${activeStatus}` : '';
            const res = await fetch(`${API_URL}/Admin/support${q}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const d = await res.json();
                setTickets(d.tickets);
                setCounts(d.counts);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, [activeStatus]);

    const handleUpdate = async (id, status, resolution) => {
        try {
            const body = { status };
            if (resolution) body.resolution = resolution;
            const res = await fetch(`${API_URL}/Admin/support/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) { toast.success(`Ticket ${status}`); fetchTickets(); } else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    const resolveTicket = (id) => {
        const resolution = prompt('Enter resolution note:');
        if (resolution) handleUpdate(id, 'resolved', resolution);
    };

    return (
        <div>
            <div className="sa-page-header">
                <h1 className="sa-page-title">Support Tickets</h1>
            </div>

            {/* Status summary */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="sa-stat-card" style={{ flex: '1', minWidth: '120px', cursor: 'pointer', borderLeft: '3px solid var(--error)' }} onClick={() => setActiveStatus('All')}>
                    <div className="sa-stat-value" style={{ color: 'var(--error)' }}>{counts.urgent}</div>
                    <div className="sa-stat-label">Urgent</div>
                </div>
                <div className="sa-stat-card" style={{ flex: '1', minWidth: '120px', cursor: 'pointer', borderLeft: '3px solid #E89B2C' }} onClick={() => setActiveStatus('open')}>
                    <div className="sa-stat-value" style={{ color: '#E89B2C' }}>{counts.open}</div>
                    <div className="sa-stat-label">Open</div>
                </div>
                <div className="sa-stat-card" style={{ flex: '1', minWidth: '120px', cursor: 'pointer', borderLeft: '3px solid var(--info)' }} onClick={() => setActiveStatus('in_progress')}>
                    <div className="sa-stat-value" style={{ color: 'var(--info, #2874A6)' }}>{counts.inProgress}</div>
                    <div className="sa-stat-label">In Progress</div>
                </div>
                <div className="sa-stat-card" style={{ flex: '1', minWidth: '120px', cursor: 'pointer', borderLeft: '3px solid var(--success)' }} onClick={() => setActiveStatus('resolved')}>
                    <div className="sa-stat-value" style={{ color: 'var(--success)' }}>{counts.resolved}</div>
                    <div className="sa-stat-label">Resolved</div>
                </div>
            </div>

            <div className="sa-tabs">
                {['All', 'open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'].map(s => (
                    <button key={s} className={`sa-tab ${activeStatus === s ? 'active' : ''}`} onClick={() => setActiveStatus(s)}>
                        {s === 'All' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {loading ? <div className="sa-empty">Loading...</div> : tickets.length === 0 ? <div className="sa-empty">No tickets found.</div> : (
                <div className="sa-table-wrap">
                <table className="sa-table">
                    <thead><tr><th>Ticket</th><th>Customer</th><th>Category</th><th>Subject</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t._id}>
                                <td style={{ fontWeight: 600 }}>{t.ticketNumber}</td>
                                <td>{t.customer?.name || '—'}</td>
                                <td style={{ fontSize: '0.85rem' }}>{t.category?.replace(/_/g, ' ')}</td>
                                <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                                <td><span className={`sa-badge ${t.priority === 'urgent' ? 'sa-badge-red' : t.priority === 'high' ? 'sa-badge-yellow' : 'sa-badge-gray'}`}>{t.priority}</span></td>
                                <td><span className={`sa-badge ${t.status === 'open' ? 'sa-badge-yellow' : t.status === 'resolved' || t.status === 'closed' ? 'sa-badge-green' : 'sa-badge-blue'}`}>{t.status.replace(/_/g, ' ')}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {t.status === 'open' && <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => handleUpdate(t._id, 'in_progress')}>Take</button>}
                                        {['open', 'in_progress'].includes(t.status) && <button className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => resolveTicket(t._id)}>Resolve</button>}
                                    </div>
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

export default AdminSupport;
