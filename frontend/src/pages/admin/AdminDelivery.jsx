import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

import { AdminSocketContext } from '../../context/AdminSocketContext';

const statusTabs = ['All', 'pending', 'active', 'suspended'];

const AdminDelivery = () => {
    const { user } = useContext(AuthContext);
    const { lastUpdated } = useContext(AdminSocketContext) || {};
    const [partners, setPartners] = useState([]);
    const [total, setTotal] = useState(0);
    const [activeStatus, setActiveStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetch_ = async () => {
        setLoading(true);
        try {
            let q = activeStatus !== 'All' ? `?status=${activeStatus}` : '';
            const res = await fetch(`${API_URL}/admin/delivery${q}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) { const d = await res.json(); setPartners(Array.isArray(d) ? d : d.partners || []); setTotal(Array.isArray(d) ? d.length : d.total || 0); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetch_(); }, [activeStatus, lastUpdated]);

    const handleStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/admin/delivery/${id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) { toast.success(`Partner ${status}`); fetch_(); } else { toast.error('Failed'); }
        } catch (e) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="sa-page-header"><h1 className="sa-page-title">Delivery Partners</h1></div>
            <div className="sa-tabs">
                {statusTabs.map(s => (<button key={s} className={`sa-tab ${activeStatus === s ? 'active' : ''}`} onClick={() => setActiveStatus(s)}>{s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>))}
            </div>
            <div className="sa-card">
                <div className="sa-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Partners List</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: {total}</div>
                </div>
                {loading ? <div className="sa-empty">Loading...</div> : partners.length === 0 ? <div className="sa-empty">No delivery partners found.</div> : (
                    <div className="sa-table-wrap">
                    <table className="sa-table">
                        <thead><tr><th>Name</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {partners.map(d => (
                                <tr key={d._id}>
                                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                                    <td>{d.phone}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{d.vehicleType || '—'} {d.vehicleNumber || ''}</td>
                                    <td><span className={`sa-badge ${d.status === 'active' ? 'sa-badge-green' : d.status === 'suspended' ? 'sa-badge-red' : 'sa-badge-yellow'}`}>{d.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {d.status === 'pending' && (<><button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => handleStatus(d._id, 'active')}>Verify</button><button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus(d._id, 'suspended')}>Reject</button></>)}
                                            {d.status === 'active' && <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem', color: 'var(--error)' }} onClick={() => handleStatus(d._id, 'suspended')}>Suspend</button>}
                                            {d.status === 'suspended' && <button className="btn btn-outline" style={{ padding: '3px 10px', fontSize: '0.78rem' }} onClick={() => handleStatus(d._id, 'active')}>Reactivate</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDelivery;
